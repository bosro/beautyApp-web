// salon-details.component.ts — complete rewrite
// Changes vs previous version:
//  1. TabType extended: "services" | "about" | "reviews" | "products" | "courses"
//  2. tabList updated with Products + Courses entries
//  3. setTab() method replaces direct activeTab assignment — lazy-loads products/courses
//  4. visibleTabs getter hides Courses tab until beautician has published at least one
//  5. Products tab: full grid with add-to-cart, qty controls, cart bar, placeProductOrder()
//  6. Courses tab: course cards with buy/access CTA, free preview link, isPurchased badge
//  7. All cart + course methods added to class (fixes TS2339 errors)
//  8. All existing features (map, directions, schedule, reviews, FAB) unchanged

import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ToastService } from "../../../core/services/toast.service";
import { BeauticianProfile, BeautyService, Review } from "../../../core/models";
import { environment } from "../../../../environments/environment";
import { NgZone } from "@angular/core";

type TabType = "services" | "about" | "reviews" | "products" | "courses";

@Component({
  selector: "app-salon-details",
  template: `
    <ng-container *ngIf="!loading; else loadingTpl">
      <div class="page-enter">
        <!-- ===== HERO ===== -->
        <div class="relative h-72 overflow-hidden">
          <img
            [src]="
              salon?.coverImage ||
              'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200'
            "
            [alt]="salon?.businessName"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0"
            style="background:linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,transparent 40%,transparent 55%,rgba(0,0,0,0.55) 100%)"
          ></div>

          <div
            class="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4"
          >
            <button
              (click)="goBack()"
              class="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <i class="ri-arrow-left-s-line text-white text-xl"></i>
            </button>
            <button
              (click)="toggleFavorite()"
              class="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <i
                class="text-xl"
                [class]="isFavorite ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
                style="color:white"
              ></i>
            </button>
          </div>

          <div class="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <div class="flex items-end justify-between mb-5">
              <div>
                <h1 class="text-white text-2xl font-bold leading-tight">
                  {{ salon?.businessName }}
                </h1>
                <div class="flex items-center gap-2 mt-1">
                  <i class="ri-star-fill text-yellow-400 text-sm"></i>
                  <span class="text-white font-bold text-sm">{{
                    salon?.rating?.toFixed(1) || "0.0"
                  }}</span>
                  <span class="text-white/70 text-xs"
                    >({{ salon?.totalReviews || 0 }})</span
                  >
                  <span class="text-white/40 text-xs">•</span>
                  <span
                    class="text-xs font-semibold"
                    style="color:var(--color-primary)"
                  >
                    {{ salon?.businessCategory || "Beauty Salon" }}
                  </span>
                </div>
              </div>
              <button
                (click)="call()"
                class="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                style="background-color:var(--color-bg-primary)"
              >
                <i
                  class="ri-phone-line text-sm"
                  style="color:var(--color-text-secondary)"
                ></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ===== CONTENT CARD ===== -->
        <div
          class="relative -mt-5 rounded-t-[28px] overflow-hidden lg:mt-0 lg:rounded-none"
          style="background-color:var(--color-bg-primary);min-height:calc(100vh - 260px)"
        >
          <div class="lg:grid lg:grid-cols-12 lg:gap-6 lg:px-6 lg:pt-6">
            <div class="lg:col-span-8">
              <!-- Profile row -->
              <div class="flex items-center gap-3 px-4 pt-5 pb-4 lg:px-0">
                <img
                  [src]="
                    salon?.profileImage ||
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200'
                  "
                  [alt]="salon?.businessName"
                  class="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border-2"
                  style="border-color:var(--color-bg-secondary)"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1">
                    <p
                      class="text-sm font-semibold truncate"
                      style="color:var(--color-text-primary)"
                    >
                      {{ salon?.city }}, {{ salon?.region }}
                    </p>
                    <i
                      *ngIf="salon?.verificationStatus === 'APPROVED'"
                      class="ri-verified-badge-fill text-blue-500 text-sm flex-shrink-0"
                    ></i>
                  </div>
                  <p
                    class="text-xs mt-0.5"
                    style="color:var(--color-text-secondary)"
                  >
                    {{ salon?.businessAddress }}
                  </p>
                </div>
                <button
                  class="w-9 h-9 rounded-full flex items-center justify-center"
                  style="background-color:color-mix(in srgb,var(--color-primary) 12%,transparent)"
                >
                  <i
                    class="ri-share-line text-sm"
                    style="color:var(--color-primary)"
                  ></i>
                </button>
              </div>

              <!-- TABS -->
              <div
                class="flex gap-2 px-4 lg:px-0 mb-5 overflow-x-auto scrollbar-hide"
              >
                <button
                  *ngFor="let t of visibleTabs"
                  (click)="setTab(t.value)"
                  class="flex-shrink-0 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all"
                  [style.background-color]="
                    activeTab === t.value
                      ? '#1a1a1a'
                      : 'var(--color-bg-secondary)'
                  "
                  [style.color]="
                    activeTab === t.value
                      ? 'white'
                      : 'var(--color-text-secondary)'
                  "
                >
                  {{ t.label }}
                </button>
              </div>

              <!-- ===== SERVICES TAB ===== -->
              <div *ngIf="activeTab === 'services'" class="pb-36">
                <div
                  *ngIf="selectedServices.length > 0"
                  class="sticky top-0 z-20 mb-3"
                >
                  <div
                    (click)="book()"
                    class="flex items-center justify-between px-4 py-3 cursor-pointer rounded-2xl mx-4 lg:mx-0"
                    style="background-color:#1a1a1a"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style="background-color:rgba(255,255,255,0.12)"
                      >
                        <span class="text-xs font-bold text-white">{{
                          selectedServices.length
                        }}</span>
                      </div>
                      <div>
                        <p class="text-white font-bold text-sm">
                          {{ selectedServices.length }} service{{
                            selectedServices.length > 1 ? "s" : ""
                          }}
                          selected
                        </p>
                        <p class="text-xs" style="color:rgba(255,255,255,0.55)">
                          Total: GHS {{ totalPrice.toFixed(2) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-white text-sm font-bold">Continue</span>
                      <i class="ri-arrow-right-line text-white text-lg"></i>
                    </div>
                  </div>
                </div>

                <div class="px-4 lg:px-0">
                  <div class="flex flex-col gap-3">
                    <div
                      *ngFor="let svc of services"
                      (click)="selectService(svc)"
                      class="relative flex items-center gap-3 rounded-2xl overflow-hidden cursor-pointer p-3"
                      [style.background-color]="
                        isSelected(svc.id)
                          ? 'color-mix(in srgb,var(--color-primary) 10%,var(--color-bg-secondary))'
                          : 'var(--color-bg-secondary)'
                      "
                      [style.border]="
                        isSelected(svc.id)
                          ? '1.5px solid var(--color-primary)'
                          : '1.5px solid transparent'
                      "
                    >
                      <div
                        class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                      >
                        <img
                          *ngIf="svc.image"
                          [src]="svc.image"
                          [alt]="svc.name"
                          class="w-full h-full object-cover"
                        />
                        <div
                          *ngIf="!svc.image"
                          class="w-full h-full flex items-center justify-center"
                          style="background:linear-gradient(135deg,color-mix(in srgb,var(--color-primary) 30%,#1a1a1a) 0%,#1a1a1a 100%)"
                        >
                          <i class="ri-scissors-2-line text-white text-2xl"></i>
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                          <p
                            class="font-semibold text-sm leading-tight"
                            style="color:var(--color-text-primary)"
                          >
                            {{ svc.name }}
                          </p>
                          <span
                            *ngIf="svc.totalBookings > 20"
                            class="text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                            style="background:color-mix(in srgb,var(--color-primary) 15%,transparent);color:var(--color-primary)"
                            >Popular</span
                          >
                        </div>
                        <div class="flex items-center gap-3 mt-2">
                          <span
                            class="text-sm font-bold"
                            style="color:var(--color-primary)"
                            >GHS {{ svc.price.toFixed(2) }}</span
                          >
                          <span
                            class="text-xs flex items-center gap-1"
                            style="color:var(--color-text-secondary)"
                          >
                            <i class="ri-time-line"></i>{{ svc.duration }}
                          </span>
                        </div>
                      </div>
                      <div
                        class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        [style.background-color]="
                          isSelected(svc.id)
                            ? 'var(--color-primary)'
                            : 'var(--color-bg-primary)'
                        "
                        [style.border]="
                          isSelected(svc.id)
                            ? 'none'
                            : '1.5px solid var(--color-border-light)'
                        "
                      >
                        <i
                          class="ri-check-line text-sm"
                          [style.color]="
                            isSelected(svc.id)
                              ? 'white'
                              : 'var(--color-border-light)'
                          "
                        ></i>
                      </div>
                    </div>
                  </div>
                  <app-empty-state
                    *ngIf="!loadingServices && services.length === 0"
                    icon="ri-scissors-2-line"
                    title="No services"
                    subtitle="This salon has no services listed"
                  >
                  </app-empty-state>
                </div>
              </div>

              <!-- ===== ABOUT TAB ===== -->
              <div
                *ngIf="activeTab === 'about'"
                class="space-y-4 px-4 lg:px-0 pb-36"
              >
                <!-- Working Hours card -->
                <div
                  class="rounded-2xl overflow-hidden"
                  style="background-color:var(--color-bg-secondary)"
                >
                  <div class="px-4 pt-4 pb-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div
                        class="w-8 h-8 rounded-xl flex items-center justify-center"
                        style="background-color:color-mix(in srgb,var(--color-primary) 12%,transparent)"
                      >
                        <i
                          class="ri-time-line text-sm"
                          style="color:var(--color-primary)"
                        ></i>
                      </div>
                      <h3
                        class="font-semibold text-sm"
                        style="color:var(--color-text-primary)"
                      >
                        Working Hours
                      </h3>
                    </div>
                    <span
                      class="text-xs font-semibold px-2.5 py-1 rounded-full"
                      [style.background-color]="
                        isOnHoliday
                          ? 'color-mix(in srgb,#F59E0B 12%,transparent)'
                          : 'color-mix(in srgb,var(--color-primary) 12%,transparent)'
                      "
                      [style.color]="
                        isOnHoliday ? '#D97706' : 'var(--color-primary)'
                      "
                    >
                      {{ isOnHoliday ? "On Holiday" : "Open" }}
                    </span>
                  </div>
                  <div class="flex justify-between px-4 pb-4">
                    <div
                      *ngFor="let day of getDayChips()"
                      (click)="selectedDayName = day.full"
                      class="flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <span
                        class="text-xs"
                        style="color:var(--color-text-secondary)"
                        >{{ day.label }}</span
                      >
                      <div
                        class="flex items-center justify-center rounded-full font-bold text-xs transition-all"
                        style="width:32px;height:40px"
                        [style.background-color]="
                          day.active
                            ? selectedDayName === day.full
                              ? '#1a1a1a'
                              : 'var(--color-primary)'
                            : 'var(--color-bg-primary)'
                        "
                        [style.color]="
                          day.active ? '#fff' : 'var(--color-text-placeholder)'
                        "
                      >
                        {{ day.short }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="mx-4 mb-4 flex items-center justify-between px-4 py-3 rounded-2xl"
                    style="background-color:var(--color-bg-primary)"
                  >
                    <div class="flex items-center gap-2">
                      <i
                        class="ri-sun-line text-sm"
                        style="color:var(--color-primary)"
                      ></i>
                      <span
                        class="text-sm font-semibold"
                        style="color:var(--color-text-primary)"
                        >{{ getDayHours(selectedDayName).open }}</span
                      >
                    </div>
                    <div
                      class="flex-1 mx-3 h-px"
                      style="background-color:var(--color-border-light)"
                    ></div>
                    <div class="flex items-center gap-2">
                      <span
                        class="text-sm font-semibold"
                        style="color:var(--color-text-primary)"
                        >{{ getDayHours(selectedDayName).close }}</span
                      >
                      <i
                        class="ri-moon-line text-sm"
                        style="color:var(--color-text-secondary)"
                      ></i>
                    </div>
                  </div>
                </div>

                <!-- Location card -->
                <div
                  class="rounded-2xl overflow-hidden"
                  style="background-color:var(--color-bg-secondary)"
                >
                  <div class="px-4 pt-4 pb-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div
                        class="w-8 h-8 rounded-xl flex items-center justify-center"
                        style="background-color:color-mix(in srgb,var(--color-primary) 12%,transparent)"
                      >
                        <i
                          class="ri-map-pin-2-line text-sm"
                          style="color:var(--color-primary)"
                        ></i>
                      </div>
                      <h3
                        class="font-semibold text-sm"
                        style="color:var(--color-text-primary)"
                      >
                        Location
                      </h3>
                    </div>
                    <button
                      *ngIf="
                        salon?.latitude &&
                        salon?.longitude &&
                        directionsMode === 'none'
                      "
                      (click)="showInAppDirections()"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style="background:color-mix(in srgb,var(--color-primary) 10%,transparent);color:var(--color-primary)"
                    >
                      <i class="ri-navigation-line text-sm"></i> Directions
                    </button>
                    <button
                      *ngIf="directionsMode !== 'none'"
                      (click)="clearInAppDirections()"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style="background:#FEE2E2;color:#EF4444"
                    >
                      <i class="ri-close-line"></i> Clear
                    </button>
                  </div>

                  <div
                    *ngIf="directionsMode !== 'none'"
                    class="flex gap-2 px-4 pb-3"
                  >
                    <button
                      *ngFor="let m of travelModes"
                      (click)="setInAppTravelMode(m.value)"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      [style.background-color]="
                        activeTravelMode === m.value
                          ? 'var(--color-primary)'
                          : 'var(--color-bg-primary)'
                      "
                      [style.color]="
                        activeTravelMode === m.value
                          ? 'white'
                          : 'var(--color-text-secondary)'
                      "
                    >
                      <i [class]="m.icon"></i> {{ m.label }}
                    </button>
                  </div>

                  <div
                    *ngIf="routeSummary"
                    class="mx-4 mb-3 flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style="background:color-mix(in srgb,var(--color-primary) 8%,transparent)"
                  >
                    <i
                      class="ri-time-line"
                      style="color:var(--color-primary)"
                    ></i>
                    <span
                      class="text-sm font-bold"
                      style="color:var(--color-text-primary)"
                      >{{ routeSummary.duration }}</span
                    >
                    <span
                      class="text-xs"
                      style="color:var(--color-text-secondary)"
                      >·</span
                    >
                    <span
                      class="text-sm font-semibold"
                      style="color:var(--color-text-primary)"
                      >{{ routeSummary.distance }}</span
                    >
                  </div>

                  <div
                    *ngIf="salon?.latitude && salon?.longitude"
                    #inlineMapContainer
                    class="mx-4 rounded-2xl overflow-hidden"
                    style="height:200px"
                  ></div>

                  <div
                    *ngIf="!salon?.latitude || !salon?.longitude"
                    class="mx-4 rounded-2xl overflow-hidden relative"
                    style="height:110px;background:linear-gradient(135deg,#e8f4f8 0%,#d0eae8 100%)"
                  >
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <div class="flex flex-col items-center gap-1">
                        <div
                          class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                          style="background-color:var(--color-primary)"
                        >
                          <i class="ri-map-pin-2-fill text-white text-lg"></i>
                        </div>
                        <div
                          class="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                          style="background:white;color:var(--color-primary)"
                        >
                          {{ salon?.city }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="px-4 py-3 flex items-start gap-3">
                    <i
                      class="ri-map-pin-line text-sm mt-0.5 flex-shrink-0"
                      style="color:var(--color-primary)"
                    ></i>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium"
                        style="color:var(--color-text-primary)"
                      >
                        {{ salon?.businessAddress }}
                      </p>
                      <p
                        class="text-xs mt-0.5"
                        style="color:var(--color-text-secondary)"
                      >
                        {{ salon?.city }}, {{ salon?.region }}
                      </p>
                    </div>
                  </div>

                  <div
                    *ngIf="salon?.latitude && salon?.longitude"
                    class="mx-4 mb-4 flex gap-2"
                  >
                    <button
                      (click)="openDirections()"
                      class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                      style="background:#f5f5f5;color:#555"
                    >
                      <i class="ri-external-link-line"></i> Open in Google Maps
                    </button>
                  </div>
                </div>
              </div>

              <!-- ===== REVIEWS TAB ===== -->
              <div
                *ngIf="activeTab === 'reviews'"
                class="space-y-4 px-4 lg:px-0 pb-36"
              >
                <div
                  class="p-4 rounded-2xl flex items-center gap-5"
                  style="background-color:var(--color-bg-secondary)"
                >
                  <div class="text-center flex-shrink-0">
                    <p
                      class="text-5xl font-bold"
                      style="color:var(--color-primary)"
                    >
                      {{ salon?.rating?.toFixed(1) || "0.0" }}
                    </p>
                    <div class="flex justify-center mt-1 gap-0.5">
                      <i
                        *ngFor="let s of [1, 2, 3, 4, 5]"
                        class="text-xs"
                        [class]="
                          s <= (salon?.rating || 0)
                            ? 'ri-star-fill text-yellow-400'
                            : 'ri-star-line'
                        "
                        style="color:var(--color-text-placeholder)"
                      ></i>
                    </div>
                    <p
                      class="text-xs mt-1"
                      style="color:var(--color-text-secondary)"
                    >
                      {{ salon?.totalReviews || 0 }} reviews
                    </p>
                  </div>
                  <div class="flex-1">
                    <div
                      *ngFor="let bar of ratingBars"
                      class="flex items-center gap-2 mb-1"
                    >
                      <span
                        class="text-xs w-2 flex-shrink-0"
                        style="color:var(--color-text-secondary)"
                        >{{ bar.star }}</span
                      >
                      <div
                        class="flex-1 h-1.5 rounded-full overflow-hidden"
                        style="background-color:var(--color-border-light)"
                      >
                        <div
                          class="h-full rounded-full"
                          [style.width.%]="bar.pct"
                          style="background-color:var(--color-primary)"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  *ngFor="let review of reviews"
                  class="p-4 rounded-2xl"
                  style="background-color:var(--color-bg-secondary)"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style="background-color:var(--color-primary)"
                    >
                      {{ review.customer?.name?.charAt(0) | uppercase }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="font-semibold text-sm truncate"
                        style="color:var(--color-text-primary)"
                      >
                        {{ review.customer?.name }}
                      </p>
                      <p
                        class="text-xs"
                        style="color:var(--color-text-secondary)"
                      >
                        {{ review.createdAt | date: "MMM d, y" }}
                      </p>
                    </div>
                    <div class="flex items-center gap-0.5 flex-shrink-0">
                      <i
                        *ngFor="let s of [1, 2, 3, 4, 5]"
                        class="text-xs"
                        [class]="
                          s <= review.rating
                            ? 'ri-star-fill text-yellow-400'
                            : 'ri-star-line'
                        "
                        style="color:var(--color-text-placeholder)"
                      ></i>
                    </div>
                  </div>
                  <p
                    *ngIf="review.comment"
                    class="text-sm leading-relaxed"
                    style="color:var(--color-text-secondary)"
                  >
                    {{ review.comment }}
                  </p>
                </div>

                <app-empty-state
                  *ngIf="!loadingReviews && reviews.length === 0"
                  icon="ri-star-line"
                  title="No reviews yet"
                  subtitle="Be the first to leave a review!"
                >
                </app-empty-state>
              </div>

              <!-- ===== PRODUCTS TAB ===== -->
              <div *ngIf="activeTab === 'products'" class="px-4 lg:px-0 pb-36">
                <!-- Loading -->
                <div *ngIf="loadingProducts" class="grid grid-cols-2 gap-3">
                  <div
                    class="skeleton rounded-2xl"
                    style="aspect-ratio:0.85"
                    *ngFor="let _ of [1, 2, 3, 4]"
                  ></div>
                </div>

                <!-- Cart bar -->
                <div
                  *ngIf="productCart.length > 0"
                  class="sticky top-0 z-20 mb-3"
                >
                  <div
                    (click)="placeProductOrder()"
                    class="flex items-center justify-between px-4 py-3 cursor-pointer rounded-2xl"
                    style="background-color:#1a1a1a"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style="background-color:rgba(255,255,255,0.12)"
                      >
                        <span class="text-xs font-bold text-white">{{
                          productCart.length
                        }}</span>
                      </div>
                      <div>
                        <p class="text-white font-bold text-sm">
                          {{ productCart.length }} item{{
                            productCart.length > 1 ? "s" : ""
                          }}
                          in cart
                        </p>
                        <p class="text-xs" style="color:rgba(255,255,255,0.55)">
                          Total: GHS {{ cartTotal.toFixed(2) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-white text-sm font-bold"
                        >Place Order</span
                      >
                      <i class="ri-arrow-right-line text-white text-lg"></i>
                    </div>
                  </div>
                </div>

                <!-- Empty -->
                <app-empty-state
                  *ngIf="!loadingProducts && products.length === 0"
                  icon="ri-shopping-bag-3-line"
                  title="No products listed"
                  subtitle="This beautician hasn't added any products yet."
                >
                </app-empty-state>

                <!-- Product grid -->
                <div
                  *ngIf="!loadingProducts && products.length > 0"
                  class="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  <div
                    *ngFor="let p of products"
                    class="rounded-2xl overflow-hidden border transition-all"
                    style="background:var(--color-bg-secondary);border-color:var(--color-border-light)"
                  >
                    <!-- Image -->
                    <div class="relative" style="aspect-ratio:1">
                      <img
                        *ngIf="p.image"
                        [src]="p.image"
                        [alt]="p.name"
                        class="w-full h-full object-cover"
                      />
                      <div
                        *ngIf="!p.image"
                        class="w-full h-full flex items-center justify-center"
                        style="background:color-mix(in srgb,var(--color-primary) 8%,var(--color-bg-secondary))"
                      >
                        <i
                          class="ri-shopping-bag-3-line text-3xl"
                          style="color:var(--color-primary)"
                        ></i>
                      </div>
                      <div
                        *ngIf="p.stock !== -1 && p.stock <= 5 && p.stock > 0"
                        class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style="background:#EF4444"
                      >
                        Only {{ p.stock }} left
                      </div>
                    </div>
                    <!-- Info -->
                    <div class="p-2.5">
                      <p
                        class="text-xs font-bold leading-tight mb-1 line-clamp-2"
                        style="color:var(--color-text-primary)"
                      >
                        {{ p.name }}
                      </p>
                      <p
                        class="text-sm font-bold mb-2"
                        style="color:var(--color-primary)"
                      >
                        GHS {{ p.price.toFixed(2) }}
                      </p>
                      <!-- Add / qty -->
                      <div *ngIf="cartQty(p.id) === 0">
                        <button
                          (click)="addToCart(p.id)"
                          [disabled]="p.stock === 0"
                          class="w-full py-1.5 rounded-xl text-xs font-bold disabled:opacity-40"
                          style="background:var(--color-primary);color:white"
                        >
                          {{ p.stock === 0 ? "Out of stock" : "Add to cart" }}
                        </button>
                      </div>
                      <div
                        *ngIf="cartQty(p.id) > 0"
                        class="flex items-center justify-between rounded-xl overflow-hidden"
                        style="background:var(--color-bg-primary)"
                      >
                        <button
                          (click)="removeFromCart(p.id)"
                          class="w-8 h-8 flex items-center justify-center text-lg font-bold"
                          style="color:var(--color-primary)"
                        >
                          -
                        </button>
                        <span
                          class="text-sm font-bold"
                          style="color:var(--color-text-primary)"
                          >{{ cartQty(p.id) }}</span
                        >
                        <button
                          (click)="addToCart(p.id)"
                          class="w-8 h-8 flex items-center justify-center text-lg font-bold"
                          style="color:var(--color-primary)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ===== COURSES TAB ===== -->
              <div
                *ngIf="activeTab === 'courses'"
                class="px-4 lg:px-0 pb-36 space-y-3"
              >
                <!-- Loading -->
                <div *ngIf="loadingCourses" class="space-y-3">
                  <div
                    class="skeleton h-28 rounded-2xl"
                    *ngFor="let _ of [1, 2, 3]"
                  ></div>
                </div>

                <!-- Course cards -->
                <div
                  *ngFor="let course of courses"
                  class="rounded-2xl overflow-hidden border"
                  style="background:var(--color-bg-secondary);border-color:var(--color-border-light)"
                >
                  <div class="flex gap-3 p-3">
                    <!-- Thumbnail -->
                    <div
                      class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative"
                      style="background:var(--color-bg-primary)"
                    >
                      <img
                        *ngIf="course.thumbnail"
                        [src]="course.thumbnail"
                        [alt]="course.title"
                        class="w-full h-full object-cover"
                      />
                      <div
                        *ngIf="!course.thumbnail"
                        class="w-full h-full flex items-center justify-center"
                        style="background:color-mix(in srgb,var(--color-primary) 8%,var(--color-bg-secondary))"
                      >
                        <i
                          [class]="courseTypeIcon(course.type) + ' text-3xl'"
                          style="color:var(--color-primary)"
                        ></i>
                      </div>
                      <!-- Type badge -->
                      <div
                        class="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
                        [style.background]="courseTypeColor(course.type)"
                      >
                        {{ course.type }}
                      </div>
                      <!-- Owned badge -->
                      <div
                        *ngIf="course.isPurchased"
                        class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                        style="background:#22C55E"
                      >
                        <i class="ri-check-line text-white text-xs"></i>
                      </div>
                    </div>

                    <!-- Details -->
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-bold leading-tight mb-1"
                        style="color:var(--color-text-primary)"
                      >
                        {{ course.title }}
                      </p>
                      <p
                        *ngIf="course.description"
                        class="text-xs leading-relaxed mb-2 line-clamp-2"
                        style="color:var(--color-text-secondary)"
                      >
                        {{ course.description }}
                      </p>

                      <div
                        class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2"
                      >
                        <span
                          *ngIf="course.duration"
                          class="text-xs flex items-center gap-1"
                          style="color:var(--color-text-secondary)"
                        >
                          <i class="ri-time-line"></i>{{ course.duration }}
                        </span>
                        <span
                          *ngIf="course.pageCount"
                          class="text-xs flex items-center gap-1"
                          style="color:var(--color-text-secondary)"
                        >
                          <i class="ri-file-text-line"></i
                          >{{ course.pageCount }} pages
                        </span>
                        <span
                          class="text-xs flex items-center gap-1"
                          style="color:var(--color-text-secondary)"
                        >
                          <i class="ri-download-line"></i
                          >{{ course._count?.purchases || 0 }} sold
                        </span>
                      </div>

                      <div class="flex items-center justify-between gap-2">
                        <span
                          class="text-base font-black"
                          style="color:var(--color-primary)"
                        >
                          {{
                            course.accessType === "FREE"
                              ? "Free"
                              : "GHS " + course.price.toFixed(2)
                          }}
                        </span>
                        <button
                          (click)="purchaseCourse(course)"
                          [disabled]="purchasingCourse[course.id]"
                          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                                 transition-all active:scale-95 disabled:opacity-50"
                          [style.background]="
                            course.isPurchased
                              ? 'color-mix(in srgb,#22C55E 12%,transparent)'
                              : 'var(--color-primary)'
                          "
                          [style.color]="
                            course.isPurchased ? '#16A34A' : 'white'
                          "
                        >
                          <i
                            *ngIf="purchasingCourse[course.id]"
                            class="ri-loader-4-line animate-spin"
                          ></i>
                          <i
                            *ngIf="!purchasingCourse[course.id]"
                            [class]="
                              course.isPurchased
                                ? 'ri-play-circle-line'
                                : 'ri-shopping-cart-line'
                            "
                          ></i>
                          {{
                            course.isPurchased
                              ? course.accessType === "FREE"
                                ? "Access"
                                : "Open"
                              : course.accessType === "FREE"
                                ? "Get free"
                                : "Buy now"
                          }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Preview bar -->
                  <div
                    *ngIf="course.previewUrl && !course.isPurchased"
                    class="flex items-center gap-2 px-3 py-2 border-t"
                    style="border-color:var(--color-border-light);
                           background:color-mix(in srgb,var(--color-primary) 4%,transparent)"
                  >
                    <i
                      class="ri-play-circle-line text-sm"
                      style="color:var(--color-primary)"
                    ></i>
                    <span
                      class="text-xs font-semibold"
                      style="color:var(--color-primary)"
                      >Free preview available</span
                    >
                    <button
                      (click)="openUrl(course.previewUrl)"
                      class="ml-auto text-xs font-bold underline"
                      style="color:var(--color-primary);background:none;border:none;cursor:pointer"
                    >
                      Watch
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- /lg:col-span-8 -->

            <!-- Desktop booking panel -->
            <div class="hidden lg:block lg:col-span-4">
              <div
                class="sticky top-4 rounded-2xl p-5"
                style="background-color:var(--color-bg-secondary)"
              >
                <h3
                  class="font-bold mb-4"
                  style="color:var(--color-text-primary)"
                >
                  Book Appointment
                </h3>
                <div
                  *ngIf="selectedServices.length === 0"
                  class="text-center py-6"
                >
                  <i
                    class="ri-scissors-2-line text-4xl mb-2"
                    style="color:var(--color-text-placeholder)"
                  ></i>
                  <p class="text-sm" style="color:var(--color-text-secondary)">
                    Select a service to book
                  </p>
                </div>
                <div *ngIf="selectedServices.length > 0">
                  <div class="space-y-2 mb-4">
                    <div
                      *ngFor="let svc of getSelectedServiceObjects()"
                      class="flex items-center justify-between text-sm"
                    >
                      <span style="color:var(--color-text-primary)">{{
                        svc.name
                      }}</span>
                      <span
                        class="font-semibold"
                        style="color:var(--color-primary)"
                        >GHS {{ svc.price.toFixed(2) }}</span
                      >
                    </div>
                  </div>
                  <div
                    class="flex items-center justify-between py-3 border-t mb-4"
                    style="border-color:var(--color-border-light)"
                  >
                    <span
                      class="font-bold"
                      style="color:var(--color-text-primary)"
                      >Total</span
                    >
                    <span
                      class="font-bold text-lg"
                      style="color:var(--color-primary)"
                      >GHS {{ totalPrice.toFixed(2) }}</span
                    >
                  </div>
                </div>
                <button
                  (click)="book()"
                  class="btn-primary w-full"
                  [disabled]="selectedServices.length === 0"
                >
                  <i class="ri-calendar-event-line"></i> Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAB -->
      <div
        *ngIf="fabOpen"
        class="lg:hidden fixed inset-0 z-30"
        style="background:rgba(0,0,0,0.1)"
        (click)="fabOpen = false"
      ></div>
      <div
        class="lg:hidden fixed z-40 flex flex-col items-end gap-3"
        style="bottom:96px;right:20px"
      >
        <div *ngIf="fabOpen" class="flex flex-col items-end gap-3">
          <div class="flex items-center gap-3">
            <span
              class="text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
              style="background-color:var(--color-bg-primary);color:var(--color-text-primary)"
            >
              {{
                selectedServices.length > 0
                  ? "Continue to Book"
                  : "Select a Service"
              }}
            </span>
            <button
              (click)="book(); fabOpen = false"
              class="w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
              style="background-color:var(--color-primary)"
            >
              <i
                class="text-white text-xl"
                [class]="
                  selectedServices.length > 0
                    ? 'ri-arrow-right-line'
                    : 'ri-scissors-2-line'
                "
              ></i>
            </button>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
              style="background-color:var(--color-bg-primary);color:var(--color-text-primary)"
            >
              {{ isFavorite ? "Unfavorite" : "Favorite" }}
            </span>
            <button
              (click)="toggleFavorite(); fabOpen = false"
              class="w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
              style="background-color:var(--color-bg-primary);border:1.5px solid var(--color-border-light)"
            >
              <i
                class="text-xl"
                [class]="isFavorite ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
                [style.color]="
                  isFavorite
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)'
                "
              ></i>
            </button>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
              style="background-color:var(--color-bg-primary);color:var(--color-text-primary)"
              >Call</span
            >
            <button
              (click)="call(); fabOpen = false"
              class="w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
              style="background-color:var(--color-bg-primary);border:1.5px solid var(--color-border-light)"
            >
              <i
                class="ri-phone-line text-xl"
                style="color:var(--color-primary)"
              ></i>
            </button>
          </div>
        </div>
        <button
          (click)="fabOpen = !fabOpen"
          class="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
          style="background-color:var(--color-primary)"
        >
          <i
            class="text-white text-2xl transition-all"
            [class]="fabOpen ? 'ri-close-line' : 'ri-add-line'"
          ></i>
        </button>
      </div>
    </ng-container>
    <ng-template #loadingTpl>
      <app-spinner
        [fullPage]="true"
        label="Loading salon details..."
      ></app-spinner>
    </ng-template>
  `,
  styles: [
    `
      .skeleton {
        background: linear-gradient(
          90deg,
          var(--color-border-light) 25%,
          color-mix(in srgb, var(--color-border-light) 60%, transparent) 50%,
          var(--color-border-light) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class SalonDetailsComponent implements OnInit {
  salonId = "";
  salon: BeauticianProfile | null = null;
  services: BeautyService[] = [];
  reviews: Review[] = [];
  isFavorite = false;
  activeTab: TabType = "services";
  loading = true;
  loadingServices = false;
  loadingReviews = false;
  selectedServices: string[] = [];
  fabOpen = false;

  // Products
  products: any[] = [];
  loadingProducts = false;
  productCart: { productId: string; quantity: number }[] = [];

  // Courses
  courses: any[] = [];
  loadingCourses = false;
  purchasingCourse: Record<string, boolean> = {};

  // Directions
  directionsMode: "none" | "preview" | "navigating" = "none";
  activeTravelMode: "DRIVING" | "WALKING" | "TRANSIT" = "DRIVING";
  routeSummary: { duration: string; distance: string } | null = null;
  routeSteps: { instructions: string; distance: string; maneuver: string }[] =
    [];
  private inlineMap: any = null;
  private directionsService: any = null;
  private directionsRenderer: any = null;

  travelModes = [
    { label: "Drive", value: "DRIVING" as const, icon: "ri-car-line" },
    { label: "Walk", value: "WALKING" as const, icon: "ri-walk-line" },
    { label: "Transit", value: "TRANSIT" as const, icon: "ri-bus-line" },
  ];

  tabList = [
    { label: "Services", value: "services" as TabType },
    { label: "About", value: "about" as TabType },
    { label: "Reviews", value: "reviews" as TabType },
    { label: "Products", value: "products" as TabType },
    { label: "Courses", value: "courses" as TabType },
  ];

  /** Courses tab hidden until beautician has at least one published course */
  get visibleTabs() {
    return this.tabList.filter((t) => {
      if (t.value === "courses")
        return this.courses.length > 0 || this.loadingCourses;
      return true;
    });
  }

  ratingBars: { star: number; pct: number }[] = [];
  salonHolidays: any[] = [];
  dayOverrides: Record<string, any> = {};
  isOnHoliday = false;
  selectedDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  salonBreakTimes: Record<string, { startTime: string; endTime: string }[]> =
    {};
  mapUrl: SafeResourceUrl = "";

  @ViewChild("inlineMapContainer") inlineMapContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.salonId = this.route.snapshot.paramMap.get("id") || "";
    this.loadSalon();
    // Pre-fetch courses so visibleTabs can decide whether to show the tab
    this.loadCourses();
  }

  // ── Data loading ────────────────────────────────────────────────────────────

  loadSalon(): void {
    this.http
      .get<any>(`${environment.apiUrl}/beauticians/${this.salonId}`)
      .subscribe({
        next: (res) => {
          this.salon = res?.data?.beautician || res?.data || null;
          this.loading = false;
          this.computeRatingBars();
          this.buildMapUrl();
          this.loadServices();
          this.loadReviews();
          this.loadHolidaysAndOverrides();
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  loadServices(): void {
    this.loadingServices = true;
    this.http
      .get<any>(`${environment.apiUrl}/services`, {
        params: { beauticianId: this.salonId, isActive: "true" },
      })
      .subscribe({
        next: (res) => {
          this.services = res?.data?.services || [];
          this.loadingServices = false;
        },
        error: () => {
          this.loadingServices = false;
        },
      });
  }

  loadReviews(): void {
    this.loadingReviews = true;
    this.http
      .get<any>(`${environment.apiUrl}/reviews`, {
        params: { beauticianId: this.salonId, limit: "20" },
      })
      .subscribe({
        next: (res) => {
          this.reviews = res?.data?.reviews || [];
          this.loadingReviews = false;
        },
        error: () => {
          this.loadingReviews = false;
        },
      });
  }

  loadProducts(): void {
    if (this.products.length || this.loadingProducts) return;
    this.loadingProducts = true;
    this.http
      .get<any>(`${environment.apiUrl}/products/beautician/${this.salonId}`)
      .subscribe({
        next: (res) => {
          this.products = res?.data?.products || [];
          this.loadingProducts = false;
        },
        error: () => {
          this.loadingProducts = false;
        },
      });
  }

  loadCourses(): void {
    if (this.courses.length || this.loadingCourses) return;
    this.loadingCourses = true;
    this.http
      .get<any>(`${environment.apiUrl}/courses/beautician/${this.salonId}`)
      .subscribe({
        next: (res) => {
          this.courses = res?.data?.courses || [];
          this.loadingCourses = false;
        },
        error: () => {
          this.loadingCourses = false;
        },
      });
  }

  setTab(tab: TabType): void {
    this.activeTab = tab;
    if (tab === "products") this.loadProducts();
    if (tab === "courses") this.loadCourses();
  }

  // ── Product cart ─────────────────────────────────────────────────────────────

  cartQty(productId: string): number {
    return (
      this.productCart.find((i) => i.productId === productId)?.quantity || 0
    );
  }

  addToCart(productId: string): void {
    const existing = this.productCart.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity++;
    } else {
      this.productCart = [...this.productCart, { productId, quantity: 1 }];
    }
  }

  removeFromCart(productId: string): void {
    const existing = this.productCart.find((i) => i.productId === productId);
    if (!existing) return;
    if (existing.quantity > 1) {
      existing.quantity--;
      this.productCart = [...this.productCart];
    } else {
      this.productCart = this.productCart.filter(
        (i) => i.productId !== productId,
      );
    }
  }

  get cartTotal(): number {
    return this.productCart.reduce((sum, item) => {
      const p = this.products.find((p) => p.id === item.productId);
      return sum + (p?.price || 0) * item.quantity;
    }, 0);
  }

  placeProductOrder(): void {
    if (!this.productCart.length) return;
    this.http
      .post(`${environment.apiUrl}/products/orders`, {
        items: this.productCart,
      })
      .subscribe({
        next: () => {
          this.toast.success(
            "Order placed! The beautician will confirm shortly.",
          );
          this.productCart = [];
        },
        error: (err) => this.toast.error(err?.error?.message || "Order failed"),
      });
  }

  // ── Courses ──────────────────────────────────────────────────────────────────

  purchaseCourse(course: any): void {
    if (course.isPurchased) {
      if (course.fileUrl) window.open(course.fileUrl, "_blank");
      return;
    }
    this.purchasingCourse = { ...this.purchasingCourse, [course.id]: true };
    this.http
      .post(`${environment.apiUrl}/courses/${course.id}/purchase`, {})
      .subscribe({
        next: () => {
          course.isPurchased = true;
          this.purchasingCourse = {
            ...this.purchasingCourse,
            [course.id]: false,
          };
          this.toast.success(
            course.accessType === "FREE"
              ? "Access granted!"
              : "Purchase successful!",
          );
        },
        error: (err) => {
          this.purchasingCourse = {
            ...this.purchasingCourse,
            [course.id]: false,
          };
          this.toast.error(err?.error?.message || "Failed to purchase");
        },
      });
  }

  courseTypeIcon(type: string): string {
    return (
      (
        {
          VIDEO: "ri-video-line",
          EBOOK: "ri-book-2-line",
          AUDIO: "ri-headphone-line",
        } as any
      )[type] || "ri-file-line"
    );
  }

  courseTypeColor(type: string): string {
    return (
      ({ VIDEO: "#7C3AED", EBOOK: "#0EA5E9", AUDIO: "#F59E0B" } as any)[type] ||
      "#71717A"
    );
  }

  openUrl(url: string): void {
    window.open(url, "_blank");
  }

  // ── Services ─────────────────────────────────────────────────────────────────

  isSelected(id: string): boolean {
    return this.selectedServices.includes(id);
  }

  selectService(svc: BeautyService): void {
    this.selectedServices = this.isSelected(svc.id)
      ? this.selectedServices.filter((s) => s !== svc.id)
      : [...this.selectedServices, svc.id];
  }

  get totalPrice(): number {
    return this.services
      .filter((s) => this.selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  }

  getSelectedServiceObjects(): BeautyService[] {
    return this.services.filter((s) => this.selectedServices.includes(s.id));
  }

  // ── Map / directions ─────────────────────────────────────────────────────────

  private buildMapUrl(): void {
    if (!this.salon?.latitude || !this.salon?.longitude) return;
    const lat = parseFloat(this.salon.latitude as any);
    const lng = parseFloat(this.salon.longitude as any);
    if (isNaN(lat) || isNaN(lng)) return;
    const key = environment.googleMapsApiKey || "";
    const raw = key
      ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lng}&zoom=16`
      : `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(raw);
  }

  openDirections(): void {
    if (!this.salon?.latitude || !this.salon?.longitude) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${this.salon.latitude},${this.salon.longitude}`,
      "_blank",
    );
  }

  showInAppDirections(): void {
    const lat = parseFloat(this.salon?.latitude as any);
    const lng = parseFloat(this.salon?.longitude as any);
    if (!this.salon || isNaN(lat) || isNaN(lng)) {
      this.openDirections();
      return;
    }
    this.directionsMode = "preview";
    setTimeout(() => this.initInlineMap(), 50);
  }

  private initInlineMap(): void {
    if (typeof google === "undefined" || !this.inlineMapContainer) return;
    const lat = parseFloat(this.salon!.latitude as any);
    const lng = parseFloat(this.salon!.longitude as any);
    this.inlineMap = new google.maps.Map(
      this.inlineMapContainer.nativeElement,
      {
        center: { lat, lng },
        zoom: 14,
        disableDefaultUI: true,
        mapId: "DEMO_MAP_ID",
      },
    );
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#6366F1",
        strokeWeight: 5,
        strokeOpacity: 0.85,
      },
    });
    this.directionsRenderer.setMap(this.inlineMap);
    this.requestInlineRoute();
  }

  setInAppTravelMode(mode: "DRIVING" | "WALKING" | "TRANSIT"): void {
    this.activeTravelMode = mode;
    if (this.directionsService) this.requestInlineRoute();
  }

  private requestInlineRoute(): void {
    if (!this.directionsService || !this.salon) return;
    const destLat = parseFloat(this.salon.latitude as any);
    const destLng = parseFloat(this.salon.longitude as any);
    const doRoute = (userLat: number, userLng: number) => {
      this.directionsService.route(
        {
          origin: new google.maps.LatLng(userLat, userLng),
          destination: new google.maps.LatLng(destLat, destLng),
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
              this.inlineMap.fitBounds(result.routes[0].bounds, {
                padding: 30,
              });
            }
          });
        },
      );
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => doRoute(pos.coords.latitude, pos.coords.longitude),
        () => doRoute(5.6037, -0.187),
      );
    } else {
      doRoute(5.6037, -0.187);
    }
  }

  clearInAppDirections(): void {
    this.directionsMode = "none";
    this.routeSummary = null;
    this.routeSteps = [];
    this.inlineMap = null;
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer = null;
    }
  }

  // ── About helpers ─────────────────────────────────────────────────────────────

  loadHolidaysAndOverrides(): void {
    this.http
      .get<any>(`${environment.apiUrl}/schedule/${this.salonId}/holidays`)
      .subscribe({
        next: (res) => {
          this.dayOverrides = res.data?.overrides || {};
          this.salonBreakTimes = {};
          Object.entries(this.dayOverrides).forEach(
            ([day, override]: [string, any]) => {
              if (override.breakTimes?.length)
                this.salonBreakTimes[day] = override.breakTimes;
            },
          );
        },
        error: () => {},
      });
  }

  getBreakTimes(): { startTime: string; endTime: string }[] {
    return this.salonBreakTimes[this.selectedDayName] || [];
  }

  private computeRatingBars(): void {
    const total = this.salon?.totalReviews || 1;
    this.ratingBars = [5, 4, 3, 2, 1].map((star) => ({
      star,
      pct: Math.round(((Math.random() * total) / total) * 100),
    }));
  }

  getDayChips(): {
    label: string;
    short: string;
    full: string;
    active: boolean;
  }[] {
    const map: Record<string, string> = {
      Sun: "Sunday",
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
    };
    const workingDays = this.salon?.workingDays || [];
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => ({
      label: d,
      short: d.slice(0, 1),
      full: map[d],
      active:
        !this.isOnHoliday &&
        workingDays.some((w: string) =>
          w.toLowerCase().startsWith(d.toLowerCase()),
        ),
    }));
  }

  getDayHours(dayName: string): { open: string; close: string } {
    const override = this.dayOverrides[dayName];
    if (override)
      return { open: override.openingTime, close: override.closingTime };
    return {
      open: this.salon?.openingTime || "09:00",
      close: this.salon?.closingTime || "18:00",
    };
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  book(): void {
    if (this.selectedServices.length === 0) {
      this.activeTab = "services";
      this.toast.warning("Please select at least one service");
      return;
    }
    this.router.navigate(["/client/book-appointment", this.salonId], {
      queryParams: { services: this.selectedServices.join(",") },
    });
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    this.toast.success(
      this.isFavorite ? "Added to favorites" : "Removed from favorites",
    );
  }

  call(): void {
    const phone = this.salon?.user?.phone;
    if (phone) window.open(`tel:${phone}`);
    else this.toast.warning("Phone number not available");
  }

  goBack(): void {
    this.router.navigate(["/client/discover"]);
  }
}
