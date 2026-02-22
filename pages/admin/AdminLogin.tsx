import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('ayvora_admin_auth', 'true');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error("Login failed", err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative">
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-dark-900 font-bold">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo-black.png" alt="Ayvora" className="h-12 w-auto object-contain mb-2" />
          <h2 className="text-2xl font-serif font-bold text-dark-900 tracking-widest">AYVORA</h2>
        </div>
        <h1 className="text-xl font-medium mb-6 text-center text-gray-500 uppercase tracking-wide">Admin Portal</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ayvora.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
            disabled={loading}
            className="w-full bg-dark-900 text-white py-2 font-bold uppercase tracking-wider hover:bg-gold-600 transition-colors disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};