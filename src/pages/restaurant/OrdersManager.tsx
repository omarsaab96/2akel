import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore } from '../../stores/orderStore';
import { Order, OrderStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Clock, CheckCircle, XCircle, PackageCheck,
  ChevronDown, ChevronUp, Eye, Printer,
  ChefHat
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const OrdersManager = () => {
  const { user } = useAuthStore();
  const { orders, getOrdersByRestaurant, updateOrderStatus, hydrateFromDB } = useOrderStore();

  const [isLoading, setIsLoading] = useState(true);
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    hydrateFromDB()
  }, []);

  useEffect(() => {
    if (user) {
      const restaurantOrders = getOrdersByRestaurant(user.id);
      let filteredOrders = [...restaurantOrders];

      // Apply filter
      if (activeFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === activeFilter);
      }

      // Apply sorting
      filteredOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });

      setCurrentOrders(filteredOrders);

      setIsLoading(false);
    }
  }, [user, orders, activeFilter, sortBy, getOrdersByRestaurant]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const getStatusIcon = (status: OrderStatus) => {
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

  const getStatusBadgeColor = (status: OrderStatus) => {
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

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${order.id.substring(0, 8)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .order-meta {
              margin-bottom: 20px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              font-weight: bold;
            }
            .total {
              font-weight: bold;
              text-align: right;
              font-size: 18px;
              margin-top: 20px;
            }
            .notes {
              margin-top: 20px;
              padding: 10px;
              background-color: #f8f8f8;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <h1>Order #${order.id.substring(0, 8)}</h1>
          <div class="order-meta">
            <p>Date: ${formatDate(order.createdAt)}</p>
            <p>Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            ${order.tableNumber ? `<p>Table: ${order.tableNumber}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${item.subtotal.toFixed(2)}</td>
                </tr>
                ${item.specialInstructions ? `
                <tr>
                  <td colspan="4" style="padding-left: 20px; font-style: italic; color: #666;">
                    Note: ${item.specialInstructions}
                  </td>
                </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">Total: $${order.totalAmount.toFixed(2)}</div>
          
          ${order.specialInstructions ? `
          <div class="notes">
            <p><strong>Special Instructions:</strong></p>
            <p>${order.specialInstructions}</p>
          </div>
          ` : ''}
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const statusFilters: { value: OrderStatus | 'all', label: string }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Orders</h1>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-[40px] bg-gray-400 rounded w-full mb-5"></div>
          <div className="flex flex-col gap-4">
            <div className="h-[90px] bg-gray-400 rounded w-full"></div>
            <div className="h-[90px] bg-gray-300 rounded w-full"></div>
            <div className="h-[90px] bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                className={`
              px-3 py-1.5 rounded-full text-sm font-medium
              ${activeFilter === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
            `}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}

            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          {currentOrders.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Orders Found</h3>
                <p className="text-gray-500">
                  {activeFilter === 'all'
                    ? "You don't have any orders yet."
                    : `You don't have any ${activeFilter} orders.`}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {currentOrders.map((order) => (
                <Card key={order.id} className="overflow-visible">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleOrderExpand(order.id)}
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-medium">
                          Order #{order.created_at.split("T")[0].replaceAll("-","")}{order.id.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-UK', {
                              month: 'numeric',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true
                            }).replace(",","")}
                          {order.tableNumber && ` • Table ${order.tableNumber}`}
                          {' • '}{order.items.length} items
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(order.totalAmount)}
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
                          <div className="mb-4 space-y-2">
                            <h4 className="font-medium">Order Items</h4>
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

                          <div className="flex justify-between items-center border-t pt-4 mt-4">
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Printer}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  printOrder(order);
                                }}
                              >
                                Print
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Eye}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // View details page (not implemented in this demo)
                                  toast.info('View details functionality would open a detailed view');
                                }}
                              >
                                Details
                              </Button>
                            </div>

                            <div className="space-x-2">
                              {order.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(order.id, 'cancelled');
                                    }}
                                    className="border-error text-error hover:bg-error hover:text-white"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(order.id, 'preparing');
                                    }}
                                  >
                                    Confirm
                                  </Button>
                                </>
                              )}

                              {order.status === 'preparing' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(order.id, 'ready');
                                  }}
                                >
                                  Mark as Ready
                                </Button>
                              )}

                              {order.status === 'ready' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(order.id, 'completed');
                                  }}
                                >
                                  Complete Order
                                </Button>
                              )}
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
        </>
      )}


    </div>
  );
};

export default OrdersManager;