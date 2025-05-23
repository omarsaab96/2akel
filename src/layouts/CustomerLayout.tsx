import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Home, LayoutDashboard, Settings } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/common/LanguageSelector';

const CustomerLayout = () => {
  const { user, logout } = useAuthStore();
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/user',
      label: t('restaurant.dashboard'),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      path: `/user/menu`,
      label: t('common.scannedMenus'),
      icon: Home,
      exact: true,
    },
    {
      path: `/user/orders`,
      label: t('common.orders'),
      icon: ShoppingBag,
      exact: true,
    },
  ];

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-primary">
            <Link to="/">
              2akel
            </Link>
          </h1>
          <p className="text-sm text-gray-600">{t('restaurant.dashboard')}</p>
        </div>

        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-1">
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 text-sm font-medium
                    ${isActive
                      ? 'text-primary bg-primary/10 border-r-4 border-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 w-64 border-t border-gray-200 p-4">
          <div className="flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-8 w-[34px] rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-2 w-[calc(100%-50px)] flex-grow-0 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate w-full">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate w-full">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>

            <div className="relative group">
              {/* <button className="text-gray-500 hover:text-gray-700">
                <ChevronDown className="h-5 w-5" />
              </button> */}

              <div className="mb-1 bg-white rounded-md shadow-lg py-1 group-hover:block">
                {/* <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  {t('common.signIn')} {user?.email}
                </div> */}

                <button
                  className="w-full text-left  py-2 text-sm text-gray-700 hover:bg-primary/10 flex items-center gap-2"
                  onClick={() => navigate('/user/account')}
                >
                  <User className="h-4 w-4" />
                  {t('common.account')}
                </button>

                <button
                  className="w-full text-left  py-2 text-sm text-gray-700 hover:bg-primary/10 flex items-center gap-2"
                  onClick={() => navigate('/user/settings')}
                >
                  <Settings className="h-4 w-4" />
                  {t('common.settings')}
                </button>

                <button
                  className="w-full text-left  py-2 text-sm text-gray-700 hover:bg-primary/10 flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  {t('common.signOut')}
                </button>

                <div className=" py-2 border-t border-gray-100">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;