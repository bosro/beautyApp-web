import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { BeauticianProfile } from "../../../core/models";

@Component({
  selector: "app-discover",
  template: `
    <div class="page-enter px-4 lg:px-6 py-4">
      <!-- Header -->
      <div class="mb-5">
        <h1
          class="text-2xl font-bold mb-1"
          style="color: var(--color-text-primary)"
        >
          Discover
        </h1>
        <p class="text-sm" style="color: var(--color-text-secondary)">
          Find beauty professionals near you
        </p>
      </div>

      <!-- Search + Filter -->
      <div class="flex gap-2 mb-4">
        <div class="flex-1 relative">
          <i
            class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
            style="color: var(--color-text-placeholder)"
          ></i>
          <input
            [(ngModel)]="query"
            (ngModelChange)="onSearch()"
            type="text"
            placeholder="Search beauticians or services..."
            class="form-input pl-10"
          />
        </div>
        <button
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          [style.background-color]="
            hasActiveFilters
              ? 'var(--color-primary)'
              : 'var(--color-bg-secondary)'
          "
          (click)="openFilters()"
        >
          <i
            class="ri-equalizer-2-line text-lg"
            [style.color]="hasActiveFilters ? 'white' : 'var(--color-primary)'"
          ></i>
          <span
            *ngIf="hasActiveFilters"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
            style="font-size: 10px; background-color: var(--color-primary); border: 2px solid var(--color-bg-primary)"
          >
            {{ activeFilterCount }}
          </span>
        </button>
      </div>

      <!-- Sort chips -->
      <div
        class="flex gap-2 mb-4 overflow-x-auto pb-1"
        style="-ms-overflow-style:none; scrollbar-width:none;"
      >
        <button
          *ngFor="let chip of sortChips"
          (click)="setSort(chip.value)"
          class="px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
          [style.background-color]="
            activeSort === chip.value
              ? 'var(--color-primary)'
              : 'var(--color-bg-secondary)'
          "
          [style.color]="
            activeSort === chip.value ? 'white' : 'var(--color-text-secondary)'
          "
        >
          {{ chip.label }}
        </button>
      </div>

      <!-- Results count -->
      <p class="text-xs mb-4" style="color: var(--color-text-secondary)">
        {{ total }} beautician{{ total !== 1 ? "s" : "" }} found
      </p>

      <!-- Skeleton -->
      <div
        *ngIf="loading"
        class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3"
      >
        <div
          class="skeleton rounded-2xl"
          style="aspect-ratio: 0.75;"
          *ngFor="let _ of [1, 2, 3, 4, 5, 6]"
        ></div>
      </div>

      <!-- Grid -->
      <div
        *ngIf="!loading"
        class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3"
      >
        <div
          *ngFor="let salon of beauticians"
          (click)="goToSalon(salon.id)"
          class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-all"
          style="aspect-ratio: 0.75;"
        >
          <img
            [src]="
              salon.profileImage ||
              salon.coverImage ||
              'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=530&fit=crop'
            "
            [alt]="salon.businessName"
            class="w-full h-full object-cover block"
          />
          <div
            class="absolute inset-0 flex flex-col justify-end p-3"
            style="background: linear-gradient(transparent, rgba(0,0,0,0.65))"
          >
            <p class="text-white font-semibold text-sm leading-tight truncate">
              {{ salon.businessName }}
            </p>
            <div class="flex items-center gap-1 mt-1">
              <i class="ri-star-fill text-yellow-400 text-xs"></i>
              <span class="text-white text-xs font-semibold">{{
                salon.rating.toFixed(1)
              }}</span>
              <span class="text-white/60 text-xs"
                >({{ salon.totalReviews || 0 }})</span
              >
            </div>
            <p
              class="text-white/70 text-xs mt-1 flex items-center gap-1 truncate"
            >
              <i class="ri-map-pin-2-line text-xs"></i>
              {{ salon.city }}, {{ salon.region }}
            </p>
            <div class="flex items-center justify-between mt-2">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                style="background: rgba(255,255,255,0.2); color: #fff;"
              >
                {{ salon.businessCategory }}
              </span>
              <button
                (click)="favorite($event, salon)"
                class="w-7 h-7 rounded-full flex items-center justify-center"
                style="background: rgba(255,255,255,0.2)"
              >
                <i class="ri-heart-3-line text-white text-xs"></i>
              </button>
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
      <div
        *ngIf="!loading && beauticians.length < total"
        class="mt-6 flex justify-center"
      >
        <button
          (click)="loadMore()"
          class="btn-secondary px-8"
          [disabled]="loadingMore"
        >
          <span class="spinner" *ngIf="loadingMore"></span>
          {{ loadingMore ? "Loading..." : "Load more" }}
        </button>
      </div>

      <div class="h-8"></div>
    </div>

    <!-- ===== FILTER BOTTOM SHEET ===== -->
    <!-- Backdrop -->
    <!-- ===== FILTER BOTTOM SHEET ===== -->
    <div
      *ngIf="showFilters"
      class="fixed inset-0 z-40 transition-opacity duration-300"
      style="background: rgba(0,0,0,0.45)"
      (click)="closeFilters()"
    ></div>

    <div
      class="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl overflow-hidden transition-transform duration-300"
      style="background-color: var(--color-bg-primary); max-height: 90vh;
         transform: {{ showFilters ? 'translateY(0)' : 'translateY(100%)' }}"
    >
      <!-- Handle -->
      <div class="flex justify-center pt-3 pb-1 flex-shrink-0">
        <div
          class="w-10 h-1 rounded-full"
          style="background-color: var(--color-border-light)"
        ></div>
      </div>

      <!-- Sheet header -->
      <div
        class="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style="border-bottom: 1px solid var(--color-border-light)"
      >
        <button
          (click)="closeFilters()"
          class="w-9 h-9 rounded-xl flex items-center justify-center"
          style="background-color: var(--color-bg-secondary)"
        >
          <i
            class="ri-arrow-left-s-line text-lg"
            style="color: var(--color-text-primary)"
          ></i>
        </button>
        <h2
          class="text-base font-bold"
          style="color: var(--color-text-primary)"
        >
          Filters
        </h2>
        <div class="w-9"></div>
      </div>

      <!-- ALL scrollable content including buttons -->
      <div
        class="overflow-y-auto px-5 py-4"
        style="-ms-overflow-style:none; scrollbar-width:none;"
      >
        <!-- Sort by -->
        <p
          class="text-sm font-bold mb-3"
          style="color: var(--color-text-primary)"
        >
          Sort by
        </p>
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            *ngFor="let chip of sortChips"
            (click)="draftFilters.sortBy = chip.value"
            class="px-4 py-2 rounded-full text-xs font-semibold transition-all"
            [style.background-color]="
              draftFilters.sortBy === chip.value
                ? 'var(--color-primary)'
                : 'var(--color-bg-secondary)'
            "
            [style.color]="
              draftFilters.sortBy === chip.value
                ? 'white'
                : 'var(--color-text-secondary)'
            "
          >
            {{ chip.label }}
          </button>
        </div>

        <!-- Price range -->
        <div
          class="rounded-2xl p-4 mb-5"
          style="background-color: var(--color-bg-secondary)"
        >
          <div class="flex items-center justify-between mb-4">
            <p
              class="text-sm font-bold"
              style="color: var(--color-text-primary)"
            >
              Price Range
            </p>
            <span
              class="text-xs font-semibold px-2 py-1 rounded-lg"
              style="background-color: var(--color-bg-primary); color: var(--color-primary)"
            >
              GHS {{ draftFilters.minPrice | number }} – GHS
              {{ draftFilters.maxPrice | number }}
            </span>
          </div>

          <!-- Bar graph visual -->
          <div class="mb-1" style="height: 48px;">
            <svg
              viewBox="0 0 300 48"
              preserveAspectRatio="none"
              style="width:100%;height:100%;"
            >
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stop-color="var(--color-primary)"
                    stop-opacity="0.25"
                  />
                  <stop
                    offset="100%"
                    stop-color="var(--color-primary)"
                    stop-opacity="0.04"
                  />
                </linearGradient>
              </defs>
              <path
                d="M0,44 C20,44 30,30 50,27 C70,24 80,18 100,13 C120,8 130,6 150,11 C170,16 180,4 200,7 C220,10 230,16 250,19 C270,22 280,29 300,44 Z"
                fill="url(#barGrad)"
              />
              <path
                d="M0,44 C20,44 30,30 50,27 C70,24 80,18 100,13 C120,8 130,6 150,11 C170,16 180,4 200,7 C220,10 230,16 250,19 C270,22 280,29 300,44"
                fill="none"
                stroke="var(--color-primary)"
                stroke-width="1.5"
                stroke-opacity="0.4"
              />
            </svg>
          </div>

          <!-- Custom dual range slider -->
          <div class="relative mb-5" style="height: 36px; padding: 0 10px;">
            <!-- Track background -->
            <div
              class="absolute rounded-full"
              style="
          top: 50%; transform: translateY(-50%);
          left: 10px; right: 10px; height: 4px;
          background-color: var(--color-border-light)"
            ></div>
            <!-- Active fill -->
            <div
              class="absolute rounded-full"
              style="
          top: 50%; transform: translateY(-50%);
          height: 4px;
          left: calc(10px + {{ (draftFilters.minPrice / maxPrice) * 100 }}%);
          width: {{
                ((draftFilters.maxPrice - draftFilters.minPrice) / maxPrice) *
                  100
              }}%;
          background-color: var(--color-primary)"
            ></div>
            <!-- Min thumb -->
            <!-- Min thumb -->
            <div
              class="absolute flex items-center justify-center rounded-full shadow-md"
              style="
    top: 50%; transform: translate(-50%, -50%);
    left: calc(10px + {{ (draftFilters.minPrice / maxPrice) * 100 }}%);
    width: 26px; height: 26px;
    background-color: var(--color-bg-primary);
    border: 2.5px solid var(--color-primary);
    z-index: 2; pointer-events: none;"
            >
              <div
                class="rounded-full"
                style="width:8px;height:8px;background-color:var(--color-primary)"
              ></div>
              <!-- Nudge lines -->
              <div
                class="absolute flex gap-0.5"
                style="top:50%;transform:translateY(-50%)"
              >
                <div
                  style="width:1.5px;height:8px;border-radius:2px;background-color:var(--color-primary);opacity:0.5"
                ></div>
                <div
                  style="width:1.5px;height:8px;border-radius:2px;background-color:var(--color-primary);opacity:0.5"
                ></div>
              </div>
            </div>

            <!-- Max thumb -->
            <div
              class="absolute flex items-center justify-center rounded-full shadow-md"
              style="
    top: 50%; transform: translate(-50%, -50%);
    left: calc(10px + {{ (draftFilters.maxPrice / maxPrice) * 100 }}%);
    width: 26px; height: 26px;
    background-color: var(--color-bg-primary);
    border: 2.5px solid var(--color-primary);
    z-index: 2; pointer-events: none;"
            >
              <div
                class="rounded-full"
                style="width:8px;height:8px;background-color:var(--color-primary)"
              ></div>
              <!-- Nudge lines -->
              <div
                class="absolute flex gap-0.5"
                style="top:50%;transform:translateY(-50%)"
              >
                <div
                  style="width:1.5px;height:8px;border-radius:2px;background-color:var(--color-primary);opacity:0.5"
                ></div>
                <div
                  style="width:1.5px;height:8px;border-radius:2px;background-color:var(--color-primary);opacity:0.5"
                ></div>
              </div>
            </div>
            <!-- Invisible range inputs on top -->
            <input
              type="range"
              min="0"
              [max]="maxPrice"
              step="100"
              [(ngModel)]="draftFilters.minPrice"
              (input)="clampMin()"
              class="absolute inset-0 w-full opacity-0 cursor-pointer"
              style="z-index:3; height:100%"
            />
            <input
              type="range"
              min="0"
              [max]="maxPrice"
              step="100"
              [(ngModel)]="draftFilters.maxPrice"
              (input)="clampMax()"
              class="absolute inset-0 w-full opacity-0 cursor-pointer"
              style="z-index:4; height:100%"
            />
          </div>

          <!-- Min / Max value boxes -->
          <div class="grid grid-cols-2 gap-3">
            <div
              class="rounded-xl p-3 flex flex-col gap-1"
              style="background-color: var(--color-bg-primary)"
            >
              <span class="text-xs" style="color: var(--color-text-secondary)"
                >Min price</span
              >
              <span
                class="text-sm font-bold"
                style="color: var(--color-text-primary)"
              >
                GHS {{ draftFilters.minPrice | number }}
              </span>
            </div>
            <div
              class="rounded-xl p-3 flex flex-col gap-1"
              style="background-color: var(--color-bg-primary)"
            >
              <span class="text-xs" style="color: var(--color-text-secondary)"
                >Max price</span
              >
              <span
                class="text-sm font-bold"
                style="color: var(--color-text-primary)"
              >
                GHS {{ draftFilters.maxPrice | number }}
              </span>
            </div>
          </div>
        </div>

        <!-- Filter rows -->
        <div
          class="rounded-2xl overflow-hidden mb-5"
          style="background-color: var(--color-bg-secondary)"
        >
          <!-- Min Rating -->
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom: 1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color: var(--color-text-primary)"
              >Min Rating</span
            >
            <div class="flex items-center gap-2">
              <button
                *ngFor="let r of [3, 4, 5]"
                (click)="
                  draftFilters.minRating = draftFilters.minRating === r ? 0 : r
                "
                class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                [style.background-color]="
                  draftFilters.minRating === r
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-primary)'
                "
                [style.color]="
                  draftFilters.minRating === r
                    ? 'white'
                    : 'var(--color-text-secondary)'
                "
              >
                <i
                  class="ri-star-fill text-yellow-400"
                  style="font-size:10px"
                ></i>
                {{ r }}+
              </button>
            </div>
          </div>

          <!-- City -->
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom: 1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color: var(--color-text-primary)"
              >City</span
            >
            <input
              [(ngModel)]="draftFilters.city"
              type="text"
              placeholder="e.g. Accra"
              class="text-sm text-right bg-transparent border-none outline-none w-32"
              style="color: var(--color-text-primary)"
            />
          </div>

          <!-- Verified -->
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom: 1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color: var(--color-text-primary)"
              >Verified Only</span
            >
            <button
              (click)="draftFilters.verifiedOnly = !draftFilters.verifiedOnly"
              class="w-12 h-6 rounded-full transition-all relative"
              [style.background-color]="
                draftFilters.verifiedOnly
                  ? 'var(--color-primary)'
                  : 'var(--color-border-light)'
              "
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                [style.left]="draftFilters.verifiedOnly ? '26px' : '2px'"
              ></span>
            </button>
          </div>

          <!-- Home service -->
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom: 1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color: var(--color-text-primary)"
              >Home Service</span
            >
            <button
              (click)="draftFilters.homeService = !draftFilters.homeService"
              class="w-12 h-6 rounded-full transition-all relative"
              [style.background-color]="
                draftFilters.homeService
                  ? 'var(--color-primary)'
                  : 'var(--color-border-light)'
              "
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                [style.left]="draftFilters.homeService ? '26px' : '2px'"
              ></span>
            </button>
          </div>

          <!-- Has discount -->
          <div class="flex items-center justify-between px-4 py-4">
            <span class="text-sm" style="color: var(--color-text-primary)"
              >Has Discount</span
            >
            <button
              (click)="draftFilters.hasDiscount = !draftFilters.hasDiscount"
              class="w-12 h-6 rounded-full transition-all relative"
              [style.background-color]="
                draftFilters.hasDiscount
                  ? 'var(--color-primary)'
                  : 'var(--color-border-light)'
              "
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                [style.left]="draftFilters.hasDiscount ? '26px' : '2px'"
              ></span>
            </button>
          </div>
        </div>

        <!-- Action buttons — part of scroll flow -->
        <div class="grid grid-cols-2 gap-3 pb-8">
          <button
            (click)="clearFilters()"
            class="py-4 rounded-2xl text-sm font-semibold transition-all"
            style="background-color: var(--color-bg-secondary); color: var(--color-text-secondary)"
          >
            Clear all
          </button>
          <button
            (click)="applyFilters()"
            class="py-4 rounded-2xl text-sm font-bold text-white transition-all"
            style="background-color: var(--color-primary)"
          >
            Apply
          </button>
        </div>
      </div>
    </div>

    <!-- Sheet -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 flex flex-col transition-transform duration-300 rounded-t-3xl overflow-hidden"
      style="background-color: var(--color-bg-primary); max-height: 90vh;
             transform: {{
        showFilters ? 'translateY(0)' : 'translateY(100%)'
      }}"
    >
      <!-- Handle -->
      <div class="flex justify-center pt-3 pb-1 flex-shrink-0">
        <div
          class="w-10 h-1 rounded-full"
          style="background-color: var(--color-border-light)"
        ></div>
      </div>

      <!-- Sheet header -->
      <div
        class="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style="border-bottom: 1px solid var(--color-border-light)"
      >
        <button
          (click)="closeFilters()"
          class="w-9 h-9 rounded-xl flex items-center justify-center"
          style="background-color: var(--color-bg-secondary)"
        >
          <i
            class="ri-arrow-left-s-line text-lg"
            style="color: var(--color-text-primary)"
          ></i>
        </button>
        <h2
          class="text-base font-bold"
          style="color: var(--color-text-primary)"
        >
          Filters
        </h2>
        <div class="w-9"></div>
      </div>

      <!-- Scrollable content -->
      <div
        class="flex-1 overflow-y-auto px-5 py-4"
        style="-ms-overflow-style:none; scrollbar-width:none;"
      >
        <!-- Sort by -->
        <p
          class="text-sm font-bold mb-3"
          style="color: var(--color-text-primary)"
        >
          Sort by
        </p>
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            *ngFor="let chip of sortChips"
            (click)="draftFilters.sortBy = chip.value"
            class="px-4 py-2 rounded-full text-xs font-semibold transition-all"
            [style.background-color]="
              draftFilters.sortBy === chip.value
                ? 'var(--color-primary)'
                : 'var(--color-bg-secondary)'
            "
            [style.color]="
              draftFilters.sortBy === chip.value
                ? 'white'
                : 'var(--color-text-secondary)'
            "
          >
            {{ chip.label }}
          </button>
        </div>

        <!-- Price range -->
        <div
          class="rounded-2xl p-4 mb-5"
          style="background-color: var(--color-bg-secondary)"
        >
          <p
            class="text-sm font-bold mb-4"
            style="color: var(--color-text-primary)"
          >
            Price Range
          </p>

          <!-- Bar graph visual -->
          <div class="mb-3" style="height: 44px;">
            <svg
              viewBox="0 0 300 44"
              preserveAspectRatio="none"
              style="width:100%;height:100%;"
            >
              <path
                d="M0,40 C20,40 30,26 50,24 C70,22 80,16 100,12 C120,8 130,6 150,10 C170,14 180,4 200,6 C220,8 230,14 250,16 C270,18 280,26 300,40 Z"
                fill="var(--color-border-light)"
                opacity="0.8"
              />
            </svg>
          </div>

          <!-- Range inputs stacked -->
          <div class="relative mb-4" style="height: 24px;">
            <div class="absolute inset-y-0 left-0 right-0 flex items-center">
              <div
                class="w-full h-1 rounded-full"
                style="background-color: var(--color-border-light)"
              >
                <div
                  class="h-full rounded-full"
                  style="background-color: var(--color-primary);
                  margin-left: {{ (draftFilters.minPrice / maxPrice) * 100 }}%;
                  width: {{
                    ((draftFilters.maxPrice - draftFilters.minPrice) /
                      maxPrice) *
                      100
                  }}%"
                ></div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              [max]="maxPrice"
              step="500"
              [(ngModel)]="draftFilters.minPrice"
              (input)="clampMin()"
              class="absolute inset-0 w-full opacity-0 cursor-pointer"
              style="z-index:2"
            />
            <input
              type="range"
              min="0"
              [max]="maxPrice"
              step="500"
              [(ngModel)]="draftFilters.maxPrice"
              (input)="clampMax()"
              class="absolute inset-0 w-full opacity-0 cursor-pointer"
              style="z-index:3"
            />
          </div>

          <!-- Min / Max labels -->
          <div class="flex justify-between">
            <div class="flex flex-col items-center">
              <span
                class="text-xs mb-1"
                style="color: var(--color-text-secondary)"
                >min. price</span
              >
              <span
                class="text-sm font-semibold px-3 py-1.5 rounded-xl"
                style="background-color: var(--color-bg-primary); color: var(--color-text-primary)"
              >
                GHS {{ draftFilters.minPrice | number }}
              </span>
            </div>
            <div class="flex flex-col items-center">
              <span
                class="text-xs mb-1"
                style="color: var(--color-text-secondary)"
                >max. price</span
              >
              <span
                class="text-sm font-semibold px-3 py-1.5 rounded-xl"
                style="background-color: var(--color-bg-primary); color: var(--color-text-primary)"
              >
                GHS {{ draftFilters.maxPrice | number }}
              </span>
            </div>
          </div>
        </div>

        <!-- Filter rows -->
        <div
          class="rounded-2xl overflow-hidden"
          style="background-color: var(--color-bg-secondary)"
        >
          <!-- Min Rating -->
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom: 1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color: var(--color-text-primary)"
              >Min Rating</span
            >
            <div class="flex items-center gap-2">
              <button
                *ngFor="let r of [3, 4, 5]"
                (click)="
                  draftFilters.minRating = draftFilters.minRating === r ? 0 : r
                "
                class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                [style.background-color]="
                  draftFilters.minRating === r
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-primary)'
                "
                [style.color]="
                  draftFilters.minRating === r
                    ? 'white'
                    : 'var(--color-text-secondary)'
                "
              >
                <i
                  class="ri-star-fill text-yellow-400"
                  style="font-size:10px"
                ></i>
                {{ r }}+
              </button>
            </div>
          </div>

          <!-- City -->
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom: 1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color: var(--color-text-primary)"
              >City</span
            >
            <input
              [(ngModel)]="draftFilters.city"
              type="text"
              placeholder="e.g. Accra"
              class="text-sm text-right bg-transparent border-none outline-none w-32"
              style="color: var(--color-text-primary)"
            />
          </div>

          <!-- Verified -->
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom: 1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color: var(--color-text-primary)"
              >Verified Only</span
            >
            <button
              (click)="draftFilters.verifiedOnly = !draftFilters.verifiedOnly"
              class="w-12 h-6 rounded-full transition-all relative"
              [style.background-color]="
                draftFilters.verifiedOnly
                  ? 'var(--color-primary)'
                  : 'var(--color-border-light)'
              "
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                [style.left]="draftFilters.verifiedOnly ? '26px' : '2px'"
              ></span>
            </button>
          </div>

          <!-- Home service -->
          <div
            class="flex items-center justify-between px-4 py-4"
            style="border-bottom: 1px solid var(--color-border-light)"
          >
            <span class="text-sm" style="color: var(--color-text-primary)"
              >Home Service</span
            >
            <button
              (click)="draftFilters.homeService = !draftFilters.homeService"
              class="w-12 h-6 rounded-full transition-all relative"
              [style.background-color]="
                draftFilters.homeService
                  ? 'var(--color-primary)'
                  : 'var(--color-border-light)'
              "
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                [style.left]="draftFilters.homeService ? '26px' : '2px'"
              ></span>
            </button>
          </div>

          <!-- Has discount -->
          <div class="flex items-center justify-between px-4 py-4">
            <span class="text-sm" style="color: var(--color-text-primary)"
              >Has Discount</span
            >
            <button
              (click)="draftFilters.hasDiscount = !draftFilters.hasDiscount"
              class="w-12 h-6 rounded-full transition-all relative"
              [style.background-color]="
                draftFilters.hasDiscount
                  ? 'var(--color-primary)'
                  : 'var(--color-border-light)'
              "
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                [style.left]="draftFilters.hasDiscount ? '26px' : '2px'"
              ></span>
            </button>
          </div>
        </div>

        <div class="h-4"></div>
      </div>

      <!-- Bottom actions -->
      <div
        class="flex gap-3 px-5 py-4 flex-shrink-0"
        style="border-top: 1px solid var(--color-border-light); background-color: var(--color-bg-primary)"
      >
        <button
          (click)="clearFilters()"
          class="flex-1 py-4 rounded-2xl text-sm font-semibold transition-all"
          style="background-color: var(--color-bg-secondary); color: var(--color-text-secondary)"
        >
          Clear all
        </button>
        <button
          (click)="applyFilters()"
          class="flex-1 py-4 rounded-2xl text-sm font-bold text-white transition-all"
          style="background-color: var(--color-primary)"
        >
          Apply
        </button>
      </div>
    </div>
  `,
})
export class DiscoverComponent implements OnInit {
  query = "";
  loading = true;
  loadingMore = false;
  showFilters = false;
  activeSort = "";
  beauticians: BeauticianProfile[] = [];
  total = 0;
  page = 1;
  maxPrice = 10000;

  filters = {
    sortBy: "",
    minRating: 0,
    city: "",
    minPrice: 0,
    maxPrice: 1000,
    verifiedOnly: false,
    homeService: false,
    hasDiscount: false,
  };

  // Draft copy — only committed when Apply is tapped
  draftFilters = {
    sortBy: "",
    minRating: 0,
    city: "",
    minPrice: 0,
    maxPrice: 10000,
    verifiedOnly: false,
    homeService: false,
    hasDiscount: false,
  };

  sortChips = [
    { label: "Best Match", value: "" },
    { label: "Top Rated", value: "rating" },
    { label: "Most Reviews", value: "reviews" },
    { label: "Nearest", value: "nearest" },
  ];

  get hasActiveFilters(): boolean {
    return !!(
      this.filters.sortBy ||
      this.filters.minRating ||
      this.filters.city ||
      this.filters.minPrice > 0 ||
      this.filters.maxPrice < this.maxPrice ||
      this.filters.verifiedOnly ||
      this.filters.homeService ||
      this.filters.hasDiscount
    );
  }

  get activeFilterCount(): number {
    return [
      this.filters.sortBy,
      this.filters.minRating,
      this.filters.city,
      this.filters.minPrice > 0,
      this.filters.maxPrice < this.maxPrice,
      this.filters.verifiedOnly,
      this.filters.homeService,
      this.filters.hasDiscount,
    ].filter(Boolean).length;
  }

  constructor(
    private http: HttpClient,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadBeauticians();
  }

  openFilters(): void {
    this.draftFilters = { ...this.filters };
    this.showFilters = true;
    document.body.style.overflow = "hidden";
  }

  closeFilters(): void {
    this.showFilters = false;
    document.body.style.overflow = "";
  }

  applyFilters(): void {
    this.filters = { ...this.draftFilters };
    this.activeSort = this.filters.sortBy;
    this.closeFilters();
    this.loadBeauticians();
  }

  clearFilters(): void {
    this.draftFilters = {
      sortBy: "",
      minRating: 0,
      city: "",
      minPrice: 0,
      maxPrice: this.maxPrice,
      verifiedOnly: false,
      homeService: false,
      hasDiscount: false,
    };
  }

  clampMin(): void {
    if (this.draftFilters.minPrice >= this.draftFilters.maxPrice) {
      this.draftFilters.minPrice = this.draftFilters.maxPrice - 500;
    }
  }

  clampMax(): void {
    if (this.draftFilters.maxPrice <= this.draftFilters.minPrice) {
      this.draftFilters.maxPrice = this.draftFilters.minPrice + 500;
    }
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

  loadBeauticians(append = false): void {
    if (!append) {
      this.loading = true;
      this.page = 1;
    } else {
      this.loadingMore = true;
    }

    const params: Record<string, string> = {
      page: String(this.page),
      limit: "12",
    };
    if (this.query) params["query"] = this.query;
    if (this.filters.sortBy) params["sortBy"] = this.filters.sortBy;
    if (this.filters.minRating)
      params["minRating"] = String(this.filters.minRating);
    if (this.filters.city) params["city"] = this.filters.city;
    if (this.filters.minPrice > 0)
      params["minPrice"] = String(this.filters.minPrice);
    if (this.filters.maxPrice < this.maxPrice)
      params["maxPrice"] = String(this.filters.maxPrice);
    if (this.filters.verifiedOnly) params["verified"] = "true";
    if (this.filters.homeService) params["homeService"] = "true";
    if (this.filters.hasDiscount) params["hasDiscount"] = "true";

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
    this.router.navigate(["/client/salon", id]);
  }
  favorite(event: Event, salon: BeauticianProfile): void {
    event.stopPropagation();
  }
}
