import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Landing from './pages/Landing';
import Places from './pages/Places';
import Place from './pages/Place';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RestaurantLayout from './layouts/RestaurantLayout';
import CustomerLayout from './layouts/CustomerLayout';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import MenuManager from './pages/restaurant/MenuManager';
import QRCodeGenerator from './pages/restaurant/QRCodeGenerator';
import OrdersManager from './pages/restaurant/OrdersManager';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerMenu from './pages/customer/Menu';
import CustomerOrders from './pages/customer/Orders';
import CustomerAccount from './pages/customer/Account';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/common/scrollTop'


const ProtectedRoute = ({
  children,
  requiredRole,
  redirectTo = '/'
}: {
  children: JSX.Element,
  requiredRole: 'restaurant' | 'customer',
  redirectTo?: string
}) => {
  const { user } = useAuthStore();

  if (!user || user.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/places" element={<Places />} />
        <Route path="/place/:id" element={<Place />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Restaurant routes */}
        <Route path="/restaurant" element={
          <ProtectedRoute requiredRole="restaurant" redirectTo="/login">
            <RestaurantLayout />
          </ProtectedRoute>
        }>
          <Route index element={<RestaurantDashboard />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="qrcode" element={<QRCodeGenerator />} />
          <Route path="orders" element={<OrdersManager />} />
        </Route>

        {/* Customer routes */}
        <Route path="/user" element={
          <ProtectedRoute requiredRole="customer" redirectTo="/login">
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CustomerDashboard />} />
          <Route path="menu" element={<CustomerMenu />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="account" element={<CustomerAccount />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;



// TODO list
//0- Footer content update
//1- Order follow up
//2- Restaurant private/public
//3- Restaurant custamization (cover image/colors...)
//4- Items photos
//5- Order Types (dine-in, takeaway, delivery)
//6- Customer Balance
//7- Share Places
//8- restaurants reports
//9- admin dashboard?