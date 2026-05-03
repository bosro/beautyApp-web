import { Component } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="min-h-screen flex" style="background-color: var(--color-bg-primary)">
      <!-- LEFT PANEL — hidden on mobile, shown on lg+ -->
      <div
        class="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-shrink-0 gradient-primary flex-col justify-between p-12 relative overflow-hidden"
      >
        <!-- Background pattern circles -->
        <div
          class="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10"
          style="background: white"
        ></div>
        <div
          class="absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-10"
          style="background: white"
        ></div>

        <!-- Logo -->
        <div class="relative z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <i class="ri-scissors-line text-white text-xl"></i>
            </div>
            <span class="text-white text-2xl font-bold tracking-tight">BeautyHub</span>
          </div>
        </div>

        <!-- Center content -->
        <div class="relative z-10">
          <h1 class="text-white text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Beauty Made<br />Simple for<br />Everyone
          </h1>
          <p class="text-white/80 text-lg leading-relaxed mb-8">
            Whether you need a service or offer one — booking and managing appointments is effortless.
          </p>

          <!-- Feature pills -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3 text-white/90">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i class="ri-map-pin-2-line text-sm"></i>
              </div>
              <span class="text-sm">Find beauticians near you</span>
            </div>
            <div class="flex items-center gap-3 text-white/90">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i class="ri-calendar-check-line text-sm"></i>
              </div>
              <span class="text-sm">Book appointments instantly</span>
            </div>
            <div class="flex items-center gap-3 text-white/90">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i class="ri-star-line text-sm"></i>
              </div>
              <span class="text-sm">Verified, rated professionals</span>
            </div>
          </div>
        </div>

        <!-- Footer text -->
        <div class="relative z-10">
          <p class="text-white/50 text-xs">© 2025 BeautyHub · Accra, Ghana</p>
        </div>
      </div>

      <!-- RIGHT PANEL — form area -->
      <div class="flex-1 flex flex-col">
        <!-- Top bar mobile logo + theme toggle -->
        <div class="flex items-center justify-between px-6 pt-6 lg:justify-end lg:px-10 lg:pt-8">
          <div class="flex items-center gap-2 lg:hidden">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: var(--color-primary)">
              <i class="ri-scissors-line text-white text-sm"></i>
            </div>
            <span class="font-bold text-lg" style="color: var(--color-text-primary)">BeautyHub</span>
          </div>

          <!-- Theme toggle -->
          <button
            (click)="toggleTheme()"
            class="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
            style="background-color: var(--color-bg-secondary)"
            [title]="themeService.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <i
              class="text-base"
              [class]="themeService.isDark ? 'ri-sun-line' : 'ri-moon-line'"
              style="color: var(--color-text-secondary)"
            ></i>
          </button>
        </div>

        <!-- Form content -->
        <div class="flex-1 flex items-center justify-center px-6 py-8 lg:px-12 xl:px-16">
          <div class="w-full max-w-md">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
