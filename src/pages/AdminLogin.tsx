import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, 'id' | 'imageUrl'> & { imageFile?: File | null }>({
    name: '', price: 0, description: '', stock: 0, imageFile: null
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch products in real time
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return () => unsub();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
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

  if (user) {
    return (
      <div style={{ maxWidth: 700, margin: '4rem auto', textAlign: 'center' }}>
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user.email}</p>
        <button className="button" onClick={handleLogout}>Logout</button>
        <div style={{ margin: '2rem 0', textAlign: 'left' }}>
          <h3>{editId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleProductSubmit} style={{ display: 'grid', gap: 16, maxWidth: 400 }}>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
              required
              min={0}
              step={0.01}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              rows={3}
            />
            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
              required
              min={0}
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setForm(f => ({ ...f, imageFile: e.target.files?.[0] || null }))}
            />
            <button className="button" type="submit" disabled={formLoading}>
              {formLoading ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
            </button>
            {editId && (
              <button type="button" className="button" style={{ background: '#888' }} onClick={() => { setEditId(null); setForm({ name: '', price: 0, description: '', stock: 0, imageFile: null }); }}>Cancel</button>
            )}
          </form>
        </div>
        <div style={{ marginTop: 32, textAlign: 'left' }}>
          <h3>Products</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr style={{ background: '#f7f7f7' }}>
                <th style={{ padding: 8, border: '1px solid #eaeaea' }}>Image</th>
                <th style={{ padding: 8, border: '1px solid #eaeaea' }}>Name</th>
                <th style={{ padding: 8, border: '1px solid #eaeaea' }}>Price</th>
                <th style={{ padding: 8, border: '1px solid #eaeaea' }}>Stock</th>
                <th style={{ padding: 8, border: '1px solid #eaeaea' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td style={{ padding: 8, border: '1px solid #eaeaea', textAlign: 'center' }}>
                    {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ width: 60, height: 60, objectFit: 'contain' }} />}
                  </td>
                  <td style={{ padding: 8, border: '1px solid #eaeaea' }}>{product.name}</td>
                  <td style={{ padding: 8, border: '1px solid #eaeaea' }}>${product.price.toFixed(2)}</td>
                  <td style={{ padding: 8, border: '1px solid #eaeaea' }}>{product.stock}</td>
                  <td style={{ padding: 8, border: '1px solid #eaeaea' }}>
                    <button className="button" style={{ fontSize: 12, padding: '4px 10px', marginRight: 8 }} onClick={() => handleEdit(product)}>Edit</button>
                    <button className="button" style={{ fontSize: 12, padding: '4px 10px', background: '#c00' }} onClick={() => handleDelete(product.id!)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, border: '1px solid #eaeaea', borderRadius: 8, background: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button className="button" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 