export type UserRole = 'restaurant' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Restaurant extends User {
  restaurantName: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string,
  featured?: boolean,
  cuisine?:string,
  rating?:Number,
  image?:string
}

export interface Customer extends User {
  phone?: string;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  restaurantId: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: string;
  available: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  tableNumber?: string;
  specialInstructions?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  specialInstructions?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';