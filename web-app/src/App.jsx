import React, { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import { ToastProvider } from './components/ToastContext';
import { PWAProvider } from './contexts/PWAContext';
import { PWANotifications } from './components/PWANotifications';
import RateLimitNotification from './components/RateLimitNotification';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import LandingPage from './pages/LandingPage';
import UserProfile from './pages/UserProfile';
import AnonymousReport from './pages/AnonymousReport';
import AboutProject from './pages/AboutProject';

function AuthForms() {
  const { login, register, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(email, password);
    }
    // Redirect immediately after successful login/register
    if (success) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const decoded = require('jwt-decode').jwtDecode(storedToken);
          if (decoded.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } catch (e) {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-green-600 mb-2">🌱 RashTrackr</div>
          <h2 className="text-2xl font-semibold text-gray-900">{isLogin ? 'Welcome Back' : 'Join Our Community'}</h2>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to continue making a difference' : 'Create an account to start reporting environmental issues'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          {isLogin ? (
            <span className="text-gray-600">
              Don&apos;t have an account?{' '}
              <button 
                className="text-green-600 hover:text-green-700 font-medium" 
                onClick={() => setIsLogin(false)}
              >
                Sign up
              </button>
            </span>
          ) : (
            <span className="text-gray-600">
              Already have an account?{' '}
              <button 
                className="text-green-600 hover:text-green-700 font-medium" 
                onClick={() => setIsLogin(true)}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about-project" element={<AboutProject />} />
      <Route path="/anonymous-report" element={<AnonymousReport />} />
      <Route path="/login" element={<AuthForms />} />
      <Route path="/register" element={<AuthForms />} />
      <Route path="/dashboard" element={user ? <UserDashboard /> : <AuthForms />} />
      <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <AuthForms />} />
      <Route path="/profile" element={user ? <UserProfile /> : <AuthForms />} />
    </Routes>
  );
}

export default function RootApp() {
  return (
    <PWAProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <App />
            <PWANotifications />
            <RateLimitNotification />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </PWAProvider>
  );
}
