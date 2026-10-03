import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User as UserIcon, Mail, Lock, AlertCircle, PlayCircle } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to complete registration. Please check input details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to enter demo mode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md space-y-6 bg-slate-800/80 border border-slate-700/80 p-8 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl text-white mb-1">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create SpeedSight Account</h1>
          <p className="text-xs text-slate-400">Register to start monitoring vehicle speed analytics.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Traffic Operator"
            icon={<UserIcon className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@speedsight.local"
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" disabled={isSubmitting} className="w-full mt-2" size="lg">
            {isSubmitting ? 'Creating Account...' : 'Register Account'}
          </Button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-500">OR</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-950/40"
          size="lg"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Continue as Demo User
        </Button>

        <div className="pt-2 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
