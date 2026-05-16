import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Location } from "@angular/common";

declare const google: any;

@Component({
  selector: "app-map",
  template: `
    <div class="map-page">
      <!-- MAP AREA -->
      <div class="map-area" #mapContainer></div>

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
          #searchInputEl
          type="text"
          placeholder="Search your favourite salon"
          class="search-input-float"
        />
        <button *ngIf="searchQuery" (click)="clearSearch()" class="clear-btn">
          <i class="ri-close-line"></i>
        </button>
        <button (click)="locateMe()" class="locate-btn" title="Use my location">
          <i class="ri-focus-3-line"></i>
        </button>
        <button
          (click)="switchToListView()"
          class="list-view-btn"
          title="List view"
        >
          <i class="ri-list-check"></i>
        </button>
      </div>

      <!-- Salon popup -->
      <div
        class="salon-popup"
        *ngIf="selectedSalon"
        (click)="goToSalon(selectedSalon.id)"
      >
        <div class="popup-img">
          <img
            [src]="
              selectedSalon.profileImage || selectedSalon.coverImage || fallback
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
              {{ (selectedSalon.rating || 0).toFixed(1) }}
            </div>
            <div class="popup-dist" *ngIf="selectedSalon.distance">
              <i class="ri-walk-line"></i>
              {{ selectedSalon.distance.toFixed(1) }} km away
            </div>
            <div class="popup-dist" *ngIf="!selectedSalon.distance">
              <i class="ri-chat-1-line"></i>
              {{ selectedSalon.totalReviews || 0 }} reviews
            </div>
          </div>
        </div>
        <i class="ri-arrow-right-s-line popup-arrow"></i>
      </div>

      <!-- BOTTOM SHEET -->
      <div
        class="bottom-sheet"
        [class.sheet-expanded]="sheetExpanded"
        [style.height]="sheetHeight"
      >
        <div class="sheet-handle-wrap" (click)="toggleSheet()">
          <div class="sheet-handle"></div>
        </div>

        <div class="location-row">
          <i class="ri-map-pin-2-fill" style="color: var(--color-primary)"></i>
          <span class="location-name">{{ currentCity }}</span>
          <span class="location-sub">{{ currentRegion }}</span>
          <button class="locate-me-chip" (click)="locateMe()">
            <i class="ri-crosshair-2-line"></i> Near me
          </button>
        </div>

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

        <!-- Category chips -->
        <div class="chips-row">
          <button
            *ngFor="let cat of categories"
            (click)="toggleCategory(cat)"
            class="chip"
            [class.chip-active]="selectedCategory === cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="results-section" *ngIf="sheetExpanded || salons.length > 0">
          <div *ngIf="loading" class="results-list">
            <div *ngFor="let _ of [1, 2, 3]" class="result-skeleton">
              <div class="skel-img"></div>
              <div class="skel-info">
                <div class="skel-line long"></div>
                <div class="skel-line short"></div>
              </div>
            </div>
          </div>

          <div *ngIf="!loading" class="results-list">
            <div
              *ngFor="let salon of salons"
              class="result-item"
              (click)="selectSalon(salon)"
              [class.result-active]="selectedSalon?.id === salon.id"
            >
              <div class="result-img">
                <img
                  [src]="salon.profileImage || salon.coverImage || fallback"
                  [alt]="salon.businessName"
                />
              </div>
              <div class="result-info">
                <p class="result-name">{{ salon.businessName }}</p>
                <p class="result-address">
                  <i class="ri-map-pin-line"></i> {{ salon.city }},
                  {{ salon.region }}
                </p>
                <div class="result-meta">
                  <span class="result-rating"
                    ><i class="ri-star-fill"></i>
                    {{ (salon.rating || 0).toFixed(1) }}</span
                  >
                  <span class="result-reviews"
                    >· {{ salon.totalReviews || 0 }} reviews</span
                  >
                  <span *ngIf="salon.distance" class="result-dist"
                    >· {{ salon.distance.toFixed(1) }}km</span
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

            <div *ngIf="salons.length === 0 && !loading" class="empty-state">
              <i class="ri-search-line empty-icon"></i>
              <p class="empty-title">No salons found</p>
              <p class="empty-sub">
                Try a different search or expand your area
              </p>
            </div>
          </div>
        </div>

        <div *ngIf="!sheetExpanded" class="confirm-btn-wrap">
          <button class="confirm-btn" (click)="runSearch()">
            {{ searchQuery ? "Search Salons" : "Find Nearby Salons" }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* keep all your existing styles, add these: */
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
      .map-area {
        flex: 1;
        min-height: 0;
      }
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
      .clear-btn,
      .locate-btn,
      .list-view-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #aaa;
        font-size: 18px;
        padding: 0;
        display: flex;
        align-items: center;
      }
      .locate-btn {
        color: var(--color-primary, #2a8a93);
      }
      .list-view-btn {
        color: var(--color-primary, #2a8a93);
        font-size: 20px;
      }
      .locate-me-chip {
        margin-left: auto;
        background: color-mix(in srgb, var(--color-primary) 12%, transparent);
        color: var(--color-primary);
        border: none;
        border-radius: 20px;
        padding: 4px 10px;
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .chips-row {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 10px;
        scrollbar-width: none;
      }
      .chips-row::-webkit-scrollbar {
        display: none;
      }
      .chip {
        flex-shrink: 0;
        padding: 6px 14px;
        border-radius: 20px;
        border: 1.5px solid var(--color-border, #eee);
        background: transparent;
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        color: var(--color-text-secondary, #666);
        transition: all 0.15s;
      }
      .chip-active {
        background: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
      }
      .result-dist {
        font-size: 12px;
        color: var(--color-primary);
        font-weight: 600;
      }
      /* Reuse existing bottom-sheet, salon-popup, result-item styles from your original */
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
        height: 320px;
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
      .location-name {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a1a;
      }
      .location-sub {
        font-size: 13px;
        color: #999;
      }
      .find-input {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f7f7f7;
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 10px;
      }
      .find-input i {
        color: #bbb;
        font-size: 18px;
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
      }
      .results-section {
        flex: 1;
        overflow-y: auto;
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
      .result-item {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 10px;
        border-radius: 14px;
        cursor: pointer;
        border: 1.5px solid transparent;
      }
      .result-item.result-active {
        background: color-mix(in srgb, var(--color-primary) 8%, transparent);
        border-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
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
      .result-reviews {
        font-size: 12px;
        color: #999;
      }
      .result-go {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #f5f5f5;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 20px;
        color: #888;
      }
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
      .salon-popup {
        position: absolute;
        bottom: 340px;
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
      .popup-dist {
        font-size: 12px;
        color: #555;
        display: flex;
        align-items: center;
        gap: 3px;
      }
      .popup-arrow {
        font-size: 22px;
        color: #ccc;
      }
    `,
  ],
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild("mapContainer", { static: true }) mapContainer!: ElementRef;

  searchQuery = "";
  loading = false;
  salons: any[] = [];
  selectedSalon: any = null;
  sheetExpanded = false;
  currentCity = "Accra";
  currentRegion = "Ghana";
  selectedCategory = "";
  userLat = 5.6037; // Accra default
  userLng = -0.187;
  fallback =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=120&h=120&fit=crop";

  categories = [
    "Hair",
    "Makeup",
    "Nails",
    "Skincare",
    "Spa",
    "Braiding",
    "Lashes",
    "Waxing",
  ];

  private map: any = null;
  private markers: any[] = [];
  private infoWindow: any = null;

  get sheetHeight(): string {
    return this.sheetExpanded ? "72vh" : "320px";
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.route.queryParams.subscribe((params) => {
      if (params["q"]) {
        this.searchQuery = params["q"];
        this.sheetExpanded = true;
        this.fetchSalons({ search: this.searchQuery });
      } else if (params["category"]) {
        this.selectedCategory = params["category"];
        this.searchQuery = params["name"] || params["category"];
        this.sheetExpanded = true;
        this.fetchSalons({ category: params["category"] });
      } else {
        this.locateMe();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearMarkers();
  }

  private initMap(): void {
    if (typeof google === "undefined") return;

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: this.userLat, lng: this.userLng },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });

    this.infoWindow = new google.maps.InfoWindow();
  }

  locateMe(): void {
    if (!navigator.geolocation) {
      this.fetchSalons({ lat: this.userLat, lng: this.userLng });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;
        if (this.map) {
          this.map.setCenter({ lat: this.userLat, lng: this.userLng });
          this.map.setZoom(14);
          // Add user location marker
          new google.maps.Marker({
            position: { lat: this.userLat, lng: this.userLng },
            map: this.map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 3,
            },
            title: "You are here",
          });
        }
        // Reverse geocode to get city name
        this.reverseGeocode(this.userLat, this.userLng);
        this.fetchSalons({ lat: this.userLat, lng: this.userLng });
        this.sheetExpanded = true;
      },
      () => {
        this.fetchSalons({ lat: this.userLat, lng: this.userLng });
      },
    );
  }

  private reverseGeocode(lat: number, lng: number): void {
    if (typeof google === "undefined") return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          const components = results[0].address_components;
          const city = components.find((c: any) =>
            c.types.includes("locality"),
          )?.long_name;
          const region = components.find((c: any) =>
            c.types.includes("administrative_area_level_1"),
          )?.long_name;
          if (city) this.currentCity = city;
          if (region) this.currentRegion = region;
        }
      },
    );
  }

  private fetchSalons(
    params: {
      lat?: number;
      lng?: number;
      search?: string;
      category?: string;
    } = {},
  ): void {
    this.loading = true;
    const apiParams: any = { limit: "30" };

    if (params.lat && params.lng) {
      // Use nearby endpoint for geo search
      apiParams.lat = params.lat.toString();
      apiParams.lng = params.lng.toString();
      apiParams.radius = "15";
      if (params.category) apiParams.category = params.category;

      this.http
        .get<any>(`${environment.apiUrl}/beauticians/nearby`, {
          params: apiParams,
        })
        .subscribe({
          next: (res) => {
            this.salons = res?.data?.beauticians || [];
            this.loading = false;
            this.dropMarkers();
            if (this.salons.length > 0) {
              this.selectedSalon = this.salons[0];
              this.sheetExpanded = true;
            }
          },
          error: () => {
            this.loading = false;
          },
        });
    } else {
      // Text search
      if (params.search) apiParams.search = params.search;
      if (params.category) apiParams.category = params.category;

      this.http
        .get<any>(`${environment.apiUrl}/beauticians`, { params: apiParams })
        .subscribe({
          next: (res) => {
            this.salons = res?.data?.beauticians || [];
            this.loading = false;
            this.dropMarkers();
            if (this.salons.length > 0) {
              this.selectedSalon = this.salons[0];
              this.sheetExpanded = true;
            }
          },
          error: () => {
            this.loading = false;
          },
        });
    }
  }

  private dropMarkers(): void {
    if (!this.map || typeof google === "undefined") return;
    this.clearMarkers();

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoords = false;

    this.salons.forEach((salon) => {
      if (!salon.latitude || !salon.longitude) return;
      hasValidCoords = true;

      const position = { lat: salon.latitude, lng: salon.longitude };
      bounds.extend(position);

      // Custom pin using SVG
      const marker = new google.maps.Marker({
        position,
        map: this.map,
        title: salon.businessName,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
              <ellipse cx="20" cy="44" rx="8" ry="4" fill="rgba(0,0,0,0.15)"/>
              <path d="M20 0C11.163 0 4 7.163 4 16c0 10 16 32 16 32S36 26 36 16C36 7.163 28.837 0 20 0z" fill="#E84A4A"/>
              <circle cx="20" cy="16" r="8" fill="white"/>
              <text x="20" y="20" text-anchor="middle" font-size="10" fill="#E84A4A" font-family="sans-serif">✂</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(40, 48),
          anchor: new google.maps.Point(20, 48),
        },
      });

      marker.addListener("click", () => {
        this.selectedSalon = salon;
        this.map.panTo(position);
      });

      this.markers.push(marker);
    });

    if (hasValidCoords && this.salons.length > 1) {
      this.map.fitBounds(bounds, { padding: 60 });
    } else if (hasValidCoords) {
      this.map.setCenter({
        lat: this.salons[0].latitude,
        lng: this.salons[0].longitude,
      });
      this.map.setZoom(15);
    }
  }

  private clearMarkers(): void {
    this.markers.forEach((m) => m.setMap(null));
    this.markers = [];
  }

  runSearch(): void {
    if (this.searchQuery.trim()) {
      this.sheetExpanded = true;
      this.fetchSalons({ search: this.searchQuery });
    }
  }

  toggleCategory(cat: string): void {
    this.selectedCategory = this.selectedCategory === cat ? "" : cat;
    this.fetchSalons({
      lat: this.userLat,
      lng: this.userLng,
      category: this.selectedCategory || undefined,
    });
  }

  clearSearch(): void {
    this.searchQuery = "";
    this.salons = [];
    this.selectedSalon = null;
    this.sheetExpanded = false;
    this.clearMarkers();
  }

  selectSalon(salon: any): void {
    this.selectedSalon = salon;
    if (this.map && salon.latitude && salon.longitude) {
      this.map.panTo({ lat: salon.latitude, lng: salon.longitude });
      this.map.setZoom(15);
    }
  }

  goToSalon(id: string): void {
    this.router.navigate(["/client/salon", id]);
  }

  switchToListView(): void {
    this.router.navigate(["/client/search"], {
      queryParams: this.searchQuery.trim()
        ? { q: this.searchQuery.trim() }
        : {},
    });
  }

  toggleSheet(): void {
    this.sheetExpanded = !this.sheetExpanded;
  }
  goBack(): void {
    this.location.back();
  }
}
