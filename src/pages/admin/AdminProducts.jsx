import { useState, useEffect, useRef } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { sanitizeText } from '../../utils/sanitize';
import { optimizeImage, validateImage, formatFileSize, IMAGE_SPECS } from '../../utils/imageOptimizer';

const EMPTY = { name: '', price: '', category: 'Blouses', description: '', material: '', stock: 'In Stock', vendor: 'Elite Studio', image: '', images: [] };
const BUCKET = 'products';

async function uploadFile(file) {
  // Validate image
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Optimize image before upload
  const optimizedBlob = await optimizeImage(file, IMAGE_SPECS.PRODUCT_MAIN);
  
  const ext  = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, optimizedBlob, { 
      upsert: true,
      contentType: 'image/jpeg',
    });
    
  if (error) throw new Error('Upload failed: ' + error.message);
  return supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [confirmDel, setConfirmDel] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [viewImg, setViewImg]         = useState('');
  const [imgFile, setImgFile]         = useState(null);
  const [imgPreview, setImgPreview]   = useState('');
  const [extraFiles, setExtraFiles]   = useState([]);       // additional File objects
  const [extraPreviews, setExtraPreviews] = useState([]);   // existing + new preview URLs
  const [uploading, setUploading]     = useState(false);
  const fileRef  = useRef();
  const extraRef = useRef();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setProducts(await fetchProducts()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setForm(EMPTY); setEditId(null); setModal('edit');
    setError(''); setImgFile(null); setImgPreview('');
    setExtraFiles([]); setExtraPreviews([]);
  }

  function openEdit(p) {
    setForm({ name: p.name, price: p.price, category: p.category, description: p.description, material: p.material, stock: p.stock, vendor: p.vendor, image: p.image, images: p.images || [] });
    setEditId(p.id); setModal('edit'); setError('');
    setImgFile(null); setImgPreview(p.image || '');
    setExtraFiles([]);
    // Show additional images excluding the main image
    setExtraPreviews((p.images || []).filter(i => i !== p.image));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
    setError(''); // Clear any previous errors
  }

  function handleExtraFiles(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Validate all files
    for (const file of files) {
      const validation = validateImage(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }
    
    setExtraFiles(prev => [...prev, ...files]);
    setExtraPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    setError(''); // Clear any previous errors
  }

  function removeExtraPreview(index) {
    setExtraPreviews(prev => prev.filter((_, i) => i !== index));
    // Only remove from extraFiles if it's a new file (index >= existing images count)
    const existingCount = form.images?.length || 0;
    if (index >= existingCount) {
      setExtraFiles(prev => prev.filter((_, i) => i !== (index - existingCount)));
    } else {
      setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
    }
  }

  async function uploadImage() {
    if (!imgFile) return form.image;
    setUploading(true);
    try { return await uploadFile(imgFile); }
    finally { setUploading(false); }
  }

  async function uploadExtraImages() {
    if (!extraFiles.length) return form.images || [];
    // Keep existing URLs, upload new files
    const existingUrls = form.images || [];
    const newUrls = await Promise.all(extraFiles.map(uploadFile));
    return [...existingUrls, ...newUrls];
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      setUploading(true);
      const imageUrl  = await uploadImage();
      const imagesArr = await uploadExtraImages();
      setUploading(false);
      const payload = { ...form, image: imageUrl, images: imagesArr };
      if (editId) await updateProduct(editId, payload);
      else        await createProduct(payload);
      setModal(null);
      await load();
    } catch (e) { setError(e.message); setUploading(false); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id);
      setConfirmDel(null);
      await load();
    } catch (e) { setError(e.message); }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const catColors = { Blouses: '#a07d56', Bangles: '#e74c3c', Materials: '#27ae60' };

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>Products</h1>
          <p style={s.sub}>{products.length} total products in database</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}>
          <i className="fas fa-plus" style={{ marginRight: 8 }}></i>Add Product
        </button>
      </div>

      <div style={s.searchWrap}>
        <i className="fas fa-search" style={s.searchIcon}></i>
        <input style={s.searchInput} placeholder="Search by name or category..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <div style={s.errBanner}>{error}</div>}

      <div style={s.tableWrap}>
        {loading ? <div style={s.loading}>Loading products...</div> : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                {['ID', 'Image', 'Name', 'Category', 'Price', 'Material', 'Stock', 'Actions'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}><span style={s.idBadge}>#{p.id}</span></td>
                  <td style={s.td}>
                    <img src={p.image} alt={p.name} style={s.thumb}
                      onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
                  </td>
                  <td style={{ ...s.td, fontWeight: 600, maxWidth: 160 }}>{sanitizeText(p.name)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: catColors[p.category] || '#888' }}>{sanitizeText(p.category)}</span>
                  </td>
                  <td style={s.td}>₹{Number(p.price).toLocaleString()}</td>
                  <td style={{ ...s.td, color: '#888' }}>{sanitizeText(p.material)}</td>
                  <td style={s.td}>
                    <span style={{ color: p.stock === 'In Stock' ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>{p.stock}</span>
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button style={s.viewBtn} onClick={() => { setViewProduct(p); setViewImg(p.image); }} title="View">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button style={s.editBtn} onClick={() => openEdit(p)} title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button style={s.delBtn} onClick={() => setConfirmDel(p)} title="Delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal === 'edit' && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editId ? 'Edit Product' : 'Add New Product'}</h2>
              <button style={s.closeBtn} onClick={() => setModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={s.formGrid}>
                <Field label="Product Name *">
                  <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </Field>
                <Field label="Price (₹) *">
                  <input style={s.input} type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </Field>
                <Field label="Category *">
                  <select style={s.input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option>Blouses</option>
                    <option>Bangles</option>
                    <option>Materials</option>
                  </select>
                </Field>
                <Field label="Material">
                  <input style={s.input} value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} />
                </Field>
                <Field label="Stock">
                  <select style={s.input} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}>
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                    <option>Limited</option>
                  </select>
                </Field>
                <Field label="Vendor">
                  <input style={s.input} value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
                </Field>
              </div>

              {/* Main Image Upload */}
              <Field label="Main Image (shown on Collections page) *">
                <div style={s.uploadBox} onClick={() => fileRef.current.click()}>
                  {imgPreview ? (
                    <img src={imgPreview} alt="preview" style={s.previewImg}
                      onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
                  ) : (
                    <div style={s.uploadPlaceholder}>
                      <i className="fas fa-cloud-upload-alt" style={{ fontSize: 28, color: '#a07d56', marginBottom: 8 }}></i>
                      <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Click to upload main image</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#bbb' }}>This is the cover shown in collections</p>
                    </div>
                  )}
                  {imgPreview && (
                    <div style={s.changeOverlay}>
                      <i className="fas fa-camera" style={{ marginRight: 6 }}></i>Change Image
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                <p style={{ fontSize: 11, color: '#888', marginTop: 6, marginBottom: 0 }}>
                  <i className="fas fa-info-circle" style={{ marginRight: 4, color: '#a07d56' }}></i>
                  <strong>Recommended:</strong> 800x800px • Max 10MB • Images auto-optimized to 500KB
                  {imgFile && <span style={{ color: '#27ae60', marginLeft: 8 }}>({formatFileSize(imgFile.size)})</span>}
                </p>
              </Field>

              {/* Extra Images */}
              <Field label="Additional Images (shown in product detail thumbnails)">
                <div style={s.extraGrid}>
                  {extraPreviews.map((src, i) => (
                    <div key={i} style={s.extraThumb}>
                      <img src={src} alt={`extra-${i}`} style={s.extraImg}
                        onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
                      <button type="button" style={s.removeBtn} onClick={() => removeExtraPreview(i)}>×</button>
                    </div>
                  ))}
                  <div style={s.addThumb} onClick={() => extraRef.current.click()}>
                    <i className="fas fa-plus" style={{ fontSize: 20, color: '#a07d56' }}></i>
                    <span style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Add more</span>
                  </div>
                </div>
                <input ref={extraRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleExtraFiles} />
              </Field>

              {uploading && <p style={{ fontSize: 12, color: '#a07d56', marginBottom: 8 }}>Uploading images...</p>}

              <Field label="Description">
                <textarea style={{ ...s.input, height: 90, resize: 'vertical' }} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Field>

              {error && <p style={{ color: '#e74c3c', marginBottom: 12 }}>{error}</p>}
              <div style={s.modalFooter}>
                <button type="button" style={s.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" style={s.saveBtn} disabled={saving || uploading}>
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail View Modal */}
      {viewProduct && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setViewProduct(null)}>
          <div style={{ ...s.modal, maxWidth: 680 }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Product Details</h2>
              <button style={s.closeBtn} onClick={() => setViewProduct(null)}>&times;</button>
            </div>
            <div style={s.viewGrid}>
              {/* Images Panel */}
              <div style={s.viewImgPanel}>
                <img
                  src={viewImg || viewProduct.image}
                  alt={viewProduct.name}
                  style={s.viewMainImg}
                  onError={e => e.target.src = '/elite studio pic/product.jpeg'}
                />
                {viewProduct.images && viewProduct.images.length > 0 && (
                  <div style={s.viewThumbs}>
                    {[viewProduct.image, ...viewProduct.images.filter(i => i !== viewProduct.image)].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`thumb-${i}`}
                        style={{ ...s.viewThumb, border: viewImg === src ? '2px solid #a07d56' : '2px solid transparent' }}
                        onClick={() => setViewImg(src)}
                        onError={e => e.target.src = '/elite studio pic/product.jpeg'}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Info Panel */}
              <div style={s.viewInfo}>
                <span style={{ ...s.badge, background: catColors[viewProduct.category] || '#888', marginBottom: 10, display: 'inline-block' }}>
                  {sanitizeText(viewProduct.category)}
                </span>
                <h3 style={s.viewName}>{sanitizeText(viewProduct.name)}</h3>
                <p style={s.viewPrice}>₹{Number(viewProduct.price).toLocaleString()}</p>

                <div style={s.viewMeta}>
                  <div style={s.viewMetaRow}>
                    <span style={s.viewMetaLabel}>ID</span>
                    <span style={s.idBadge}>#{viewProduct.id}</span>
                  </div>
                  <div style={s.viewMetaRow}>
                    <span style={s.viewMetaLabel}>Material</span>
                    <span>{sanitizeText(viewProduct.material) || '—'}</span>
                  </div>
                  <div style={s.viewMetaRow}>
                    <span style={s.viewMetaLabel}>Stock</span>
                    <span style={{ color: viewProduct.stock === 'In Stock' ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>
                      {sanitizeText(viewProduct.stock)}
                    </span>
                  </div>
                  <div style={s.viewMetaRow}>
                    <span style={s.viewMetaLabel}>Vendor</span>
                    <span>{sanitizeText(viewProduct.vendor) || '—'}</span>
                  </div>
                </div>

                {viewProduct.description && (
                  <div style={s.viewDesc}>
                    <p style={s.viewMetaLabel}>Description</p>
                    <p style={{ margin: 0, color: '#555', fontSize: 14, lineHeight: 1.6 }}>{sanitizeText(viewProduct.description)}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button style={s.saveBtn} onClick={() => { setViewProduct(null); openEdit(viewProduct); }}>
                    <i className="fas fa-edit" style={{ marginRight: 6 }}></i>Edit
                  </button>
                  <button style={{ ...s.saveBtn, background: '#e74c3c' }} onClick={() => { setViewProduct(null); setConfirmDel(viewProduct); }}>
                    <i className="fas fa-trash" style={{ marginRight: 6 }}></i>Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setConfirmDel(null)}>
          <div style={{ ...s.modal, maxWidth: 400 }}>
            <div style={s.modalHeader}>
              <h2 style={{ ...s.modalTitle, color: '#e74c3c' }}>Delete Product</h2>
              <button style={s.closeBtn} onClick={() => setConfirmDel(null)}>&times;</button>
            </div>
            <p style={{ color: '#555', marginBottom: 24 }}>
              Are you sure you want to delete <strong>{sanitizeText(confirmDel.name)}</strong>? This cannot be undone.
            </p>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setConfirmDel(null)}>Cancel</button>
              <button style={{ ...s.saveBtn, background: '#e74c3c' }} onClick={() => handleDelete(confirmDel.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#555', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const s = {
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  heading:          { fontSize: 26, color: '#333d47', margin: '0 0 4px' },
  sub:              { color: '#888', margin: 0 },
  addBtn:           { background: '#a07d56', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  searchWrap:       { position: 'relative', marginBottom: 20 },
  searchIcon:       { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' },
  searchInput:      { width: '100%', padding: '11px 14px 11px 40px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, background: '#fff', boxSizing: 'border-box', outline: 'none' },
  errBanner:        { background: '#fde8e8', color: '#e74c3c', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  tableWrap:        { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'auto' },
  loading:          { padding: 40, textAlign: 'center', color: '#888' },
  table:            { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  thead:            { background: '#f8f6f2' },
  th:               { padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' },
  tr:               { borderBottom: '1px solid #f5f5f5' },
  td:               { padding: '12px 16px', fontSize: 14, color: '#333d47', verticalAlign: 'middle' },
  idBadge:          { background: '#f0ece3', color: '#a07d56', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 },
  thumb:            { width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' },
  badge:            { color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  actions:          { display: 'flex', gap: 8 },
  viewBtn:          { background: '#e8f5e9', color: '#27ae60', border: 'none', borderRadius: 6, width: 34, height: 34, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  editBtn:          { background: '#e8f4fd', color: '#3498db', border: 'none', borderRadius: 6, width: 34, height: 34, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  delBtn:           { background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: 6, width: 34, height: 34, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  overlay:          { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal:            { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle:       { fontSize: 20, fontWeight: 700, color: '#333d47', margin: 0 },
  closeBtn:         { background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888', lineHeight: 1 },
  formGrid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' },
  input:            { width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  modalFooter:      { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 },
  cancelBtn:        { padding: '10px 22px', background: '#f5f5f5', color: '#555', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
  saveBtn:          { padding: '10px 22px', background: '#a07d56', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  uploadBox:        { position: 'relative', border: '2px dashed #ddd', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: '#fafafa', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadPlaceholder:{ textAlign: 'center', padding: 20 },
  previewImg:       { width: '100%', height: 160, objectFit: 'cover', display: 'block' },
  changeOverlay:    { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '8px 0', textAlign: 'center' },
  extraGrid:        { display: 'flex', flexWrap: 'wrap', gap: 10 },
  extraThumb:       { position: 'relative', width: 72, height: 72 },
  extraImg:         { width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' },
  removeBtn:        { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: '18px', textAlign: 'center', padding: 0 },
  addThumb:         { width: 72, height: 72, border: '2px dashed #ddd', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa' },
  viewGrid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 },
  viewImgPanel:     { display: 'flex', flexDirection: 'column', gap: 10 },
  viewMainImg:      { width: '100%', height: 280, objectFit: 'cover', borderRadius: 12, border: '1px solid #eee' },
  viewThumbs:       { display: 'flex', gap: 8, flexWrap: 'wrap' },
  viewThumb:        { width: 56, height: 56, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' },
  viewInfo:         { display: 'flex', flexDirection: 'column' },
  viewName:         { fontSize: 20, fontWeight: 700, color: '#333d47', margin: '6px 0 4px' },
  viewPrice:        { fontSize: 22, fontWeight: 700, color: '#a07d56', margin: '0 0 16px' },
  viewMeta:         { background: '#f8f6f2', borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 },
  viewMetaRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 },
  viewMetaLabel:    { fontWeight: 600, color: '#888', fontSize: 13 },
  viewDesc:         { marginTop: 16 },
};
