import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BeauticianProfile } from '../../../core/models';

@Component({
  selector: 'app-discover',
  template: `
    <div class="page-enter px-4 lg:px-6 py-4">
      <!-- Header -->
      <div class="mb-5">
        <h1 class="text-2xl font-bold mb-1" style="color: var(--color-text-primary)">Discover</h1>
        <p class="text-sm" style="color: var(--color-text-secondary)">Find beauty professionals near you</p>
      </div>

      <!-- Search + Filter -->
      <div class="flex gap-2 mb-5">
        <div class="flex-1 relative">
          <i class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
            style="color: var(--color-text-placeholder)"></i>
          <input
            [(ngModel)]="query"
            (ngModelChange)="onSearch()"
            type="text"
            placeholder="Search beauticians or services..."
            class="form-input pl-10"
          />
        </div>
        <button
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors"
          [style.border-color]="showFilters ? 'var(--color-primary)' : 'var(--color-border-light)'"
          [style.background-color]="showFilters ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'var(--color-bg-secondary)'"
          (click)="showFilters = !showFilters"
        >
          <i class="ri-equalizer-2-line text-lg" style="color: var(--color-primary)"></i>
        </button>
      </div>

      <!-- Filters panel -->
      <div *ngIf="showFilters"
        class="mb-5 p-4 rounded-xl border"
        style="background-color: var(--color-bg-secondary); border-color: var(--color-border-light)">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label class="form-label text-xs">Sort by</label>
            <select [(ngModel)]="filters.sortBy" (change)="loadBeauticians()" class="form-input text-sm">
              <option value="">Default</option>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
          <div>
            <label class="form-label text-xs">Min Rating</label>
            <select [(ngModel)]="filters.minRating" (change)="loadBeauticians()" class="form-input text-sm">
              <option value="">Any</option>
              <option value="4">4+</option>
              <option value="3">3+</option>
            </select>
          </div>
          <div>
            <label class="form-label text-xs">City</label>
            <input [(ngModel)]="filters.city" (blur)="loadBeauticians()" type="text"
              placeholder="e.g., Accra" class="form-input text-sm"/>
          </div>
          <div class="flex items-end">
            <button (click)="clearFilters()" class="btn-secondary w-full text-sm py-2.5">
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Sort chips -->
      <div class="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button *ngFor="let chip of sortChips"
          (click)="setSort(chip.value)"
          class="px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
          [style.background-color]="activeSort === chip.value ? 'var(--color-primary)' : 'var(--color-bg-secondary)'"
          [style.color]="activeSort === chip.value ? 'white' : 'var(--color-text-secondary)'"
        >{{ chip.label }}</button>
      </div>

      <!-- Results count -->
      <p class="text-xs mb-4" style="color: var(--color-text-secondary)">
        {{ total }} beautician{{ total !== 1 ? 's' : '' }} found
      </p>

      <!-- Desktop grid / Mobile list -->
      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div class="skeleton h-48 rounded-xl" *ngFor="let _ of [1,2,3,4,5,6]"></div>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          *ngFor="let salon of beauticians"
          (click)="goToSalon(salon.id)"
          class="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          style="background-color: var(--color-bg-secondary)"
        >
          <!-- Cover -->
          <div class="relative h-44">
            <img
              [src]="salon.profileImage || salon.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600'"
              [alt]="salon.businessName"
              class="w-full h-full object-cover"
            />
            <button
              (click)="favorite($event, salon)"
              class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
            >
              <i class="ri-heart-3-line text-base" style="color: var(--color-primary)"></i>
            </button>
            <div class="absolute bottom-0 left-0 right-0 h-20
                        bg-gradient-to-t from-black/60 to-transparent">
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <div class="flex items-start justify-between mb-1">
              <h3 class="font-bold text-sm" style="color: var(--color-text-primary)">
                {{ salon.businessName }}
              </h3>
              <span class="badge badge-success text-xs ml-2 flex-shrink-0">Open</span>
            </div>
            <p class="text-xs flex items-center gap-1 mb-2" style="color: var(--color-text-secondary)">
              <i class="ri-map-pin-2-line"></i>
              {{ salon.city }}, {{ salon.region }}
            </p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1">
                <i class="ri-star-fill text-yellow-400 text-xs"></i>
                <span class="text-xs font-bold" style="color: var(--color-text-primary)">
                  {{ salon.rating?.toFixed(1) || '0.0' }}
                </span>
                <span class="text-xs" style="color: var(--color-text-secondary)">
                  ({{ salon.totalReviews || 0 }})
                </span>
              </div>
              <span class="text-xs" style="color: var(--color-primary)">
                {{ salon.businessCategory }}
              </span>
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

      <!-- Load more -->
      <div *ngIf="!loading && beauticians.length < total" class="mt-6 flex justify-center">
        <button (click)="loadMore()" class="btn-secondary px-8" [disabled]="loadingMore">
          <span class="spinner" *ngIf="loadingMore"></span>
          {{ loadingMore ? 'Loading...' : 'Load more' }}
        </button>
      </div>

      <div class="h-8"></div>
    </div>
  `,
})
export class DiscoverComponent implements OnInit {
  query = '';
  loading = true;
  loadingMore = false;
  showFilters = false;
  activeSort = '';
  beauticians: BeauticianProfile[] = [];
  total = 0;
  page = 1;

  filters = { sortBy: '', minRating: '', city: '' };

  sortChips = [
    { label: 'All', value: '' },
    { label: 'Top Rated', value: 'rating' },
    { label: 'Most Reviews', value: 'reviews' },
  ];

  constructor(private http: HttpClient, public router: Router) {}

  ngOnInit(): void {
    this.loadBeauticians();
  }

  onSearch(): void {
    this.page = 1;
    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this.loadBeauticians(), 400);
  }
  private _debounce: ReturnType<typeof setTimeout> | undefined;

  setSort(val: string): void {
    this.activeSort = val;
    this.filters.sortBy = val;
    this.loadBeauticians();
  }

  clearFilters(): void {
    this.filters = { sortBy: '', minRating: '', city: '' };
    this.activeSort = '';
    this.loadBeauticians();
  }

  loadBeauticians(append = false): void {
    if (!append) {
      this.loading = true;
      this.page = 1;
    } else {
      this.loadingMore = true;
    }

    const params: Record<string, string> = { page: String(this.page), limit: '12' };
    if (this.query) params['query'] = this.query;
    if (this.filters.sortBy) params['sortBy'] = this.filters.sortBy;
    if (this.filters.minRating) params['minRating'] = this.filters.minRating;
    if (this.filters.city) params['city'] = this.filters.city;

    const endpoint = this.query
      ? `${environment.apiUrl}/beauticians/search`
      : `${environment.apiUrl}/beauticians`;

    this.http.get<any>(endpoint, { params }).subscribe({
      next: (res) => {
        const items = res?.data?.beauticians || res?.beauticians || [];
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
    this.router.navigate(['/client/salon', id]);
  }

  favorite(event: Event, salon: BeauticianProfile): void {
    event.stopPropagation();
  }
}
