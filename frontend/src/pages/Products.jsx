import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    search: '',
    ordering: '-created_at',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Update filters when URL params change
    const categoryParam = searchParams.get('category');
    const genderParam = searchParams.get('gender');
    setFilters(prev => ({
      ...prev,
      category: categoryParam || '',
      gender: genderParam || '',
    }));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await productsAPI.getCategories();
      const categoriesData = response.data?.results || response.data || [];
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        console.warn('Categories data is not an array:', categoriesData);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let allProducts = [];
      let currentPage = 1;
      let hasMore = true;

      console.log('Starting to fetch products with filters:', filters);

      // Fetch all pages of results
      while (hasMore) {
        const params = {
          page: currentPage,
          ...filters,
        };
        
        // Remove empty filter values
        if (!params.category) delete params.category;
        if (!params.gender) delete params.gender;
        if (!params.search) delete params.search;

        console.log(`Fetching page ${currentPage} with params:`, params);

        const response = await productsAPI.getAll(params);
        
        console.log(`Page ${currentPage} response:`, response.data);

        // Handle different response structures
        let pageResults = [];
        let totalCount = 0;
        let nextPage = null;
        
        if (response.data.results) {
          // Paginated response with results array
          pageResults = response.data.results;
          totalCount = response.data.count || 0;
          nextPage = response.data.next;
          console.log(`Page ${currentPage}: Got ${pageResults.length} products, total count: ${totalCount}, next: ${nextPage}`);
        } else if (Array.isArray(response.data)) {
          // Direct array response
          pageResults = response.data;
          console.log(`Page ${currentPage}: Got ${pageResults.length} products (direct array)`);
        }

        if (Array.isArray(pageResults) && pageResults.length > 0) {
          allProducts = [...allProducts, ...pageResults];
          
          // CORRECT LOGIC: Check if there's a next page using the 'next' field
          // The API returns next: "url" if there are more pages, or next: null if this is the last page
          if (nextPage === null) {
            hasMore = false;
            console.log('Stopping pagination: No next page (next is null)');
          }
          
          // Alternative check: if we've fetched all products according to count
          if (totalCount > 0 && allProducts.length >= totalCount) {
            hasMore = false;
            console.log(`Stopping pagination: Fetched ${allProducts.length} >= ${totalCount} total`);
          }
          
          // Safety check: prevent infinite loops (max 50 pages)
          if (currentPage >= 50) {
            hasMore = false;
            console.log('Stopping pagination: Reached max page limit (50)');
          }
        } else {
          hasMore = false;
          console.log('Stopping pagination: No results in response');
        }

        currentPage++;
      }

      console.log(`Total products fetched: ${allProducts.length}`);
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (newFilters.category) {
      params.set('category', newFilters.category);
    }
    if (newFilters.gender) {
      params.set('gender', newFilters.gender);
    }
    setSearchParams(params);
  };

  if (loading && products.length === 0) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-gray-600 font-sans-body">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif-heading text-4xl md:text-5xl text-[#2b3349] mb-12 text-center tracking-wider">
          All Products
        </h1>
        
        {/* Show products count */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 font-sans-body">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <h3 className="font-serif-heading text-xl text-[#2b3349] mb-6 tracking-wider">Filters</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#2b3349] mb-2 font-sans-body">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  disabled={categoriesLoading}
                  className="w-full border-b border-gray-300 px-2 py-2 text-sm font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                >
                  <option value="">All Categories</option>
                  {categoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No categories available</option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#2b3349] mb-2 font-sans-body">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="w-full border-b border-gray-300 px-2 py-2 text-sm font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                >
                  <option value="">All</option>
                  <option value="M">Men</option>
                  <option value="W">Women</option>
                  <option value="U">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#2b3349] mb-2 font-sans-body">Sort By</label>
                <select
                  value={filters.ordering}
                  onChange={(e) => handleFilterChange('ordering', e.target.value)}
                  className="w-full border-b border-gray-300 px-2 py-2 text-sm font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
                >
                  <option value="-created_at">Newest</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border-b border-gray-300 px-4 py-2 text-sm font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
              />
            </div>
            {loading ? (
              <div className="text-center py-20">
                <p className="text-[#2b3349]/70 font-sans-body">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#2b3349]/70 font-sans-body">No products found</p>
              </div>
            ) : (
              <div className="w-full flex flex-wrap gap-5 justify-center">
                {products.map((product) => (
                  <div key={product.id} style={{ width: '360px' }} className="shrink-0">
                    <ProductCard product={product} />
                  </div>
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