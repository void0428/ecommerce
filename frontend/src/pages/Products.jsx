import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    search: '',
    ordering: '-created_at',
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters, page]);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data);
      console.log('fetching Products Categories: ', productsAPI.getAll());
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        ...filters,
      };
      if (!params.category) delete params.category;
      if (!params.gender) delete params.gender;
      if (!params.search) delete params.search;

      const response = await productsAPI.getAll(params);
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1 className="page-title">All Products</h1>
        <div className="products-layout">
          <aside className="filters">
            <h3>Filters</h3>
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <option value="">All</option>
                <option value="M">Men</option>
                <option value="W">Women</option>
                <option value="U">Unisex</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.ordering}
                onChange={(e) => handleFilterChange('ordering', e.target.value)}
              >
                <option value="-created_at">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </aside>
          <div className="products-content">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            {products.length === 0 ? (
              <div className="no-products">No products found</div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

