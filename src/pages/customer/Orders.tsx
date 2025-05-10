import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore } from '../../stores/orderStore';
import { Order } from '../../types';
import { ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, PackageCheck,Eye, ChefHat } from 'lucide-react';
import Card from '../../components/common/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';


const Orders = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  // Get orders directly from Zustand store
  const customerOrders = useOrderStore((s) => 
    user ? s.getOrdersByCustomer(user.id) : []
  );
  
  const isLoading = useOrderStore((s) => s.isLoading);
  const hydrateFromDB = useOrderStore((s) => s.hydrateFromDB);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const local = localStorage.getItem("order-storage");
      if (!local) {
        await hydrateFromDB();
      }
      setIsHydrating(false);
    };
    
    loadData();
  }, [hydrateFromDB]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'preparing':
        return <ChefHat className="h-5 w-5 text-blue-500" />;
      case 'ready':
        return <PackageCheck className="h-5 w-5 text-lime-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-500';
      case 'preparing':
        return 'bg-blue-100	text-blue-700';
      case 'ready':
        return 'bg-lime-100	text-lime-500';
      case 'completed':
        return 'bg-green-100	text-green-500';
      case 'cancelled':
        return 'bg-red-100	text-red-500';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order is waiting to be confirmed by the restaurant.';
      case 'confirmed':
        return 'Your order has been confirmed and will be prepared soon.';
      case 'preparing':
        return 'The restaurant is preparing your order.';
      case 'ready':
        return 'Your order is ready for pickup/delivery.';
      case 'completed':
        return 'Your order has been completed.';
      case 'cancelled':
        return 'Your order has been cancelled.';
      default:
        return '';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isHydrating || isLoading) {
    return <div>Loading...</div>;
  }

  console.log('Current customer orders:', customerOrders);
console.log('User ID:', user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline">
          <h1 className="text-2xl font-semibold mr-[10px]">{t('customer.myOrders.title')}</h1>
          <p className="text-sm text-gray-600">({`${customerOrders.length}`} order{`${customerOrders.length == 1 ? '' : 's'}`})</p>
        </div>

        <Link to='/places'>
          <Button variant="ghost" size="sm">
            {t('customer.myOrders.discoverMore')}
          </Button>
        </Link>
      </div>
      {customerOrders.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('customer.myOrders.noOrders.title')}</h3>
            <p className="text-gray-500 mb-3">{t('customer.myOrders.noOrders.subtitle')}</p>

            <Link to='/places'>
              <Button variant="ghost" size="sm">
                {t('customer.myOrders.noOrders.link')}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {customerOrders.map((order) => (
            <Card key={order.id}>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleOrderExpand(order.id)}
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-medium">
                      Order #{order.id.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                      {' • '}{order.items.length} items
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t mt-4 pt-4">
                      <div className={`p-3 rounded-md mb-4 ${getStatusBadgeColor(order.status)}`}>
                        <p>{getStatusText(order.status)}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between bg-gray-50 p-3 rounded-md">
                              <div>
                                <div className="font-medium">
                                  {item.quantity}x {item.name}
                                </div>
                                {item.specialInstructions && (
                                  <p className="text-sm text-gray-600 italic mt-1">
                                    "{item.specialInstructions}"
                                  </p>
                                )}
                              </div>
                              <div className="font-medium">
                                {formatCurrency(item.subtotal)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.specialInstructions && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-1">Special Instructions</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                            {order.specialInstructions}
                          </p>
                        </div>
                      )}

                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;