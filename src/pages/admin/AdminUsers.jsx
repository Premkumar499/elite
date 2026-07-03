import { useState, useEffect } from 'react';
import { adminGetAllUsers } from '../../services/adminDb';
import { sanitizeText } from '../../utils/sanitize';
export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    adminGetAllUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>Users</h1>
          <p style={s.sub}>{users.length} registered users</p>
        </div>
      </div>

      <div style={s.searchWrap}>
        <i className="fas fa-search" style={s.searchIcon}></i>
        <input style={s.searchInput} placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={s.tableWrap}>
        {loading ? <div style={s.loading}>Loading users...</div> : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                {['Avatar', 'Name', 'Email', 'Provider', 'Joined'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>
                    {u.avatar_url
                      ? <img src={u.avatar_url} alt={sanitizeText(u.full_name)} style={s.avatar} />
                      : <div style={s.avatarFallback}>{(u.full_name || u.email || '?')[0].toUpperCase()}</div>
                    }
                  </td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{sanitizeText(u.full_name) || '—'}</td>
                  <td style={s.td}>{sanitizeText(u.email)}</td>
                  <td style={s.td}>
                    <span style={s.providerBadge}>google</span>
                  </td>
                  <td style={{ ...s.td, color: '#aaa' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const s = {
  header:        { marginBottom: 24 },
  heading:       { fontSize: 26, color: '#333d47', margin: '0 0 4px' },
  sub:           { color: '#888', margin: 0 },
  searchWrap:    { position: 'relative', marginBottom: 20 },
  searchIcon:    { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' },
  searchInput:   { width: '100%', padding: '11px 14px 11px 40px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, background: '#fff', boxSizing: 'border-box', outline: 'none' },
  tableWrap:     { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'auto' },
  loading:       { padding: 40, textAlign: 'center', color: '#888' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  thead:         { background: '#f8f6f2' },
  th:            { padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: 700 },
  tr:            { borderBottom: '1px solid #f5f5f5' },
  td:            { padding: '12px 16px', fontSize: 14, color: '#333d47', verticalAlign: 'middle' },
  avatar:        { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' },
  avatarFallback:{ width: 40, height: 40, borderRadius: '50%', background: '#a07d56', color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  providerBadge: { background: '#e8f4fd', color: '#3498db', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
};
