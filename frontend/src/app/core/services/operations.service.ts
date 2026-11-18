import { Injectable, computed, signal } from '@angular/core';
import { Order, Product } from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class OperationsService {
  private readonly productState = signal<Product[]>([
    { id: 'PR-2048', name: 'Studio Everyday Hoodie', sku: 'ST-HDY-048', category: 'Apparel', price: 78, stock: 124, status: 'Healthy', updatedAt: 'Today, 10:42', initials: 'SH', tone: 'lavender' },
    { id: 'PR-2047', name: 'Performance Training Tee', sku: 'PT-TEE-021', category: 'Apparel', price: 42, stock: 18, status: 'Low stock', updatedAt: 'Today, 09:18', initials: 'PT', tone: 'peach' },
    { id: 'PR-2046', name: 'Everyday Carry Bottle', sku: 'EC-BTL-006', category: 'Accessories', price: 26, stock: 0, status: 'Out of stock', updatedAt: 'Yesterday', initials: 'EB', tone: 'mint' },
    { id: 'PR-2045', name: 'Core Training Leggings', sku: 'CT-LEG-015', category: 'Apparel', price: 64, stock: 86, status: 'Healthy', updatedAt: 'Yesterday', initials: 'CL', tone: 'blue' },
    { id: 'PR-2044', name: 'Minimal Crossbody Bag', sku: 'MC-BAG-003', category: 'Accessories', price: 54, stock: 9, status: 'Low stock', updatedAt: '18 Nov, 08:30', initials: 'CB', tone: 'sand' },
    { id: 'PR-2043', name: 'Cloud Knit Running Socks', sku: 'CK-SCK-012', category: 'Footwear', price: 18, stock: 212, status: 'Healthy', updatedAt: '17 Nov, 16:12', initials: 'KS', tone: 'rose' },
    { id: 'PR-2042', name: 'Flex Form Sports Bra', sku: 'FF-BRA-019', category: 'Apparel', price: 48, stock: 34, status: 'Healthy', updatedAt: '17 Nov, 14:06', initials: 'FB', tone: 'lavender' }
  ]);

  private readonly orderState = signal<Order[]>([
    { id: '#AT-89342', customer: 'Olivia Rhys', email: 'olivia.rhys@email.com', date: '18 Nov, 11:42', total: 186, items: 3, status: 'Processing', initials: 'OR' },
    { id: '#AT-89341', customer: 'Marcus Chen', email: 'marcus.chen@email.com', date: '18 Nov, 11:18', total: 124, items: 2, status: 'Shipped', initials: 'MC' },
    { id: '#AT-89340', customer: 'Sofia Laurent', email: 'sofia.laurent@email.com', date: '18 Nov, 10:56', total: 248, items: 4, status: 'Delivered', initials: 'SL' },
    { id: '#AT-89339', customer: 'Noah Williams', email: 'noah.w@email.com', date: '18 Nov, 10:21', total: 78, items: 1, status: 'Processing', initials: 'NW' },
    { id: '#AT-89338', customer: 'Amara Okafor', email: 'amara.o@email.com', date: '18 Nov, 09:48', total: 156, items: 2, status: 'Delivered', initials: 'AO' },
    { id: '#AT-89337', customer: 'Leo Martin', email: 'leo.martin@email.com', date: '17 Nov, 17:32', total: 92, items: 2, status: 'Cancelled', initials: 'LM' },
    { id: '#AT-89336', customer: 'Mia Thompson', email: 'mia.t@email.com', date: '17 Nov, 16:05', total: 204, items: 3, status: 'Shipped', initials: 'MT' }
  ]);

  readonly products = this.productState.asReadonly();
  readonly orders = this.orderState.asReadonly();
  readonly lowStockCount = computed(() => this.productState().filter(p => p.status !== 'Healthy').length);
  readonly totalUnits = computed(() => this.productState().reduce((sum, p) => sum + p.stock, 0));

  addProduct(input: { name: string; sku: string; category: string; price: number; stock: number }): void {
    const stock = Math.max(0, input.stock);
    const product: Product = {
      id: `PR-${Math.floor(2000 + Math.random() * 7000)}`,
      ...input,
      status: stock === 0 ? 'Out of stock' : stock < 20 ? 'Low stock' : 'Healthy',
      updatedAt: 'Just now',
      initials: input.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase(),
      tone: 'mint'
    };
    this.productState.update(items => [product, ...items]);
  }

  updateOrderStatus(id: string, status: Order['status']): void {
    this.orderState.update(items => items.map(order => order.id === id ? { ...order, status } : order));
  }
}
