// ============================================================
// DISCOVER COMPONENT — full lazy-load Pinterest masonry
// Changes vs original:
//  1. BeauticianCard interface extends BeauticianProfile with
//     isFeatured, featuredPlan, isSponsored optional fields
//  2. isSponsoredCard() helper method added
//  3. "Recommended" badge shown on sponsored/featured salon cards
//  4. Array type changed from BeauticianProfile[] to BeauticianCard[]
//  5. Everything else (filter sheet, price slider, lazy load) unchanged
// ============================================================
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { BeauticianProfile } from "../../../core/models";

// Extend BeauticianProfile to include featured listing fields
// returned by the backend on /beauticians, /beauticians/search,
// and /beauticians/featured responses
interface BeauticianCard extends BeauticianProfile {
  isFeatured?: boolean;
  featuredPlan?: string; // "discover" | "map" | "bundle" | "category"
  featuredUntil?: string;
  isSponsored?: boolean; // set by backend on featured/search responses
}

@Component({
  selector: "app-discover",
  template: `
    <div class="page-enter px-4 lg:px-6 py-4">
      <div class="mb-5">
        <h1
          class="text-2xl font-bold mb-1"
          style="color: var(--color-text-primary)"
        >
          Discover
        </h1>
        <p class="text-sm" style="color: var(--color-text-secondary)">
          Find beauty professionals near you
        </p>
      </div>

      <!-- Search + Filter -->
      <div class="flex gap-2 mb-4">
        <div class="flex-1 relative">
          <i
            class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
            style="color: var(--color-text-placeholder)"
          ></i>
          <input
            [(ngModel)]="query"
            (ngModelChange)="onSearch()"
            type="text"
            placeholder="Search beauticians or services..."
            class="form-input pl-10"
          />
        </div>
        <button
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          [style.background-color]="
            hasActiveFilters
              ? 'var(--color-primary)'
              : 'var(--color-bg-secondary)'
          "
          (click)="openFilters()"
        >
          <i
            class="ri-equalizer-2-line text-lg"
            [style.color]="hasActiveFilters ? 'white' : 'var(--color-primary)'"
          ></i>
          <span
            *ngIf="hasActiveFilters"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
            style="font-size:10px; background-color:var(--color-primary); border:2px solid var(--color-bg-primary)"
          >
            {{ activeFilterCount }}
          </span>
        </button>
      </div>

      <!-- Sort chips -->
      <div
        class="flex gap-2 mb-4 overflow-x-auto pb-1"
        style="-ms-overflow-style:none;scrollbar-width:none;"
      >
        <button
          *ngFor="let chip of sortChips"
          (click)="setSort(chip.value)"
          class="px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
          [style.background-color]="
            activeSort === chip.value
              ? 'var(--color-primary)'
              : 'var(--color-bg-secondary)'
          "
          [style.color]="
            activeSort === chip.value ? 'white' : 'var(--color-text-secondary)'
          "
        >
          {{ chip.label }}
        </button>
      </div>

      <p class="text-xs mb-4" style="color: var(--color-text-secondary)">
        {{ total }} beautician{{ total !== 1 ? "s" : "" }} found
      </p>

      <!-- Skeleton masonry -->
      <div *ngIf="loading" class="masonry-grid pb-28">
        <div
          *ngFor="let h of skeletonHeights"
          class="masonry-item skeleton rounded-2xl"
          [style.height]="h + 'px'"
        ></div>
      </div>

      <!-- Pinterest masonry grid -->
      <div *ngIf="!loading" class="masonry-grid">
        <div
          *ngFor="let salon of beauticians; let i = index"
          (click)="goToSalon(salon.id)"
          class="masonry-item relative rounded-2xl overflow-hidden cursor-pointer
                    active:scale-[0.98] transition-transform card-animate"
          [style.animation-delay]="i * 40 + 'ms'"
        >
          <img
            [src]="
              salon.profileImage ||
              salon.coverImage ||
              'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=530&fit=crop'
            "
            [alt]="salon.businessName"
            loading="lazy"
            class="w-full block object-cover"
            [style.aspect-ratio]="cardRatio(i)"
          />

          <!-- ── RECOMMENDED badge (new) — shown for featured/sponsored salons ── -->
          <div
            *ngIf="isSponsoredCard(salon)"
            class="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full z-10"
            style="background: rgba(245, 158, 11, 0.92);"
          >
            <i class="ri-star-fill text-white" style="font-size: 9px"></i>
            <span
              class="text-white font-bold"
              style="font-size: 9px; letter-spacing: 0.03em"
              >RECOMMENDED</span
            >
          </div>

          <!-- Verified badge -->
          <div
            *ngIf="salon.verificationStatus === 'APPROVED'"
            class="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style="background:rgba(255,255,255,0.92);"
          >
            <i class="ri-verified-badge-fill text-blue-500 text-xs"></i>
            <span class="text-xs font-semibold" style="color:#1D4ED8;"
              >Verified</span
            >
          </div>

          <div
            class="absolute inset-0 flex flex-col justify-end p-3"
            style="background: linear-gradient(transparent, rgba(0,0,0,0.65))"
          >
            <p class="text-white font-semibold text-sm leading-tight truncate">
              {{ salon.businessName }}
            </p>
            <div class="flex items-center gap-1 mt-1">
              <i class="ri-star-fill text-yellow-400 text-xs"></i>
              <span class="text-white text-xs font-semibold">{{
                salon.rating.toFixed(1)
              }}</span>
              <span class="text-white/60 text-xs"
                >({{ salon.totalReviews || 0 }})</span
              >
            </div>
            <p
              class="text-white/70 text-xs mt-1 flex items-center gap-1 truncate"
            >
              <i class="ri-map-pin-2-line text-xs"></i>
              {{ salon.city }}, {{ salon.region }}
            </p>
            <div class="flex items-center justify-between mt-2">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                style="background:rgba(255,255,255,0.2);color:#fff;"
              >
                {{ salon.businessCategory }}
              </span>
              <button
                (click)="favorite($event, salon)"
                class="w-7 h-7 rounded-full flex items-center justify-center"
                style="background:rgba(255,255,255,0.2)"
              >
                <i
                  [class]="
                    isFavorited(salon.id)
                      ? 'ri-heart-3-fill text-red-400 text-xs'
                      : 'ri-heart-3-line text-white text-xs'
                  "
                ></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && beauticians.length === 0"
        icon="ri-search-line"
        title="No results found"
        subtitle="Try different search terms or filters"
      ></app-empty-state>

      <!-- Lazy-load sentinel — IntersectionObserver watches this -->
      <div #sentinel class="h-4 mt-2"></div>

      <!-- Inline loading indicator while fetching next page -->
      <div *ngIf="loadingMore" class="flex justify-center py-6">
        <span class="spinner"></span>
      </div>

      <div class="h-8"></div>
    </div>

    <!-- ===== FILTER BOTTOM SHEET ===== -->
    <div
      class="fixed inset-0 z-40 transition-opacity duration-300"
      [style.opacity]="showFilters ? '1' : '0'"
      [style.pointer-events]="showFilters ? 'auto' : 'none'"
      style="background:rgba(0,0,0,0.45)"
      (click)="closeFilters()"
    ></div>

    <div
      class="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl overflow-hidden transition-transform duration-300"
      style="background-color:var(--color-bg-primary);max-height:90vh;"
      [style.transform]="showFilters ? 'translateY(0)' : 'translateY(100%)'"
    >
      <div class="flex justify-center pt-3 pb-1 flex-shrink-0">
        <div
          class="w-10 h-1 rounded-full"
          style="background-color:var(--color-border-light)"
        ></div>
      </div>

      <div
        class="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style="border-bottom:1px solid var(--color-border-light)"
      >
        <button
          (click)="closeFilters()"
          class="w-9 h-9 rounded-xl flex items-center justify-center"
          style="background-color:var(--color-bg-secondary)"
        >
          <i
            class="ri-arrow-left-s-line text-lg"
            style="color:var(--color-text-primary)"
          ></i>
        </button>
        <h2 class="text-base font-bold" style="color:var(--color-text-primary)">
          Filters
        </h2>
        <div class="w-9"></div>
      </div>

      <div
        class="overflow-y-auto px-5 py-4"
        style="-ms-overflow-style:none;scrollbar-width:none;"
      >
        <p
          class="text-sm font-bold mb-3"
          style="color:var(--color-text-primary)"
        >
          Sort by
        </p>
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            *ngFor="let chip of sortChips"
            (click)="draftFilters.sortBy = chip.value"
            class="px-4 py-2 rounded-full text-xs font-semibold transition-all"
            [style.background-color]="
              draftFilters.sortBy === chip.value
                ? 'var(--color-primary)'
                : 'var(--color-bg-secondary)'
            "
            [style.color]="
              draftFilters.sortBy === chip.value
                ? 'white'
                : 'var(--color-text-secondary)'
            "
          >
            {{ chip.label }}
          </button>
        </div>

        <!-- Price range -->
        <div
          class="rounded-2xl p-4 mb-5"
          style="background-color:var(--color-bg-secondary)"
        >
          <div class="flex items-center justify-between mb-4">
            <p
              class="text-sm font-bold"
              style="color:var(--color-text-primary)"
            >
              Price Range
            </p>
            <span
              class="text-xs font-semibold px-2 py-1 rounded-lg"
              style="background-color:var(--color-bg-primary);color:var(--color-primary)"
            >
              GHS {{ draftFilters.minPrice | number }} – GHS
              {{ draftFilters.maxPrice | number }}
            </span>
          </div>
          <div class="dual-range-wrap">
            <div class="dual-track">
              <div
                class="dual-fill"
                [style.left.%]="(draftFilters.minPrice / maxPrice) * 100"
                [style.width.%]="
                  ((draftFilters.maxPrice - draftFilters.minPrice) / maxPrice) *
                  100
                "
              ></div>
            </div>
            <input
              type="range"
              min="0"
              [max]="maxPrice"
              step="500"
              [(ngModel)]="draftFilters.minPrice"
              (input)="clampMin()"
              class="dual-input dual-input-min"
            />
            <input
              type="range"
              min="0"
              [max]="maxPrice"
              step="500"
              [(ngModel)]="draftFilters.maxPrice"
              (input)="clampMax()"
              class="dual-input dual-input-max"
            />
          </div>
          <div class="flex justify-between mt-5">
            <div class="flex flex-col items-center">
              <span
                class="text-xs mb-1"
                style="color:var(--color-text-secondary)"
                >min. price</span
              >
              <span
                class="text-sm font-semibold px-3 py-1.5 rounded-xl"
                style="background-color:var(--color-bg-primary);color:var(--color-text-primary)"
              >
                GHS {{ draftFilters.minPrice | number }}
              </span>
            </div>
            <div class="flex flex-col items-center">
              <span
                class="text-xs mb-1"
                style="color:var(--color-text-secondary)"
                >max. price</span
              >
              <span
                class="text-sm font-semibold px-3 py-1.5 rounded-xl"
                style="background-color:var(--color-bg-primary);color:var(--color-text-primary)"
              >
                GHS {{ draftFilters.maxPrice | number }}
              </span>
            </div>
          </div>
        </div>

        <!-- Filter toggles -->
        <div
          class="rounded-2xl overflow-hidden mb-5"
          style="background-color:var(--color-bg-secondary)"
        >
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom:1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color:var(--color-text-primary)"
              >Min Rating</span
            >
            <div class="flex items-center gap-2">
              <button
                *ngFor="let r of [3, 4, 5]"
                (click)="
                  draftFilters.minRating = draftFilters.minRating === r ? 0 : r
                "
                class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                [style.background-color]="
                  draftFilters.minRating === r
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-primary)'
                "
                [style.color]="
                  draftFilters.minRating === r
                    ? 'white'
                    : 'var(--color-text-secondary)'
                "
              >
                <i
                  class="ri-star-fill text-yellow-400"
                  style="font-size:10px"
                ></i>
                {{ r }}+
              </button>
            </div>
          </div>
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom:1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color:var(--color-text-primary)"
              >City</span
            >
            <input
              [(ngModel)]="draftFilters.city"
              type="text"
              placeholder="e.g. Accra"
              class="text-sm text-right bg-transparent border-none outline-none w-32"
              style="color:var(--color-text-primary)"
            />
          </div>
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom:1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color:var(--color-text-primary)"
              >Verified Only</span
            >
            <button
              (click)="draftFilters.verifiedOnly = !draftFilters.verifiedOnly"
              class="w-12 h-6 rounded-full transition-all relative"
              [style.background-color]="
                draftFilters.verifiedOnly
                  ? 'var(--color-primary)'
                  : 'var(--color-border-light)'
              "
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                [style.left]="draftFilters.verifiedOnly ? '26px' : '2px'"
              ></span>
            </button>
          </div>
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom:1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color:var(--color-text-primary)"
              >Home Service</span
            >
            <button
              (click)="draftFilters.homeService = !draftFilters.homeService"
              class="w-12 h-6 rounded-full transition-all relative"
              [style.background-color]="
                draftFilters.homeService
                  ? 'var(--color-primary)'
                  : 'var(--color-border-light)'
              "
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                [style.left]="draftFilters.homeService ? '26px' : '2px'"
              ></span>
            </button>
          </div>
          <div class="flex items-center justify-between px-4 py-4">
            <span class="text-sm" style="color:var(--color-text-primary)"
              >Has Discount</span
            >
            <button
              (click)="draftFilters.hasDiscount = !draftFilters.hasDiscount"
              class="w-12 h-6 rounded-full transition-all relative"
              [style.background-color]="
                draftFilters.hasDiscount
                  ? 'var(--color-primary)'
                  : 'var(--color-border-light)'
              "
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                [style.left]="draftFilters.hasDiscount ? '26px' : '2px'"
              ></span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2 pb-8">
          <button
            (click)="clearFilters()"
            class="py-4 rounded-2xl text-sm font-semibold transition-all"
            style="background-color:var(--color-bg-secondary);color:var(--color-text-secondary)"
          >
            Clear all
          </button>
          <button
            (click)="applyFilters()"
            class="py-4 rounded-2xl text-sm font-bold text-white transition-all"
            style="background-color:var(--color-primary)"
          >
            Apply
          </button>
        </div>
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

      .dual-range-wrap {
        position: relative;
        height: 40px;
        display: flex;
        align-items: center;
        margin: 0 4px;
      }
      .dual-track {
        position: absolute;
        left: 0;
        right: 0;
        height: 4px;
        border-radius: 4px;
        background-color: var(--color-border-light);
        pointer-events: none;
        z-index: 0;
      }
      .dual-fill {
        position: absolute;
        height: 100%;
        border-radius: 4px;
        background-color: var(--color-primary);
      }
      .dual-input {
        position: absolute;
        left: 0;
        width: 100%;
        height: 40px;
        top: 0;
        background: transparent;
        cursor: pointer;
        margin: 0;
        padding: 0;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
      }
      .dual-input::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        background: transparent;
        height: 4px;
      }
      .dual-input::-moz-range-track {
        background: transparent;
        height: 4px;
        border: none;
      }
      .dual-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #fff;
        border: 3px solid var(--color-primary);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        cursor: grab;
        margin-top: -12px;
        position: relative;
        z-index: 10;
        transition: transform 0.1s;
      }
      .dual-input::-moz-range-thumb {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #fff;
        border: 3px solid var(--color-primary);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        cursor: grab;
      }
      .dual-input:active::-webkit-slider-thumb {
        transform: scale(1.2);
        cursor: grabbing;
      }
      .dual-input-min {
        z-index: 3;
      }
      .dual-input-max {
        z-index: 4;
      }
    `,
  ],
})
export class DiscoverComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("sentinel") sentinel!: ElementRef;

  query = "";
  loading = true;
  loadingMore = false;
  showFilters = false;
  activeSort = "";
  // ── Changed from BeauticianProfile[] to BeauticianCard[] ──
  beauticians: BeauticianCard[] = [];
  total = 0;
  page = 1;
  maxPrice = 10000;
  favoriteIds = new Set<string>();
  private observer?: IntersectionObserver;
  private _debounce?: ReturnType<typeof setTimeout>;

  skeletonHeights = [
    220, 160, 280, 180, 240, 150, 200, 190, 210, 170, 260, 155,
  ];

  filters = {
    sortBy: "",
    minRating: 0,
    city: "",
    minPrice: 0,
    maxPrice: 10000,
    verifiedOnly: false,
    homeService: false,
    hasDiscount: false,
  };
  draftFilters = { ...this.filters };

  sortChips = [
    { label: "Best Match", value: "" },
    { label: "Top Rated", value: "rating" },
    { label: "Most Reviews", value: "reviews" },
    { label: "Nearest", value: "nearest" },
  ];

  get hasActiveFilters(): boolean {
    return !!(
      this.filters.sortBy ||
      this.filters.minRating ||
      this.filters.city ||
      this.filters.minPrice > 0 ||
      this.filters.maxPrice < this.maxPrice ||
      this.filters.verifiedOnly ||
      this.filters.homeService ||
      this.filters.hasDiscount
    );
  }
  get activeFilterCount(): number {
    return [
      this.filters.sortBy,
      this.filters.minRating,
      this.filters.city,
      this.filters.minPrice > 0,
      this.filters.maxPrice < this.maxPrice,
      this.filters.verifiedOnly,
      this.filters.homeService,
      this.filters.hasDiscount,
    ].filter(Boolean).length;
  }

  cardRatio(index: number): string {
    const ratios = ["3/4", "4/5", "2/3", "3/5", "4/6", "3/4", "5/7", "2/3"];
    return ratios[index % ratios.length];
  }

  // ── NEW: returns true if salon should show the Recommended badge ──
  isSponsoredCard(salon: BeauticianCard): boolean {
    return salon.isSponsored === true || salon.isFeatured === true;
  }

  constructor(
    private http: HttpClient,
    public router: Router,
  ) {}

  isFavorited(id: string): boolean {
    return this.favoriteIds.has(id);
  }

  ngOnInit(): void {
    this.loadBeauticians();
    this.http.get<any>(`${environment.apiUrl}/favorites`).subscribe({
      next: (res) => {
        const favs = res.data?.favorites || [];
        this.favoriteIds = new Set(
          favs.map((f: any) => f.beautician?.id || f.beauticianId),
        );
      },
      error: () => {},
    });
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.loadingMore && !this.loading) {
          if (this.beauticians.length < this.total) this.loadMore();
        }
      },
      { threshold: 0.1 },
    );
    if (this.sentinel) this.observer.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  openFilters(): void {
    this.draftFilters = { ...this.filters };
    this.showFilters = true;
    document.body.style.overflow = "hidden";
  }
  closeFilters(): void {
    this.showFilters = false;
    document.body.style.overflow = "";
  }
  applyFilters(): void {
    this.filters = { ...this.draftFilters };
    this.activeSort = this.filters.sortBy;
    this.closeFilters();
    this.loadBeauticians();
  }
  clearFilters(): void {
    this.draftFilters = {
      sortBy: "",
      minRating: 0,
      city: "",
      minPrice: 0,
      maxPrice: this.maxPrice,
      verifiedOnly: false,
      homeService: false,
      hasDiscount: false,
    };
  }
  clampMin(): void {
    if (this.draftFilters.minPrice >= this.draftFilters.maxPrice)
      this.draftFilters.minPrice = this.draftFilters.maxPrice - 500;
  }
  clampMax(): void {
    if (this.draftFilters.maxPrice <= this.draftFilters.minPrice)
      this.draftFilters.maxPrice = this.draftFilters.minPrice + 500;
  }
  onSearch(): void {
    this.page = 1;
    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this.loadBeauticians(), 400);
  }
  setSort(val: string): void {
    this.activeSort = val;
    this.filters.sortBy = val;
    this.loadBeauticians();
  }

  loadBeauticians(append = false): void {
    if (!append) {
      this.loading = true;
      this.page = 1;
    } else {
      this.loadingMore = true;
    }

    const params: Record<string, string> = {
      page: String(this.page),
      limit: "12",
    };
    if (this.query) params["query"] = this.query;
    if (this.filters.sortBy) params["sortBy"] = this.filters.sortBy;
    if (this.filters.minRating)
      params["minRating"] = String(this.filters.minRating);
    if (this.filters.city) params["city"] = this.filters.city;
    if (this.filters.minPrice > 0)
      params["minPrice"] = String(this.filters.minPrice);
    if (this.filters.maxPrice < this.maxPrice)
      params["maxPrice"] = String(this.filters.maxPrice);
    if (this.filters.verifiedOnly) params["verified"] = "true";
    if (this.filters.homeService) params["homeService"] = "true";
    if (this.filters.hasDiscount) params["hasDiscount"] = "true";

    const endpoint = this.query
      ? `${environment.apiUrl}/beauticians/search`
      : `${environment.apiUrl}/beauticians`;

    this.http.get<any>(endpoint, { params }).subscribe({
      next: (res) => {
        const items: BeauticianCard[] =
          res?.data?.beauticians || res?.beauticians || [];
        this.total = res?.meta?.total || items.length;
        this.beauticians = append ? [...this.beauticians, ...items] : items;
        this.loading = false;
        this.loadingMore = false;
      },
      error: () => {
        this.loading = false;
        this.loadingMore = false;
      },
    });
  }

  loadMore(): void {
    this.page++;
    this.loadBeauticians(true);
  }
  goToSalon(id: string): void {
    this.router.navigate(["/client/salon", id]);
  }

  favorite(event: Event, salon: BeauticianCard): void {
    event.stopPropagation();
    const alreadyFaved = this.favoriteIds.has(salon.id);
    if (alreadyFaved) {
      this.favoriteIds.delete(salon.id);
      this.http
        .delete(`${environment.apiUrl}/favorites/${salon.id}`)
        .subscribe({ error: () => this.favoriteIds.add(salon.id) });
    } else {
      this.favoriteIds.add(salon.id);
      this.http
        .post(`${environment.apiUrl}/favorites`, { beauticianId: salon.id })
        .subscribe({ error: () => this.favoriteIds.delete(salon.id) });
    }
  }
}
