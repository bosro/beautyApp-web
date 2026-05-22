
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Category } from "../../../core/models";

@Component({
  selector: "app-categories",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-10">

      <!-- ── Sticky Header ── -->
      <div class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md
                  border-b border-[var(--color-border)] px-4 pt-4 pb-3">
        <div class="flex items-center gap-3">
          <button
            (click)="goBack()"
            class="flex-shrink-0 w-9 h-9 flex items-center justify-center
                   rounded-full hover:bg-[var(--color-background)] transition-colors"
          >
            <i class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"></i>
          </button>
          <div>
            <h1 class="text-lg font-bold text-[var(--color-text-primary)] leading-tight">
              Categories
            </h1>
            <p class="text-xs text-[var(--color-text-secondary)]">
              Browse by beauty service
            </p>
          </div>
        </div>
      </div>

      <!-- ── Loading Skeleton ── -->
      <div *ngIf="loading" class="px-4 lg:px-6 pt-5
           grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <div
          *ngFor="let _ of [1,2,3,4,5,6,7,8,9,10]"
          class="rounded-2xl overflow-hidden border border-[var(--color-border)]"
        >
          <div class="skeleton-shimmer h-28"></div>
          <div class="p-3 space-y-1.5">
            <div class="skeleton-shimmer h-3.5 rounded-full w-2/3"></div>
            <div class="skeleton-shimmer h-3 rounded-full w-1/3"></div>
          </div>
        </div>
      </div>

      <!-- ── Categories Grid ── -->
      <div
        *ngIf="!loading"
        class="px-4 lg:px-6 pt-5
               grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3"
      >
        <button
          *ngFor="let cat of categories; let i = index"
          (click)="goToCategory(cat)"
          class="cat-card group relative rounded-2xl overflow-hidden
                 border border-[var(--color-border)] text-left
                 hover:border-[var(--color-primary)]/40
                 hover:shadow-lg hover:-translate-y-0.5
                 active:scale-95 transition-all duration-300 cursor-pointer"
          [style.animation-delay]="(i * 40) + 'ms'"
        >
          <!-- Image / Icon area -->
          <div class="relative h-28 overflow-hidden bg-[var(--color-background)]">
            <img
              *ngIf="cat.image"
              [src]="cat.image"
              [alt]="cat.name"
              class="cat-img w-full h-full object-cover
                     transition-transform duration-400 ease-out
                     group-hover:scale-110"
              (error)="onImgError($event, cat)"
            />
            <!-- Fallback icon -->
            <div
              *ngIf="!cat.image"
              class="w-full h-full flex items-center justify-center"
              [ngStyle]="{ 'background-color': (cat.color || 'var(--color-primary)') + '22' }"
            >
              <i
                [class]="(cat.icon || 'ri-scissors-2-line') + ' text-4xl'"
                [ngStyle]="{ color: cat.color || 'var(--color-primary)' }"
              ></i>
            </div>

            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t
                        from-black/55 via-black/10 to-transparent"></div>

            <!-- Category name pinned bottom-left on the image -->
            <p class="absolute bottom-2 left-3 right-3
                       text-white font-bold text-sm leading-tight truncate drop-shadow">
              {{ cat.name }}
            </p>
          </div>

          <!-- Sub-info strip -->
          <div class="px-3 py-2 flex items-center justify-between
                      bg-[var(--color-surface)]">
            <span class="text-xs text-[var(--color-text-secondary)] truncate">
              {{ cat.beauticianCount != null
                  ? cat.beauticianCount + ' professionals'
                  : 'Explore' }}
            </span>
            <i class="ri-arrow-right-s-line text-[var(--color-primary)] text-base flex-shrink-0"></i>
          </div>
        </button>

        <!-- Empty state -->
        <div
          *ngIf="categories.length === 0"
          class="col-span-full flex flex-col items-center justify-center py-20 text-center"
        >
          <div class="w-16 h-16 rounded-full bg-[var(--color-primary)]/10
                      flex items-center justify-center mb-4">
            <i class="ri-layout-grid-line text-2xl text-[var(--color-primary)]"></i>
          </div>
          <p class="text-base font-semibold text-[var(--color-text-primary)]">
            No categories yet
          </p>
          <p class="text-sm text-[var(--color-text-secondary)] mt-1">
            Check back soon for beauty service categories.
          </p>
        </div>
      </div>

      <div class="h-6"></div>
    </div>
  `,
  styles: [`
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }

    .cat-card {
      animation: fadeSlideIn 0.35s ease both;
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

    .cat-img {
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
  `],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/categories`).subscribe({
      next: (res) => {
        this.categories =
          res?.data?.categories || res?.categories || res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  goToCategory(cat: Category): void {
    // Navigate to search/discover with both slug (for API filtering) and display name
    this.router.navigate(["/client/search"], {
      queryParams: { category: cat.slug || cat.name, name: cat.name },
    });
  }

  onImgError(event: Event, cat: Category): void {
    // If image fails, hide it so the icon fallback shows
    (event.target as HTMLImageElement).style.display = "none";
  }

  goBack(): void {
    this.router.navigate(["/client/home"]);
  }
}