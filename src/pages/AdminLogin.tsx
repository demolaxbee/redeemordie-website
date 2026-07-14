import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, resetPassword, error: authError, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        navigate('/admin/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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