import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { api } from '../api/axios';
import { useAuthStore } from '../store/auth.store';
import { UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const { token, user } = response.data.data;
      setAuth(user, token);
      toast.success(`Account created successfully! Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.data?.errors) {
         // Handle Zod validation array
         const firstError = error.response.data.errors[0];
         toast.error(firstError.message || 'Validation failed');
      } else {
         const message = error.response?.data?.message || 'Registration failed. Please try again.';
         toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mb-8">
        <Logo size="lg" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/50 backdrop-blur-md py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-zinc-800">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Create an account</h2>
            <p className="text-sm text-zinc-400 mt-1">Join your organization's workspace.</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                {!isLoading && <UserPlus size={18} className="mr-2" />}
                Sign up
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
