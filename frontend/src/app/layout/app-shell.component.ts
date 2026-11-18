import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="app-frame">
      <aside class="sidebar">
        <a class="brand" routerLink="/overview">
          <span class="brand-mark">A</span>
          <span class="brand-copy"><strong>atlas<span>.</span></strong><small>OPERATIONS CLOUD</small></span>
        </a>
        <div class="workspace-switch">
          <div class="workspace-icon">N</div>
          <div class="workspace-copy"><strong>Northstar Studio</strong><small>Enterprise workspace</small></div>
          <span class="chevron">⌄</span>
        </div>
        <div class="nav-label">WORKSPACE</div>
        <nav class="main-nav">
          <a routerLink="/overview" routerLinkActive="active"><span class="nav-icon">◫</span> Overview</a>
          <a routerLink="/inventory" routerLinkActive="active"><span class="nav-icon">▦</span> Inventory <span class="nav-count">2</span></a>
          <a routerLink="/orders" routerLinkActive="active"><span class="nav-icon">↗</span> Orders</a>
          <a routerLink="/analytics" routerLinkActive="active"><span class="nav-icon">▥</span> Analytics</a>
        </nav>
        <div class="nav-label tools-label">MANAGE</div>
        <nav class="main-nav">
          <a href="javascript:void(0)" class="muted-link"><span class="nav-icon">♙</span> Customers <span class="soon">SOON</span></a>
          <a href="javascript:void(0)" class="muted-link"><span class="nav-icon">⚙</span> Settings</a>
        </nav>
        <div class="sidebar-bottom">
          <div class="help-card"><div class="help-symbol">✳</div><strong>Need a hand?</strong><p>Explore the workspace guide and learn your way around.</p><a href="mailto:hello@atlasops.example">Visit help centre ↗</a></div>
          <div class="profile">
            <div class="avatar profile-avatar">DA</div>
            <div class="profile-copy"><strong>Daniel Agulto</strong><small>Workspace admin</small></div>
            <span class="profile-dots">···</span>
          </div>
        </div>
      </aside>
      <main class="main-area">
        <header class="topbar">
          <div class="breadcrumb"><span>Northstar Studio</span><b>/</b><strong>{{ pageTitle() }}</strong></div>
          <div class="top-actions">
            <div class="system-status"><i></i> All systems operational</div>
            <button class="icon-button" aria-label="Help">?</button>
            <button class="icon-button notification" aria-label="Notifications">♧<i></i></button>
            <div class="top-avatar">DA</div>
          </div>
        </header>
        <section class="page-content"><ng-content /></section>
        <footer class="footer"><span>© 2026 Atlas Ops, Inc.</span><span>Built for clarity. Designed for momentum.</span><span>System status <i></i></span></footer>
      </main>
    </div>
  `
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly routePath = (() => {
    const current = this.router.url.split('/')[1] || 'overview';
    return current;
  })();
  readonly pageTitle = computed(() => {
    const path = this.router.url.split('/')[1] || 'overview';
    return ({ overview: 'Overview', inventory: 'Inventory', orders: 'Orders', analytics: 'Analytics' } as Record<string, string>)[path] ?? 'Overview';
  });
}
