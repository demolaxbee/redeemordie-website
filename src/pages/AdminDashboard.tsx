import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, Product, addProduct, updateProduct, deleteProduct } from '../utils/airtable';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/admin.css';

interface ProductFormData {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrls: string[];
  stock: number;
  sizes: string[];
}

const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;

if (!uploadPreset || !cloudinaryUrl) {
  throw new Error('Cloudinary environment variables are not set!');
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
    imageUrls: [],
    stock: 0,
    sizes: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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

  useEffect(() => {
    if (showAddForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showAddForm]);
  

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      imageUrls: product.imageUrls || [],
      stock: product.stock || 0,
      sizes: product.sizes || []
    });
    setImagePreview(product.imageUrls || []);
    setImageFiles([]);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await deleteProduct(productId);
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
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(filesArray);
      
      // Create preview URLs for new files
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setImagePreview(newPreviewUrls);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      description: '',
      category: '',
      imageUrls: [],
      stock: 0,
      sizes: []
    });
    setImageFiles([]);
    setImagePreview([]);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImagesToCloudinary = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
  
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }
  
      const data = await response.json();
      return data.secure_url;
    });
  
    return Promise.all(uploadPromises);
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      let finalImageUrls: string[] = formData.imageUrls || [];

      // Only upload new images if files are selected
      if (imageFiles.length > 0) {
        console.log('Uploading new images...');
        const newImageUrls = await uploadImagesToCloudinary(imageFiles);
        finalImageUrls = newImageUrls;
        console.log('New images uploaded successfully');
      } else if (isEditing) {
        console.log('No new images selected, keeping existing images');
        // Keep existing images when editing without new files
        finalImageUrls = formData.imageUrls || [];
      }

      const productData = {
        ...formData,
        imageUrls: finalImageUrls,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      console.log('Submitting product data:', productData);

      if (isEditing && formData.id) {
        const updated = await updateProduct(formData.id, productData);
        setProducts(products.map(p => p.id === formData.id ? updated : p));
        alert('Product updated successfully');
      } else {
        const { id, ...newProductData } = productData;
        const newProduct = await addProduct(newProductData as Product);
        setProducts([...products, newProduct]);
        alert('Product added successfully');
      }

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
    return <div className="admin-loading"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="admin-error"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'products' && (
          <motion.div className="admin-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="admin-toolbar">
              <h2>Manage Products</h2>
              <button className="add-btn" onClick={() => { resetForm(); setShowAddForm(true); }}>Add New Product</button>
            </div>

            <div className="products-grid">
              {products.map((product) => (
                <div className="admin-product-card" key={product.id}>
                  <div className="admin-product-image">
                    {(product.imageUrls || []).map((url, index) => (
                      <img key={index} src={url} alt={`${product.name} ${index + 1}`} />
                    ))}
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
      </AnimatePresence>

      <AnimatePresence>
        {showAddForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !formSubmitting && setShowAddForm(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="close-modal" onClick={() => !formSubmitting && setShowAddForm(false)} disabled={formSubmitting}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-section">
                  <div className="form-group">
                    <label>Product Image</label>
                    <div className="image-preview">
                      {imagePreview.length > 0 ? (
                        (imagePreview || []).map((src, index) => <img key={index} src={src} alt={`Preview ${index + 1}`} />)
                      ) : (
                        <span>No images selected</span>
                      )}
                    </div>  

                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="file-input"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={formSubmitting}
                      />
                      <span className="file-input-label">Choose Image</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">Product Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} disabled={formSubmitting} required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Price ($)</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" disabled={formSubmitting} required />
                  </div>

                  <div className="form-group">
                    <label>Available Sizes</label>
                    <div className="size-checkboxes">
                      {availableSizes.map((size) => (
                        <label key={size} style={{ marginRight: '10px' }}>
                          <input
                            type="checkbox"
                            value={size}
                            checked={formData.sizes.includes(size)}
                            onChange={(e) => {
                              const { checked, value } = e.target;
                              if (checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  sizes: [...prev.sizes, value],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  sizes: prev.sizes.filter((s) => s !== value),
                                }));
                              }
                            }}
                            disabled={formSubmitting}
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock">Stock Quantity</label>
                    <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleInputChange} min="0" disabled={formSubmitting} required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select id="category" name="category" value={formData.category} onChange={handleInputChange} disabled={formSubmitting} required>
                      <option value="">Select Category</option>
                      <option value="T-Shirts">Shirts</option>
                      <option value="Hoodies">Hoodies</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Pants">Pants</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} disabled={formSubmitting} />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)} disabled={formSubmitting}>Cancel</button>
                  <button type="submit" className="save-btn" disabled={formSubmitting}>{formSubmitting ? 'Saving...' : 'Save Product'}</button>
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
