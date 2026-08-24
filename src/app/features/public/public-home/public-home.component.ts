import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter, take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

interface PublicSalon {
  id: string;
  businessName: string;
  businessCategory: string;
  city: string;
  region: string;
  profileImage?: string;
  coverImage?: string;
  rating: number;
  totalReviews: number;
  verificationStatus: string;
}

interface PublicCategory {
  id: string;
  name: string;
  icon?: string;
}

@Component({
  selector: 'app-public-home',
  template: `
    <div class="public-home-root">
      <!-- Header -->
      <header
        class="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 py-3"
        style="background-color: var(--color-background); border-bottom: 1px solid var(--color-border-light)"
      >
        <div class="flex items-center gap-2">
          <img src="assets/images/logo.png" alt="Bigluxx" class="logo-light h-7 w-auto object-contain" />
          <img src="assets/images/logo-dark.png" alt="Bigluxx" class="logo-dark h-7 w-auto object-contain" />
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="openRoleModal('login')"
            class="px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
            style="color: var(--color-text-primary)"
          >
            Sign in
          </button>
          <button
            (click)="openRoleModal('register')"
            class="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-transform active:scale-95"
            style="background-color: var(--color-primary)"
          >
            Sign up
          </button>
        </div>
      </header>

      <!-- Hero -->
      <section class="px-4 lg:px-8 pt-8 pb-6 text-center">
        <h1 class="text-2xl lg:text-4xl font-bold leading-tight mb-2" style="color: var(--color-text-primary)">
          Discover, book, and experience luxury
        </h1>
        <p class="text-sm lg:text-base max-w-md mx-auto" style="color: var(--color-text-secondary)">
          Browse Ghana's top-rated hair, nail, spa and makeup professionals. Sign up when you're ready to book.
        </p>
      </section>

      <!-- Categories -->
      <section class="px-4 lg:px-8 mb-6" *ngIf="categories.length">
        <div class="flex gap-2 overflow-x-auto pb-1" style="scrollbar-width: none;">
          <button
            *ngFor="let cat of categories"
            (click)="browseCategory(cat)"
            class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style="background-color: var(--color-bg-secondary); color: var(--color-text-primary)"
          >
            {{ cat.name }}
          </button>
        </div>
      </section>

      <!-- Featured salons -->
      <section class="px-4 lg:px-8 pb-28">
        <h2 class="text-lg font-bold mb-3" style="color: var(--color-text-primary)">
          Popular right now
        </h2>

        <div *ngIf="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div *ngFor="let i of [1,2,3,4]" class="rounded-2xl skeleton" style="aspect-ratio: 3/4"></div>
        </div>

        <div *ngIf="!loading && salons.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            *ngFor="let salon of salons"
            (click)="viewSalon(salon.id)"
            class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            style="aspect-ratio: 3/4"
          >
            <img
              [src]="salon.profileImage || salon.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=530&fit=crop'"
              [alt]="salon.businessName"
              loading="lazy"
              class="w-full h-full object-cover"
            />
            <div
              *ngIf="salon.verificationStatus === 'APPROVED'"
              class="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
              style="background: rgba(255,255,255,0.92)"
            >
              <i class="ri-verified-badge-fill text-xs" style="color:#D4AF37; filter: drop-shadow(0 0 2px rgba(212,175,55,0.5))"></i>
              <span class="text-xs font-semibold" style="color:#1D4ED8">Verified</span>
            </div>
            <div
              class="absolute inset-0 flex flex-col justify-end p-3"
              style="background: linear-gradient(transparent, rgba(0,0,0,0.7))"
            >
              <p class="text-white font-semibold text-sm leading-tight truncate">{{ salon.businessName }}</p>
              <p class="text-white/80 text-xs truncate">{{ salon.city }}, {{ salon.region }}</p>
              <div class="flex items-center gap-1 mt-1" *ngIf="salon.rating">
                <i class="ri-star-fill text-yellow-400" style="font-size: 10px"></i>
                <span class="text-white text-xs font-medium">{{ salon.rating | number: '1.1-1' }}</span>
                <span class="text-white/70 text-xs">({{ salon.totalReviews }})</span>
              </div>
            </div>
          </div>
        </div>

        <app-empty-state
          *ngIf="!loading && !salons.length"
          icon="ri-store-2-line"
          title="No salons to show yet"
          subtitle="Check back soon — new professionals are joining every week."
        ></app-empty-state>
      </section>

      <!-- Bottom CTA -->
      <div
        class="fixed bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-3 z-20"
        style="background-color: var(--color-background); border-top: 1px solid var(--color-border-light)"
      >
        <p class="text-xs flex-1" style="color: var(--color-text-secondary)">
          Ready to book your first appointment?
        </p>
        <button
          (click)="openRoleModal('register')"
          class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
          style="background-color: var(--color-primary)"
        >
          Get started
        </button>
      </div>

      <!-- Role selection modal -->
      <div class="role-modal-overlay" *ngIf="showRoleModal" (click)="closeRoleModal()">
        <div class="role-modal-card" (click)="$event.stopPropagation()">
          <button class="role-modal-close" (click)="closeRoleModal()" aria-label="Close">
            <i class="ri-close-line"></i>
          </button>

          <h3 class="role-modal-title">
            {{ pendingAction === 'register' ? 'Create your account' : 'Welcome back' }}
          </h3>
          <p class="role-modal-sub">Tell us who you are so we can take you to the right place</p>

          <div class="role-modal-options">
            <button class="role-option" (click)="selectRole('client')">
              <div class="role-option-icon"><i class="ri-user-3-line"></i></div>
              <div class="role-option-text">
                <span class="role-option-title">I'm a client</span>
                <span class="role-option-sub">Book appointments with top beauty pros</span>
              </div>
              <i class="ri-arrow-right-s-line role-option-arrow"></i>
            </button>

            <button class="role-option" (click)="selectRole('beautician')">
              <div class="role-option-icon"><i class="ri-scissors-cut-line"></i></div>
              <div class="role-option-text">
                <span class="role-option-title">I'm a beautician</span>
                <span class="role-option-sub">List your services and get bookings</span>
              </div>
              <i class="ri-arrow-right-s-line role-option-arrow"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .public-home-root {
      display: block;
      height: 100vh;
      height: 100dvh;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      background-color: var(--color-background);
    }

    /* ── Role picker modal ── */
    .role-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: fadeIn 0.15s ease-out;
    }
    @media (min-width: 640px) {
      .role-modal-overlay { align-items: center; padding: 20px; }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .role-modal-card {
      position: relative;
      width: 100%;
      max-width: 420px;
      background: var(--color-background);
      border-radius: 24px 24px 0 0;
      padding: 28px 20px 24px;
      animation: slideUp 0.2s ease-out;
    }
    @media (min-width: 640px) {
      .role-modal-card { border-radius: 24px; padding: 28px 24px; }
    }
    @keyframes slideUp {
      from { transform: translateY(24px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .role-modal-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: none;
      background: var(--color-bg-secondary);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
    }
    .role-modal-close:hover { color: var(--color-text-primary); }

    .role-modal-title {
      font-size: 19px;
      font-weight: 800;
      color: var(--color-text-primary);
      margin-bottom: 4px;
      padding-right: 32px;
    }
    .role-modal-sub {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-bottom: 20px;
    }

    .role-modal-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .role-option {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 14px;
      border-radius: 16px;
      border: 1.5px solid var(--color-border-light);
      background: var(--color-surface, var(--color-background));
      cursor: pointer;
      text-align: left;
      transition: border-color 0.15s, background 0.15s, transform 0.1s;
    }
    .role-option:hover {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 6%, transparent);
    }
    .role-option:active { transform: scale(0.98); }

    .role-option-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      color: var(--color-primary);
    }
    .role-option-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }
    .role-option-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .role-option-sub {
      font-size: 12px;
      color: var(--color-text-secondary);
    }
    .role-option-arrow {
      flex-shrink: 0;
      font-size: 18px;
      color: var(--color-text-muted);
    }
  `],
})
export class PublicHomeComponent implements OnInit {
  salons: PublicSalon[] = [];
  categories: PublicCategory[] = [];
  loading = true;

  showRoleModal = false;
  pendingAction: 'login' | 'register' = 'login';

  constructor(
    private http: HttpClient,
    public router: Router,
    private toast: ToastService,
    public auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.auth.state$
      .pipe(
        filter((s) => !s.isLoading),
        take(1),
      )
      .subscribe(() => {
        if (this.auth.isAuthenticated) {
          this.router.navigate([this.auth.getDashboardRoute()]);
          return;
        }
        this.loadCategories();
        this.loadSalons();
      });
  }

  private loadCategories(): void {
    this.http.get<any>(`${environment.apiUrl}/categories`).subscribe({
      next: (res) => { this.categories = res?.data?.categories || res?.data || []; },
      error: () => { /* Non-critical — homepage still works without the category chips. */ },
    });
  }

  private loadSalons(): void {
    this.http.get<any>(`${environment.apiUrl}/beauticians/featured`).subscribe({
      next: (res) => {
        const featured = res?.data?.beauticians || res?.data || [];
        if (featured.length) {
          this.salons = featured;
          this.loading = false;
        } else {
          this.loadAllSalons();
        }
      },
      error: () => this.loadAllSalons(),
    });
  }

  private loadAllSalons(): void {
    this.http
      .get<any>(`${environment.apiUrl}/beauticians`, { params: { limit: '8' } as any })
      .subscribe({
        next: (res) => {
          this.salons = res?.data?.beauticians || [];
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  viewSalon(id: string): void {
    this.router.navigate(['/salon', id]);
  }

  browseCategory(cat: PublicCategory): void {
    this.toast.info('Sign up to filter and book by category');
    this.router.navigate(['/auth/register'], { queryParams: { category: cat.id } });
  }

  // ── Role modal ──
  openRoleModal(action: 'login' | 'register'): void {
    this.pendingAction = action;
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
  }

  selectRole(role: 'client' | 'beautician'): void {
    this.showRoleModal = false;

    if (this.pendingAction === 'register') {
      this.router.navigate([role === 'beautician' ? '/auth/beautician-register' : '/auth/register']);
      return;
    }

    // Sign-in is a single unified endpoint for both roles — the backend
    // resolves the dashboard from the account's role. "as=beautician" is
    // just a hint the login page can use for friendlier copy.
    this.router.navigate(
      ['/auth/login'],
      role === 'beautician' ? { queryParams: { as: 'beautician' } } : undefined,
    );
  }
}