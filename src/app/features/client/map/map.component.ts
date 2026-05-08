// map.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { BeauticianProfile } from "../../../core/models";
import { Location } from "@angular/common";

@Component({
  selector: "app-map",
  template: `
    <div class="map-page">
      <!-- ===== MAP AREA ===== -->
      <div class="map-area">
        <!-- Map background image (replace with real map integration) -->
        <img
          class="map-img"
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=700&fit=crop"
          alt="map"
        />

        <!-- Back button -->
        <button class="back-btn" (click)="goBack()">
          <i class="ri-arrow-left-s-line"></i>
        </button>

        <!-- Floating search bar -->
       <div class="search-bar-float">
  <i class="ri-search-line"></i>
  <input
    [(ngModel)]="searchQuery"
    (keyup.enter)="runSearch()"
    type="text"
    placeholder="Search your favourite salon"
    class="search-input-float"
  />
  <button *ngIf="searchQuery" (click)="clearSearch()" class="clear-btn">
    <i class="ri-close-line"></i>
  </button>
  <button (click)="switchToListView()" class="list-view-btn" title="List view">
    <i class="ri-list-check"></i>
  </button>
</div>

        <!-- Salon popup (shows when a salon is selected) -->
        <div
          class="salon-popup"
          *ngIf="selectedSalon"
          (click)="goToSalon(selectedSalon.id)"
        >
          <div class="popup-img">
            <img
              [src]="
                selectedSalon.profileImage ||
                selectedSalon.coverImage ||
                'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=150&h=120&fit=crop'
              "
              [alt]="selectedSalon.businessName"
            />
          </div>
          <div class="popup-info">
            <div class="popup-name">{{ selectedSalon.businessName }}</div>
            <div class="popup-address">
              <i class="ri-map-pin-line"></i>
              {{ selectedSalon.city }}, {{ selectedSalon.region }}
            </div>
            <div class="popup-meta">
              <div class="popup-rating">
                <i class="ri-star-fill"></i>
                {{ selectedSalon.rating.toFixed(1) }}
              </div>
              <div class="popup-dist">
                <i class="ri-walk-line"></i>
                {{ selectedSalon.totalReviews || 0 }} reviews
              </div>
            </div>
          </div>
          <i class="ri-arrow-right-s-line popup-arrow"></i>
        </div>
      </div>

      <!-- ===== BOTTOM SHEET ===== -->
      <div
        class="bottom-sheet"
        [class.sheet-expanded]="sheetExpanded"
        [style.height]="sheetHeight"
      >
        <!-- Drag handle -->
        <div class="sheet-handle-wrap" (click)="toggleSheet()">
          <div class="sheet-handle"></div>
        </div>

        <!-- Location row -->
        <div class="location-row">
          <i class="ri-map-pin-2-fill" style="color: var(--color-primary)"></i>
          <span class="location-name">{{ currentCity }}</span>
          <span class="location-sub">{{ currentRegion }}</span>
        </div>

        <!-- Search input in sheet -->
        <div class="find-input">
          <i class="ri-search-line"></i>
          <input
            [(ngModel)]="searchQuery"
            (keyup.enter)="runSearch()"
            type="text"
            placeholder="Find salon"
            class="find-input-text"
          />
        </div>

        <!-- Results list (shown when expanded or results exist) -->
        <div class="results-section" *ngIf="sheetExpanded || salons.length > 0">
          <!-- Loading skeletons -->
          <div *ngIf="loading" class="results-list">
            <div *ngFor="let _ of [1, 2, 3]" class="result-skeleton">
              <div class="skel-img"></div>
              <div class="skel-info">
                <div class="skel-line long"></div>
                <div class="skel-line short"></div>
              </div>
            </div>
          </div>

          <!-- Salon results -->
          <div *ngIf="!loading" class="results-list">
            <div
              *ngFor="let salon of salons"
              class="result-item"
              (click)="selectSalon(salon)"
              [class.result-active]="selectedSalon?.id === salon.id"
            >
              <div class="result-img">
                <img
                  [src]="
                    salon.profileImage ||
                    salon.coverImage ||
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=120&h=120&fit=crop'
                  "
                  [alt]="salon.businessName"
                />
              </div>
              <div class="result-info">
                <p class="result-name">{{ salon.businessName }}</p>
                <p class="result-address">
                  <i class="ri-map-pin-line"></i>
                  {{ salon.city }}, {{ salon.region }}
                </p>
                <div class="result-meta">
                  <span class="result-rating">
                    <i class="ri-star-fill"></i>
                    {{ salon.rating.toFixed(1) }}
                  </span>
                  <span class="result-reviews"
                    >· {{ salon.totalReviews || 0 }} reviews</span
                  >
                </div>
              </div>
              <button
                class="result-go"
                (click)="goToSalon(salon.id); $event.stopPropagation()"
              >
                <i class="ri-arrow-right-s-line"></i>
              </button>
            </div>

            <!-- Empty state -->
            <div *ngIf="salons.length === 0 && !loading" class="empty-state">
              <i class="ri-search-line empty-icon"></i>
              <p class="empty-title">No salons found</p>
              <p class="empty-sub">Try a different search term or location</p>
            </div>
          </div>
        </div>

        <!-- Confirm location button (shown when not expanded) -->
        <div *ngIf="!sheetExpanded" class="confirm-btn-wrap">
          <button class="confirm-btn" (click)="runSearch()">
            {{ searchQuery ? "Search Salons" : "Confirm Location" }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .map-page {
        display: flex;
        flex-direction: column;
        height: 100vh;
        position: relative;
        overflow: hidden;
      }

      /* ---- MAP ---- */
      .map-area {
        flex: 1;
        position: relative;
        overflow: hidden;
        min-height: 0;
      }
      .map-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* ---- BACK BUTTON ---- */
      .back-btn {
        position: absolute;
        top: 56px;
        left: 16px;
        width: 40px;
        height: 40px;
        background: #fff;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        z-index: 10;
        color: var(--color-text-primary, #1a1a1a);
      }
      .back-btn:active {
        transform: scale(0.92);
      }

      /* ---- FLOATING SEARCH BAR ---- */
      .search-bar-float {
        position: absolute;
        top: 56px;
        left: 64px;
        right: 16px;
        background: #fff;
        border-radius: 30px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
        z-index: 10;
      }
      .search-bar-float i {
        color: #aaa;
        font-size: 18px;
        flex-shrink: 0;
      }
      .search-input-float {
        flex: 1;
        border: none;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        color: var(--color-text-primary, #1a1a1a);
        background: transparent;
      }
      .search-input-float::placeholder {
        color: #bbb;
      }
      .clear-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #aaa;
        font-size: 18px;
        padding: 0;
        display: flex;
        align-items: center;
      }

      .list-view-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primary, #2a8a93);
  font-size: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

      /* ---- SALON POPUP ---- */
      .salon-popup {
        position: absolute;
        bottom: 16px;
        left: 16px;
        right: 16px;
        background: #fff;
        border-radius: 16px;
        padding: 14px;
        display: flex;
        gap: 12px;
        align-items: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
        z-index: 10;
        cursor: pointer;
        animation: slideUp 0.25s ease;
      }
      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .popup-img {
        width: 68px;
        height: 58px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .popup-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .popup-info {
        flex: 1;
        min-width: 0;
      }
      .popup-name {
        font-size: 15px;
        font-weight: 700;
        color: #1a1a1a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .popup-address {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #777;
        margin-top: 3px;
      }
      .popup-address i {
        font-size: 12px;
        color: #aaa;
      }
      .popup-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 6px;
      }
      .popup-rating {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 13px;
        font-weight: 600;
        color: #f5a623;
      }
      .popup-rating i {
        font-size: 14px;
      }
      .popup-dist {
        font-size: 12px;
        color: #555;
        display: flex;
        align-items: center;
        gap: 3px;
      }
      .popup-dist i {
        font-size: 14px;
      }
      .popup-arrow {
        font-size: 22px;
        color: #ccc;
        flex-shrink: 0;
      }

      /* ---- BOTTOM SHEET ---- */
      .bottom-sheet {
        background: #fff;
        border-radius: 24px 24px 0 0;
        box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        transition: height 0.35s cubic-bezier(0.32, 0.72, 0, 1);
        overflow: hidden;
        flex-shrink: 0;
        padding: 0 20px 16px;
        height: 280px;
      }
      .bottom-sheet.sheet-expanded {
        height: 72vh;
      }

      .sheet-handle-wrap {
        display: flex;
        justify-content: center;
        padding: 12px 0 8px;
        cursor: pointer;
      }
      .sheet-handle {
        width: 40px;
        height: 4px;
        background: #ddd;
        border-radius: 2px;
      }

      .location-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
      }
      .location-row i {
        font-size: 20px;
      }
      .location-name {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a1a;
      }
      .location-sub {
        font-size: 13px;
        color: #999;
        margin-left: 2px;
      }

      .find-input {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f7f7f7;
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 14px;
      }
      .find-input i {
        color: #bbb;
        font-size: 18px;
        flex-shrink: 0;
      }
      .find-input-text {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: 14px;
        font-family: inherit;
        color: #1a1a1a;
      }
      .find-input-text::placeholder {
        color: #bbb;
      }

      /* Confirm button */
      .confirm-btn-wrap {
        margin-top: auto;
      }
      .confirm-btn {
        width: 100%;
        background: var(--color-primary, #2a8a93);
        color: #fff;
        border: none;
        padding: 16px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 14px;
        cursor: pointer;
        font-family: inherit;
        transition: opacity 0.2s;
      }
      .confirm-btn:active {
        opacity: 0.85;
      }

      /* Results */
      .results-section {
        flex: 1;
        overflow-y: auto;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .results-section::-webkit-scrollbar {
        display: none;
      }

      .results-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 8px;
      }

      /* Skeleton loaders */
      .result-skeleton {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .skel-img {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.2s infinite;
        flex-shrink: 0;
      }
      .skel-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .skel-line {
        height: 12px;
        border-radius: 6px;
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.2s infinite;
      }
      .skel-line.long {
        width: 70%;
      }
      .skel-line.short {
        width: 45%;
      }
      @keyframes shimmer {
        to {
          background-position: -200% 0;
        }
      }

      /* Result item */
      .result-item {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 10px;
        border-radius: 14px;
        cursor: pointer;
        transition: background 0.15s;
        border: 1.5px solid transparent;
      }
      .result-item:active {
        background: #f7f7f7;
      }
      .result-item.result-active {
        background: color-mix(
          in srgb,
          var(--color-primary, #2a8a93) 8%,
          transparent
        );
        border-color: color-mix(
          in srgb,
          var(--color-primary, #2a8a93) 25%,
          transparent
        );
      }
      .result-img {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .result-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .result-info {
        flex: 1;
        min-width: 0;
      }
      .result-name {
        font-size: 14px;
        font-weight: 700;
        color: #1a1a1a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .result-address {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        color: #888;
        margin-top: 3px;
      }
      .result-address i {
        font-size: 12px;
      }
      .result-meta {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
      }
      .result-rating {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 12px;
        font-weight: 600;
        color: #f5a623;
      }
      .result-rating i {
        font-size: 13px;
      }
      .result-reviews {
        font-size: 12px;
        color: #999;
      }
      .result-go {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-bg-secondary, #f5f5f5);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        font-size: 20px;
        color: var(--color-text-secondary, #888);
      }

      /* Empty state */
      .empty-state {
        text-align: center;
        padding: 40px 20px;
      }
      .empty-icon {
        font-size: 40px;
        color: #ddd;
        display: block;
        margin-bottom: 12px;
      }
      .empty-title {
        font-size: 16px;
        font-weight: 600;
        color: #555;
        margin-bottom: 4px;
      }
      .empty-sub {
        font-size: 13px;
        color: #aaa;
      }
    `,
  ],
})
export class MapComponent implements OnInit {
  searchQuery = "";
  loading = false;
  salons: BeauticianProfile[] = [];
  selectedSalon: BeauticianProfile | null = null;
  sheetExpanded = false;
  currentCity = "Accra";
  currentRegion = "Ghana";

  get sheetHeight(): string {
    return this.sheetExpanded ? "72vh" : "280px";
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["q"]) {
        this.searchQuery = params["q"];
        this.sheetExpanded = true;
        this.fetchSalons(this.searchQuery);
      } else if (params["category"]) {
        this.searchQuery = params["name"] || params["category"];
        this.sheetExpanded = true;
        this.fetchSalons("", params["category"]);
      } else {
        this.fetchSalons();
      }
    });
  }

  private fetchSalons(query = "", category = ""): void {
    this.loading = true;
    const base = environment.apiUrl;
    const params: any = { limit: "20" };
    if (query) params["search"] = query;
    if (category) params["category"] = category;

    this.http.get<any>(`${base}/beauticians`, { params }).subscribe({
      next: (res) => {
        this.salons = res?.data?.beauticians || res?.beauticians || [];
        if (this.salons.length > 0) {
          this.selectedSalon = this.salons[0];
        }
        this.loading = false;
        if (this.salons.length > 0) this.sheetExpanded = true;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  runSearch(): void {
    if (this.searchQuery.trim()) {
      this.sheetExpanded = true;
      this.fetchSalons(this.searchQuery);
    }
  }

  clearSearch(): void {
    this.searchQuery = "";
    this.salons = [];
    this.selectedSalon = null;
    this.sheetExpanded = false;
  }

  selectSalon(salon: BeauticianProfile): void {
    this.selectedSalon = salon;
  }

  goToSalon(id: string): void {
    this.router.navigate(["/client/salon", id]);
  }

  switchToListView(): void {
  this.router.navigate(["/client/search"], {
    queryParams: this.searchQuery.trim() ? { q: this.searchQuery.trim() } : {}
  });
}

  toggleSheet(): void {
    this.sheetExpanded = !this.sheetExpanded;
  }

  goBack(): void {
    this.location.back();
  }
}
