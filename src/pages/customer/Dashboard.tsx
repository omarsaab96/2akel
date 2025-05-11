import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, DollarSign, Home, BookmarkCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore } from '../../stores/orderStore';
import Card from '../../components/common/Card';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { orders, hydrateFromDB, getOrdersByCustomer } = useOrderStore(); // Added getOrdersByCustomer
  const [isLoading, setIsLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);

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

  const stats = useMemo(() => {
    const defaultStats = {
      totalOrders: 0,
      pendingOrders: [],
      totalBalance: 0,
      orderedFrom: 0,
      savedPlaces: savedPlaces.length,
    };

    if (!user) return defaultStats;

    const userOrders = getOrdersByCustomer(user.id);
    const pendingOrders = userOrders.filter((order) =>
      ['pending', 'preparing', 'ready'].includes(order.status)
    );

    const orderedFromCount = new Set(
      userOrders.map(order => order.restaurant_id)
    ).size;

    return {
      totalOrders: userOrders.length,
      pendingOrders,
      totalBalance: 0,
      orderedFrom: orderedFromCount,
      savedPlaces: savedPlaces.length,
    };
  }, [user, orders, savedPlaces, getOrdersByCustomer]);

  // Separate effect for async operation (Supabase call)
  useEffect(() => {
    const fetchSavedPlaces = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('saved_menus')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const restaurantIds = data.map((item) => item.restaurant_id);
        setSavedPlaces(restaurantIds);
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchSavedPlaces();
  }, [user]);

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
      value: `${stats.totalOrders} ${stats.totalOrders === 1 ? 'order' : 'orders'}`,
      icon: ShoppingBag,
      color: 'bg-primary/10 text-primary',
      link: '/user/orders',
    },
    {
      title: 'You Ordered from',
      value: `${stats.orderedFrom} ${stats.orderedFrom === 1 ? 'place' : 'places'}`,
      icon: Home,
      color: 'bg-warning/10 text-warning',
      link: '/user/menu',
    },
    {
      title: 'Saved Places',
      value: stats.savedPlaces,
      icon: BookmarkCheck,
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

  const completedOrders = useMemo(() =>
    getOrdersByCustomer(user?.id || '').filter(order => order.status === 'completed'),
    [user, orders, getOrdersByCustomer]
  );

  const userOrders = useMemo(() =>
    getOrdersByCustomer(user?.id || ''),
    [user, orders, getOrdersByCustomer]
  );

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

          <div className="grid grid-cols-1 gap-6">
            {/* Pending Orders */}
            {stats.pendingOrders.length > 0 && (
              <Card title={`Your Order${stats.pendingOrders.length > 1 ? 's are' : ' is'} on the way!`}
                {
                ...(
                  stats.pendingOrders.length >= 1
                    ? {
                      viewAll: "View All",
                      viewAllLink: "/user/orders",
                    }
                    : stats.pendingOrders.length === 0
                      ? {
                        viewAll: "Place New Order",
                        viewAllLink: "/user/orders",
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
                          <h4 className="font-medium flex gap-4 items-center">
                            Order #{order.created_at.split("T")[0].replaceAll("-", "")}{order.id.substring(0, 8)}
                          </h4>
                          <p className="text-sm text-gray-500 mb-1">
                            {new Date(order.createdAt).toLocaleDateString('en-UK', {
                              month: 'numeric',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true
                            }).replace(",", "")} • {order.items.length} items
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

                  {userOrders.length === 0 && (
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
                getOrdersByCustomer(user?.id || '').filter((order) => order.status === 'completed').length > 0
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
                        <h4 className="font-medium">
                          Order #{order.created_at.split("T")[0].replaceAll("-", "")}{order.id.substring(0, 8)}
                        </h4>
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

                {completedOrders.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No orders yet.</p>
                  </div>
                )}

              </div>
            </Card>
          </div>
        </>
      )}


    </div >
  );
};

export default Dashboard;