import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/api';

export default function Collections() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filterOpen, setFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [categories, setCategories] = useState({ Blouses: true, Bangles: true, Materials: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchTimeout = useRef(null);

  // Apply category from URL param on mount
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategories({ Blouses: false, Bangles: false, Materials: false, [cat]: true });
    }
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    loadProducts();
  }, [categories, minPrice, maxPrice]);

  async function loadProducts(search = searchTerm) {
    setLoading(true);
    setError(null);
    try {
      const selectedCats = Object.keys(categories).filter(k => categories[k]);
      // If all or none selected, no category filter; if only one, filter by it
      const categoryFilter = selectedCats.length === 1 ? selectedCats[0] : undefined;

      let data = await fetchProducts({
        category: categoryFilter,
        minPrice,
        maxPrice,
        search: search.trim() || undefined,
      });

      // Client-side multi-category filter when multiple are selected
      if (selectedCats.length > 1 && selectedCats.length < 3) {
        data = data.filter(p => selectedCats.includes(p.category));
      }

      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setFilterOpen(false);
    }
  }

  function handleSearch(val) {
    setSearchTerm(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (!val.trim()) { loadProducts(''); setShowSuggestions(false); return; }
      loadProducts(val);
      setShowSuggestions(true);
    }, 300);
  }

  const suggestions = products.filter(p =>
    searchTerm && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Filter Sidebar */}
      <div className={`filter-sidebar${filterOpen ? ' open' : ''}`}>
        <div className="filter-header">
          <h3>Filter</h3>
          <button className="close-filter" onClick={() => setFilterOpen(false)}>&times;</button>
        </div>
        <div className="filter-section">
          <h4>Price</h4>
          <div className="price-range">
            <div className="price-inputs">
              <input type="number" placeholder="From ₹" value={minPrice} min="0"
                onChange={e => setMinPrice(+e.target.value)} />
              <span>-</span>
              <input type="number" placeholder="To ₹" value={maxPrice} min="0"
                onChange={e => setMaxPrice(+e.target.value)} />
            </div>
            <button id="applyPrice" onClick={() => loadProducts()}>Apply</button>
          </div>
        </div>
        <div className="filter-section">
          <h4>Categories</h4>
          {Object.keys(categories).map(cat => (
            <div className="filter-item" key={cat}>
              <input type="checkbox" id={cat} checked={categories[cat]}
                onChange={e => setCategories(prev => ({ ...prev, [cat]: e.target.checked }))} />
              <label htmlFor={cat}>{cat}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="title">
        <h1>OUR COLLECTIONS</h1>
        <div className="breadcrumb">
          <span><a href="/">HOME</a></span> &gt; <span>COLLECTIONS</span>
        </div>
      </div>

      {/* Search */}
      <div className="product-selection">
        <form className="product-search" onSubmit={e => { e.preventDefault(); loadProducts(); setShowSuggestions(false); }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => searchTerm && setShowSuggestions(true)}
          />
          <button type="submit" className="search-button">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions" style={{ display: 'block' }}>
              {suggestions.map(p => (
                <a key={p.id} href="#" onClick={e => { e.preventDefault(); navigate(`/product/${p.id}`); setShowSuggestions(false); }}>
                  {p.name} - ₹{p.price}
                </a>
              ))}
            </div>
          )}
          {showSuggestions && suggestions.length === 0 && searchTerm && (
            <div className="search-suggestions" style={{ display: 'block' }}>
              <div className="no-results">No matching products found</div>
            </div>
          )}
        </form>
      </div>

      {/* Products */}
      <div className="products-content">
        <div className="products-header">
          <button className="filter-button" onClick={() => setFilterOpen(true)}>
            <i className="fas fa-filter"></i> Filter
          </button>
          <div className="results-count">
            {loading ? 'Loading...' : products.length === 0
              ? 'Showing 0 results'
              : `Showing 1 - ${products.length} of ${products.length} results`}
          </div>
        </div>

        <div className="products-grid">
          {loading && <div className="no-products">Loading products...</div>}
          {error && <div className="no-products" style={{ color: 'red' }}>Error: {error}</div>}
          {!loading && !error && products.length === 0 && (
            <div className="no-products">No products match your criteria</div>
          )}
          {!loading && !error && products.map(product => (
            <div key={product.id} className="product-card"
              onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
              <img src={product.image || product.images?.[0] || '/elite studio pic/product.jpeg'} alt={product.name} className="product-image"
                onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">₹ {product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
