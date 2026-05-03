import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ThemeMode } from '../models';

const THEME_KEY = '@app_theme_mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _mode = new BehaviorSubject<ThemeMode>('system');
  mode$ = this._mode.asObservable();

  get isDark(): boolean {
    const mode = this._mode.value;
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  constructor() {
    this.load();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this._mode.value === 'system') this.applyTheme();
    });
  }

  private load(): void {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (saved) {
      this._mode.next(saved);
    }
    this.applyTheme();
  }

  setMode(mode: ThemeMode): void {
    this._mode.next(mode);
    localStorage.setItem(THEME_KEY, mode);
    this.applyTheme();
  }

  getMode(): string {
    return this._mode.value;
  }

  toggle(): void {
    this.setMode(this.isDark ? 'light' : 'dark');
  }

  private applyTheme(): void {
    const dark = this.isDark;
    document.body.classList.toggle('dark', dark);
  }
}
