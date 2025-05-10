import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, PieChart, Users, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useMenuStore } from '../../stores/menuStore';
import { useOrderStore } from '../../stores/orderStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { getCategoriesByRestaurant, getMenuItemsByCategory } = useMenuStore();
  const { getOrdersByCustomer } = useOrderStore();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalBalance: 0,
    scannedMenus: 0
  });

  useEffect(() => {
    if (user) {
      const orders = getOrdersByCustomer(user.id);
      const pendingOrders = orders.filter((order) =>
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      ).length;

      let totalRewards = 0;

      orders.forEach((order) => {
        totalRewards += order.totalAmount;
      });

      totalRewards *= 0.1;

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        totalBalance: 0,
        scannedMenus: 0,
      });
    }
  }, [user, getCategoriesByRestaurant, getMenuItemsByCategory, getOrdersByCustomer]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const statCards = [
    {
      title: 'You Placed',
      value: stats.totalOrders + ` ${stats.totalOrders == 1 ? 'order' : 'orders'}`,
      icon: BarChart,
      color: 'bg-primary/10 text-primary',
      link: '/user/orders',
    },
    {
      title: 'You Ordered from',
      value: stats.pendingOrders + ` ${stats.pendingOrders == 1 ? 'place' : 'places'}`,
      icon: Clock,
      color: 'bg-warning/10 text-warning',
      link: '/user/menu',
    },
    {
      title: 'Scanned Menus',
      value: stats.scannedMenus,
      icon: Users,
      color: 'bg-secondary/10 text-secondary',
      link: '/user/menu',
    },
    {
      title: 'Balance',
      value: formatCurrency(stats.totalBalance),
      icon: DollarSign,
      color: 'bg-accent/10 text-accent-dark',
      link: '#',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Hi, {user?.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link} className="block">
            <Card
              noPadding={true}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full p-2"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-4 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700">{stat.title}</h3>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Pending Orders */}
        {stats.pendingOrders > 0 && (
          <Card title={`Your Order${stats.pendingOrders > 1 ? 's are' : ' is'} on the way!`}
            {
            ...(
              getOrdersByCustomer(user?.id || '').length >= 1
                ? {
                  viewAll: "View All",
                  viewAllLink: "/user/orders",
                }
                : getOrdersByCustomer(user?.id || '').length === 0
                  ? {
                    viewAll: "Place New Order",
                    viewAllLink: "/user/orders",
                  }
                  : {}
            )
            }>
            <div className="space-y-4">
              {getOrdersByCustomer(user?.id || '')
                .slice(0, 5)
                .map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Order #{order.id.substring(0, 8)}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                      </p>
                    </div>
                    <div>
                      <span className={`
                      px-2 py-1 text-xs font-medium rounded-full 
                      ${order.status === 'pending' ? 'bg-amber-100 text-amber-500' : ''}
                      ${order.status === 'preparing' ? 'bg-blue-100	text-blue-700' : ''}
                      ${order.status === 'ready' ? 'bg-lime-100	text-lime-500' : ''}
                      ${order.status === 'completed' ? 'bg-green-100	text-green-500' : ''}
                      ${order.status === 'cancelled' ? 'bg-red-100	text-red-500' : ''}
                    `}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}

              {getOrdersByCustomer(user?.id || '').length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>No orders yet.</p>
                </div>
              )}

            </div>
          </Card>
        )}


        {/* Recent Orders */}
        <Card title="Recent Orders"
          {
          ...(
            getOrdersByCustomer(user?.id || '').filter((order) => order.status === 'completed').length > 3
              ? {
                viewAll: "View All",
                viewAllLink: "/user/orders",
              }
              : getOrdersByCustomer(user?.id || '').filter((order) => order.status === 'completed').length === 0
                ? {
                  viewAll: "Place Your First Order",
                  viewAllLink: "/user/orders",
                }
                : {}
          )
          }>
          <div className="space-y-4">
            {getOrdersByCustomer(user?.id || '')
              .filter((order) => order.status === 'completed')
              .slice(0, 3)
              .map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Order #{order.id.substring(0, 8)}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                    </p>
                  </div>
                  <div>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full 
                      ${order.status === 'pending' ? 'bg-amber-100 text-amber-500' : ''}
                      ${order.status === 'preparing' ? 'bg-blue-100	text-blue-700' : ''}
                      ${order.status === 'ready' ? 'bg-lime-100	text-lime-500' : ''}
                      ${order.status === 'completed' ? 'bg-green-100	text-green-500' : ''}
                      ${order.status === 'cancelled' ? 'bg-red-100	text-red-500' : ''}
                    `}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}

            {getOrdersByCustomer(user?.id || '').filter((order) => order.status === 'completed').length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>No orders yet.</p>
              </div>
            )}

          </div>
        </Card>
      </div>
    </div >
  );
};

export default Dashboard;