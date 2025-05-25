import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  imageUrl: string;
}

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, resetPassword, error: authError, loading } = useAuth();
  const navigate = useNavigate();

  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, 'id' | 'imageUrl'> & { imageFile?: File | null }>({
    name: '', price: 0, description: '', stock: 0, imageFile: null
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        navigate('/admin/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch products in real time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Add or update product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    let imageUrl = '';
    try {
      if (form.imageFile) {
        const imageRef = ref(storage, `products/${Date.now()}_${form.imageFile.name}`);
        await uploadBytes(imageRef, form.imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }
      if (editId) {
        // Update
        const updateData: any = {
          name: form.name,
          price: Number(form.price),
          description: form.description,
          stock: Number(form.stock),
        };
        if (imageUrl) updateData.imageUrl = imageUrl;
        await updateDoc(doc(db, 'products', editId), updateData);
        setEditId(null);
      } else {
        // Add
        await addDoc(collection(db, 'products'), {
          name: form.name,
          price: Number(form.price),
          description: form.description,
          stock: Number(form.stock),
          imageUrl,
        });
      }
      setForm({ name: '', price: 0, description: '', stock: 0, imageFile: null });
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    }
    setFormLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id!);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      imageFile: null,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  if (resetSent) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box">
          <div className="admin-login-header">
            <h2>Check Your Email</h2>
            <p>We've sent password reset instructions to {email}</p>
          </div>
          <div className="forgot-password">
            <button onClick={() => {
              setIsResetMode(false);
              setResetSent(false);
            }}>
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h2>{isResetMode ? 'Reset Password' : 'Admin Login'}</h2>
        </div>
        <form className="admin-login-form" onSubmit={isResetMode ? handleResetPassword : handleLogin}>
          <div className="form-input">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {!isResetMode && (
            <div className="form-input">
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {authError && (
            <div className="error-text">{authError}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Processing...' : isResetMode ? 'Send Reset Link' : 'Sign in'}
          </button>

          <div className="forgot-password">
            <button
              type="button"
              onClick={() => setIsResetMode(!isResetMode)}
            >
              {isResetMode ? 'Back to login' : 'Forgot your password?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 