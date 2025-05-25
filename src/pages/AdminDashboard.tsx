import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, Product, addProduct, updateProduct, deleteProduct } from '../utils/airtable';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, storage } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/admin.css';

interface ProductFormData {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
}

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    description: '',
    category: '',
    imageUrl: '',
    stock: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const handleEdit = (product: Product) => {
    // Populate form with product data
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      imageUrl: product.imageUrl || '',
      stock: product.stock || 0
    });
    setImagePreview(product.imageUrl || '');
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        // Delete from Firestore
        await deleteDoc(doc(db, 'products', productId));
        // Delete from Airtable
        await deleteProduct(productId);
        // Update UI
        setProducts(products.filter(product => product.id !== productId));
        alert('Product deleted successfully');
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      description: '',
      category: '',
      imageUrl: '',
      stock: 0
    });
    setImageFile(null);
    setImagePreview('');
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      let finalImageUrl = formData.imageUrl;
      
      // If there's a new image file, upload it
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }
      
      const productData = {
        ...formData,
        imageUrl: finalImageUrl,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };
      
      if (isEditing && formData.id) {
        // Update existing product
        // Update in Firestore
        await updateDoc(doc(db, 'products', formData.id), productData);
        // Update in Airtable
        await updateProduct(formData.id, productData);
        
        // Update local state
        setProducts(products.map(p => p.id === formData.id ? { ...p, ...productData } : p));
        alert('Product updated successfully');
      } else {
        // Add new product
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'products'), productData);
        const newProduct = { ...productData, id: docRef.id };
        
        // Add to Airtable
        await addProduct(newProduct);
        
        // Update local state
        setProducts([...products, newProduct]);
        alert('Product added successfully');
      }
      
      // Reset and close form
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">
          <span>{user?.email}</span>
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'products' && (
          <motion.div 
            className="admin-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="admin-toolbar">
              <h2>Manage Products</h2>
              <button 
                className="add-btn"
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
              >
                Add New Product
              </button>
            </div>

            <div className="products-grid">
              {products.map((product) => (
                <div className="admin-product-card" key={product.id}>
                  <div className="admin-product-image">
                    <img src={product.imageUrl || '/placeholder-image.jpg'} alt={product.name} />
                  </div>
                  <div className="admin-product-info">
                    <div className="admin-product-name">{product.name}</div>
                    <div className="admin-product-price">${product.price}</div>
                    <div className="admin-product-stock">Stock: {product.stock || 0}</div>
                    <div className="admin-product-actions">
                      <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div 
            className="admin-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Orders Management</h2>
            <p>No orders to display.</p>
          </motion.div>
        )}

        {activeTab === 'customers' && (
          <motion.div 
            className="admin-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Customer Management</h2>
            <p>No customers to display.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Product Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !formSubmitting && setShowAddForm(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                <button 
                  className="close-modal" 
                  onClick={() => !formSubmitting && setShowAddForm(false)}
                  disabled={formSubmitting}
                >×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="product-form">
                <div className="product-form-container">
                  <div className="form-section">
                    <div className="form-group">
                      <label htmlFor="name">Product Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={formSubmitting}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="price">Price ($)</label>
                      <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        disabled={formSubmitting}
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
                        min="0"
                        disabled={formSubmitting}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select 
                        id="category" 
                        name="category" 
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={formSubmitting}
                      >
                        <option value="">Select Category</option>
                        <option value="shirts">Shirts</option>
                        <option value="hoodies">Hoodies</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea 
                        id="description" 
                        name="description" 
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        disabled={formSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <div className="form-group">
                      <label>Product Image</label>
                      <div className="image-preview">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" />
                        ) : (
                          <span>No image selected</span>
                        )}
                      </div>
                      
                      <div className="file-input-wrapper">
                        <input 
                          type="file"
                          ref={fileInputRef}
                          className="file-input"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={formSubmitting}
                        />
                        <span className="file-input-label">Choose Image</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="imageUrl">Or Image URL</label>
                      <input 
                        type="text" 
                        id="imageUrl" 
                        name="imageUrl" 
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        disabled={formSubmitting}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => setShowAddForm(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard; 