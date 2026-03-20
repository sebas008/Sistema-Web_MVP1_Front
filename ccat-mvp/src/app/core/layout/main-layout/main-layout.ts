import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [
    NgIf,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})
export class MainLayoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('drawer') drawer?: MatSidenav;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened = true;
  private destroy$ = new Subject<void>();

  constructor(public auth: AuthService, private router: Router, private bp: BreakpointObserver) {
    this.bp.observe(['(max-width: 1023px)']).pipe(takeUntil(this.destroy$)).subscribe((r) => {
      const mobile = r.matches;
      this.drawerMode = mobile ? 'over' : 'side';
      this.drawerOpened = !mobile;
    });
  }

  ngAfterViewInit(): void {
    if (this.drawer) {
      this.drawer.mode = this.drawerMode;
      if (this.drawerOpened) this.drawer.open();
      else this.drawer.close();
    }
  }

  toggleMenu(): void { this.drawer?.toggle(); }

  closeMenuOnNav(): void {
    if (this.drawerMode === 'over') this.drawer?.close();
  }

  can(moduleKey: string): boolean { return this.auth.canAccess(moduleKey); }
  get displayName(): string { return this.auth.getDisplayName(); }
  get roleLabel(): string { return this.auth.getRoleLabels().join(', ') || 'Sin rol'; }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
