export type StockStatus = 'Healthy' | 'Low stock' | 'Out of stock';
export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: StockStatus;
  updatedAt: string;
  initials: string;
  tone: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
  initials: string;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  direction: 'up' | 'down';
  note: string;
}
