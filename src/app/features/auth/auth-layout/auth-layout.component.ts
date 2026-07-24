// ============================================================
// auth-layout.component.ts — h-screen + overflow-hidden always,
// with min-h-0 on the nested flex column so the form-area's
// overflow-y-auto actually gets a bounded box to scroll within.
// ============================================================

import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div
      class="flex h-screen overflow-hidden"
      style="background-color: var(--color-background)"
    >
      <!-- RIGHT / FULL-WIDTH PANEL -->
      <div class="flex-1 flex flex-col min-w-0 min-h-0">

        <!-- Top bar — only on non-login routes -->
        <ng-container *ngIf="!isLoginRoute">
          <div class="flex items-center justify-between px-6 pt-6 lg:justify-end lg:px-10 lg:pt-8">
            <div class="flex items-center gap-2 lg:hidden">
              <img src="assets/images/logo.png" alt="Bigluxx" class="logo-light h-8 w-auto object-contain" />
              <img src="assets/images/logo-dark.png" alt="Bigluxx" class="logo-dark h-8 w-auto object-contain" />
            </div>
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
        </ng-container>

        <!-- Form area -->
        <div
          [class]="isLoginRoute
            ? 'flex-1 flex items-center justify-center min-h-0 p-0 overflow-hidden'
            : 'flex-1 flex items-start justify-center overflow-y-auto min-h-0 px-6 py-8 lg:px-12 xl:px-16'"
        >
          <div [ngClass]="isLoginRoute ? 'w-full h-full' : 'w-full max-w-md'">
            <router-outlet></router-outlet>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class AuthLayoutComponent implements OnInit {
  isLoginRoute = false;

  constructor(
    public themeService: ThemeService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.checkRoute(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.checkRoute(e.urlAfterRedirects));
  }

  private checkRoute(url: string): void {
    this.isLoginRoute = /\/auth(\/login)?(\/)?(\?.*)?$/.test(url);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}