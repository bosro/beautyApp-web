import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from "rxjs";

@Component({
  selector: "app-search-results",
  standalone: false,
  styles: [
    `
      /* ── Animations ─────────────────────────────────────── */
      @keyframes fadeSlideIn {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes shimmer {
        0% {
          background-position: -400px 0;
        }
        100% {
          background-position: 400px 0;
        }
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .result-card {
        animation: fadeSlideIn 0.35s ease both;
      }
      .result-card:nth-child(1) {
        animation-delay: 0.04s;
      }
      .result-card:nth-child(2) {
        animation-delay: 0.08s;
      }
      .result-card:nth-child(3) {
        animation-delay: 0.12s;
      }
      .result-card:nth-child(4) {
        animation-delay: 0.16s;
      }
      .result-card:nth-child(5) {
        animation-delay: 0.2s;
      }
      .result-card:nth-child(6) {
        animation-delay: 0.24s;
      }
      .result-card:nth-child(n + 7) {
        animation-delay: 0.28s;
      }

      .skeleton-shimmer {
        background: linear-gradient(
          90deg,
          var(--color-border) 25%,
          var(--color-surface) 50%,
          var(--color-border) 75%
        );
        background-size: 400px 100%;
        animation: shimmer 1.4s infinite linear;
      }

      .search-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--color-primary);
      }

      /* Image zoom on hover */
      .card-img {
        transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      .result-card:hover .card-img {
        transform: scale(1.06);
      }

      /* Fav button */
      .fav-btn {
        transition:
          transform 0.15s ease,
          color 0.15s ease;
      }
      .fav-btn:hover {
        transform: scale(1.2);
      }
      .fav-btn.active {
        color: #ef4444;
      }

      /* Filter chip */
      .chip {
        transition: all 0.18s ease;
      }
      .chip:hover {
        transform: translateY(-1px);
      }

      /* Spinner */
      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid var(--color-border);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 0.75s linear infinite;
      }
    `,
  ],
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-10">
      <!-- ── Sticky header ──────────────────────────────── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md
                  border-b border-[var(--color-border)] px-4 pt-3 pb-0 space-y-3"
      >
        <!-- Row 1: back · search · actions -->
        <div class="flex items-center gap-2">
          <!-- Back -->
          <button
            (click)="goBack()"
            class="flex-shrink-0 w-9 h-9 flex items-center justify-center
                   rounded-full hover:bg-[var(--color-background)] transition-colors"
          >
            <i
              class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"
            ></i>
          </button>

          <!-- Search input -->
          <div class="flex-1 relative">
            <i
              class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2
                      text-[var(--color-primary)] text-base pointer-events-none"
            ></i>
            <input
              [(ngModel)]="query"
              (ngModelChange)="onQueryChange($event)"
              (keyup.enter)="search()"
              #searchInput
              type="text"
              class="search-input w-full pl-9 pr-10 py-2.5 rounded-xl text-sm
                     bg-[var(--color-background)] border border-[var(--color-border)]
                     text-[var(--color-text-primary)]
                     placeholder:text-[var(--color-text-muted)]
                     transition-all duration-200"
              placeholder="Search salons, services..."
            />
            <!-- Clear -->
            <button
              *ngIf="query"
              (click)="clearQuery()"
              class="absolute right-3 top-1/2 -translate-y-1/2
                     text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
                     transition-colors"
            >
              <i class="ri-close-line text-base"></i>
            </button>
          </div>

          <!-- Map view -->
          <button
            (click)="switchToMapView()"
            title="Map view"
            class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full
                   bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20
                   transition-colors"
          >
            <i
              class="ri-map-pin-2-line text-base text-[var(--color-primary)]"
            ></i>
          </button>

          <!-- Search button -->
          <button
            (click)="search()"
            class="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold
                   bg-[var(--color-primary)] text-white
                   hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            Search
          </button>
        </div>

        <!-- Row 2: category chips -->
        <div class="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
          <button
            *ngFor="let cat of categories"
            (click)="toggleCategory(cat)"
            class="chip flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium
                   border transition-colors"
            [class.bg-[var(--color-primary)]]="selectedCategories.includes(cat)"
            [class.text-white]="selectedCategories.includes(cat)"
            [class.border-[var(--color-primary)]]="
              selectedCategories.includes(cat)
            "
            [class.border-[var(--color-border)]]="
              !selectedCategories.includes(cat)
            "
            [class.text-[var(--color-text-secondary)]]="
              !selectedCategories.includes(cat)
            "
            [class.hover:border-[var(--color-primary)]]="
              !selectedCategories.includes(cat)
            "
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- ── Results meta bar ───────────────────────────── -->
      <div
        *ngIf="!loading && searched"
        class="flex items-center justify-between px-4 lg:px-6 py-3"
      >
        <p class="text-sm text-[var(--color-text-secondary)]">
          <span class="font-semibold text-[var(--color-text-primary)]">{{
            results.length
          }}</span>
          {{ results.length === 1 ? "result" : "results" }} for
          <span class="font-semibold text-[var(--color-primary)]"
            >"{{ lastQuery }}"</span
          >
        </p>

        <!-- View toggle -->
        <div
          class="flex items-center gap-1 bg-[var(--color-background)]
                    border border-[var(--color-border)] rounded-lg p-0.5"
        >
          <button
            (click)="viewMode = 'grid'"
            class="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
            [class.bg-[var(--color-surface)]]="viewMode === 'grid'"
            [class.shadow-sm]="viewMode === 'grid'"
          >
            <i
              class="ri-grid-fill text-sm"
              [class.text-[var(--color-primary)]]="viewMode === 'grid'"
              [class.text-[var(--color-text-muted)]]="viewMode !== 'grid'"
            ></i>
          </button>
          <button
            (click)="viewMode = 'list'"
            class="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
            [class.bg-[var(--color-surface)]]="viewMode === 'list'"
            [class.shadow-sm]="viewMode === 'list'"
          >
            <i
              class="ri-list-check text-sm"
              [class.text-[var(--color-primary)]]="viewMode === 'list'"
              [class.text-[var(--color-text-muted)]]="viewMode !== 'list'"
            ></i>
          </button>
        </div>
      </div>

      <!-- ── Loading skeleton ───────────────────────────── -->
      <div
        *ngIf="loading"
        class="px-4 lg:px-6 pt-2"
        [class.grid]="true"
        [class.grid-cols-1]="true"
        [class.md:grid-cols-2]="true"
        [class.xl:grid-cols-3]="true"
        [class.gap-4]="true"
      >
        <div
          *ngFor="let i of [1, 2, 3, 4, 5, 6]"
          class="rounded-2xl overflow-hidden border border-[var(--color-border)]"
        >
          <div class="skeleton-shimmer h-44"></div>
          <div class="p-4 space-y-2">
            <div class="skeleton-shimmer h-4 rounded-full w-3/4"></div>
            <div class="skeleton-shimmer h-3 rounded-full w-1/2"></div>
            <div class="flex gap-2 mt-3">
              <div class="skeleton-shimmer h-6 rounded-full w-16"></div>
              <div class="skeleton-shimmer h-6 rounded-full w-12"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Empty state ────────────────────────────────── -->
      <div
        *ngIf="!loading && searched && results.length === 0"
        class="flex flex-col items-center justify-center px-6 pt-20 pb-10 text-center"
      >
        <div
          class="w-20 h-20 rounded-full bg-[var(--color-primary)]/10
                    flex items-center justify-center mb-5"
        >
          <i class="ri-search-line text-3xl text-[var(--color-primary)]"></i>
        </div>
        <h3 class="text-lg font-bold text-[var(--color-text-primary)] mb-2">
          No Results Found
        </h3>
        <p
          class="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed"
        >
          We couldn't find anything for
          <span class="font-semibold text-[var(--color-text-primary)]"
            >"{{ lastQuery }}"</span
          >. Try different keywords or remove some filters.
        </p>
        <button
          (click)="clearAll()"
          class="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold
                 bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
        >
          Clear search
        </button>
      </div>

      <!-- ── Initial / idle state ───────────────────────── -->
      <div
        *ngIf="!loading && !searched"
        class="flex flex-col items-center justify-center px-6 pt-24 pb-10 text-center"
      >
        <div
          class="w-20 h-20 rounded-full bg-[var(--color-primary)]/10
                    flex items-center justify-center mb-5"
        >
          <i class="ri-search-2-line text-3xl text-[var(--color-primary)]"></i>
        </div>
        <h3
          class="text-base font-semibold text-[var(--color-text-primary)] mb-1"
        >
          Discover beauty services
        </h3>
        <p class="text-sm text-[var(--color-text-secondary)]">
          Search for salons, nail techs, spas &amp; more near you
        </p>
      </div>

      <!-- ── Results — GRID view ────────────────────────── -->
      <div
        *ngIf="!loading && results.length > 0 && viewMode === 'grid'"
        class="px-4 lg:px-6 pb-6
               grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div
          *ngFor="let item of results; let i = index"
          class="result-card bg-[var(--color-surface)] rounded-2xl overflow-hidden
                 border border-[var(--color-border)]
                 hover:border-[var(--color-primary)]/30
                 hover:shadow-lg hover:-translate-y-0.5
                 transition-all duration-300 cursor-pointer group"
          (click)="viewSalon(item.id)"
        >
          <!-- Image -->
          <div
            class="relative h-44 overflow-hidden bg-[var(--color-background)]"
          >
            <img
              [src]="item.coverImage || item.profileImage || fallbackImage"
              [alt]="item.businessName"
              class="card-img w-full h-full object-cover"
              (error)="onImgError($event)"
            />
            <!-- Gradient overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
            ></div>

            <!-- Rating badge — bottom left -->
            <div
              class="absolute bottom-3 left-3 flex items-center gap-1
                        bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5"
            >
              <i class="ri-star-fill text-amber-400 text-xs"></i>
              <span class="text-white text-xs font-semibold">
                {{ item.averageRating || item.rating || 0 | number: "1.1-1" }}
              </span>
              <span class="text-white/70 text-xs">
                ({{ item.totalReviews || 0 }})
              </span>
            </div>

            <!-- Fav button — top right -->
            <button
              class="fav-btn absolute top-3 right-3 w-8 h-8 rounded-full
                     bg-black/30 backdrop-blur-sm flex items-center justify-center
                     text-white hover:bg-black/50 transition-colors"
              [class.active]="favorites.has(item.id)"
              (click)="toggleFavorite($event, item.id)"
            >
              <i
                [class]="
                  favorites.has(item.id)
                    ? 'ri-heart-fill text-sm'
                    : 'ri-heart-line text-sm'
                "
              ></i>
            </button>

            <!-- Open/closed badge -->
            <div
              *ngIf="item.isOpen !== undefined"
              class="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold"
              [class.bg-emerald-500]="item.isOpen"
              [class.bg-red-400]="!item.isOpen"
              [class.text-white]="true"
            >
              {{ item.isOpen ? "Open" : "Closed" }}
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <div class="flex items-start justify-between gap-2">
              <h3
                class="font-semibold text-[var(--color-text-primary)] truncate text-sm leading-tight"
              >
                {{ item.businessName }}
              </h3>
              <span
                *ngIf="item.category || item.categoryName"
                class="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full
                       bg-[var(--color-primary)]/12 text-[var(--color-primary)]"
              >
                {{ item.category || item.categoryName }}
              </span>
            </div>

            <p
              class="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] mt-1.5"
            >
              <i
                class="ri-map-pin-line text-[var(--color-primary)] flex-shrink-0"
              ></i>
              {{ item.city || "Accra"
              }}<span *ngIf="item.region">, {{ item.region }}</span>
            </p>

            <!-- Services preview -->
            <div
              *ngIf="item.services?.length"
              class="flex flex-wrap gap-1 mt-3"
            >
              <span
                *ngFor="let svc of item.services | slice: 0 : 3"
                class="text-xs px-2 py-0.5 rounded-full
                       bg-[var(--color-background)] text-[var(--color-text-secondary)]
                       border border-[var(--color-border)]"
              >
                {{ $any(svc).name || svc }}
              </span>
              <span
                *ngIf="item.services.length > 3"
                class="text-xs px-2 py-0.5 rounded-full
                       bg-[var(--color-background)] text-[var(--color-text-muted)]"
              >
                +{{ item.services.length - 3 }} more
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Results — LIST view ────────────────────────── -->
      <div
        *ngIf="!loading && results.length > 0 && viewMode === 'list'"
        class="px-4 lg:px-6 pb-6 space-y-3"
      >
        <div
          *ngFor="let item of results; let i = index"
          class="result-card flex items-center gap-4
                 bg-[var(--color-surface)] rounded-2xl overflow-hidden
                 border border-[var(--color-border)]
                 hover:border-[var(--color-primary)]/30 hover:shadow-md
                 transition-all duration-300 cursor-pointer group p-3"
          (click)="viewSalon(item.id)"
        >
          <!-- Thumb -->
          <div
            class="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[var(--color-background)]"
          >
            <img
              [src]="item.profileImage || item.coverImage || fallbackImage"
              [alt]="item.businessName"
              class="card-img w-full h-full object-cover"
              (error)="onImgError($event)"
            />
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3
                class="font-semibold text-[var(--color-text-primary)] truncate text-sm"
              >
                {{ item.businessName }}
              </h3>
              <span
                *ngIf="item.isOpen !== undefined"
                class="flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-full"
                [class.bg-emerald-100]="item.isOpen"
                [class.text-emerald-700]="item.isOpen"
                [class.bg-red-100]="!item.isOpen"
                [class.text-red-600]="!item.isOpen"
              >
                {{ item.isOpen ? "Open" : "Closed" }}
              </span>
            </div>

            <p
              class="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] mt-0.5"
            >
              <i class="ri-map-pin-line text-[var(--color-primary)]"></i>
              {{ item.city || "Accra"
              }}<span *ngIf="item.region">, {{ item.region }}</span>
            </p>

            <div class="flex items-center gap-3 mt-1.5">
              <div class="flex items-center gap-1">
                <i class="ri-star-fill text-amber-400 text-xs"></i>
                <span
                  class="text-xs font-semibold text-[var(--color-text-primary)]"
                >
                  {{ item.averageRating || item.rating || 0 | number: "1.1-1" }}
                </span>
                <span class="text-xs text-[var(--color-text-muted)]"
                  >({{ item.totalReviews || 0 }})</span
                >
              </div>
              <span
                *ngIf="item.category || item.categoryName"
                class="text-xs px-1.5 py-0.5 rounded-full
                       bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
              >
                {{ item.category || item.categoryName }}
              </span>
            </div>
          </div>

          <!-- Fav -->
          <button
            class="fav-btn flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                   text-[var(--color-text-muted)] hover:bg-[var(--color-background)] transition-colors"
            [class.active]="favorites.has(item.id)"
            (click)="toggleFavorite($event, item.id)"
          >
            <i
              [class]="
                favorites.has(item.id)
                  ? 'ri-heart-fill text-base'
                  : 'ri-heart-line text-base'
              "
            ></i>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  query = "";
  lastQuery = "";
  results: any[] = [];
  loading = false;
  searched = false;
  viewMode: "grid" | "list" = "grid";
  favorites = new Set<string>();
  selectedCategories: string[] = [];

  fallbackImage =
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80";

  categories = [
    "Hair",
    "Makeup",
    "Nails",
    "Skincare",
    "Waxing",
    "Spa",
    "Braiding",
    "Lashes",
  ];

  private queryChange$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    // Debounce live search as user types
    this.queryChange$
      .pipe(debounceTime(420), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.search());

    // Handle query params on load
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params["q"]) {
          this.query = params["q"];
          this.search();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onQueryChange(val: string) {
    this.query = val;
    if (val.trim()) this.queryChange$.next(val);
  }

  search() {
    if (!this.query.trim()) return;
    this.loading = true;
    this.lastQuery = this.query.trim();
    this.searched = true;

    const params: any = { q: this.lastQuery };
    if (this.selectedCategories.length)
      params.categories = this.selectedCategories.join(",");

    this.http
      .get<any>(`${environment.apiUrl}/beauticians/search`, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.results = res.data?.beauticians || res.data || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  toggleCategory(cat: string) {
    const idx = this.selectedCategories.indexOf(cat);
    if (idx > -1) this.selectedCategories.splice(idx, 1);
    else this.selectedCategories.push(cat);
    if (this.searched) this.search();
  }

  toggleFavorite(event: Event, id: string) {
    event.stopPropagation();
    if (this.favorites.has(id)) this.favorites.delete(id);
    else this.favorites.add(id);
  }

  clearQuery() {
    this.query = "";
    this.results = [];
    this.searched = false;
  }

  clearAll() {
    this.clearQuery();
    this.selectedCategories = [];
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = this.fallbackImage;
  }

  switchToMapView() {
    this.router.navigate(["/client/map"], {
      queryParams: this.query.trim() ? { q: this.query.trim() } : {},
    });
  }

  viewSalon(id: string) {
    this.router.navigate(["/client/salon", id]);
  }

  goBack() {
    this.router.navigate(["/client/home"]);
  }
}
