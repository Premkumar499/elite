import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

const STATUSES = ['new', 'contacted', 'enrolled', 'cancelled'];
const STATUS_COLOR = {
  new:       { bg: '#fff3cd', color: '#856404' },
  contacted: { bg: '#d1ecf1', color: '#0c5460' },
  enrolled:  { bg: '#d4edda', color: '#155724' },
  cancelled: { bg: '#f8d7da', color: '#721c24' },
};

export default function AdminEnrollments() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null); // for detail modal

  useEffect(() => {
    load();
    const channel = supabaseAdmin
      .channel('admin-enrollments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'enrollments' }, () => load())
      .subscribe();
    return () => supabaseAdmin.removeChannel(channel);
  }, []);

  async function load() {
    setLoading(true);
    setFetchError('');
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Enrollments fetch error:', error.message);
      setFetchError(error.message);
    }
    setList(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabaseAdmin.from('enrollments').update({ status }).eq('id', id);
    setList(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  }

  async function deleteEnrollment(id) {
    if (!window.confirm('Delete this enrollment? This cannot be undone.')) return;
    await supabaseAdmin.from('enrollments').delete().eq('id', id);
    setList(prev => prev.filter(e => e.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const filtered = list
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e =>
      !search ||
      `${e.first_name} ${e.last_name} ${e.email} ${e.phone}`.toLowerCase().includes(search.toLowerCase())
    );

  const newCount = list.filter(e => e.status === 'new').length;

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>
            Enrollments
            {newCount > 0 && <span style={s.newBadge}>{newCount} new</span>}
          </h1>
          <p style={s.sub}>{list.length} total enrollments</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}></i>
          <input style={s.searchInput} placeholder="Search by name, email, phone..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', ...STATUSES].map(st => (
            <button key={st} style={{ ...s.tab, ...(filter === st ? s.tabActive : {}) }}
              onClick={() => setFilter(st)}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {fetchError && (
        <div style={{ background: '#fde8e8', color: '#e74c3c', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          Error: {fetchError}
        </div>
      )}

      {loading ? (
        <div style={s.loading}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={s.loading}>No enrollments found.</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                {['#', 'Name', 'Contact', 'Plan', 'Experience', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const sc = STATUS_COLOR[e.status] || STATUS_COLOR.new;
                return (
                  <tr key={e.id} style={s.tr}>
                    <td style={s.td}><span style={s.idBadge}>#{e.id}</span></td>
                    <td style={s.td}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{e.first_name} {e.last_name}</p>
                    </td>
                    <td style={s.td}>
                      <p style={{ margin: 0 }}>{e.phone}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{e.email}</p>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontSize: 13, color: '#a07d56', fontWeight: 600 }}>{e.payment_plan || '—'}</span>
                    </td>
                    <td style={{ ...s.td, color: '#888', fontSize: 13 }}>{e.experience || '—'}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: sc.bg, color: sc.color }}>
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#aaa', fontSize: 12 }}>
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button style={s.viewBtn} onClick={() => setSelected(e)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        <select style={s.select} value={e.status} onChange={ev => updateStatus(e.id, ev.target.value)}>
                          {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                        <button style={s.deleteBtn} onClick={() => deleteEnrollment(e.id)} title="Delete">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <h2 style={s.modalTitle}>Enrollment Details</h2>
              <button style={s.closeBtn} onClick={() => setSelected(null)}>&times;</button>
            </div>

            {/* Status badge */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ ...s.badge, background: STATUS_COLOR[selected.status]?.bg || '#eee', color: STATUS_COLOR[selected.status]?.color || '#333', fontSize: 13 }}>
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </span>
              <span style={{ marginLeft: 10, color: '#aaa', fontSize: 12 }}>#{selected.id} · {new Date(selected.created_at).toLocaleString()}</span>
            </div>

            <div style={s.detailGrid}>
              <DetailRow label="First Name"    value={selected.first_name} />
              <DetailRow label="Last Name"     value={selected.last_name} />
              <DetailRow label="Email"         value={selected.email} />
              <DetailRow label="Phone"         value={selected.phone} />
              <DetailRow label="Payment Plan"  value={selected.payment_plan} />
              <DetailRow label="Experience"    value={selected.experience} />
              <DetailRow label="Heard From"    value={selected.referral} />
              <DetailRow label="Address"       value={selected.address} fullWidth />
            </div>

            <div style={{ marginTop: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>Update Status</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUSES.map(st => (
                  <button key={st}
                    style={{ ...s.stBtn, ...(selected.status === st ? { background: '#a07d56', color: '#fff', border: '1.5px solid #a07d56' } : {}) }}
                    onClick={() => { updateStatus(selected.id, st); setSelected(prev => ({ ...prev, status: st })); }}>
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
              <button style={{ ...s.deleteBtn, marginTop: 16, padding: '8px 18px', borderRadius: 8, fontSize: 13 }}
                onClick={() => deleteEnrollment(selected.id)}>
                <i className="fas fa-trash" style={{ marginRight: 6 }}></i>Delete Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  header:     { marginBottom: 24 },
  heading:    { fontSize: 26, color: '#333d47', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 12 },
  newBadge:   { background: '#e74c3c', color: '#fff', fontSize: 13, padding: '2px 10px', borderRadius: 20, fontWeight: 700 },
  sub:        { color: '#888', margin: 0 },
  searchInput:{ width: '100%', padding: '10px 14px 10px 36px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  tab:        { padding: '6px 14px', border: '1.5px solid #ddd', borderRadius: 20, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#555', fontWeight: 600 },
  tabActive:  { background: '#a07d56', color: '#fff', border: '1.5px solid #a07d56' },
  loading:    { textAlign: 'center', padding: 40, color: '#888' },
  tableWrap:  { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'auto' },
  table:      { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  thead:      { background: '#f8f6f2' },
  th:         { padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: 700 },
  tr:         { borderBottom: '1px solid #f5f5f5' },
  td:         { padding: '12px 16px', fontSize: 14, color: '#333d47', verticalAlign: 'middle' },
  idBadge:    { background: '#f0ece3', color: '#a07d56', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 },
  badge:      { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  select:     { padding: '5px 8px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#fff' },
  viewBtn:    { background: '#e8f4fd', color: '#3498db', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 13 },
  deleteBtn:  { background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 13 },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal:      { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#333d47', margin: 0 },
  closeBtn:   { background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#888', lineHeight: 1 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', background: '#f7f2e7', borderRadius: 10, padding: 20 },
  stBtn:      { padding: '7px 16px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#f8f8f8', color: '#555', fontWeight: 600, textTransform: 'capitalize' },
};

function DetailRow({ label, value, fullWidth }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <p style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 14, color: '#333d47', margin: 0, fontWeight: 500 }}>{value || '—'}</p>
    </div>
  );
}
