import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavourites, removeFavourite } from '../services/db';
import { sanitizeText } from '../utils/sanitize';

export default function Favourites() {
  const [favs, setFavs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    try { setFavs(await getFavourites()); }
    catch { }
    finally { setLoading(false); }
  }

  async function handleRemove(productId) {
    setRemovingId(productId);
    await removeFavourite(productId);
    setFavs(f => f.filter(i => i.product_id !== productId));
    setRemovingId(null);
  }

  return (
    <>
      <div className="title">
        <h1>MY FAVOURITES</h1>
        <div className="breadcrumb">
          <span><Link to="/">HOME</Link></span> &gt; <span>FAVOURITES</span>
        </div>
      </div>

      <div style={s.page}>
        {/* Header bar */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <i className="fas fa-heart" style={{ color: '#e74c3c', fontSize: 20 }}></i>
            <span style={s.count}>
              {loading ? 'Loading...' : `${favs.length} item${favs.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          <Link to="/collections" style={s.shopBtn}>
            <i className="fas fa-shopping-bag" style={{ marginRight: 7 }}></i>
            Continue Shopping
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={s.grid}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={s.skeleton}>
                <div style={s.skeletonImg}></div>
                <div style={{ padding: 16 }}>
                  <div style={s.skeletonLine}></div>
                  <div style={{ ...s.skeletonLine, width: '60%', marginTop: 10 }}></div>
                  <div style={{ ...s.skeletonLine, width: '80%', marginTop: 16, height: 36, borderRadius: 8 }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && favs.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>
              <i className="fas fa-heart-broken"></i>
            </div>
            <h3 style={s.emptyTitle}>Your wishlist is empty</h3>
            <p style={s.emptyText}>Save items you love by clicking the heart icon on any product.</p>
            <Link to="/collections" style={s.emptyBtn}>
              <i className="fas fa-th-large" style={{ marginRight: 8 }}></i>
              Browse Collections
            </Link>
          </div>
        )}

        {/* Favourites grid */}
        {!loading && favs.length > 0 && (
          <div style={s.grid}>
            {favs.map(fav => {
              const isRemoving = removingId === fav.product_id;
              return (
                <div key={fav.id} className="fav-card-hover" style={{ ...s.card, opacity: isRemoving ? 0.5 : 1 }}>
                  {/* Remove button top-right */}
                  <button
                    style={s.removeIcon}
                    onClick={() => handleRemove(fav.product_id)}
                    disabled={isRemoving}
                    title="Remove from favourites"
                  >
                    {isRemoving
                      ? <i className="fas fa-spinner fa-spin"></i>
                      : <i className="fas fa-times"></i>
                    }
                  </button>

                  {/* Image */}
                  <div style={s.imgWrap} onClick={() => navigate(`/product/${fav.products.id}`)}>
                    <img
                      src={fav.products.image}
                      alt={sanitizeText(fav.products.name)}
                      className="fav-img"
                      style={s.img}
                      onError={e => e.target.src = '/elite studio pic/product.jpeg'}
                    />
                    <div className="fav-overlay" style={s.imgOverlay}>
                      <span style={s.quickView}>
                        <i className="fas fa-eye" style={{ marginRight: 6 }}></i>Quick View
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={s.info}>
                    <h3 style={s.name} onClick={() => navigate(`/product/${fav.products.id}`)}>
                      {sanitizeText(fav.products.name)}
                    </h3>
                    <p style={s.price}>₹{Number(fav.products.price).toLocaleString()}</p>
                    <p style={s.date}>
                      <i className="fas fa-clock" style={{ marginRight: 5, fontSize: 11 }}></i>
                      Added {new Date(fav.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>

                    <div style={s.actions}>
                      <button
                        style={s.viewBtn}
                        onClick={() => navigate(`/product/${fav.products.id}`)}
                      >
                        <i className="fas fa-shopping-cart" style={{ marginRight: 6 }}></i>
                        Add to Cart
                      </button>
                      <button
                        style={s.removeBtn}
                        onClick={() => handleRemove(fav.product_id)}
                        disabled={isRemoving}
                      >
                        <i className="fas fa-heart-broken"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 20px 60px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: '1.5px solid #f0ece3',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  count: {
    fontSize: 18,
    fontWeight: 700,
    color: '#333d47',
  },
  shopBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 20px',
    background: '#333d47',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 24,
  },

  // Card
  card: {
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    border: '1px solid #f0ece3',
  },

  // Remove X button
  removeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: '#888',
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
    backdropFilter: 'blur(4px)',
  },

  // Image
  imgWrap: {
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    height: 220,
    background: '#f9f6f1',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
    display: 'block',
  },
  imgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(51,61,71,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  quickView: {
    background: '#fff',
    color: '#333d47',
    padding: '8px 18px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
  },

  // Info
  info: {
    padding: '16px 18px 18px',
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: '#333d47',
    margin: '0 0 8px',
    cursor: 'pointer',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  price: {
    fontSize: 20,
    fontWeight: 700,
    color: '#a07d56',
    margin: '0 0 6px',
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    margin: '0 0 16px',
    display: 'flex',
    alignItems: 'center',
  },
  actions: {
    display: 'flex',
    gap: 10,
  },
  viewBtn: {
    flex: 1,
    padding: '10px 0',
    background: '#a07d56',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  removeBtn: {
    width: 40,
    height: 40,
    background: '#fde8e8',
    color: '#e74c3c',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    flexShrink: 0,
    transition: 'background 0.2s',
  },

  // Empty state
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyIcon: {
    fontSize: 60,
    color: '#f5c6cb',
    marginBottom: 24,
    lineHeight: 1,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#333d47',
    margin: '0 0 12px',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    margin: '0 0 28px',
  },
  emptyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '13px 28px',
    background: '#a07d56',
    color: '#fff',
    borderRadius: 10,
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 700,
  },

  // Skeleton loader
  skeleton: {
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid #f0ece3',
  },
  skeletonImg: {
    height: 220,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  skeletonLine: {
    height: 16,
    borderRadius: 6,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
};
