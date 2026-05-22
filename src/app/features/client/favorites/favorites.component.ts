// ============================================================
// FAVORITES COMPONENT — Pinterest masonry with lazy load
// ============================================================
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-favorites",
  standalone: false,
  template: `
    <div
      class="min-h-screen pb-28"
      style="background-color: var(--color-bg-primary)"
    >
      <div class="px-4 lg:px-6 pt-5 pb-3">
        <h1
          class="text-2xl font-bold mb-1"
          style="color: var(--color-text-primary)"
        >
          Favourites
        </h1>
        <p class="text-sm" style="color: var(--color-text-secondary)">
          {{ total }} saved beautician{{ total !== 1 ? "s" : "" }}
        </p>
      </div>

      <!-- Skeleton masonry -->
      <div *ngIf="loading" class="masonry-grid px-4 lg:px-6">
        <div
          *ngFor="let h of skeletonHeights"
          class="masonry-item skeleton rounded-2xl"
          [style.height]="h + 'px'"
        ></div>
      </div>

      <!-- Empty state -->
      <div
        *ngIf="!loading && favorites.length === 0"
        class="flex flex-col items-center justify-center px-6 pt-20 pb-10 text-center"
      >
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style="background-color: color-mix(in srgb, var(--color-primary) 10%, transparent)"
        >
          <i
            class="ri-heart-3-line text-4xl"
            style="color: var(--color-primary)"
          ></i>
        </div>
        <h3
          class="text-lg font-bold mb-2"
          style="color: var(--color-text-primary)"
        >
          No Favourites Yet
        </h3>
        <p class="text-sm mb-6" style="color: var(--color-text-secondary)">
          Save beauticians you love to find them quickly later.
        </p>
        <button
          (click)="router.navigate(['/client/discover'])"
          class="px-6 py-3 rounded-2xl font-semibold text-sm text-white"
          style="background-color: var(--color-primary)"
        >
          Discover Beauticians
        </button>
      </div>

      <!-- Pinterest masonry -->
      <div
        *ngIf="!loading && favorites.length > 0"
        class="masonry-grid px-4 lg:px-6"
      >
        <div
          *ngFor="let fav of favorites; let i = index"
          (click)="viewSalon(fav.beautician.id)"
          class="masonry-item relative rounded-2xl overflow-hidden cursor-pointer
                    active:scale-[0.98] transition-transform card-animate"
          [style.animation-delay]="i * 50 + 'ms'"
        >
          <img
            [src]="
              fav.beautician.coverImage ||
              fav.beautician.profileImage ||
              'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=530&fit=crop'
            "
            [alt]="fav.beautician.businessName"
            loading="lazy"
            class="w-full block object-cover"
            [style.aspect-ratio]="cardRatio(i)"
          />

          <!-- Verified badge -->
          <div
            *ngIf="fav.beautician.verificationStatus === 'APPROVED'"
            class="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style="background: rgba(255,255,255,0.92);"
          >
            <i class="ri-verified-badge-fill text-blue-500 text-xs"></i>
            <span class="text-xs font-semibold" style="color: #1D4ED8;"
              >Verified</span
            >
          </div>

          <!-- Remove heart -->
          <button
            (click)="$event.stopPropagation(); removeFavorite(fav)"
            class="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                         transition-all active:scale-90"
            style="background: rgba(255,255,255,0.92)"
          >
            <i class="ri-heart-3-fill text-red-500 text-sm"></i>
          </button>

          <div
            class="absolute inset-0 flex flex-col justify-end p-3"
            style="background: linear-gradient(transparent, rgba(0,0,0,0.65))"
          >
            <p class="text-white font-semibold text-sm leading-tight truncate">
              {{ fav.beautician.businessName }}
            </p>
            <div class="flex items-center gap-1 mt-1">
              <i class="ri-star-fill text-yellow-400 text-xs"></i>
              <span class="text-white text-xs font-semibold">
                {{
                  (
                    fav.beautician.rating ||
                    fav.beautician.averageRating ||
                    0
                  ).toFixed(1)
                }}
              </span>
              <span class="text-white/60 text-xs">
                ({{
                  fav.beautician.totalReviews ||
                    fav.beautician.reviewCount ||
                    0
                }})
              </span>
            </div>
            <p
              class="text-white/70 text-xs mt-1 flex items-center gap-1 truncate"
            >
              <i class="ri-map-pin-2-line text-xs"></i>
              {{ fav.beautician.city || "Accra" }},
              {{ fav.beautician.region || "Ghana" }}
            </p>
            <div
              *ngIf="fav.beautician.businessCategory || fav.beautician.category"
              class="flex items-center mt-2"
            >
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                style="background: rgba(255,255,255,0.2); color: #fff;"
              >
                {{ fav.beautician.businessCategory || fav.beautician.category }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Lazy-load sentinel -->
      <div #sentinel class="h-4 mt-2"></div>

      <!-- Fetching-more indicator -->
      <div *ngIf="loadingMore" class="flex justify-center py-6">
        <span class="spinner"></span>
      </div>
    </div>
  `,
  styles: [
    `
      .masonry-grid {
        columns: 2;
        column-gap: 12px;
      }
      @media (min-width: 768px) {
        .masonry-grid {
          columns: 3;
        }
      }
      @media (min-width: 1280px) {
        .masonry-grid {
          columns: 4;
        }
      }
      .masonry-item {
        break-inside: avoid;
        display: block;
        margin-bottom: 12px;
      }
      @keyframes cardIn {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .card-animate {
        animation: cardIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
    `,
  ],
})
export class FavoritesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("sentinel") sentinel!: ElementRef;

  favorites: any[] = [];
  loading = true;
  loadingMore = false;
  page = 1;
  total = 0;
  private observer?: IntersectionObserver;

  skeletonHeights = [
    220, 160, 280, 180, 240, 150, 200, 190, 210, 170, 260, 155,
  ];

  cardRatio(index: number): string {
    const ratios = ["3/4", "4/5", "2/3", "3/5", "4/6", "3/4", "5/7", "2/3"];
    return ratios[index % ratios.length];
  }

  constructor(
    private http: HttpClient,
    public router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.loadingMore && !this.loading) {
          if (this.favorites.length < this.total) this.loadMore();
        }
      },
      { threshold: 0.1 },
    );
    if (this.sentinel) this.observer.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  loadFavorites(append = false) {
    if (!append) {
      this.loading = true;
      this.page = 1;
    } else {
      this.loadingMore = true;
    }

    this.http
      .get<any>(`${environment.apiUrl}/favorites`, {
        params: { page: String(this.page), limit: "12" },
      })
      .subscribe({
        next: (res) => {
          const items = res.data?.favorites || [];
          this.total = res.meta?.total || items.length;
          this.favorites = append ? [...this.favorites, ...items] : items;
          this.loading = false;
          this.loadingMore = false;
        },
        error: () => {
          this.loading = false;
          this.loadingMore = false;
        },
      });
  }

  loadMore() {
    this.page++;
    this.loadFavorites(true);
  }

  viewSalon(id: string) {
    this.router.navigate(["/client/salon", id]);
  }

  removeFavorite(fav: any) {
    this.favorites = this.favorites.filter((f) => f.id !== fav.id);
    this.total = Math.max(0, this.total - 1);
    this.http
      .delete(`${environment.apiUrl}/favorites/${fav.beautician.id}`)
      .subscribe({
        next: () => this.toast.success("Removed from favourites"),
        error: () => {
          this.favorites = [...this.favorites, fav];
          this.total++;
          this.toast.error("Failed to remove");
        },
      });
  }
}
