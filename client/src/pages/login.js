import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      setToken(response.data.token);
      setUser(response.data.user);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-white rounded-xl shadow-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Lumina
            </h1>
            <p className="text-slate-600 mt-2">AI-Powered Data Analytics Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-base"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-base"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-slate-600 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
