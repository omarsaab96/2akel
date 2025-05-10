import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderItem, OrderStatus } from '../types';
import { supabase } from '../lib/supabase';

interface CartItem extends OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderState {
  orders: Order[];
  cart: {
    restaurantId: string;
    items: CartItem[];
  };
  isLoading: boolean;

  getCart: () => {
    restaurantId: string;
    items: CartItem[];
  };

  // Cart actions
  addToCart: (restaurantId: string, item: CartItem) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;

  // Order actions
  placeOrder: (customerId: string, tableNumber?: string, specialInstructions?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<Order>;
  cancelOrder: (orderId: string) => void;

  // Getters
  getCartTotal: () => number;
  getOrdersByCustomer: (customerId: string) => Order[];
  getOrdersByRestaurant: (restaurantId: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;

  hydrateFromDB: () => Promise<void>;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      cart: {
        restaurantId: '',
        items: [],
      },
      isLoading: false,

      // Cart actions
      addToCart: (restaurantId, item) => {
        const currentCart = get().cart;

        // If adding an item from a different restaurant, clear the cart first
        if (currentCart.restaurantId && currentCart.restaurantId !== restaurantId) {
          set({ cart: { restaurantId, items: [] } });
        }

        set((state) => {
          const existingItemIndex = state.cart.items.findIndex(
            (cartItem) => cartItem.menuItemId === item.menuItemId
          );

          // Update already exists in cart => update quantity
          if (existingItemIndex >= 0) {
            const updatedItems = [...state.cart.items];
            const existingItem = updatedItems[existingItemIndex];

            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + item.quantity,
              subtotal: (existingItem.quantity + item.quantity) * existingItem.price,
            };

            return {
              cart: {
                restaurantId,
                items: updatedItems,
              },
            };
          } else {
            // Add new item
            return {
              cart: {
                restaurantId,
                items: [...state.cart.items, item],
              },
            };
          }
        });
      },

      updateCartItemQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }

        set((state) => ({
          cart: {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.id === itemId
                ? { ...item, quantity, subtotal: item.price * quantity }
                : item
            ),
          },
        }));
      },

      removeFromCart: (itemId) => {
        set((state) => ({
          cart: {
            ...state.cart,
            items: state.cart.items.filter((item) => item.id !== itemId),
          },
        }));
      },

      clearCart: () => {
        set({
          cart: {
            restaurantId: '',
            items: [],
          },
        });
      },

      // Order actions
      placeOrder: async (customerId, tableNumber, specialInstructions) => {
        const { cart } = get();

        if (cart.items.length === 0) {
          throw new Error('Cannot place an empty order');
        }

        const totalAmount = get().getCartTotal();

        const newOrder: Order = {
          id: crypto.randomUUID(),
          customerId,
          restaurantId: cart.restaurantId,
          items: [...cart.items],
          totalAmount,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tableNumber,
          specialInstructions,
        };

        set((state) => ({
          orders: [...state.orders, newOrder],
        }));

        // Insert the order into Supabase
        (async () => {
          const { error } = await supabase.from('orders').insert({
            id: newOrder.id,
            customer_id: newOrder.customerId,
            restaurant_id: newOrder.restaurantId,
            items: newOrder.items, // assuming `items` is stored as JSONB
            total_amount: newOrder.totalAmount,
            status: newOrder.status,
            created_at: newOrder.createdAt,
            updated_at: newOrder.updatedAt,
            table_number: newOrder.tableNumber,
            special_instructions: newOrder.specialInstructions,
          });

          if (error) {
            console.error('Error inserting order into Supabase:', error);
          }
        })();


        // Clear the cart after placing the order
        get().clearCart();

        return newOrder;
      },

      updateOrderStatus: async (orderId, status) => {
        let updatedOrder: Order = {} as Order;
        let nowDate = new Date().toISOString();


        const { error } = await supabase
          .from('orders')
          .update({
            status,
            updated_at: nowDate,
          })
          .eq('id', orderId);

        if (error) {
          console.error('Failed to update order in Supabase:', error.message);
          // Optionally, rollback state change or notify the user
        } else {
          set((state) => ({
            orders: state.orders.map((order) => {
              if (order.id === orderId) {
                updatedOrder = {
                  ...order,
                  status,
                  updatedAt: nowDate,
                };
                return updatedOrder;
              }
              return order;
            }),
          }));
        }

        return updatedOrder;
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, status: 'cancelled', updatedAt: new Date().toISOString() }
              : order
          ),
        }));
      },

      // Getters
      getCartTotal: () => {
        return get().cart.items.reduce((total, item) => total + item.subtotal, 0);
      },

      getOrdersByCustomer: (customerId) => {
        const orders = get().orders;
        console.log('All orders in store:', orders); // Debug log
        console.log('Looking for customer:', customerId); // Debug log

        const filtered = orders
          .filter((order) => order.customerId === customerId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        console.log('Filtered orders:', filtered); // Debug log
        return filtered;
      },

      getOrdersByRestaurant: (restaurantId) => {
        return get().orders
          .filter((order) => order.restaurantId === restaurantId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId);
      },

      getCart: () => {
        return get().cart;
      },

      hydrateFromDB: async () => {
        set({ isLoading: true });

        const { data: ordersRes, error } = await supabase.from('orders').select('*');

        if (error) throw error;

        // Transform Supabase snake_case to camelCase
        const transformedOrders = ordersRes?.map(order => ({
          ...order,
          customerId: order.customer_id,
          restaurantId: order.restaurant_id,
          totalAmount: order.total_amount,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          tableNumber: order.table_number,
          specialInstructions: order.special_instructions
        })) || [];

        set({
          orders: transformedOrders,
          isLoading: false,
        });

      },
    }),
    {
      name: 'order-storage',
    }
  )
);