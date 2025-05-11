import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from './Button'; // Adjust the import path as needed
import LanguageSelector from './LanguageSelector'; // Adjust the import path as needed
import { useAuthStore } from '../../stores/authStore'; // Adjust the import path as needed

interface HeaderProps {
  noBG?: boolean;
}

const Header = ({ noBG = false }: HeaderProps) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const headerClass = noBG ? 'bg-background' : 'bg-white shadow-sm';

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">
              <Link to="/">
                2akel
              </Link>
            </h1>
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
    </header>
  );
};

export default Header;