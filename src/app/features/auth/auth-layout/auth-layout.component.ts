// ============================================================
// auth-layout.component.ts  —  Updated
// The left marquee panel now lives inside login.component,
// so this layout is a simple full-width shell with a theme toggle.
// ============================================================

import { Component } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="auth-shell" style="background-color: var(--color-background)">

      <!-- Theme toggle — top-right corner, sits above everything -->
      <button
        (click)="toggleTheme()"
        class="theme-toggle"
        [title]="themeService.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <i
          class="text-base"
          [class]="themeService.isDark ? 'ri-sun-line' : 'ri-moon-line'"
          style="color: var(--color-text-secondary)"
        ></i>
      </button>

      <!-- Each auth page (login, register, etc.) renders here.
           login.component owns the left/right split layout internally. -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .auth-shell {
      position: relative;
      min-height: 100vh;
    }
    .theme-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100;
      width: 36px; height: 36px;
      border-radius: 10px;
      border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      background-color: var(--color-bg-secondary);
      transition: opacity 0.2s;
    }
    .theme-toggle:hover { opacity: 0.8; }
  `],
})
export class AuthLayoutComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggle();
  }
}