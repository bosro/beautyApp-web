import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Location } from "@angular/common";

declare const google: any;

type TravelMode = "DRIVING" | "WALKING" | "TRANSIT";

@Component({
  selector: "app-map",
  template: `
    <div class="map-page">
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

      <!-- Salon popup (shown when a pin is tapped, directions not active) -->
      <div
        class="salon-popup"
        *ngIf="selectedSalon && !directionsActive"
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
          </div>
          <!-- Direction trigger inside popup -->
          <button
            class="popup-dir-btn"
            (click)="startDirections(selectedSalon); $event.stopPropagation()"
          >
            <i class="ri-navigation-fill"></i> Directions
          </button>
        </div>
        <i class="ri-arrow-right-s-line popup-arrow"></i>
      </div>

      <!-- Directions panel (shown when route is active) -->
      <div class="dir-panel" *ngIf="directionsActive">
        <div class="dir-header">
          <button class="dir-close" (click)="clearDirections()">
            <i class="ri-close-line"></i>
          </button>
          <div class="dir-dest">
            <i class="ri-store-2-line"></i>
            <span class="dir-name">{{ selectedSalon?.businessName }}</span>
          </div>
          <!-- Travel mode chips -->
          <div class="dir-modes">
            <button
              *ngFor="let m of travelModes"
              (click)="setTravelMode(m.value)"
              class="mode-btn"
              [class.mode-active]="activeTravelMode === m.value"
              [title]="m.label"
            >
              <i [class]="m.icon"></i>
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div class="dir-summary" *ngIf="routeSummary">
          <div class="dir-sum-item">
            <i class="ri-time-line"></i>
            <span>{{ routeSummary.duration }}</span>
          </div>
          <div class="dir-sum-dot"></div>
          <div class="dir-sum-item">
            <i class="ri-road-map-line"></i>
            <span>{{ routeSummary.distance }}</span>
          </div>
          <div class="dir-sum-dot"></div>
          <div class="dir-sum-item text-primary">
            {{ activeTravelMode | titlecase }}
          </div>
        </div>

        <!-- Steps -->
        <div class="dir-steps" *ngIf="routeSteps.length > 0">
          <div
            *ngFor="let step of routeSteps; let i = index; let last = last"
            class="dir-step"
            [class.dir-step-last]="last"
          >
            <div class="step-icon">
              <i [class]="getStepIcon(step.maneuver)"></i>
            </div>
            <div class="step-body">
              <p class="step-instr" [innerHTML]="step.instructions"></p>
              <p class="step-dist">{{ step.distance }}</p>
            </div>
          </div>
        </div>

        <!-- External link -->
        <button class="ext-maps-btn" (click)="openExternalDirections()">
          <i class="ri-external-link-line"></i>
          Open in Google Maps
        </button>
      </div>

      <!-- BOTTOM SHEET -->
      <div
        class="bottom-sheet"
        [class.sheet-peek]="sheetState === 'peek'"
        [class.sheet-half]="sheetState === 'half'"
        [class.sheet-full]="sheetState === 'full'"
        [class.sheet-hidden]="sheetState === 'hidden'"
        [class.sheet-dragging]="isDragging"
        [style.height.px]="isDragging ? dragHeightPx : null"
        (touchstart)="onSheetTouchStart($event)"
        (touchmove)="onSheetTouchMove($event)"
        (touchend)="onSheetTouchEnd($event)"
      >
        <div class="sheet-handle-wrap" (click)="cycleSheet()">
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

        <!-- Results -->
        <div class="results-section">
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
                  <i class="ri-map-pin-line"></i>
                  {{ salon.city }}, {{ salon.region }}
                </p>
                <div class="result-meta">
                  <span class="result-rating">
                    <i class="ri-star-fill"></i>
                    {{ (salon.rating || 0).toFixed(1) }}
                  </span>
                  <span class="result-reviews"
                    >· {{ salon.totalReviews || 0 }} reviews</span
                  >
                  <span *ngIf="salon.distance" class="result-dist">
                    · {{ salon.distance.toFixed(1) }}km
                  </span>
                </div>
              </div>
              <div class="result-actions">
                <button
                  class="result-dir"
                  (click)="startDirections(salon); $event.stopPropagation()"
                  title="Get directions"
                >
                  <i class="ri-navigation-line"></i>
                </button>
                <button
                  class="result-go"
                  (click)="goToSalon(salon.id); $event.stopPropagation()"
                >
                  <i class="ri-arrow-right-s-line"></i>
                </button>
              </div>
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

        <div *ngIf="sheetState === 'peek'" class="confirm-btn-wrap">
          <button class="confirm-btn" (click)="runSearch()">
            {{ searchQuery ? "Search Salons" : "Find Nearby Salons" }}
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
      .map-area {
        flex: 1;
        min-height: 0;
      }

      /* ── Back + Search float ── */
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
        color: #1a1a1a;
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
        gap: 8px;
        padding: 12px 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
        z-index: 10;
      }
      .search-bar-float > i {
        flex-shrink: 0;
      }
      .search-input-float {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        color: #1a1a1a;
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
        flex-shrink: 0;
      }
      .locate-btn,
      .list-view-btn {
        color: var(--color-primary);
      }
      .list-view-btn {
        font-size: 20px;
      }

      /* ── Salon popup ── */
      .salon-popup {
        position: absolute;
        bottom: 240px;
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
        margin-top: 4px;
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
      .popup-dir-btn {
        margin-top: 8px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: color-mix(in srgb, var(--color-primary) 12%, transparent);
        color: var(--color-primary);
        border: none;
        border-radius: 20px;
        padding: 5px 12px;
        font-size: 12px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
      }
      .popup-arrow {
        font-size: 22px;
        color: #ccc;
      }

      /* ── Directions panel ── */
      .dir-panel {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 20;
        background: #fff;
        border-radius: 24px 24px 0 0;
        box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.14);
        max-height: 65vh;
        display: flex;
        flex-direction: column;
        animation: slideUp 0.3s ease;
      }
      .dir-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 16px 10px;
        border-bottom: 1px solid #f0f0f0;
        flex-shrink: 0;
      }
      .dir-close {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #f5f5f5;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #555;
        flex-shrink: 0;
      }
      .dir-dest {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;
        min-width: 0;
      }
      .dir-dest i {
        color: var(--color-primary);
        font-size: 16px;
        flex-shrink: 0;
      }
      .dir-name {
        font-size: 15px;
        font-weight: 700;
        color: #1a1a1a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dir-modes {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }
      .mode-btn {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: none;
        background: #f5f5f5;
        cursor: pointer;
        font-size: 16px;
        color: #888;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
      }
      .mode-btn.mode-active {
        background: var(--color-primary);
        color: #fff;
      }

      .dir-summary {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        background: color-mix(in srgb, var(--color-primary) 6%, transparent);
        flex-shrink: 0;
      }
      .dir-sum-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        font-weight: 600;
        color: #1a1a1a;
      }
      .dir-sum-item i {
        color: var(--color-primary);
      }
      .dir-sum-item.text-primary {
        color: var(--color-primary);
      }
      .dir-sum-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #ccc;
      }

      .dir-steps {
        flex: 1;
        overflow-y: auto;
        padding: 12px 16px;
        scrollbar-width: none;
      }
      .dir-steps::-webkit-scrollbar {
        display: none;
      }
      .dir-step {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding-bottom: 16px;
        position: relative;
      }
      .dir-step:not(.dir-step-last)::before {
        content: "";
        position: absolute;
        left: 15px;
        top: 32px;
        bottom: 0;
        width: 2px;
        background: #eee;
      }
      .step-icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: var(--color-primary);
        flex-shrink: 0;
        z-index: 1;
      }
      .step-body {
        flex: 1;
        min-width: 0;
      }
      .step-instr {
        font-size: 13px;
        color: #1a1a1a;
        line-height: 1.4;
      }
      .step-instr b {
        font-weight: 700;
      }
      .step-dist {
        font-size: 11px;
        color: #999;
        margin-top: 3px;
      }

      .ext-maps-btn {
        margin: 8px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 12px;
        border-radius: 12px;
        border: none;
        background: #f5f5f5;
        color: #555;
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        flex-shrink: 0;
      }

      /* ── Bottom sheet ── */
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
        touch-action: none;
      }
      .bottom-sheet.sheet-dragging {
        transition: none;
      }
      .bottom-sheet.sheet-hidden {
        height: 60px;
      }
      .bottom-sheet.sheet-peek {
        height: 220px;
      }
      .bottom-sheet.sheet-half {
        height: 55vh;
      }
      .bottom-sheet.sheet-full {
        height: 78vh;
      }

      .sheet-handle-wrap {
        display: flex;
        justify-content: center;
        padding: 12px 0 8px;
        cursor: pointer;
        flex-shrink: 0;
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

      /* Skeletons */
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
      .result-dist {
        font-size: 12px;
        color: var(--color-primary);
        font-weight: 600;
      }
      .result-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex-shrink: 0;
      }
      .result-dir,
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
        font-size: 18px;
        color: #888;
      }
      .result-dir {
        color: var(--color-primary);
      }
      .result-dir:hover {
        background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      }

      .confirm-btn-wrap {
        margin-top: auto;
        padding-top: 8px;
      }
      .confirm-btn {
        width: 100%;
        background: var(--color-primary);
        color: #fff;
        border: none;
        padding: 16px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 14px;
        cursor: pointer;
        font-family: inherit;
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
    `,
  ],
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild("mapContainer", { static: true }) mapContainer!: ElementRef;

  searchQuery = "";
  loading = false;
  salons: any[] = [];
  selectedSalon: any = null;
  sheetState: "hidden" | "peek" | "half" | "full" = "peek";
  currentCity = "Accra";
  currentRegion = "Ghana";
  selectedCategory = "";
  userLat = 5.6037;
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

  // Directions state
  directionsActive = false;
  activeTravelMode: TravelMode = "DRIVING";
  routeSummary: { duration: string; distance: string } | null = null;
  routeSteps: { instructions: string; distance: string; maneuver: string }[] =
    [];

  travelModes = [
    { label: "Driving", value: "DRIVING" as TravelMode, icon: "ri-car-line" },
    { label: "Walking", value: "WALKING" as TravelMode, icon: "ri-walk-line" },
    { label: "Transit", value: "TRANSIT" as TravelMode, icon: "ri-bus-line" },
  ];

  private map: any = null;
  private markers: any[] = [];
  private directionsService: any = null;
  private directionsRenderer: any = null;

  // Touch drag state for bottom sheet
  private dragStartY = 0;
  private dragStartState: "hidden" | "peek" | "half" | "full" = "peek";

  get sheetHeight(): string {
    const map: Record<string, string> = {
      hidden: "60px",
      peek: "220px",
      half: "55vh",
      full: "78vh",
    };
    return map[this.sheetState];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private location: Location,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.route.queryParams.subscribe((params) => {
      if (params["q"]) {
        this.searchQuery = params["q"];
        this.sheetState = "half";
        this.fetchSalons({ search: this.searchQuery });
      } else if (params["category"]) {
        this.selectedCategory = params["category"];
        this.searchQuery = params["name"] || params["category"];
        this.sheetState = "half";
        this.fetchSalons({ category: params["category"] });
      } else {
        this.locateMe();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearMarkers();
    if (this.directionsRenderer) this.directionsRenderer.setMap(null);
  }

  private initMap(): void {
    if (typeof google === "undefined") return;

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: this.userLat, lng: this.userLng },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      // NOTE: "DEMO_MAP_ID" is Google's shared public testing Map ID — fine
      // for development, but for production you should create a real Map
      // ID in Google Cloud Console (Maps > Map Management) and put it here
      // instead. A mapId is required for Advanced Markers to render.
      //
      // The `styles` array that used to live here was being silently
      // ignored — once a mapId is set, Google requires styling to be
      // configured against that Map ID in Cloud Console instead of via
      // the styles array (that's what the "styles property cannot be set
      // when a mapId is present" console warning was about). To hide POI
      // and transit labels like this used to, open your Map ID's style in
      // Cloud Console and turn those layers off there.
      mapId: "DEMO_MAP_ID",
    });

    // Init directions services
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "var(--color-primary, #2a8a93)",
        strokeWeight: 5,
        strokeOpacity: 0.85,
      },
    });
    this.directionsRenderer.setMap(this.map);
  }

  // ── Directions ──────────────────────────────────────────────────────────

  startDirections(salon: any): void {
    this.selectedSalon = salon;
    if (!salon.latitude || !salon.longitude) {
      // Fall back to external if no coords
      this.openExternalDirections();
      return;
    }
    this.directionsActive = true;
    this.sheetState = "half";
    this.requestRoute();
  }

  setTravelMode(mode: TravelMode): void {
    this.activeTravelMode = mode;
    this.requestRoute();
  }

  private requestRoute(): void {
    if (!this.directionsService || !this.selectedSalon) return;

    const origin = new google.maps.LatLng(this.userLat, this.userLng);
    const destination = new google.maps.LatLng(
      this.selectedSalon.latitude,
      this.selectedSalon.longitude,
    );

    this.directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode[this.activeTravelMode],
      },
      (result: any, status: any) => {
        this.ngZone.run(() => {
          if (status === "OK") {
            this.directionsRenderer.setDirections(result);
            const leg = result.routes[0].legs[0];
            this.routeSummary = {
              duration: leg.duration.text,
              distance: leg.distance.text,
            };
            this.routeSteps = leg.steps.map((s: any) => ({
              instructions: s.instructions,
              distance: s.distance.text,
              maneuver: s.maneuver || "",
            }));
            // Pan map to show full route
            const bounds = result.routes[0].bounds;
            this.map.fitBounds(bounds, { padding: 60 });
          }
        });
      },
    );
  }

  clearDirections(): void {
    this.directionsActive = false;
    this.routeSummary = null;
    this.routeSteps = [];
    if (this.directionsRenderer) {
      this.directionsRenderer.setDirections({ routes: [] });
    }
    this.sheetState = "half";
    // Re-drop salon markers
    this.dropMarkers();
  }

  openExternalDirections(): void {
    if (!this.selectedSalon) return;
    const dest =
      this.selectedSalon.latitude && this.selectedSalon.longitude
        ? `${this.selectedSalon.latitude},${this.selectedSalon.longitude}`
        : encodeURIComponent(
            `${this.selectedSalon.businessName}, ${this.selectedSalon.city}`,
          );
    const mode = this.activeTravelMode.toLowerCase();
    // Pass the origin explicitly using coordinates we already have from
    // navigator.geolocation — without this, Google Maps has to re-request
    // location permission in the new tab/session, which is why "Your
    // location" was showing as an unfilled placeholder instead of routing.
    const origin = `${this.userLat},${this.userLng}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=${mode}`,
      "_blank",
    );
  }

  getStepIcon(maneuver: string): string {
    const map: Record<string, string> = {
      "turn-left": "ri-arrow-left-line",
      "turn-right": "ri-arrow-right-line",
      "turn-slight-left": "ri-arrow-left-up-line",
      "turn-slight-right": "ri-arrow-right-up-line",
      "turn-sharp-left": "ri-corner-up-left-line",
      "turn-sharp-right": "ri-corner-up-right-line",
      "uturn-left": "ri-arrow-go-back-line",
      "uturn-right": "ri-arrow-go-forward-line",
      "roundabout-left": "ri-recycle-line",
      "roundabout-right": "ri-recycle-line",
      merge: "ri-merge-cells-horizontal",
      "ramp-left": "ri-arrow-left-down-line",
      "ramp-right": "ri-arrow-right-down-line",
      "fork-left": "ri-git-branch-line",
      "fork-right": "ri-git-branch-line",
      ferry: "ri-ship-line",
      straight: "ri-arrow-up-line",
    };
    return map[maneuver] || "ri-arrow-up-line";
  }

  // ── Bottom sheet drag ────────────────────────────────────────────────────
  // Previously this only detected a swipe gesture (>60px threshold) and
  // jumped straight to the next/prev snap state with no visual feedback
  // while dragging. Now the sheet actually follows the finger in real time
  // (isDragging=true disables the CSS transition so it tracks 1:1), and
  // snaps to the nearest of the four states on release.

  isDragging = false;
  dragHeightPx = 0;

  private stateHeightPx(state: "hidden" | "peek" | "half" | "full"): number {
    const vh = window.innerHeight;
    const map: Record<string, number> = {
      hidden: 60,
      peek: 220,
      half: vh * 0.55,
      full: vh * 0.78,
    };
    return map[state];
  }

  onSheetTouchStart(e: TouchEvent): void {
    this.dragStartY = e.touches[0].clientY;
    this.dragStartState = this.sheetState;
    this.dragHeightPx = this.stateHeightPx(this.sheetState);
    this.isDragging = true;
  }

  onSheetTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (!this.isDragging) return;
    const dy = this.dragStartY - e.touches[0].clientY; // positive = finger moved up
    const startHeight = this.stateHeightPx(this.dragStartState);
    const minHeight = this.stateHeightPx("hidden");
    const maxHeight = this.stateHeightPx("full");
    this.dragHeightPx = Math.min(maxHeight, Math.max(minHeight, startHeight + dy));
  }

  onSheetTouchEnd(e: TouchEvent): void {
    this.isDragging = false;
    const states: Array<"hidden" | "peek" | "half" | "full"> = [
      "hidden",
      "peek",
      "half",
      "full",
    ];
    // Snap to whichever state's height is closest to where the sheet was
    // released, rather than only reacting to total swipe distance.
    let closest = states[0];
    let closestDiff = Infinity;
    for (const state of states) {
      const diff = Math.abs(this.stateHeightPx(state) - this.dragHeightPx);
      if (diff < closestDiff) {
        closestDiff = diff;
        closest = state;
      }
    }
    this.sheetState = closest;
  }

  cycleSheet(): void {
    const states: Array<"hidden" | "peek" | "half" | "full"> = [
      "peek",
      "half",
      "full",
    ];
    const idx = states.indexOf(this.sheetState as any);
    this.sheetState = states[(idx + 1) % states.length];
  }

  // ── Map markers ─────────────────────────────────────────────────────────

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
          this.addUserLocationMarker();
        }
        this.reverseGeocode(this.userLat, this.userLng);
        this.fetchSalons({ lat: this.userLat, lng: this.userLng });
        this.sheetState = "half";
      },
      () => {
        this.fetchSalons({ lat: this.userLat, lng: this.userLng });
      },
    );
  }

  private addUserLocationMarker(): void {
    if (typeof google === "undefined" || !this.map) return;
    const dot = document.createElement("div");
    dot.style.cssText = `
      width: 20px; height: 20px; border-radius: 50%;
      background: #4285F4; border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(66,133,244,.5);
    `;
    new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: { lat: this.userLat, lng: this.userLng },
      content: dot,
      title: "You are here",
    });
  }

  private reverseGeocode(lat: number, lng: number): void {
    if (typeof google === "undefined") return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: any) => {
        this.ngZone.run(() => {
          if (status === "OK" && results[0]) {
            const c = results[0].address_components;
            const city = c.find((x: any) =>
              x.types.includes("locality"),
            )?.long_name;
            const region = c.find((x: any) =>
              x.types.includes("administrative_area_level_1"),
            )?.long_name;
            if (city) this.currentCity = city;
            if (region) this.currentRegion = region;
          }
        });
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

    const endpoint =
      params.lat && params.lng
        ? `${environment.apiUrl}/beauticians/nearby`
        : `${environment.apiUrl}/beauticians`;

    if (params.lat) apiParams.lat = params.lat.toString();
    if (params.lng) apiParams.lng = params.lng.toString();
    if (params.lat) apiParams.radius = "15";
    if (params.search) apiParams.search = params.search;
    if (params.category) apiParams.category = params.category;

    this.http.get<any>(endpoint, { params: apiParams }).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.salons = res?.data?.beauticians || [];
          this.loading = false;
          this.dropMarkers();
          if (this.salons.length > 0) {
            this.selectedSalon = this.salons[0];
            this.sheetState = "half";
          }
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.loading = false;
        });
      },
    });
  }

  private dropMarkers(): void {
    if (!this.map || typeof google === "undefined") return;
    this.clearMarkers();

    const AdvancedMarkerElement = google.maps.marker?.AdvancedMarkerElement;
    if (!AdvancedMarkerElement) {
      console.warn("AdvancedMarkerElement not available.");
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoords = false;
    const now = new Date();

    this.salons.forEach((salon) => {
      if (!salon.latitude || !salon.longitude) return;
      hasValidCoords = true;

      const position = { lat: salon.latitude, lng: salon.longitude };
      bounds.extend(position);

      // ── Determine if this salon has an active map/bundle featured listing ──
      const isMapFeatured =
        salon.isFeatured === true &&
        salon.featuredUntil &&
        new Date(salon.featuredUntil) > now &&
        ["map", "bundle"].includes(salon.featuredPlan || "");

      // ── Build the pin element ──
      const pinEl = document.createElement("div");

      if (isMapFeatured) {
        // Golden highlighted pin — larger, shows profile image or initial
        const initial = (salon.businessName || "B").charAt(0).toUpperCase();
        const imageUrl = salon.profileImage || salon.coverImage || null;

        pinEl.style.cssText =
          "display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3))";
        pinEl.innerHTML = `
        <div style="
          width: 52px; height: 52px; border-radius: 50%;
          border: 3px solid #F59E0B;
          overflow: hidden; background: #F59E0B;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.3);
        ">
          ${
            imageUrl
              ? `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover" alt="${salon.businessName}" />`
              : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
                           color:#fff;font-size:20px;font-weight:700;background:#F59E0B">${initial}</div>`
          }
        </div>
        <div style="
          margin-top: 2px;
          background: #F59E0B; color: #fff;
          font-size: 9px; font-weight: 700;
          padding: 1px 6px; border-radius: 20px;
          letter-spacing: 0.03em; white-space: nowrap;
        ">★ RECOMMENDED</div>
        <div style="width:2px;height:8px;background:#F59E0B;margin:0 auto"></div>
        <div style="width:5px;height:5px;border-radius:50%;background:#F59E0B;opacity:0.4;margin:0 auto"></div>
      `;
      } else {
        // Standard red scissor pin (unchanged from original)
        pinEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
          <ellipse cx="20" cy="44" rx="8" ry="4" fill="rgba(0,0,0,0.15)"/>
          <path d="M20 0C11.163 0 4 7.163 4 16c0 10 16 32 16 32S36 26 36 16C36 7.163 28.837 0 20 0z" fill="#E84A4A"/>
          <circle cx="20" cy="16" r="8" fill="white"/>
          <text x="20" y="20" text-anchor="middle" font-size="10"
                fill="#E84A4A" font-family="sans-serif">✂</text>
        </svg>`;
        pinEl.style.cursor = "pointer";
      }

      const marker = new AdvancedMarkerElement({
        map: this.map,
        position,
        content: pinEl,
        title: salon.businessName,
        gmpClickable: true,
        // Featured markers render above organic ones
        zIndex: isMapFeatured ? 10 : 1,
      });

      marker.addListener("gmp-click", () => {
        this.ngZone.run(() => {
          this.selectedSalon = salon;
          this.map.panTo(position);
          if (this.sheetState === "hidden") this.sheetState = "peek";
        });
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
    this.markers.forEach((m) => (m.map = null));
    this.markers = [];
  }

  runSearch(): void {
    if (this.searchQuery.trim()) {
      this.sheetState = "half";
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
    this.sheetState = "peek";
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
  goBack(): void {
    this.location.back();
  }
}
