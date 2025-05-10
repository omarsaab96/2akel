import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LanguageSelector from '../../components/common/LanguageSelector';

const Register = () => {
   const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, user } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('restaurant');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === 'restaurant' && !restaurantName) {
      setError('Restaurant name is required');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        email,
        password,
        name,
        role,
        ...(role === 'restaurant' ? { restaurantName } : {}),
        ...(phone ? { phone } : {}),
      };

      await register(userData);
      toast.success('Account created successfully!');
      navigate(role === 'restaurant' ? '/restaurant' : '/user', { replace: true });
    } catch (error) {
      setError('Registration failed. This email may already be in use.');
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">2akel</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary">
                {t('common.home')}
              </Link>
              <Link to="/places" className="text-sm font-medium text-gray-700 hover:text-primary">
                {t('common.places')}
              </Link>

              <LanguageSelector />

              {user == null ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    {t('common.signIn')}
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      {t('common.register')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to={user.role == "restaurant" ? "/restaurant" : "/user"}>
                  <Button variant="primary" size="sm">
                    {t('common.dashboard')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header >
      <div className="bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 ">
              Create your account
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                sign in to your existing account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 text-error p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Select
                label="I am a:"
                options={[
                  { value: 'restaurant', label: 'Restaurant Owner' },
                  { value: 'customer', label: 'Customer' },
                ]}
                value={role}
                onChange={(value) => setRole(value as UserRole)}
              />

              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                label="Full Name"
                placeholder="John Doe"
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {role === 'restaurant' && (
                <Input
                  id="restaurantName"
                  name="restaurantName"
                  type="text"
                  required
                  label="Restaurant Name"
                  placeholder="Your Restaurant"
                  icon={Store}
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />
              )}

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                label="Email address"
                placeholder="your@email.com"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                label="Phone Number (optional)"
                placeholder="+1 (555) 123-4567"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                label="Password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                label="Confirm Password"
                placeholder="••••••••"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </div>

            <div className="text-sm text-center text-gray-600">
              By signing up, you agree to our{' '}
              <a href="#" className="font-medium text-primary hover:text-primary-dark">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-primary hover:text-primary-dark">
                Privacy Policy
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;