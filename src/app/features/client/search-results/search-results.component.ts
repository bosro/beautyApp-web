import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-search-results',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <!-- Header with search -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 space-y-3">
        <div class="flex items-center gap-3">
          <button (click)="goBack()" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]">
            <i class="ri-arrow-left-line text-xl text-[var(--color-text-primary)]"></i>
          </button>
          <div class="flex-1 relative">
            <i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"></i>
            <input
              [(ngModel)]="query"
              (keyup.enter)="search()"
              type="text"
              class="form-input pl-9 pr-4"
              placeholder="Search salons, services..."
              autofocus
            />
          </div>
          <button (click)="search()" class="btn-primary px-4 py-2.5 text-sm">Search</button>
        </div>

        <!-- Filter chips -->
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button *ngFor="let cat of categories"
            (click)="toggleCategory(cat)"
            class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
            [ngClass]="selectedCategories.includes(cat)
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'">
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Results count -->
      <div *ngIf="!loading && searched" class="px-4 py-3">
        <p class="text-sm text-[var(--color-text-secondary)]">
          <span class="font-semibold text-[var(--color-text-primary)]">{{ results.length }}</span> results for "{{ lastQuery }}"
        </p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="skeleton h-52 rounded-2xl"></div>
      </div>

      <!-- Empty -->
      <app-empty-state
        *ngIf="!loading && searched && results.length === 0"
        icon="ri-search-line"
        title="No Results Found"
        subtitle="Try different keywords or remove some filters.">
      </app-empty-state>

      <!-- Initial state -->
      <div *ngIf="!loading && !searched" class="p-4 text-center mt-12">
        <i class="ri-search-2-line text-5xl text-[var(--color-text-muted)]"></i>
        <p class="text-[var(--color-text-secondary)] mt-2">Search for salons or beauty services</p>
      </div>

      <!-- Results grid -->
      <div *ngIf="!loading && results.length > 0" class="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let item of results"
          class="card overflow-hidden cursor-pointer group"
          (click)="viewSalon(item.id)">
          <div class="relative h-36">
            <img
              [src]="item.coverImage || item.profileImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80'"
              [alt]="item.businessName"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div class="p-3">
            <h3 class="font-semibold text-[var(--color-text-primary)] truncate">{{ item.businessName }}</h3>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
              <i class="ri-map-pin-line"></i> {{ item.city || 'Accra' }}
            </p>
            <div class="flex items-center justify-between mt-2">
              <span *ngIf="item.category" class="badge badge-info text-xs">{{ item.category }}</span>
              <div class="flex items-center gap-1">
                <i class="ri-star-fill text-amber-400 text-xs"></i>
                <span class="text-xs font-semibold">{{ item.averageRating | number:'1.1-1' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class SearchResultsComponent implements OnInit {
  query = '';
  lastQuery = '';
  results: any[] = [];
  loading = false;
  searched = false;
  selectedCategories: string[] = [];

  categories = ['Hair', 'Makeup', 'Nails', 'Skincare', 'Waxing', 'Spa', 'Braiding', 'Lashes'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.query = params['q'];
        this.search();
      }
    });
  }

  search() {
    if (!this.query.trim()) return;
    this.loading = true;
    this.lastQuery = this.query;
    this.searched = true;
    const params: any = { q: this.query };
    if (this.selectedCategories.length) params.categories = this.selectedCategories.join(',');

    this.http.get<any>(`${environment.apiUrl}/beauticians/search`, { params }).subscribe({
      next: (res) => { this.results = res.data || []; this.loading = false; },
      error: () => this.loading = false
    });
  }

  toggleCategory(cat: string) {
    const idx = this.selectedCategories.indexOf(cat);
    if (idx > -1) this.selectedCategories.splice(idx, 1);
    else this.selectedCategories.push(cat);
    if (this.searched) this.search();
  }

  viewSalon(id: string) { this.router.navigate(['/client/salon', id]); }

  goBack() { this.router.navigate(['/client/home']); }
}
