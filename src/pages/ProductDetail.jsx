import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProduct } from '../services/api';
import { addFavourite, isFavourite, addToCart } from '../services/db';
import { sanitizeText } from '../utils/sanitize';

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct]     = useState(null);
  const [images, setImages]       = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [activeThumb, setActiveThumb] = useState(0);
  const [zoomOpen, setZoomOpen]   = useState(false);
  const [inFav, setInFav]         = useState(false);
  const [message, setMessage]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [qty, setQty]             = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchProduct(id)
      .then(async data => {
        setProduct(data);
        // Build the full image list: main image first, then additional images (deduplicated)
        const mainImg = data.image || '';
        const extras  = data.images || [];
        // Combine: if main is already in extras, don't duplicate it
        const allImgs = mainImg
          ? [mainImg, ...extras.filter(i => i !== mainImg)]
          : extras;
        const imgs = allImgs.length ? allImgs : ['/elite studio pic/product.jpeg'];
        setImages(imgs);
        setMainImage(imgs[0]);
        setInFav(await isFavourite(data.id));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function showMsg(text, type) {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAddFav() {
    try {
      await addFavourite(product.id);
      setInFav(true);
      showMsg('Added to favourites!', 'success');
    } catch {
      showMsg('Already in favourites.', 'info');
    }
  }

  async function handleAddToCart() {
    try {
      await addToCart(product.id, qty);
      showMsg(`Added ${qty} to cart!`, 'success');
    } catch (e) {
      showMsg(e.message, 'error');
    }
  }

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading product...</div>;
  if (error)   return <div style={{ padding: '60px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!product) return <div style={{ padding: '60px', textAlign: 'center' }}>Product not found.</div>;

  return (
    <>
      <div className="breadcrumb-nav">
        <div className="container">
          <Link to="/">Home</Link> &gt; <Link to="/collections">Collections</Link> &gt; <span>Product Details</span>
        </div>
      </div>

      <div className="product-details-container">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="main-image" onClick={() => setZoomOpen(true)}>
            <img id="mainProductImage" src={mainImage} alt={sanitizeText(product.name)} />
          </div>
          <div className="thumbnail-container">
            {images.map((src, i) => (
              <div key={i} className={`thumbnail${activeThumb === i ? ' active' : ''}`}
                onClick={() => { setMainImage(src); setActiveThumb(i); }}>
                <img src={src} alt={`${sanitizeText(product.name)} - ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="product-info">
          <h1>{sanitizeText(product.name)}</h1>
          <p className="price">₹ {sanitizeText(String(product.price))}</p>
          <div className="product-description">
            <p>{sanitizeText(product.description)}</p>
            <p><strong>Material:</strong> {sanitizeText(product.material)}</p>
            <p><strong>Stock:</strong> {sanitizeText(product.stock)}</p>
            <p><strong>Vendor:</strong> {sanitizeText(product.vendor)}</p>
          </div>

          {/* Qty + Add to Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f7f2e7', borderRadius: 8, padding: '6px 12px' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#a07d56', fontWeight: 700 }}>−</button>
              <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}
                style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#a07d56', fontWeight: 700 }}>+</button>
            </div>
            <button onClick={handleAddToCart}
              style={{ padding: '12px 28px', background: '#333d47', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              <i className="fas fa-shopping-cart" style={{ marginRight: 8 }}></i>Add to Cart
            </button>
          </div>

          <button
            className={`add-to-favourites${inFav ? ' in-favourites' : ''}`}
            onClick={handleAddFav}
            disabled={inFav}
          >
            <i className={`fa${inFav ? 's' : 'r'} fa-heart`}></i>
            {inFav ? ' In Favourites' : ' Add to Favourites'}
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomOpen && (
        <div className="zoom-modal active"
          onClick={e => { if (e.target.classList.contains('zoom-modal') || e.target.classList.contains('close-zoom')) setZoomOpen(false); }}>
          <span className="close-zoom" onClick={() => setZoomOpen(false)}>&times;</span>
          <div className="zoom-image-container">
            <img className="zoom-modal-content" src={mainImage} alt={sanitizeText(product.name)} />
          </div>
        </div>
      )}

      {message && <div className={`message-popup ${message.type} show`}>{message.text}</div>}
    </>
  );
}
