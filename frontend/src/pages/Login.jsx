import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { loginUser } from '../api/authApi';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await loginUser(data);
      login(res.data.data.token, res.data.data.user);
      toast.success(`Welcome back, ${res.data.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <aside className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-container blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
            <span className="material-symbols-outlined text-white text-4xl">task_alt</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Manage your team.<br />Ship faster.
          </h1>
          <p className="text-lg text-white/80 max-w-sm mx-auto">
            The high-performance workspace designed for teams who value speed, clarity, and precision.
          </p>
        </div>
        <div className="absolute bottom-12 left-12 right-12">
          <div className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['A', 'B', 'C'].map((l) => (
                <div key={l} className="w-9 h-9 rounded-full bg-indigo-400 border-2 border-primary-container flex items-center justify-center text-white text-xs font-bold">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-white/90 text-sm font-medium">Joined by 2,000+ top engineering teams</p>
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
            <span className="text-2xl font-bold text-on-surface">TaskFlow</span>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-outline-variant shadow-lg">
            {/* Logo (desktop) */}
            <div className="hidden lg:flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
              <span className="text-2xl font-bold text-on-surface">TaskFlow</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-on-surface mb-1">Welcome back</h2>
              <p className="text-sm text-on-surface-variant">Sign in to your workspace</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className={`input-field ${errors.email ? 'border-error focus:ring-error' : ''}`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-on-surface" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-field pr-12 ${errors.password ? 'border-error focus:ring-error' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-error">{errors.password.message}</p>
                )}
              </div>

              <button type="submit" className="btn-primary w-full justify-center h-10" disabled={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Register
                </Link>
              </p>
            </div>

            {/* Test credentials hint */}
            <div className="mt-4 p-3 bg-surface-container rounded-lg border border-outline-variant">
              <p className="text-xs text-on-surface-variant font-medium mb-1">Test Credentials:</p>
              <p className="text-xs text-on-surface-variant">Admin: <span className="font-mono text-primary">admin@test.com</span> / Admin@1234</p>
              <p className="text-xs text-on-surface-variant">Member: <span className="font-mono text-primary">alice@test.com</span> / Member@1234</p>
            </div>
          </div>

          <footer className="mt-6 flex justify-center gap-6">
            <a href="#" className="text-xs text-outline hover:text-on-surface transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-outline hover:text-on-surface transition-colors">Terms of Service</a>
          </footer>
        </div>
      </main>
    </div>
  );
}
