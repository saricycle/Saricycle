import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { database } from '../../firebase/config';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Eye,
  EyeOff,
  Image,
  CheckCircle,
  X,
  Tag,
  Star,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './ManageProducts.css';

const ManageProducts = React.memo(() => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsRequired: 0,
    image: '',
    category: '',
    stock: 0,
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [imagePreview, setImagePreview] = useState('');

  // Optimized Firebase listener with proper cleanup
  useEffect(() => {
    let unsubscribe;
    
    const setupListener = () => {
      try {
        const productsRef = ref(database, 'Products');
        unsubscribe = onValue(productsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const productsList = Object.keys(data).map(productID => ({
              productID,
              ...data[productID]
            }));
            setProducts(productsList);
          } else {
            setProducts([]);
          }
        }, (error) => {
          console.error('Error fetching products:', error);
        });
      } catch (error) {
        console.error('Error setting up product listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Memoized input handler
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'pointsRequired' || name === 'stock' ? parseInt(value) || 0 : value
    }));

    // Handle image preview
    if (name === 'image') {
      setImagePreview(value);
    }
  }, []);

  // Create new product
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.pointsRequired) {
      alert('Product name, description, and points required are mandatory!');
      return;
    }

    setLoading(true);
    try {
      const productsRef = ref(database, 'Products');
      await push(productsRef, {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setFormData({
        name: '',
        description: '',
        pointsRequired: 0,
        image: '',
        category: '',
        stock: 0,
        isActive: true
      });
      setImagePreview('');
      
      alert('Product created successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    } finally {
      setLoading(false);
    }
  };

  // Update existing product
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.pointsRequired) {
      alert('Product name, description, and points required are mandatory!');
      return;
    }

    setLoading(true);
    try {
      const productRef = ref(database, `Products/${editingId}`);
      await update(productRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      
      setFormData({
        name: '',
        description: '',
        pointsRequired: 0,
        image: '',
        category: '',
        stock: 0,
        isActive: true
      });
      setImagePreview('');
      setEditingId(null);
      
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (productID) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        const productRef = ref(database, `Products/${productID}`);
        await remove(productRef);
        
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      } finally {
        setLoading(false);
      }
    }
  };

  // Edit product (populate form)
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      pointsRequired: product.pointsRequired,
      image: product.image || '',
      category: product.category || '',
      stock: product.stock || 0,
      isActive: product.isActive !== undefined ? product.isActive : true
    });
    setImagePreview(product.image || '');
    setEditingId(product.productID);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setFormData({
      name: '',
      description: '',
      pointsRequired: 0,
      image: '',
      category: '',
      stock: 0,
      isActive: true
    });
    setImagePreview('');
    setEditingId(null);
  };

  // Toggle product active status
  const handleToggleActive = async (productID, currentStatus) => {
    setLoading(true);
    try {
      const productRef = ref(database, `Products/${productID}`);
      await update(productRef, {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Error updating product status');
    } finally {
      setLoading(false);
    }
  };

  // Memoized categories and filtered products for better performance
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['all', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (product.name && product.name.toLowerCase().includes(searchTermLower)) ||
        (product.description && product.description.toLowerCase().includes(searchTermLower)) ||
        (product.category && product.category.toLowerCase().includes(searchTermLower));
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <AdminLayout>
      <div className="manage-products-page">
        <div className="page-header">
          <h1>Manage Products</h1>
          <p>Add, edit, and manage products available for redemption with points</p>
        </div>

        <div className="products-content">
          {/* Create/Edit Form */}
          <div className="form-section">
            <div className="section-header">
              {editingId ? <Edit3 size={24} /> : <Plus size={24} />}
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            </div>
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Electronics, Clothing, Food"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pointsRequired">Points Required *</label>
                  <input
                    type="number"
                    id="pointsRequired"
                    name="pointsRequired"
                    value={formData.pointsRequired}
                    onChange={handleInputChange}
                    placeholder="Enter points required"
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="stock">Stock Quantity</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="Enter stock quantity"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="image">Product Image URL</label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active Product
                  </label>
                </div>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <label>Image Preview:</label>
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
                  {loading ? 'Processing...' : (editingId ? 'Update Product' : 'Add Product')}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    <X size={18} />
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="admin-products-section">
            <div className="products-header">
              <div className="header-title">
                <Package size={24} />
                <h2>Products ({filteredProducts.length})</h2>
              </div>
              <div className="filters">
                <div className="search-box">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="category-filter">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="products-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoadingSkeleton key={index} type="card" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products">
                <Package size={64} className="no-products-icon" />
                <p>No products found</p>
                <small>{searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'Add your first product above!'}</small>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div key={product.productID} className={`product-card ${!product.isActive ? 'inactive' : ''} ${editingId === product.productID ? 'editing' : ''}`}>
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">
                          <Image size={48} />
                          <small>No Image</small>
                        </div>
                      )}
                      <div className="product-status">
                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                          {product.isActive ? <CheckCircle size={16} /> : <X size={16} />}
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="product-info">
                      <div className="product-header">
                        <h3 className="product-name">{product.name}</h3>
                        {product.category && (
                          <span className="product-category">
                            <Tag size={14} />
                            {product.category}
                          </span>
                        )}
                      </div>
                      
                      <p className="product-description">{product.description}</p>
                      
                      <div className="product-details">
                        <div className="points-required">
                          <Star size={16} className="points-icon" />
                          <span className="points-label">Points Required:</span>
                          <span className="points-value">{product.pointsRequired}</span>
                        </div>
                        {product.stock !== undefined && (
                          <div className="stock-info">
                            {product.stock === 0 ? <AlertCircle size={16} className="stock-icon" /> : <CheckCircle size={16} className="stock-icon" />}
                            <span className="stock-label">Stock:</span>
                            <span className={`stock-value ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                              {product.stock === 0 ? 'Out of Stock' : product.stock}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="product-meta">
                        <small>
                          Created: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown'}
                        </small>
                        {product.updatedAt && product.updatedAt !== product.createdAt && (
                          <small>
                            Updated: {new Date(product.updatedAt).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    </div>
                    
                                          <div className="product-actions">
                        <button
                          onClick={() => handleToggleActive(product.productID, product.isActive)}
                          className={`btn btn-toggle ${product.isActive ? 'btn-warning' : 'btn-success'}`}
                          disabled={loading}
                          title={product.isActive ? 'Deactivate product' : 'Activate product'}
                        >
                          {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="btn btn-edit"
                          title="Edit product"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.productID)}
                          className="btn btn-delete"
                          title="Delete product"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
});

export default ManageProducts; 