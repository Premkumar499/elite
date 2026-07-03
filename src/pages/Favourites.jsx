import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavourites, removeFavourite } from '../services/db';

export default function Favourites() {
  const [favs, setFavs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    try { setFavs(await getFavourites()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleRemove(productId) {
    await removeFavourite(productId);
    setFavs(f => f.filter(i => i.product_id !== productId));
  }

  return (
    <>
      <div className="title">
        <h1>MY FAVOURITES</h1>
        <div className="breadcrumb">
          <span><Link to="/">HOME</Link></span> &gt; <span>FAVOURITES</span>
        </div>
      </div>

      <div className="products-content">
        <div className="products-header">
          <div className="results-count">
            {loading ? 'Loading...' : favs.length === 0 ? 'No favourites yet' : `${favs.length} favourite${favs.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        {!loading && favs.length === 0 ? (
          <div className="empty-favourites">
            <div className="empty-state">
              <i className="fas fa-heart-broken"></i>
              <h3>No items in favourites</h3>
              <p>Add products to favourites from product pages.</p>
              <div className="empty-actions">
                <Link to="/collections" className="btn btn-primary">Browse Products</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="products-grid">
            {favs.map(fav => (
              <div key={fav.id} className="product-card favourite-card">
                <div className="favourite-badge"><i className="fas fa-heart"></i></div>
                <img src={fav.products.image} alt={fav.products.name} className="product-image"
                  onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
                <div className="product-info">
                  <h3 className="product-name">{fav.products.name}</h3>
                  <p className="product-price">₹ {fav.products.price}</p>
                  <div className="product-actions">
                    <button className="btn btn-primary" onClick={() => navigate(`/product/${fav.products.id}`)}>
                      <i className="fas fa-eye"></i> View
                    </button>
                    <button className="btn btn-danger" onClick={() => handleRemove(fav.product_id)}>
                      <i className="fas fa-trash"></i> Remove
                    </button>
                  </div>
                </div>
                <div className="added-date">Added: {new Date(fav.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
