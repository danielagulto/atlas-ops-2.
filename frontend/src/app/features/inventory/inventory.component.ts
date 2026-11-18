import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../core/services/operations.service';
import { Product } from '../../core/models/operations.models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="page-heading"><div><div class="eyebrow">CATALOG MANAGEMENT</div><h1>Inventory</h1><p>Keep your catalogue accurate and your stock moving.</p></div><button class="primary-button" (click)="openModal()">＋ Add product</button></div>
    <div class="stats-row"><div><span>Total products</span><strong>{{ ops.products().length }}</strong><small>Across all categories</small></div><div><span>Units in stock</span><strong>{{ ops.totalUnits() | number }}</strong><small>Available inventory</small></div><div><span>Stock alerts</span><strong class="alert-number">{{ ops.lowStockCount() }}</strong><small>Requires your attention</small></div><div><span>Inventory value</span><strong>€{{ inventoryValue() | number:'1.0-0' }}</strong><small>Based on current stock</small></div></div>
    <section class="panel">
      <div class="table-toolbar"><div><h2>All products <span>{{ filteredProducts().length }}</span></h2><p>Manage product details, pricing and stock availability.</p></div><div class="filters"><div class="search-box"><span>⌕</span><input [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="Search products or SKU..." aria-label="Search products"></div><select [ngModel]="category()" (ngModelChange)="category.set($event)" aria-label="Filter category"><option value="All">All categories</option><option>Apparel</option><option>Accessories</option><option>Footwear</option></select><select [ngModel]="status()" (ngModelChange)="status.set($event)" aria-label="Filter stock status"><option value="All">All statuses</option><option>Healthy</option><option>Low stock</option><option>Out of stock</option></select></div></div>
      <div class="table-scroll"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>PRICE</th><th>AVAILABLE STOCK</th><th>STATUS</th><th>LAST UPDATED</th></tr></thead><tbody>
        @for (product of filteredProducts(); track product.id) {
          <tr><td><div class="product-cell"><span class="product-thumb" [class]="product.tone">{{ product.initials }}</span><strong>{{ product.name }}</strong></div></td><td class="sku">{{ product.sku }}</td><td>{{ product.category }}</td><td class="price">€{{ product.price }}</td><td><div class="stock-cell"><strong>{{ product.stock }}</strong><div class="stock-bar"><i [style.width.%]="Math.min(product.stock / 2.2, 100)" [class.low]="product.stock < 20"></i></div></div></td><td><app-status-badge [label]="product.status" [tone]="product.status === 'Healthy' ? 'healthy' : product.status === 'Low stock' ? 'warning' : 'danger'"/></td><td>{{ product.updatedAt }}</td></tr>
        } @empty { <tr><td colspan="7" class="empty">No products match your filters. Try a different search.</td></tr> }
      </tbody></table></div>
      <div class="table-foot"><span>Showing {{ filteredProducts().length }} of {{ ops.products().length }} products</span><span>Updated just now</span></div>
    </section>
    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <section class="modal" (click)="$event.stopPropagation()">
          <div class="modal-head"><div><span class="eyebrow">NEW CATALOG ITEM</span><h2>Add a product</h2><p>Enter the details to add an item to your inventory.</p></div><button class="close" (click)="closeModal()">×</button></div>
          <form (ngSubmit)="saveProduct()">
            <label>Product name<input name="name" [(ngModel)]="form.name" required placeholder="e.g. Everyday Essential Hoodie"></label>
            <div class="form-row"><label>SKU<input name="sku" [(ngModel)]="form.sku" required placeholder="ST-HDY-001"></label><label>Category<select name="category" [(ngModel)]="form.category"><option>Apparel</option><option>Accessories</option><option>Footwear</option></select></label></div>
            <div class="form-row"><label>Price (€)<input name="price" type="number" min="0" [(ngModel)]="form.price" required></label><label>Initial stock<input name="stock" type="number" min="0" [(ngModel)]="form.stock" required></label></div>
            <div class="modal-actions"><button type="button" class="secondary-button" (click)="closeModal()">Cancel</button><button class="primary-button" type="submit">Save product</button></div>
          </form>
        </section>
      </div>
    }
  `,
  styles: [`
    .page-heading{display:flex;justify-content:space-between;align-items:flex-end;margin:10px 0 25px}.eyebrow{font-size:10px;letter-spacing:1.2px;color:#9aa4b2;font-weight:800}h1{font:800 28px Manrope;margin:10px 0 5px;letter-spacing:-1px}.page-heading p,.table-toolbar p{margin:0;color:#8994a3;font-size:12px}.primary-button{border:0;border-radius:9px;background:var(--navy);color:#fff;padding:12px 16px;font-size:12px;font-weight:700}.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:17px}.stats-row>div{background:#fff;border:1px solid #edf0f4;border-radius:11px;padding:15px 17px}.stats-row span,.stats-row small{display:block;color:#929dac;font-size:10px}.stats-row strong{display:block;font:800 22px Manrope;margin:8px 0 3px}.stats-row .alert-number{color:#c58a37}.panel{background:#fff;border:1px solid #edf0f4;border-radius:13px;padding:19px}.table-toolbar{display:flex;justify-content:space-between;gap:15px;align-items:flex-start}.table-toolbar h2{font:800 14px Manrope;margin:0 0 5px}.table-toolbar h2 span{font:700 10px 'DM Sans';background:#f0f3f6;color:#7d8998;padding:3px 7px;border-radius:10px;margin-left:5px}.filters{display:flex;gap:8px}.search-box{display:flex;align-items:center;border:1px solid #e7ebf0;border-radius:7px;padding:0 9px;gap:7px;color:#929eac}.search-box span{font-size:18px}.search-box input{border:0;outline:0;width:170px;padding:9px 0;font-size:10px}.filters select{border:1px solid #e7ebf0;border-radius:7px;padding:8px;color:#687587;font-size:10px;background:#fff}table{border-collapse:collapse;width:100%;white-space:nowrap;margin-top:23px}th{text-align:left;font-size:9px;letter-spacing:.6px;color:#a1aab7;padding:11px 9px;border-bottom:1px solid #edf0f4}td{font-size:10px;color:#8490a0;padding:13px 9px;border-bottom:1px solid #f0f2f5}.product-cell{display:flex;align-items:center;gap:10px}.product-cell strong{font-size:10px;color:#425168}.product-thumb{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-size:9px;font-weight:800;color:#667}.lavender{background:#eeebfa}.peach{background:#fff0e8}.mint{background:#e8f5ed}.blue{background:#eaf0ff}.sand{background:#f5eee2}.rose{background:#f9eaf0}.sku{color:#9aa4b1}.price{font-weight:700;color:#45546a}.stock-cell{display:flex;align-items:center;gap:9px}.stock-cell strong{width:24px;color:#46566b}.stock-bar{width:48px;height:4px;border-radius:5px;background:#edf0f3;overflow:hidden}.stock-bar i{display:block;height:100%;background:#8fc65a;border-radius:5px}.stock-bar i.low{background:#e4ad58}.table-foot{display:flex;justify-content:space-between;padding-top:13px;color:#a0a9b5;font-size:9px}.empty{text-align:center;padding:35px}.modal-backdrop{position:fixed;inset:0;background:#101b2b70;z-index:10;display:grid;place-items:center;padding:20px}.modal{background:#fff;width:min(480px,100%);border-radius:16px;padding:25px;box-shadow:0 20px 70px #101b2b30}.modal-head{display:flex;justify-content:space-between}.modal-head h2{font:800 21px Manrope;margin:7px 0}.modal-head p{font-size:11px;color:#8994a3;margin:0 0 20px}.close{border:0;background:#f2f4f7;border-radius:8px;width:30px;height:30px;font-size:20px;color:#7c8795}.modal form{display:grid;gap:13px}.modal label{display:grid;gap:6px;font-size:10px;font-weight:700;color:#647185}.modal input,.modal select{width:100%;border:1px solid #e5eaf0;border-radius:7px;padding:11px;font-size:11px;outline-color:#a6cf70}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}.secondary-button{border:1px solid #e6eaf0;background:#fff;border-radius:8px;padding:11px 15px;font-size:11px;color:#657184}
    @media(max-width:1000px){.table-toolbar{flex-direction:column}.filters{width:100%;flex-wrap:wrap}.search-box{flex:1}.search-box input{width:100%}}@media(max-width:760px){.stats-row{grid-template-columns:repeat(2,1fr)}.page-heading{align-items:flex-start;flex-direction:column}.table-scroll{overflow-x:auto}}@media(max-width:430px){.stats-row{grid-template-columns:1fr 1fr}.form-row{grid-template-columns:1fr}}
  `]
})
export class InventoryComponent {
  readonly ops = inject(OperationsService);
  readonly Math = Math;
  readonly search = signal('');
  readonly category = signal('All');
  readonly status = signal('All');
  readonly modalOpen = signal(false);
  readonly form = { name: '', sku: '', category: 'Apparel', price: 0, stock: 0 };
  readonly filteredProducts = computed(() => {
    const query = this.search().toLowerCase().trim();
    return this.ops.products().filter(product =>
      (this.category() === 'All' || product.category === this.category()) &&
      (this.status() === 'All' || product.status === this.status()) &&
      (!query || `${product.name} ${product.sku} ${product.id}`.toLowerCase().includes(query))
    );
  });
  readonly inventoryValue = computed(() => this.ops.products().reduce((sum, p) => sum + p.price * p.stock, 0));
  openModal(): void { this.modalOpen.set(true); }
  closeModal(): void { this.modalOpen.set(false); }
  saveProduct(): void {
    if (!this.form.name.trim() || !this.form.sku.trim()) return;
    this.ops.addProduct({ ...this.form, name: this.form.name.trim(), sku: this.form.sku.trim().toUpperCase() });
    this.form.name = ''; this.form.sku = ''; this.form.price = 0; this.form.stock = 0;
    this.closeModal();
  }
}
