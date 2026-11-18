import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { Order } from '../../core/models/operations.models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  standalone: true,
  imports: [FormsModule, StatusBadgeComponent],
  template: `
    <div class="page-heading"><div><div class="eyebrow">ORDER OPERATIONS</div><h1>Orders</h1><p>Follow every transaction from checkout to delivery.</p></div><button class="export-button" (click)="exportCsv()">↓ Export orders</button></div>
    <div class="order-kpis"><div><span>Total orders</span><strong>{{ ops.orders().length }}</strong></div><div><span>Processing</span><strong>{{ count('Processing') }}</strong></div><div><span>Shipped</span><strong>{{ count('Shipped') }}</strong></div><div><span>Delivered</span><strong>{{ count('Delivered') }}</strong></div></div>
    <section class="panel"><div class="toolbar"><div><h2>All transactions</h2><p>Review customer orders and update fulfilment status.</p></div><div class="filters"><input [(ngModel)]="search" placeholder="Search order or customer..." aria-label="Search orders"><select [(ngModel)]="status"><option value="All">All statuses</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></div></div>
      <div class="table-scroll"><table><thead><tr><th>ORDER ID</th><th>CUSTOMER</th><th>ORDER DATE</th><th>ITEMS</th><th>TOTAL</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
        @for (order of filteredOrders(); track order.id) {
          <tr><td class="id">{{ order.id }}</td><td><div class="customer"><span class="avatar">{{ order.initials }}</span><div><strong>{{ order.customer }}</strong><small>{{ order.email }}</small></div></div></td><td>{{ order.date }}</td><td>{{ order.items }} items</td><td class="total">€{{ order.total.toFixed(2) }}</td><td><app-status-badge [label]="order.status" [tone]="tone(order.status)"/></td><td><select class="status-select" [ngModel]="order.status" (ngModelChange)="changeStatus(order, $event)" [attr.aria-label]="'Update status for ' + order.id"><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></td></tr>
        } @empty { <tr><td colspan="7" class="empty">No orders found.</td></tr> }
      </tbody></table></div><div class="table-foot">Showing {{ filteredOrders().length }} transactions <span>All amounts in EUR</span></div>
    </section>
  `,
  styles: [`
    .page-heading{display:flex;justify-content:space-between;align-items:flex-end;margin:10px 0 25px}.eyebrow{font-size:10px;letter-spacing:1.2px;color:#9aa4b2;font-weight:800}h1{font:800 28px Manrope;margin:10px 0 5px;letter-spacing:-1px}.page-heading p,.toolbar p{margin:0;color:#8994a3;font-size:12px}.export-button{border:1px solid #e3e8ee;background:#fff;color:#56657a;padding:11px 14px;border-radius:8px;font-size:11px;font-weight:700}.order-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:17px}.order-kpis>div{background:#fff;border:1px solid #edf0f4;border-radius:11px;padding:15px 17px}.order-kpis span{display:block;color:#929dac;font-size:10px}.order-kpis strong{display:block;font:800 23px Manrope;margin-top:7px}.panel{background:#fff;border:1px solid #edf0f4;border-radius:13px;padding:19px}.toolbar{display:flex;justify-content:space-between;align-items:flex-start;gap:15px}.toolbar h2{font:800 14px Manrope;margin:0 0 5px}.filters{display:flex;gap:8px}.filters input,.filters select,.status-select{border:1px solid #e7ebf0;border-radius:7px;padding:9px 10px;background:#fff;color:#687587;font-size:10px;outline-color:#9bc968}.filters input{width:200px}table{border-collapse:collapse;width:100%;white-space:nowrap;margin-top:22px}th{text-align:left;font-size:9px;letter-spacing:.6px;color:#a1aab7;padding:11px 9px;border-bottom:1px solid #edf0f4}td{font-size:10px;color:#8490a0;padding:13px 9px;border-bottom:1px solid #f0f2f5}.id,.total{font-weight:700;color:#3d4d63}.customer{display:flex;align-items:center;gap:9px}.avatar{width:30px;height:30px;border-radius:9px;background:#eef1f7;color:#64728a;display:grid;place-items:center;font-size:9px;font-weight:800}.customer strong,.customer small{display:block}.customer strong{color:#4c5b70;font-size:10px}.customer small{font-size:9px;color:#a0a9b5;margin-top:3px}.status-select{padding:6px 7px;font-size:9px}.table-foot{padding-top:14px;color:#a0a9b5;font-size:9px}.table-foot span{float:right}.empty{text-align:center;padding:35px}
    @media(max-width:850px){.toolbar{flex-direction:column}.filters{width:100%}.filters input{flex:1}}@media(max-width:760px){.order-kpis{grid-template-columns:repeat(2,1fr)}.page-heading{align-items:flex-start;flex-direction:column}.table-scroll{overflow-x:auto}}
  `]
})
export class OrdersComponent {
  readonly ops = inject(OperationsService);
  readonly search = signal('');
  readonly status = signal('All');
  readonly filteredOrders = computed(() => {
    const query = this.search().toLowerCase().trim();
    return this.ops.orders().filter(order =>
      (this.status() === 'All' || order.status === this.status()) &&
      (!query || `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query))
    );
  });
  count(status: Order['status']): number { return this.ops.orders().filter(order => order.status === status).length; }
  tone(status: Order['status']): 'healthy' | 'warning' | 'danger' | 'info' {
    return status === 'Delivered' ? 'healthy' : status === 'Processing' ? 'warning' : status === 'Cancelled' ? 'danger' : 'info';
  }
  changeStatus(order: Order, status: Order['status']): void { this.ops.updateOrderStatus(order.id, status); }
  exportCsv(): void {
    const header = 'Order,Customer,Email,Date,Items,Total,Status';
    const rows = this.ops.orders().map(o => [o.id, o.customer, o.email, o.date, o.items, o.total, o.status].map(v => `"${String(v).replaceAll('"', '""')}"`).join(','));
    const blob = new Blob([[header, ...rows].join('\\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'atlas-orders.csv'; anchor.click();
    URL.revokeObjectURL(url);
  }
}
