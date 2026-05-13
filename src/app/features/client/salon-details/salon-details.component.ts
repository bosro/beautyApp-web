import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ToastService } from "../../../core/services/toast.service";
import { BeauticianProfile, BeautyService, Review } from "../../../core/models";
import { environment } from "../../../../environments/environment";

type TabType = "services" | "about" | "reviews";

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
            style="background: linear-gradient(to bottom,
              rgba(0,0,0,0.45) 0%,
              transparent 40%,
              transparent 55%,
              rgba(0,0,0,0.55) 100%)"
          ></div>

          <!-- Top bar -->
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
                style="color: white"
              ></i>
            </button>
          </div>

          <!-- Name + rating overlay -->
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
                    style="color: var(--color-primary)"
                  >
                    {{ salon?.businessCategory || "Beauty Salon" }}
                  </span>
                </div>
              </div>
              <button
                (click)="call()"
                class="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                style="background-color: var(--color-bg-primary)"
              >
                <i
                  class="ri-phone-line text-sm"
                  style="color: var(--color-text-secondary)"
                ></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ===== CONTENT CARD ===== -->
        <div
          class="relative -mt-5 rounded-t-[28px] overflow-hidden lg:mt-0 lg:rounded-none"
          style="background-color: var(--color-bg-primary); min-height: calc(100vh - 260px)"
        >
          <div class="lg:grid lg:grid-cols-12 lg:gap-6 lg:px-6 lg:pt-6">
            <div class="lg:col-span-8">
              <!-- Profile + quick info -->
              <div class="flex items-center gap-3 px-4 pt-5 pb-4 lg:px-0">
                <img
                  [src]="
                    salon?.profileImage ||
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200'
                  "
                  [alt]="salon?.businessName"
                  class="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border-2"
                  style="border-color: var(--color-bg-secondary)"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1">
                    <p
                      class="text-sm font-semibold truncate"
                      style="color: var(--color-text-primary)"
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
                    style="color: var(--color-text-secondary)"
                  >
                    {{ salon?.businessAddress }}
                  </p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    class="w-9 h-9 rounded-full flex items-center justify-center"
                    style="background-color: color-mix(in srgb, var(--color-primary) 12%, transparent)"
                  >
                    <i
                      class="ri-share-line text-sm"
                      style="color: var(--color-primary)"
                    ></i>
                  </button>
                </div>
              </div>

              <!-- TABS -->
              <div class="flex gap-2 px-4 lg:px-0 mb-5">
                <button
                  *ngFor="let t of tabList"
                  (click)="activeTab = t.value"
                  class="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
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
                <!-- Continue bar -->
                <div
                  *ngIf="selectedServices.length > 0"
                  class="sticky top-0 z-20 mb-3"
                  style="animation: slideDown 0.3s ease"
                >
                  <div
                    (click)="book()"
                    class="flex items-center justify-between px-4 py-3 cursor-pointer active:opacity-90 transition-all mx-4 lg:mx-0 rounded-2xl"
                    style="background-color: #1a1a1a"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style="background-color: rgba(255,255,255,0.12); animation: pulse 1.8s infinite"
                      >
                        <span class="text-xs font-bold" style="color: #fff">{{
                          selectedServices.length
                        }}</span>
                      </div>
                      <div>
                        <p class="text-white font-bold text-sm leading-tight">
                          {{ selectedServices.length }} service{{
                            selectedServices.length > 1 ? "s" : ""
                          }}
                          selected
                        </p>
                        <p
                          class="text-xs"
                          style="color: rgba(255,255,255,0.55)"
                        >
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

                <!-- Service Cards -->
                <div class="px-4 lg:px-0">
                  <ng-container *ngIf="loadingServices">
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div
                        class="skeleton rounded-2xl"
                        style="aspect-ratio: 0.8;"
                        *ngFor="let _ of [1, 2, 3, 4]"
                      ></div>
                    </div>
                  </ng-container>

                  <div class="flex flex-col gap-3">
                    <div
                      *ngFor="let svc of services"
                      (click)="selectService(svc)"
                      class="relative flex items-center gap-3 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all p-3"
                      [style.background-color]="
                        isSelected(svc.id)
                          ? 'color-mix(in srgb, var(--color-primary) 10%, var(--color-bg-secondary))'
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
                          style="background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 30%, #1a1a1a) 0%, #1a1a1a 100%)"
                        >
                          <i class="ri-scissors-2-line text-white text-2xl"></i>
                        </div>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                          <p
                            class="font-semibold text-sm leading-tight"
                            style="color: var(--color-text-primary)"
                          >
                            {{ svc.name }}
                          </p>
                          <span
                            *ngIf="svc.totalBookings > 20"
                            class="text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                            style="background: color-mix(in srgb, var(--color-primary) 15%, transparent); color: var(--color-primary)"
                          >
                            Popular</span
                          >
                        </div>
                        <div class="flex items-center gap-3 mt-2">
                          <span
                            class="text-sm font-bold"
                            style="color: var(--color-primary)"
                          >
                            GHS {{ svc.price.toFixed(2) }}
                          </span>
                          <span
                            class="text-xs flex items-center gap-1"
                            style="color: var(--color-text-secondary)"
                          >
                            <i class="ri-time-line"></i>
                            {{ svc.duration }}
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
                  ></app-empty-state>
                </div>
              </div>

              <!-- ===== ABOUT TAB ===== -->
              <div
                *ngIf="activeTab === 'about'"
                class="space-y-4 px-4 lg:px-0 pb-36"
              >
                <!-- Working Hours -->
                <div
                  class="rounded-2xl overflow-hidden"
                  style="background-color: var(--color-bg-secondary)"
                >
                  <div class="px-4 pt-4 pb-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div
                        class="w-8 h-8 rounded-xl flex items-center justify-center"
                        style="background-color: color-mix(in srgb, var(--color-primary) 12%, transparent)"
                      >
                        <i
                          class="ri-time-line text-sm"
                          style="color: var(--color-primary)"
                        ></i>
                      </div>
                      <h3
                        class="font-semibold text-sm"
                        style="color: var(--color-text-primary)"
                      >
                        Working Hours
                      </h3>
                    </div>
                    <span
                      class="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style="background-color: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary)"
                    >
                      Open
                    </span>
                  </div>

                  <div class="flex justify-between px-4 pb-4">
                    <div
                      *ngFor="let day of getDayChips()"
                      class="flex flex-col items-center gap-1.5"
                    >
                      <span
                        class="text-xs"
                        style="color: var(--color-text-secondary)"
                        >{{ day.label }}</span
                      >
                      <div
                        class="flex items-center justify-center rounded-full font-bold text-xs transition-all"
                        style="width: 32px; height: 40px;"
                        [style.background-color]="
                          day.active
                            ? 'var(--color-primary)'
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
                    style="background-color: var(--color-bg-primary)"
                  >
                    <div class="flex items-center gap-2">
                      <i
                        class="ri-sun-line text-sm"
                        style="color: var(--color-primary)"
                      ></i>
                      <span
                        class="text-sm font-semibold"
                        style="color: var(--color-text-primary)"
                      >
                        {{ salon?.openingTime || "09:00" }}
                      </span>
                    </div>
                    <div
                      class="flex-1 mx-3 h-px"
                      style="background-color: var(--color-border-light)"
                    ></div>
                    <div class="flex items-center gap-2">
                      <span
                        class="text-sm font-semibold"
                        style="color: var(--color-text-primary)"
                      >
                        {{ salon?.closingTime || "18:00" }}
                      </span>
                      <i
                        class="ri-moon-line text-sm"
                        style="color: var(--color-text-secondary)"
                      ></i>
                    </div>
                  </div>
                </div>

                <!-- Location -->
                <div
                  class="rounded-2xl overflow-hidden"
                  style="background-color: var(--color-bg-secondary)"
                >
                  <div class="px-4 pt-4 pb-3 flex items-center gap-2">
                    <div
                      class="w-8 h-8 rounded-xl flex items-center justify-center"
                      style="background-color: color-mix(in srgb, var(--color-primary) 12%, transparent)"
                    >
                      <i
                        class="ri-map-pin-2-line text-sm"
                        style="color: var(--color-primary)"
                      ></i>
                    </div>
                    <h3
                      class="font-semibold text-sm"
                      style="color: var(--color-text-primary)"
                    >
                      Location
                    </h3>
                  </div>

                  <div
                    class="mx-4 rounded-2xl overflow-hidden relative"
                    style="height: 110px; background: linear-gradient(135deg, #e8f4f8 0%, #d0eae8 100%)"
                  >
                    <div
                      class="absolute inset-0 opacity-10"
                      style="background-image: repeating-linear-gradient(0deg, transparent, transparent 20px, var(--color-primary) 20px, var(--color-primary) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, var(--color-primary) 20px, var(--color-primary) 21px)"
                    ></div>
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <div class="flex flex-col items-center gap-1">
                        <div
                          class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                          style="background-color: var(--color-primary)"
                        >
                          <i class="ri-map-pin-2-fill text-white text-lg"></i>
                        </div>
                        <div
                          class="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                          style="background: white; color: var(--color-primary)"
                        >
                          {{ salon?.city }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="px-4 py-3 flex items-start gap-3">
                    <i
                      class="ri-map-pin-line text-sm mt-0.5 flex-shrink-0"
                      style="color: var(--color-primary)"
                    ></i>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium"
                        style="color: var(--color-text-primary)"
                      >
                        {{ salon?.businessAddress }}
                      </p>
                      <p
                        class="text-xs mt-0.5"
                        style="color: var(--color-text-secondary)"
                      >
                        {{ salon?.city }}, {{ salon?.region }}
                      </p>
                    </div>
                  </div>

                  <div
                    *ngIf="salon?.user?.phone"
                    class="mx-4 mb-4 flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer active:opacity-80"
                    style="background-color: color-mix(in srgb, var(--color-primary) 8%, transparent)"
                    (click)="call()"
                  >
                    <div class="flex items-center gap-2">
                      <i
                        class="ri-phone-fill text-sm"
                        style="color: var(--color-primary)"
                      ></i>
                      <span
                        class="text-sm font-semibold"
                        style="color: var(--color-primary)"
                      >
                        {{ salon?.user?.phone }}
                      </span>
                    </div>
                    <i
                      class="ri-arrow-right-s-line"
                      style="color: var(--color-primary)"
                    ></i>
                  </div>
                  <div *ngIf="!salon?.user?.phone" class="pb-4"></div>
                </div>
              </div>

              <!-- ===== REVIEWS TAB ===== -->
              <div
                *ngIf="activeTab === 'reviews'"
                class="space-y-4 px-4 lg:px-0 pb-36"
              >
                <div
                  class="p-4 rounded-2xl flex items-center gap-5"
                  style="background-color: var(--color-bg-secondary)"
                >
                  <div class="text-center flex-shrink-0">
                    <p
                      class="text-5xl font-bold"
                      style="color: var(--color-primary)"
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
                        style="color: var(--color-text-placeholder)"
                      ></i>
                    </div>
                    <p
                      class="text-xs mt-1"
                      style="color: var(--color-text-secondary)"
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
                        style="color: var(--color-text-secondary)"
                        >{{ bar.star }}</span
                      >
                      <div
                        class="flex-1 h-1.5 rounded-full overflow-hidden"
                        style="background-color: var(--color-border-light)"
                      >
                        <div
                          class="h-full rounded-full"
                          [style.width.%]="bar.pct"
                          style="background-color: var(--color-primary)"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  *ngFor="let review of reviews"
                  class="p-4 rounded-2xl"
                  style="background-color: var(--color-bg-secondary)"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style="background-color: var(--color-primary)"
                    >
                      {{ review.customer?.name?.charAt(0) | uppercase }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="font-semibold text-sm truncate"
                        style="color: var(--color-text-primary)"
                      >
                        {{ review.customer?.name }}
                      </p>
                      <p
                        class="text-xs"
                        style="color: var(--color-text-secondary)"
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
                        style="color: var(--color-text-placeholder)"
                      ></i>
                    </div>
                  </div>
                  <p
                    *ngIf="review.comment"
                    class="text-sm leading-relaxed"
                    style="color: var(--color-text-secondary)"
                  >
                    {{ review.comment }}
                  </p>
                </div>

                <app-empty-state
                  *ngIf="!loadingReviews && reviews.length === 0"
                  icon="ri-star-line"
                  title="No reviews yet"
                  subtitle="Be the first to leave a review!"
                ></app-empty-state>
              </div>
            </div>

            <!-- Desktop booking panel -->
            <div class="hidden lg:block lg:col-span-4">
              <div
                class="sticky top-4 rounded-2xl p-5"
                style="background-color: var(--color-bg-secondary)"
              >
                <h3
                  class="font-bold mb-4"
                  style="color: var(--color-text-primary)"
                >
                  Book Appointment
                </h3>
                <div
                  *ngIf="selectedServices.length === 0"
                  class="text-center py-6"
                >
                  <i
                    class="ri-scissors-2-line text-4xl mb-2"
                    style="color: var(--color-text-placeholder)"
                  ></i>
                  <p class="text-sm" style="color: var(--color-text-secondary)">
                    Select a service from the Services tab to book
                  </p>
                </div>
                <div *ngIf="selectedServices.length > 0">
                  <div class="space-y-2 mb-4">
                    <div
                      *ngFor="let svc of getSelectedServiceObjects()"
                      class="flex items-center justify-between text-sm"
                    >
                      <span style="color: var(--color-text-primary)">{{
                        svc.name
                      }}</span>
                      <span
                        class="font-semibold"
                        style="color: var(--color-primary)"
                        >GHS {{ svc.price.toFixed(2) }}</span
                      >
                    </div>
                  </div>
                  <div
                    class="flex items-center justify-between py-3 border-t mb-4"
                    style="border-color: var(--color-border-light)"
                  >
                    <span
                      class="font-bold"
                      style="color: var(--color-text-primary)"
                      >Total</span
                    >
                    <span
                      class="font-bold text-lg"
                      style="color: var(--color-primary)"
                      >GHS {{ totalPrice.toFixed(2) }}</span
                    >
                  </div>
                </div>
                <button
                  (click)="book()"
                  class="btn-primary w-full"
                  [disabled]="selectedServices.length === 0"
                >
                  <i class="ri-calendar-event-line"></i>
                  {{ activeTab === "reviews" ? "Leave a Review" : "Book Now" }}
                </button>
                <button
                  (click)="activeTab = 'services'"
                  *ngIf="activeTab !== 'services'"
                  class="btn-secondary w-full mt-2"
                >
                  View Services
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== MOBILE FAB ===== -->
      <div
        *ngIf="fabOpen"
        class="lg:hidden fixed inset-0 z-30"
        style="background: rgba(0,0,0,0.1)"
        (click)="fabOpen = false"
      ></div>

      <div
        class="lg:hidden fixed z-40 flex flex-col items-end gap-3"
        style="bottom: 96px; right: 20px;"
      >
        <div *ngIf="fabOpen" class="flex flex-col items-end gap-3">
          <div
            *ngIf="selectedServices.length > 0"
            class="flex items-center gap-2 px-4 py-2 rounded-2xl shadow-md"
            style="background-color: var(--color-bg-primary); border: 1px solid var(--color-border-light)"
          >
            <span
              class="text-xs font-semibold"
              style="color: var(--color-text-secondary)"
            >
              {{ selectedServices.length }} service{{
                selectedServices.length > 1 ? "s" : ""
              }}
            </span>
            <span class="text-sm font-bold" style="color: var(--color-primary)"
              >GHS {{ totalPrice.toFixed(2) }}</span
            >
          </div>

          <div class="flex items-center gap-3">
            <span
              class="text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
              style="background-color: var(--color-bg-primary); color: var(--color-text-primary)"
            >
              {{
                activeTab === "reviews"
                  ? "Leave a Review"
                  : selectedServices.length > 0
                    ? "Continue to Book"
                    : "Select a Service"
              }}
            </span>
            <button
              (click)="book(); fabOpen = false"
              class="w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all"
              style="background-color: var(--color-primary)"
            >
              <i
                class="text-white text-xl"
                [class]="
                  activeTab === 'reviews'
                    ? 'ri-edit-2-line'
                    : selectedServices.length > 0
                      ? 'ri-arrow-right-line'
                      : 'ri-scissors-2-line'
                "
              >
              </i>
            </button>
          </div>

          <div class="flex items-center gap-3">
            <span
              class="text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
              style="background-color: var(--color-bg-primary); color: var(--color-text-primary)"
            >
              {{ isFavorite ? "Unfavorite" : "Favorite" }}
            </span>
            <button
              (click)="toggleFavorite(); fabOpen = false"
              class="w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all"
              style="background-color: var(--color-bg-primary); border: 1.5px solid var(--color-border-light)"
            >
              <i
                class="text-xl"
                [class]="isFavorite ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
                [style.color]="
                  isFavorite
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)'
                "
              >
              </i>
            </button>
          </div>

          <div class="flex items-center gap-3">
            <span
              class="text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
              style="background-color: var(--color-bg-primary); color: var(--color-text-primary)"
              >Call</span
            >
            <button
              (click)="call(); fabOpen = false"
              class="w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all"
              style="background-color: var(--color-bg-primary); border: 1.5px solid var(--color-border-light)"
            >
              <i
                class="ri-phone-line text-xl"
                style="color: var(--color-primary)"
              ></i>
            </button>
          </div>
        </div>

        <button
          (click)="fabOpen = !fabOpen"
          class="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all"
          style="background-color: var(--color-primary)"
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

  tabList = [
    { label: "Services", value: "services" as TabType },
    { label: "About", value: "about" as TabType },
    { label: "Reviews", value: "reviews" as TabType },
  ];

  ratingBars: { star: number; pct: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.salonId = this.route.snapshot.paramMap.get("id") || "";
    this.loadSalon();
  }

  loadSalon(): void {
    this.http
      .get<any>(`${environment.apiUrl}/beauticians/${this.salonId}`)
      .subscribe({
        next: (res) => {
          this.salon = res?.data?.beautician || res?.data || null;
          this.loading = false;
          this.computeRatingBars();
          this.loadServices();
          this.loadReviews();
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private computeRatingBars(): void {
    const total = this.salon?.totalReviews || 1;
    this.ratingBars = [5, 4, 3, 2, 1].map((star) => ({
      star,
      pct: Math.round(((Math.random() * total) / total) * 100),
    }));
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

  book(): void {
    if (this.activeTab === "reviews") {
      this.router.navigate(["/client/review", this.salonId]);
      return;
    }
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

  getDayChips(): { label: string; short: string; active: boolean }[] {
    const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const workingDays = this.salon?.workingDays || [];
    return allDays.map((d) => ({
      label: d,
      short: d.slice(0, 1),
      active: workingDays.some((w: string) =>
        w.toLowerCase().startsWith(d.toLowerCase()),
      ),
    }));
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
