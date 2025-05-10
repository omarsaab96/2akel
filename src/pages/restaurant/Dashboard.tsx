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
  const { getOrdersByRestaurant } = useOrderStore();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalMenuItems: 0,
    popularItems: [] as { name: string; count: number }[],
  });

  useEffect(() => {
    if (user) {
      const categories = getCategoriesByRestaurant(user.id);
      let totalItems = 0;
      const itemCounts: Record<string, number> = {};

      categories.forEach((category) => {
        const items = getMenuItemsByCategory(category.id);
        totalItems += items.length;
      });

      const orders = getOrdersByRestaurant(user.id);
      const pendingOrders = orders.filter((order) =>
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      ).length;

      let totalRevenue = 0;

      orders.forEach((order) => {
        totalRevenue += order.totalAmount;

        order.items.forEach((item) => {
          if (!itemCounts[item.menuItemId]) {
            itemCounts[item.menuItemId] = 0;
          }
          itemCounts[item.menuItemId] += item.quantity;
        });
      });

      const popularItems = Object.entries(itemCounts)
        .map(([id, count]) => {
          const name = orders.flatMap((o) => o.items).find((i) => i.menuItemId === id)?.name || 'Unknown';
          return { name, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
        totalMenuItems: totalItems,
        popularItems,
      });
    }
  }, [user, getCategoriesByRestaurant, getMenuItemsByCategory, getOrdersByRestaurant]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: BarChart,
      color: 'bg-primary/10 text-primary',
      link: '/restaurant/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-warning/10 text-warning',
      link: '/restaurant/orders',
    },
    {
      title: 'Menu Items',
      value: stats.totalMenuItems,
      icon: Users,
      color: 'bg-secondary/10 text-secondary',
      link: '/restaurant/menu',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-accent/10 text-accent-dark',
      link: '#',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Hi, {user?.name}</h1>
        {/* <div className="flex space-x-3">
          <Link to="/restaurant/menu">
            <Button variant="primary" icon={Users}>
              Manage Menu
            </Button>
          </Link>
          <Link to="/restaurant/qrcode">
            <Button variant="outline">
              Generate QR Code
            </Button>
          </Link>
        </div> */}
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

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Recent Orders */}
        <Card title="Open Orders"
          subtitle={`${getOrdersByRestaurant(user?.id || '').length} order${(getOrdersByRestaurant(user?.id || '').length == 1) ? "" : "s"}`}
          titleSubTitleSameLine={true}
          {
          ...(
            getOrdersByRestaurant(user?.id || '').length > 3
              ? {
                
                viewAll: "View all",
                viewAllLink: "/restaurant/orders",
              }
              : {}
          )
          }>
          <div className="space-y-4">
            {getOrdersByRestaurant(user?.id || '')
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
                      ${order.status === 'completed' ? 'bg-success/10 text-success' : ''}
                      ${order.status === 'pending' ? 'bg-warning/10 text-warning' : ''}
                      ${order.status === 'cancelled' ? 'bg-error/10 text-error' : ''}
                      ${['confirmed', 'preparing', 'ready'].includes(order.status) ? 'bg-primary/10 text-primary' : ''}
                    `}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}

            {getOrdersByRestaurant(user?.id || '').length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>No orders yet.</p>
              </div>
            )}

          </div>
        </Card>

        {/* Popular Items */}
        <Card title="Popular Menu Items">
          <div className="space-y-4">
            {stats.popularItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <h4 className="font-medium">{item.name}</h4>
                </div>
                <div>
                  <span className="text-sm font-medium">
                    {item.count} ordered
                  </span>
                </div>
              </div>
            ))}

            {stats.popularItems.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>No order data available yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/restaurant/menu">
            <Button variant="outline" icon={Users} fullWidth>
              Update Menu
            </Button>
          </Link>
          <Link to="/restaurant/qrcode">
            <Button variant="outline" icon={TrendingUp} fullWidth>
              Generate QR Code
            </Button>
          </Link>
          <Link to="/restaurant/orders">
            <Button variant="outline" icon={PieChart} fullWidth>
              View Orders
            </Button>
          </Link>
        </div>
      </Card> */}
    </div>
  );
};

export default Dashboard;