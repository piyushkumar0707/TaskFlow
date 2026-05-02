import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { registerUser } from '../api/authApi';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await registerUser({ name: data.name, email: data.email, password: data.password });
      login(res.data.data.token, res.data.data.user);
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
          <span className="text-2xl font-bold text-on-surface">TaskFlow</span>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-outline-variant shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface mb-1">Create your account</h2>
            <p className="text-sm text-on-surface-variant">Join your team on TaskFlow</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                className={`input-field ${errors.name ? 'border-error' : ''}`}
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                className={`input-field ${errors.email ? 'border-error' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                className={`input-field ${errors.password ? 'border-error' : ''}`}
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                className={`input-field ${errors.confirmPassword ? 'border-error' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full justify-center h-10" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
