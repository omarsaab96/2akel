import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag , Utensils, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useMenuStore } from '../../stores/menuStore';
import { useOrderStore } from '../../stores/orderStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { getCategoriesByRestaurant, getMenuItemsByCategory } = useMenuStore();
  const { orders, hydrateFromDB } = useOrderStore();
  const [isLoading, setIsLoading] = useState(true);

  // const [stats, setStats] = useState({
  //   totalOrders: 0,
  //   pendingOrders: [],
  //   totalRevenue: 0,
  //   totalMenuItems: 0,
  //   popularItems: [],
  // });

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        await hydrateFromDB();
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [hydrateFromDB]);

  // Memoized derived state
  const { stats } = useMemo(() => {
    if (!user) return { stats: initialStats };

    const categories = getCategoriesByRestaurant(user.id);
    let totalItems = 0;
    const itemCounts: Record<string, number> = {};

    categories.forEach((category) => {
      const items = getMenuItemsByCategory(category.id);
      totalItems += items.length;
    });

    const restaurantOrders = orders.filter(order => order.restaurantId === user.id);
    const pendingOrders = restaurantOrders.filter(order =>
      ['pending', 'preparing', 'ready'].includes(order.status)
    );

    let totalRevenue = 0;
    const completedOrders = restaurantOrders.filter(order => order.status === 'completed');

    completedOrders.forEach((order) => {
      totalRevenue += order.totalAmount;
      order.items.forEach((item) => {
        itemCounts[item.menuItemId] = (itemCounts[item.menuItemId] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .map(([id, count]) => ({
        name: restaurantOrders.flatMap(o => o.items).find(i => i.menuItemId === id)?.name || 'Unknown',
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      stats: {
        totalOrders: restaurantOrders.length,
        pendingOrders,
        totalRevenue,
        totalMenuItems: totalItems,
        popularItems,
      }
    };
  }, [user, orders, getCategoriesByRestaurant, getMenuItemsByCategory]);

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
      icon: ShoppingBag,
      color: 'bg-primary/10 text-primary',
      link: '/restaurant/orders',
    },
    {
      title: 'Open Orders',
      value: stats.pendingOrders.length,
      icon: Clock,
      color: 'bg-warning/10 text-warning',
      link: '/restaurant/orders',
    },
    {
      title: 'Menu Items',
      value: stats.totalMenuItems,
      icon: Utensils,
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
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="flex gap-4">
            <div className="h-[75px] bg-gray-400 rounded w-1/4"></div>
            <div className="h-[75px] bg-gray-300 rounded w-1/4"></div>
            <div className="h-[75px] bg-gray-200 rounded w-1/4"></div>
            <div className="h-[75px] bg-gray-100 rounded w-1/4"></div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-[200px] bg-gray-400 rounded w-full"></div>
            <div className="h-[200px] bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      ) : (
        <>
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
              subtitle={`${stats.pendingOrders.length} order${(stats.pendingOrders.length == 1) ? "" : "s"}`}
              titleSubTitleSameLine={true}
              {
              ...(
                stats.pendingOrders.length > 0
                  ? {

                    viewAll: "View all",
                    viewAllLink: "/restaurant/orders",
                  }
                  : {}
              )
              }>
              <div className="space-y-4">
                {stats.pendingOrders
                  .slice(0, 5)
                  .map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          Order #{order.created_at.split("T")[0].replaceAll("-", "")}{order.id.substring(0, 8)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-UK', {
                              month: 'numeric',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true
                            }).replace(",","")} • {order.items.length} items
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

                {orders.filter(o => o.restaurantId === user?.id).length === 0 && (
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
        </>
      )}


    </div>
  );
};

export default Dashboard;