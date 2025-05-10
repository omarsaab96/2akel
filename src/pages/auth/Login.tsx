import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import Button from '../../components/common/Button';
import LanguageSelector from '../../components/common/LanguageSelector';
import Input from '../../components/common/Input';
import { User, Lock } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, user } = useAuthStore();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const resp = await login(email, password);

      toast.success(`Welcome back!`);
      console.log(resp);

      if (resp.role == "restaurant") {
        navigate('/restaurant', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    } catch (error) {
      console.log(error);
      toast.error(error + "");
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
              Sign in to your account
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
                create a new account
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
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                label="Email address"
                placeholder="your@email.com"
                icon={User}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                label="Password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;