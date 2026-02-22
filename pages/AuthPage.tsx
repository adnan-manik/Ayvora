import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create profile entry in Firestore
        if (user) {
          await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: email,
            full_name: fullName,
            createdAt: new Date().toISOString()
          });
        }
        alert('Signup successful!');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 md:p-12 shadow-lg max-w-md w-full rounded-sm">
        <h2 className="text-3xl font-serif font-bold text-center mb-8 text-dark-900">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 mb-6 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 p-3 rounded-sm focus:border-gold-500 outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 p-3 rounded-sm focus:border-gold-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full border border-gray-300 p-3 rounded-sm focus:border-gold-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-70"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-500 hover:text-dark-900 underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};