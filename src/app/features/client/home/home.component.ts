// home.component.ts
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { BeauticianProfile, Category, Promotion } from "../../../core/models";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-home",
  template: `
    <div class="page-enter">
      <!-- ===== HEADER ===== -->
      <div class="flex items-center justify-between px-4 lg:px-6 pt-4 pb-2">
        <div class="flex items-center gap-2">
          <i
            class="ri-map-pin-2-fill text-base"
            style="color: var(--color-primary)"
          ></i>
          <div>
            <p class="text-xs" style="color: var(--color-text-secondary)">
              Location
            </p>
            <p
              class="text-sm font-semibold leading-tight"
              style="color: var(--color-text-primary)"
            >
              {{ user?.city || "Accra" }}, {{ user?.region || "Ghana" }}
            </p>
          </div>
        </div>
        <div class="hidden lg:flex items-center gap-2">
          <a
            routerLink="/client/notifications"
            class="w-9 h-9 rounded-xl flex items-center justify-center"
            style="background-color: var(--color-bg-secondary)"
          >
            <i
              class="ri-notification-3-line text-base"
              style="color: var(--color-primary)"
            ></i>
          </a>
          <a
            routerLink="/client/favorites"
            class="w-9 h-9 rounded-xl flex items-center justify-center"
            style="background-color: var(--color-bg-secondary)"
          >
            <i
              class="ri-heart-3-line text-base"
              style="color: var(--color-primary)"
            ></i>
          </a>
        </div>
      </div>

      <!-- ===== GREETING ===== -->
      <!-- <div class="px-4 lg:px-6 pb-4">
        <p class="text-sm mt-0.5" style="color: var(--color-text-secondary)">
          What service do you need today?
        </p>
      </div> -->

      <!-- ===== SEARCH BAR ===== -->
      <div class="px-4 lg:px-6 mb-5">
        <div class="flex gap-2">
          <div class="flex-1 relative">
            <i
              class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
              style="color: var(--color-text-placeholder)"
            ></i>
            <input
              [(ngModel)]="searchQuery"
              (keyup.enter)="search()"
              type="text"
              placeholder="Search for services near you..."
              class="form-input pl-10"
            />
          </div>
          <button
            (click)="search()"
            class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background-color: var(--color-primary)"
          >
            <i class="ri-search-line text-white text-lg"></i>
          </button>
        </div>
      </div>

      <div class="lg:grid lg:grid-cols-12 lg:gap-6 lg:px-6">
        <div class="lg:col-span-8">
          <!-- ===== PROMOTIONS BANNER ===== -->
          <section class="mb-6">
            <div class="flex items-center justify-between px-4 lg:px-0 mb-3">
              <h2
                class="text-base font-bold"
                style="color: var(--color-text-primary)"
              >
                Promotions
              </h2>
              <a
                routerLink="/client/promotions"
                class="text-xs font-semibold"
                style="color: var(--color-primary)"
                >View all</a
              >
            </div>
            <div
              class="flex gap-3 overflow-x-auto px-4 lg:px-0 pb-2 snap-x snap-mandatory
                     lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0"
              style="-ms-overflow-style: none; scrollbar-width: none;"
            >
              <div
                *ngIf="loading.featured"
                class="skeleton h-40 w-64 flex-shrink-0 rounded-xl lg:w-full"
              ></div>
              <div
                *ngIf="loading.featured"
                class="skeleton h-40 w-64 flex-shrink-0 rounded-xl lg:w-full"
              ></div>

              <div
                *ngFor="let salon of featuredSalons.slice(0, 4)"
                class="relative flex-shrink-0 w-64 h-40 rounded-xl overflow-hidden cursor-pointer lg:w-full"
                (click)="goToSalon(salon.id)"
              >
                <img
                  [src]="
                    salon.coverImage ||
                    salon.profileImage ||
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
                  "
                  [alt]="salon.businessName"
                  class="w-full h-full object-cover"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3"
                >
                  <p class="text-white font-bold text-sm">
                    {{ salon.businessName }}
                  </p>
                  <div class="flex items-center gap-1 mt-0.5">
                    <i class="ri-star-fill text-yellow-400 text-xs"></i>
                    <span class="text-white text-xs">{{
                      salon.rating.toFixed(1)
                    }}</span>
                  </div>
                </div>
              </div>

              <div
                *ngIf="!loading.featured && featuredSalons.length === 0"
                class="flex-shrink-0 w-64 h-40 rounded-xl flex items-center justify-center lg:w-full"
                style="background-color: var(--color-bg-secondary)"
              >
                <p class="text-xs" style="color: var(--color-text-secondary)">
                  No promotions
                </p>
              </div>
            </div>
          </section>

          <!-- ===== CATEGORIES ===== -->
          <section class="mb-6">
            <div class="flex items-center justify-between px-4 lg:px-0 mb-3">
              <h2
                class="text-base font-bold"
                style="color: var(--color-text-primary)"
              >
                Categories
              </h2>
              <a
                routerLink="/client/discover"
                class="text-xs font-semibold"
                style="color: var(--color-primary)"
                >View all</a
              >
            </div>

            <!-- Skeleton -->
            <div
              *ngIf="loading.categories"
              class="flex gap-3 overflow-x-auto px-4 lg:px-0 pb-2"
              style="-ms-overflow-style: none; scrollbar-width: none;"
            >
              <div
                *ngFor="let _ of [1, 2, 3, 4, 5]"
                class="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div
                  class="skeleton rounded-xl"
                  style="width: 72px; height: 62px;"
                ></div>
                <div class="skeleton h-3 w-12 rounded"></div>
              </div>
            </div>

            <!-- Category tiles — rounded square image + label below, matching HTML reference -->
            <div
              *ngIf="!loading.categories"
              class="flex gap-3 overflow-x-auto px-4 lg:px-0 pb-2"
              style="-ms-overflow-style: none; scrollbar-width: none;"
            >
              <button
                *ngFor="let cat of categories.slice(0, 8)"
                (click)="goToCategory(cat)"
                class="flex flex-col items-center gap-2 flex-shrink-0 active:scale-95 transition-all"
              >
                <!-- Square rounded image tile -->
                <div
                  class="rounded-xl overflow-hidden flex-shrink-0"
                  style="width: 72px; height: 62px;"
                >
                  <img
                    *ngIf="cat.image"
                    [src]="cat.image"
                    [alt]="cat.name"
                    class="w-full h-full object-cover"
                  />
                  <!-- Fallback: tinted icon tile when no image -->
                  <div
                    *ngIf="!cat.image"
                    class="w-full h-full flex items-center justify-center"
                    [ngStyle]="{
                      'background-color':
                        (cat.color || 'var(--color-primary)') + '22',
                    }"
                  >
                    <i
                      [class]="(cat.icon || 'ri-scissors-2-line') + ' text-2xl'"
                      [ngStyle]="{ color: cat.color || 'var(--color-primary)' }"
                    ></i>
                  </div>
                </div>

                <!-- Category name -->
                <span
                  class="text-xs font-medium text-center"
                  style="color: var(--color-text-primary); max-width: 72px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;"
                >
                  {{ cat.name }}
                </span>
              </button>
            </div>
          </section>

          <!-- ===== NEAR YOU ===== -->
          <section class="mb-6">
            <div class="flex items-center justify-between px-4 lg:px-0 mb-3">
              <h2
                class="text-base font-bold"
                style="color: var(--color-text-primary)"
              >
                Near you
              </h2>
              <a
                routerLink="/client/discover"
                class="text-xs font-semibold"
                style="color: var(--color-primary)"
                >View all</a
              >
            </div>

            <div
              *ngIf="loading.nearby"
              class="grid grid-cols-2 gap-3 px-4 lg:px-0"
            >
              <div
                *ngFor="let _ of [1, 2, 3, 4]"
                class="skeleton rounded-2xl"
                style="aspect-ratio: 0.75;"
              ></div>
            </div>

            <div class="grid grid-cols-2 gap-3 px-4 lg:px-0">
              <div
                *ngFor="let salon of nearbySalons.slice(0, 6)"
                (click)="goToSalon(salon.id)"
                class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-all"
                style="aspect-ratio: 0.75;"
              >
                <img
                  [src]="
                    salon.profileImage ||
                    salon.coverImage ||
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=530&fit=crop'
                  "
                  [alt]="salon.businessName"
                  class="w-full h-full object-cover block"
                />
                <div
                  class="absolute inset-0 flex flex-col justify-end p-3"
                  style="background: linear-gradient(transparent, rgba(0,0,0,0.65))"
                >
                  <p
                    class="text-white font-semibold text-sm leading-tight truncate"
                  >
                    {{ salon.businessName }}
                  </p>
                  <div class="flex items-center justify-between mt-1">
                    <div class="flex items-center gap-1">
                      <i class="ri-star-fill text-yellow-400 text-xs"></i>
                      <span class="text-white text-xs font-semibold">{{
                        salon.rating.toFixed(1)
                      }}</span>
                      <span class="text-white/60 text-xs"
                        >({{ salon.totalReviews || 0 }})</span
                      >
                    </div>
                    <button
                      (click)="toggleFavorite(salon, $event)"
                      class="w-7 h-7 rounded-full flex items-center justify-center"
                      style="background: rgba(255,255,255,0.2)"
                    >
                      <i class="ri-heart-3-line text-white text-xs"></i>
                    </button>
                  </div>
                  <p
                    class="text-white/70 text-xs mt-1 flex items-center gap-1 truncate"
                  >
                    <i class="ri-map-pin-2-line text-xs"></i>
                    {{ salon.city }}, {{ salon.region }}
                  </p>
                </div>
              </div>
            </div>

            <app-empty-state
              *ngIf="!loading.nearby && nearbySalons.length === 0"
              icon="ri-map-pin-2-line"
              title="No salons nearby"
              subtitle="Try expanding your search area"
            ></app-empty-state>
          </section>
        </div>

        <!-- ===== DESKTOP SIDEBAR ===== -->
        <div class="hidden lg:block lg:col-span-4">
          <div
            class="rounded-xl p-5 mb-4"
            style="background-color: var(--color-bg-secondary)"
          >
            <h3
              class="font-bold text-sm mb-4"
              style="color: var(--color-text-primary)"
            >
              Your Activity
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <a
                routerLink="/client/bookings"
                class="stat-card hover:opacity-80 transition-opacity cursor-pointer"
              >
                <p
                  class="text-2xl font-bold"
                  style="color: var(--color-primary)"
                >
                  {{ stats.bookings }}
                </p>
                <p
                  class="text-xs mt-1"
                  style="color: var(--color-text-secondary)"
                >
                  Bookings
                </p>
              </a>
              <a
                routerLink="/client/favorites"
                class="stat-card hover:opacity-80 transition-opacity cursor-pointer"
              >
                <p
                  class="text-2xl font-bold"
                  style="color: var(--color-primary)"
                >
                  {{ stats.favorites }}
                </p>
                <p
                  class="text-xs mt-1"
                  style="color: var(--color-text-secondary)"
                >
                  Favorites
                </p>
              </a>
              <a
                routerLink="/client/referral"
                class="stat-card hover:opacity-80 transition-opacity cursor-pointer"
              >
                <p
                  class="text-2xl font-bold"
                  style="color: var(--color-primary)"
                >
                  {{ stats.referrals }}
                </p>
                <p
                  class="text-xs mt-1"
                  style="color: var(--color-text-secondary)"
                >
                  Referrals
                </p>
              </a>
              <a
                routerLink="/client/wallet"
                class="stat-card hover:opacity-80 transition-opacity cursor-pointer"
              >
                <p
                  class="text-xl font-bold"
                  style="color: var(--color-primary)"
                >
                  GHS {{ stats.wallet }}
                </p>
                <p
                  class="text-xs mt-1"
                  style="color: var(--color-text-secondary)"
                >
                  Wallet
                </p>
              </a>
            </div>
          </div>

          <div class="rounded-xl overflow-hidden mb-4" *ngIf="latestPromo">
            <div class="gradient-primary p-4">
              <div class="flex items-center justify-between mb-2">
                <span
                  class="text-white text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full"
                  >PROMO</span
                >
                <span class="text-white text-xs">{{
                  latestPromo.endDate | date: "MMM d"
                }}</span>
              </div>
              <p class="text-white font-bold text-base mb-1">
                {{ latestPromo.title }}
              </p>
              <p class="text-white/80 text-xs mb-3">
                {{ latestPromo.description }}
              </p>
              <div class="flex items-center justify-between">
                <span class="text-white font-bold text-lg">
                  {{
                    latestPromo.discountType === "PERCENTAGE"
                      ? latestPromo.discountValue + "% OFF"
                      : "GHS " + latestPromo.discountValue + " OFF"
                  }}
                </span>
                <button
                  class="bg-white text-sm font-semibold px-3 py-1.5 rounded-lg"
                  [style.color]="'var(--color-primary)'"
                  (click)="router.navigate(['/client/promotions'])"
                >
                  View
                </button>
              </div>
            </div>
          </div>

          <div
            class="rounded-xl p-4"
            style="background-color: var(--color-bg-secondary)"
          >
            <h3
              class="font-bold text-sm mb-3"
              style="color: var(--color-text-primary)"
            >
              Quick Links
            </h3>
            <div class="space-y-2">
              <a
                *ngFor="let link of quickLinks"
                [routerLink]="[link.route]"
                class="flex items-center gap-3 p-2.5 rounded-lg hover:opacity-80 transition-opacity"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style="background-color: color-mix(in srgb, var(--color-primary) 12%, transparent)"
                >
                  <i
                    [class]="link.icon + ' text-sm'"
                    style="color: var(--color-primary)"
                  ></i>
                </div>
                <span
                  class="text-sm font-medium"
                  style="color: var(--color-text-primary)"
                  >{{ link.label }}</span
                >
                <i
                  class="ri-arrow-right-s-line ml-auto"
                  style="color: var(--color-text-secondary)"
                ></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-8 lg:h-4"></div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  searchQuery = "";
  user = this.authService.user;

  loading = { featured: true, categories: true, nearby: true };

  featuredSalons: BeauticianProfile[] = [];
  nearbySalons: BeauticianProfile[] = [];
  categories: Category[] = [];
  latestPromo: Promotion | null = null;

  stats = { bookings: 0, favorites: 0, referrals: 0, wallet: 0 };

  quickLinks = [
    {
      label: "My Bookings",
      icon: "ri-calendar-event-line",
      route: "/client/bookings",
    },
    { label: "Favorites", icon: "ri-heart-3-line", route: "/client/favorites" },
    {
      label: "Referral Program",
      icon: "ri-gift-2-line",
      route: "/client/referral",
    },
  ];

  get firstName(): string {
    return this.user?.name?.split(" ")[0] || "Guest";
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private toast: ToastService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    const base = environment.apiUrl;

    this.http.get<any>(`${base}/beauticians/featured`).subscribe({
      next: (res) => {
        this.featuredSalons = res?.data?.beauticians || res?.data || [];
        this.loading.featured = false;
      },
      error: () => {
        this.loading.featured = false;
      },
    });

    this.http.get<any>(`${base}/categories`).subscribe({
      next: (res) => {
        this.categories =
          res?.data?.categories || res?.categories || res?.data || [];
        this.loading.categories = false;
      },
      error: () => {
        this.loading.categories = false;
      },
    });

    this.http
      .get<any>(`${base}/beauticians`, { params: { limit: "5" } })
      .subscribe({
        next: (res) => {
          this.nearbySalons = res?.data?.beauticians || res?.beauticians || [];
          this.loading.nearby = false;
        },
        error: () => {
          this.loading.nearby = false;
        },
      });

    this.http.get<any>(`${base}/users/stats`).subscribe({
      next: (res) => {
        const d = res?.data || {};
        this.stats = {
          bookings: d.bookings || 0,
          favorites: d.favorites || 0,
          referrals: 0,
          wallet: 0,
        };
      },
      error: () => {},
    });

    this.http
      .get<any>(`${base}/promotions`, {
        params: { isActive: "true", limit: "1" },
      })
      .subscribe({
        next: (res) => {
          this.latestPromo = (res?.data?.promotions || [])[0] || null;
        },
        error: () => {},
      });
  }

  search(): void {
    this.router.navigate(["/client/map"], {
      queryParams: this.searchQuery.trim()
        ? { q: this.searchQuery.trim() }
        : {},
    });
  }

  goToSalon(id: string): void {
    this.router.navigate(["/client/salon", id]);
  }

  goToCategory(cat: Category): void {
    this.router.navigate(["/client/search"], {
      queryParams: { category: cat.slug, name: cat.name },
    });
  }

  toggleFavorite(salon: BeauticianProfile, event: Event): void {
    event.stopPropagation();
    this.toast.info("Added to favorites");
  }
}
