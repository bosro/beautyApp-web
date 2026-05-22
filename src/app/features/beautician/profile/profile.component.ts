// ============================================================
// beautician-profile.component.ts
//
// Changes vs previous version:
//  1. Interactive Google Maps picker inside the Location section
//     — click map or drag the pin to set exact coordinates
//  2. Profile image (or initials) shown on the map pin marker
//  3. GPS "Use my location" now also reverse-geocodes and shows
//     the resolved address name (e.g. "Osu, Accra")
//  4. locationName field shows the human-readable place name
//     whenever coordinates are set (GPS or map drag)
//  5. Warning banner shown when beautician has no location set
//     (especially useful for new signups)
//  6. saveAll() unchanged — still PUTs lat/lng to the API
// ============================================================

import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { AuthService } from "@core/services/auth.service";
import { ToastService } from "@core/services/toast.service";

declare const google: any;

@Component({
  selector: "app-beautician-profile",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-28 lg:pb-10">

      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
        style="background-color: var(--color-surface); border-color: var(--color-border)"
      >
        <button
          (click)="back()"
          class="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style="background-color: var(--color-background)"
        >
          <i class="ri-arrow-left-s-line text-lg text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="flex-1 text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          My Profile
        </h1>
      </div>

      <!-- ── Skeleton ── -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-44 rounded-3xl"></div>
        <div class="skeleton h-20 rounded-2xl"></div>
        <div class="skeleton h-52 rounded-2xl"></div>
        <div class="skeleton h-64 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">

        <!-- ── Hero Card ── -->
        <div class="rounded-3xl overflow-hidden" style="background-color: var(--color-surface)">
          <!-- Banner -->
          <div
            class="h-24 relative"
            style="background: linear-gradient(135deg, var(--color-primary) 0%, #C84428 100%)"
          >
            <div class="absolute -bottom-11 left-1/2 -translate-x-1/2">
              <div class="relative">
                <img
                  *ngIf="previewUrl || beautician?.profileImage"
                  [src]="previewUrl || beautician?.profileImage"
                  alt="Profile"
                  class="w-[88px] h-[88px] rounded-2xl object-cover border-4 shadow-xl"
                  style="border-color: var(--color-surface)"
                />
                <div
                  *ngIf="!previewUrl && !beautician?.profileImage"
                  class="w-[88px] h-[88px] rounded-2xl border-4 shadow-xl flex items-center justify-center"
                  style="background: var(--color-primary); border-color: var(--color-surface)"
                >
                  <span class="text-3xl font-black text-white">
                    {{ (beautician?.businessName || user?.name || 'B').charAt(0).toUpperCase() }}
                  </span>
                </div>
                <label
                  class="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer shadow-md hover:opacity-90 transition-opacity"
                  style="background: var(--color-primary)"
                >
                  <i class="ri-camera-line text-white text-sm"></i>
                  <input type="file" accept="image/*" class="hidden" (change)="onFile($event)" />
                </label>
              </div>
            </div>
          </div>

          <!-- Name / email / rating -->
          <div class="pt-16 pb-5 px-5 text-center">
            <h2 class="font-black text-xl text-[var(--color-text-primary)]">
              {{ beautician?.businessName || user?.name }}
            </h2>
            <p class="text-sm text-[var(--color-text-muted)] mt-0.5">{{ user?.email }}</p>
            <div class="flex items-center justify-center gap-1.5 mt-2">
              <i class="ri-star-fill text-amber-400 text-sm"></i>
              <span class="text-sm font-bold text-[var(--color-text-primary)]">
                {{ beautician?.rating || 0 | number: '1.1-1' }}
              </span>
              <span class="text-xs text-[var(--color-text-muted)]">
                ({{ beautician?.totalReviews || 0 }} reviews)
              </span>
            </div>
            <button
              *ngIf="selectedFile"
              (click)="uploadPhoto()"
              [disabled]="uploading"
              class="btn-primary text-sm px-6 py-2.5 rounded-xl mt-4 mx-auto flex items-center justify-center gap-2"
            >
              <i *ngIf="uploading" class="ri-loader-4-line animate-spin text-sm"></i>
              {{ uploading ? 'Uploading…' : 'Save Photo' }}
            </button>
          </div>
        </div>

        <!-- ── Stats ── -->
        <div class="rounded-2xl flex items-center" style="background-color: var(--color-surface)">
          <div class="flex-1 text-center py-4">
            <p class="text-2xl font-black" style="color: var(--color-primary)">
              {{ beautician?.totalBookings || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">Bookings</p>
          </div>
          <div class="w-px h-10" style="background-color: var(--color-border)"></div>
          <div class="flex-1 text-center py-4">
            <p class="text-2xl font-black" style="color: var(--color-primary)">
              {{ beautician?.completedBookings || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">Completed</p>
          </div>
          <div class="w-px h-10" style="background-color: var(--color-border)"></div>
          <div class="flex-1 text-center py-4">
            <p class="text-2xl font-black" style="color: var(--color-primary)">
              {{ beautician?.rating || 0 | number: '1.1-1' }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">Rating</p>
          </div>
        </div>

        <!-- ── Personal Info ── -->
        <div class="rounded-2xl p-5 space-y-4" style="background-color: var(--color-surface)">
          <p class="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
            Personal Information
          </p>

          <div>
            <label class="field-label">Full Name</label>
            <input [(ngModel)]="nameInput" type="text" class="form-input rounded-xl" placeholder="Your full name" />
          </div>

          <div>
            <label class="field-label">Phone</label>
            <input [(ngModel)]="phone" type="tel" class="form-input rounded-xl" placeholder="e.g. 024 000 0000" />
          </div>

          <div>
            <label class="field-label">Email</label>
            <input
              [value]="user?.email"
              type="email"
              class="form-input rounded-xl opacity-50 cursor-not-allowed"
              style="background-color: var(--color-background)"
              readonly
            />
          </div>
        </div>

        <!-- ── Location ── -->
        <div class="rounded-2xl p-5 space-y-4" style="background-color: var(--color-surface)">

          <!-- Section header -->
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
              Location
            </p>
            <!-- GPS button -->
            <button
              (click)="detectLocation()"
              [disabled]="detectingLocation"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary)"
            >
              <i
                class="text-sm"
                [class]="detectingLocation ? 'ri-loader-4-line animate-spin' : 'ri-map-pin-2-line'"
              ></i>
              {{ detectingLocation ? 'Detecting…' : 'Use my location' }}
            </button>
          </div>

          <!-- ── NEW SIGNUP NOTICE: shown when no location set ── -->
          <div
            *ngIf="!hasLocation"
            class="flex items-start gap-3 px-4 py-3 rounded-xl"
            style="background: color-mix(in srgb, #F59E0B 10%, transparent); border: 1px dashed #F59E0B"
          >
            <i class="ri-map-pin-2-line text-amber-500 text-base flex-shrink-0 mt-0.5"></i>
            <div>
              <p class="text-xs font-semibold text-amber-700">Location not set</p>
              <p class="text-xs text-amber-600 mt-0.5">
                Set your location so clients can find you on the map. Tap "Use my location", drag the pin, or tap anywhere on the map below.
              </p>
            </div>
          </div>

          <!-- ── Location name pill (shown once coords are set) ── -->
          <div
            *ngIf="hasLocation && locationName"
            class="flex items-center gap-2 px-3 py-2 rounded-xl"
            style="background: color-mix(in srgb, var(--color-primary) 8%, transparent)"
          >
            <i class="ri-map-pin-check-line text-sm flex-shrink-0" style="color: var(--color-primary)"></i>
            <span class="text-xs font-semibold flex-1" style="color: var(--color-primary)">
              {{ locationName }}
            </span>
            <div
              class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
            ></div>
          </div>

          <!-- ── Interactive Google Map Picker ── -->
          <div class="rounded-2xl overflow-hidden relative" style="height: 220px;">

            <!-- Map canvas -->
            <div
              #mapEl
              class="w-full h-full"
              style="background: #e8ede8"
            ></div>

            <!-- Shown while Maps JS hasn't loaded yet -->
            <div
              *ngIf="!mapReady"
              class="absolute inset-0 flex items-center justify-center gap-2"
              style="background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))"
            >
              <i class="ri-loader-4-line animate-spin text-xl" style="color: var(--color-primary)"></i>
              <span class="text-sm" style="color: var(--color-text-muted)">Loading map…</span>
            </div>

            <!-- Hint overlay at the bottom of the map -->
            <div
              *ngIf="mapReady"
              class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white pointer-events-none"
              style="background: rgba(0,0,0,0.5)"
            >
              {{ hasLocation ? 'Drag pin to adjust exact position' : 'Tap map or drag pin to set location' }}
            </div>
          </div>

          <!-- ── GPS Coordinates display ── -->
          <div
            *ngIf="latitude !== null && longitude !== null"
            class="flex items-center gap-3 px-4 py-3 rounded-xl"
            style="background-color: color-mix(in srgb, var(--color-primary) 8%, transparent)"
          >
            <i class="ri-map-pin-2-fill text-sm flex-shrink-0" style="color: var(--color-primary)"></i>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold" style="color: var(--color-primary)">GPS Coordinates</p>
              <p class="text-xs mt-0.5 font-mono" style="color: var(--color-text-secondary)">
                {{ latitude | number: '1.4-6' }}, {{ longitude | number: '1.4-6' }}
              </p>
            </div>
            <button
              (click)="clearCoordinates()"
              class="w-6 h-6 flex items-center justify-center rounded-lg"
              style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)"
            >
              <i class="ri-close-line text-xs" style="color: var(--color-primary)"></i>
            </button>
          </div>

          <!-- No coordinates placeholder (when map not ready or coords cleared) -->
          <div
            *ngIf="latitude === null || longitude === null"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed"
            style="border-color: var(--color-border)"
          >
            <i class="ri-map-pin-line text-sm flex-shrink-0" style="color: var(--color-text-muted)"></i>
            <p class="text-xs" style="color: var(--color-text-muted)">
              Tap "Use my location" or tap/drag on the map to set GPS coordinates.
            </p>
          </div>

          <!-- City / Region -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">City</label>
              <input [(ngModel)]="city" type="text" class="form-input rounded-xl" placeholder="e.g. Accra" />
            </div>
            <div>
              <label class="field-label">Region</label>
              <input [(ngModel)]="region" type="text" class="form-input rounded-xl" placeholder="e.g. Greater Accra" />
            </div>
          </div>

          <div>
            <label class="field-label">Business Address</label>
            <input
              [(ngModel)]="businessAddress"
              type="text"
              class="form-input rounded-xl"
              placeholder="e.g. 12 Oxford Street, Osu"
            />
          </div>
        </div>

        <!-- ── Save button ── -->
        <button
          (click)="saveAll()"
          [disabled]="saving"
          class="btn-primary w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold"
        >
          <i *ngIf="saving" class="ri-loader-4-line animate-spin"></i>
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>

      </div>
    </div>
  `,
  styles: [`
    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
  `],
})
export class BeauticianProfileComponent implements OnInit, OnDestroy {

  // ── ViewChild for the map canvas ──
  @ViewChild('mapEl', { static: false }) mapElRef!: ElementRef<HTMLDivElement>;

  user: any = null;
  beautician: any = null;
  loading = true;
  saving = false;
  uploading = false;
  detectingLocation = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Personal fields
  nameInput = "";
  phone = "";

  // Location fields
  city = "";
  region = "";
  businessAddress = "";
  latitude: number | null = null;
  longitude: number | null = null;

  // ── New fields ──
  hasLocation = false;          // drives the "no location" notice banner
  locationName = "";            // human-readable name resolved from coordinates
  mapReady = false;             // shows loading overlay until Maps JS initialises

  // Internal map references
  private map: any = null;
  private marker: any = null;  // AdvancedMarkerElement for the beautician's pin

  constructor(
    private location: Location,
    public router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private toast: ToastService,
    private ngZone: NgZone,
  ) {}

  // ─────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────

  ngOnInit() {
    this.auth.user$.subscribe((u) => {
      if (u) {
        this.user = u;
        this.nameInput = u.name || "";
        this.phone = u.phone ?? "";
      }
    });

    this.http.get<any>(`${environment.apiUrl}/users/beautician/profile`).subscribe({
      next: (res) => {
        const b = res.data?.beautician;
        this.beautician = b;
        if (b) {
          this.city            = b.city            || "";
          this.region          = b.region          || "";
          this.businessAddress = b.businessAddress || "";
          this.latitude        = b.latitude  ?? null;
          this.longitude       = b.longitude ?? null;
          this.hasLocation     = this.latitude !== null && this.longitude !== null;
          if (this.hasLocation) {
            // Build initial locationName from existing address fields
            this.locationName = this.buildLocationName(this.latitude!, this.longitude!);
          }
        }
        this.loading = false;

        // Wait one tick so *ngIf="!loading" has rendered the map container
        setTimeout(() => this.initMap(), 0);
      },
      error: () => {
        this.loading = false;
        setTimeout(() => this.initMap(), 0);
      },
    });
  }

  ngOnDestroy() {
    // Clean up marker to avoid memory leaks
    if (this.marker) {
      this.marker.map = null;
    }
  }

  // ─────────────────────────────────────────────
  // Map initialisation
  // ─────────────────────────────────────────────

  private initMap(): void {
    if (typeof google === 'undefined' || !this.mapElRef?.nativeElement) return;

    const defaultCenter = { lat: 5.6037, lng: -0.1870 }; // Accra fallback
    const center = (this.latitude !== null && this.longitude !== null)
      ? { lat: this.latitude, lng: this.longitude }
      : defaultCenter;

    // Build the map
    this.map = new google.maps.Map(this.mapElRef.nativeElement, {
      center,
      zoom: this.hasLocation ? 15 : 13,
      disableDefaultUI: true,
      zoomControl: true,
      mapId: environment['googleMapsMapId'] || 'DEMO_MAP_ID',
      styles: [
        { featureType: 'poi',     elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit',                        stylers: [{ visibility: 'off' }] },
      ],
    });

    this.mapReady = true;

    // Drop the pin if we already have coordinates
    if (this.hasLocation) {
      this.placeMarker({ lat: this.latitude!, lng: this.longitude! });
    }

    // Clicking anywhere on the map moves the pin
    this.map.addListener('click', (e: any) => {
      this.ngZone.run(() => {
        this.onMapClick(e.latLng.lat(), e.latLng.lng());
      });
    });
  }

  // ─────────────────────────────────────────────
  // Pin / marker helpers
  // ─────────────────────────────────────────────

  /**
   * Creates (or moves) the custom AdvancedMarkerElement.
   * The pin shows the beautician's profile image if available,
   * or falls back to their business name initial.
   */
  private placeMarker(position: { lat: number; lng: number }): void {
    if (!this.map || typeof google === 'undefined') return;

    const AdvancedMarkerElement = google.maps.marker?.AdvancedMarkerElement;
    if (!AdvancedMarkerElement) {
      console.warn('AdvancedMarkerElement not available — ensure Maps JS loaded with the marker library.');
      return;
    }

    // Build the custom pin element
    const initial = (this.beautician?.businessName || this.user?.name || 'B')
      .charAt(0).toUpperCase();
    const imageUrl = this.previewUrl || this.beautician?.profileImage || null;

    const pinEl = document.createElement('div');
    pinEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:grab';
    pinEl.innerHTML = `
      <div style="
        width: 44px; height: 44px; border-radius: 50%;
        border: 3px solid #E84A4A; overflow: hidden;
        background: #E84A4A;
        box-shadow: 0 2px 10px rgba(0,0,0,0.25);
      ">
        ${imageUrl
          ? `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover" alt="Profile" />`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;
               justify-content:center;color:#fff;font-size:18px;font-weight:700">
               ${initial}
             </div>`
        }
      </div>
      <div style="width:2px;height:10px;background:#E84A4A;"></div>
      <div style="width:6px;height:6px;border-radius:50%;background:#E84A4A;opacity:0.4;"></div>
    `;

    // If marker already exists, just move it
    if (this.marker) {
      this.marker.position = position;
      // Re-attach the updated content (image may have changed after photo upload)
      this.marker.content = pinEl;
      return;
    }

    this.marker = new AdvancedMarkerElement({
      map: this.map,
      position,
      content: pinEl,
      title: this.beautician?.businessName || 'Your location',
      gmpDraggable: true,   // ← allows the pin to be dragged
    });

    // Dragging the pin updates coordinates in real time
    this.marker.addListener('dragend', (e: any) => {
      this.ngZone.run(() => {
        const p = this.marker.position;
        this.onMapClick(p.lat, p.lng);
      });
    });
  }

  // ─────────────────────────────────────────────
  // Map interaction
  // ─────────────────────────────────────────────

  private onMapClick(lat: number, lng: number): void {
    this.latitude   = lat;
    this.longitude  = lng;
    this.hasLocation = true;
    this.placeMarker({ lat, lng });
    this.map.panTo({ lat, lng });
    this.reverseGeocode(lat, lng);
  }

  // ─────────────────────────────────────────────
  // GPS detection
  // ─────────────────────────────────────────────

  detectLocation() {
    if (!navigator.geolocation) {
      this.toast.error('Geolocation is not supported by your browser');
      return;
    }
    this.detectingLocation = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.ngZone.run(() => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          this.latitude   = lat;
          this.longitude  = lng;
          this.hasLocation = true;
          this.detectingLocation = false;

          // Move map to the detected position
          if (this.map) {
            this.map.setCenter({ lat, lng });
            this.map.setZoom(16);
          }
          this.placeMarker({ lat, lng });

          // Resolve a human-readable name from coordinates
          this.reverseGeocode(lat, lng);
          this.toast.success('Location detected successfully');
        });
      },
      (err) => {
        this.ngZone.run(() => {
          this.detectingLocation = false;
          const messages: Record<number, string> = {
            1: 'Location permission denied. Please allow location access in your browser settings.',
            2: 'Location unavailable. Please try again.',
            3: 'Location request timed out. Please try again.',
          };
          this.toast.error(messages[err.code] || 'Could not detect location');
        });
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  // ─────────────────────────────────────────────
  // Reverse geocoding — resolves lat/lng → place name
  // ─────────────────────────────────────────────

  private reverseGeocode(lat: number, lng: number): void {
    if (typeof google === 'undefined') {
      // Fallback: build name from existing city/region fields
      this.locationName = this.buildLocationName(lat, lng);
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any[], status: string) => {
        this.ngZone.run(() => {
          if (status === 'OK' && results?.[0]) {
            const comps = results[0].address_components;
            const neighbourhood = comps.find((c: any) =>
              c.types.includes('neighborhood') || c.types.includes('sublocality_level_1')
            )?.long_name;
            const city = comps.find((c: any) =>
              c.types.includes('locality')
            )?.long_name;
            const region = comps.find((c: any) =>
              c.types.includes('administrative_area_level_1')
            )?.long_name;

            // Auto-populate the city/region inputs if still empty
            if (city   && !this.city)   this.city   = city;
            if (region && !this.region) this.region = region;

            // Build a nice human-readable label
            const parts = [neighbourhood, city, region].filter(Boolean);
            this.locationName = parts.length ? parts.join(', ') : (city || 'Location set');
          } else {
            this.locationName = this.buildLocationName(lat, lng);
          }
        });
      },
    );
  }

  /** Fallback location name from existing fields or raw coordinates */
  private buildLocationName(lat: number, lng: number): string {
    const parts = [this.businessAddress, this.city, this.region].filter(Boolean);
    return parts.length
      ? parts.join(', ')
      : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  // ─────────────────────────────────────────────
  // Clear coordinates
  // ─────────────────────────────────────────────

  clearCoordinates() {
    this.latitude    = null;
    this.longitude   = null;
    this.hasLocation = false;
    this.locationName = "";

    // Remove the marker from the map
    if (this.marker) {
      this.marker.map = null;
      this.marker = null;
    }
  }

  // ─────────────────────────────────────────────
  // Photo upload
  // ─────────────────────────────────────────────

  back() {
    this.location.back();
  }

  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const r = new FileReader();
    r.onload = (e) => {
      this.previewUrl = e.target?.result as string;
      // Refresh the map marker to show the new photo immediately
      if (this.marker && this.latitude !== null && this.longitude !== null) {
        this.placeMarker({ lat: this.latitude, lng: this.longitude });
      }
    };
    r.readAsDataURL(file);
  }

  uploadPhoto() {
    if (!this.selectedFile) return;
    this.uploading = true;
    const fd = new FormData();
    fd.append('profileImage', this.selectedFile);
    this.http.post<any>(`${environment.apiUrl}/users/beautician/images`, fd).subscribe({
      next: (res) => {
        if (res.data?.beautician?.profileImage && this.beautician) {
          this.beautician.profileImage = res.data.beautician.profileImage;
        }
        this.uploading = false;
        this.selectedFile = null;
        this.previewUrl = null;
        // Refresh marker with the newly uploaded image
        if (this.latitude !== null && this.longitude !== null) {
          this.placeMarker({ lat: this.latitude, lng: this.longitude });
        }
        this.toast.success('Photo updated!');
      },
      error: () => {
        this.uploading = false;
        this.toast.error('Upload failed');
      },
    });
  }

  // ─────────────────────────────────────────────
  // Save (personal + location in parallel)
  // ─────────────────────────────────────────────

  saveAll() {
    this.saving = true;

    const personalReq = this.http.put<any>(`${environment.apiUrl}/users/profile`, {
      name:  this.nameInput,
      phone: this.phone,
    });

    const locationReq = this.http.put<any>(`${environment.apiUrl}/users/beautician/profile`, {
      city:            this.city,
      region:          this.region,
      businessAddress: this.businessAddress,
      ...(this.latitude !== null && this.longitude !== null
        ? { latitude: this.latitude, longitude: this.longitude }
        : {}),
    });

    let done = 0;
    let hasError = false;

    const finish = () => {
      done++;
      if (done < 2) return;
      this.saving = false;
      if (hasError) {
        this.toast.error('Some changes could not be saved');
      } else {
        this.toast.success('Profile updated!');
      }
    };

    personalReq.subscribe({
      next: (res) => {
        this.auth.updateUser(res.data?.user || res.data);
        finish();
      },
      error: () => { hasError = true; finish(); },
    });

    locationReq.subscribe({
      next: (res) => {
        if (res.data?.beautician) {
          this.beautician = { ...this.beautician, ...res.data.beautician };
          this.hasLocation = this.latitude !== null && this.longitude !== null;
        }
        finish();
      },
      error: () => { hasError = true; finish(); },
    });
  }
}