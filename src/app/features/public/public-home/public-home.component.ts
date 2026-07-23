// public-home.component.ts
//
// Public landing page — no auth required. Lets a visitor get a feel for
// the app (browse categories, see real salons) before committing to an
// account. Any action that actually requires a session (booking,
// favoriting, messaging, viewing full contact details) is gated behind
// login via requireAuth(), which sends them to /auth/login with a toast
// explaining why, and remembers where to send them back afterward.

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
    <div style="background-color: var(--color-background); min-height: 100vh;">
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
            (click)="router.navigate(['/auth/login'])"
            class="px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
            style="color: var(--color-text-primary)"
          >
            Sign in
          </button>
          <button
            (click)="router.navigate(['/auth/register'])"
            class="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-transform active:scale-95"
            style="background-color: var(--color-primary)"
          >
            Sign up
          </button>
        </div>
      </header>

      <!-- Hero -->
      <section class="px-4 lg:px-8 pt-8 pb-6 text-center">
        <h1
          class="text-2xl lg:text-4xl font-bold leading-tight mb-2"
          style="color: var(--color-text-primary)"
        >
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
      <section class="px-4 lg:px-8 pb-24">
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
              <i class="ri-verified-badge-fill text-blue-500 text-xs"></i>
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
          (click)="router.navigate(['/auth/register'])"
          class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
          style="background-color: var(--color-primary)"
        >
          Get started
        </button>
      </div>
    </div>
  `,
})
export class PublicHomeComponent implements OnInit {
  salons: PublicSalon[] = [];
  categories: PublicCategory[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    public router: Router,
    private toast: ToastService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    // Wait for AuthService to finish hydrating (including any silent
    // refresh of an expired-but-refreshable token) before deciding —
    // otherwise a genuinely logged-in user with a stale access token could
    // flash the guest homepage before the refresh resolves.
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
      next: (res) => {
        this.categories = res?.data?.categories || res?.data || [];
      },
      error: () => {
        // Non-critical — homepage still works without the category chips.
      },
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
          // Fall back to a general listing if nothing is currently featured.
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
        error: () => {
          this.loading = false;
        },
      });
  }

  viewSalon(id: string): void {
    this.router.navigate(['/salon', id]);
  }

  browseCategory(cat: PublicCategory): void {
    // Category filtering lives in the full Discover experience, which
    // requires an account — send them to sign up with the category
    // preselected via query param so it's not a dead end.
    this.toast.info('Sign up to filter and book by category');
    this.router.navigate(['/auth/register'], { queryParams: { category: cat.id } });
  }
}
