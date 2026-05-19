import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Hexagon } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 w-full max-w-md p-8 sm:p-10 border border-white/50 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30">
            <Hexagon className="text-white fill-white/20" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mt-2 font-medium">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
            <input
              type="email"
              className="input-field py-3"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              className="input-field py-3"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-2 text-base"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">
            Sign up
          </Link>
        </p>

        {/* Demo credentials hint */}
        <div className="mt-8 p-4 bg-blue-50/50 rounded-xl text-xs text-blue-800 border border-blue-100 font-medium">
          <p className="font-bold text-blue-900 mb-2">Demo accounts (after seeding):</p>
          <div className="space-y-1">
            <p>Admin: <span className="font-mono bg-white/60 px-1 rounded">admin@example.com</span> / <span className="font-mono bg-white/60 px-1 rounded">password123</span></p>
            <p>Member: <span className="font-mono bg-white/60 px-1 rounded">member@example.com</span> / <span className="font-mono bg-white/60 px-1 rounded">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
