import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-favorites',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4">
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Favourites</h1>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let i of [1,2,3,4]" class="skeleton h-52 rounded-2xl"></div>
      </div>

      <!-- Empty -->
      <app-empty-state
        *ngIf="!loading && favorites.length === 0"
        icon="ri-heart-line"
        title="No Favourites Yet"
        subtitle="Save beauticians you love to find them quickly later.">
      </app-empty-state>

      <!-- Grid -->
      <div *ngIf="!loading && favorites.length > 0" class="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let fav of favorites"
          class="card overflow-hidden cursor-pointer group"
          (click)="viewSalon(fav.beautician.id)">

          <!-- Cover -->
          <div class="relative h-36">
            <img
              [src]="fav.beautician.coverImage || fav.beautician.profileImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80'"
              [alt]="fav.beautician.businessName"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <button
              (click)="$event.stopPropagation(); removeFavorite(fav)"
              class="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
              <i class="ri-heart-fill text-red-500"></i>
            </button>
          </div>

          <!-- Info -->
          <div class="p-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="font-semibold text-[var(--color-text-primary)] truncate">{{ fav.beautician.businessName }}</h3>
                <p class="text-xs text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
                  <i class="ri-map-pin-line"></i> {{ fav.beautician.city || 'Accra' }}
                </p>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-lg">
                <i class="ri-star-fill text-amber-400 text-xs"></i>
                <span class="text-xs font-semibold text-amber-600 dark:text-amber-400">{{ fav.beautician.averageRating | number:'1.1-1' }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <span *ngIf="fav.beautician.category" class="badge badge-info text-xs">{{ fav.beautician.category }}</span>
              <span class="text-xs text-[var(--color-text-muted)]">{{ fav.beautician.reviewCount }} reviews</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/favorites`).subscribe({
      next: (res) => { this.favorites = res.data || []; this.loading = false; },
      error: () => this.loading = false
    });
  }

  viewSalon(id: string) {
    this.router.navigate(['/client/salon', id]);
  }

  removeFavorite(fav: any) {
    this.http.delete(`${environment.apiUrl}/favorites/${fav.beautician.id}`).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.id !== fav.id);
        this.toast.success('Removed from favourites');
      },
      error: () => this.toast.error('Failed to remove')
    });
  }
}
