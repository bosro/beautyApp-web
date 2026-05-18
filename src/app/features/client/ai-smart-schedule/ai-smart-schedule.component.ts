// src/app/features/client/ai-smart-schedule/ai-smart-schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

interface SmartSlot {
  dayName: string;
  date: string;
  time: string;
  popularity: 'low' | 'medium' | 'high';
  discount?: number;
  waitTime: string;
  aiReason: string;
  score: number;
}

@Component({
  selector: 'app-ai-smart-schedule',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-16">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3">
        <button onclick="history.back()" class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center">
          <i class="ri-arrow-left-line text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Smart Scheduling</h1>
        <span class="ml-auto text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
          <i class="ri-robot-2-line"></i> AI Powered
        </span>
      </div>

      <div class="max-w-2xl mx-auto p-4 space-y-5">

        <!-- Info card -->
        <div class="card p-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800">
          <i class="ri-lightbulb-line text-amber-500 text-xl flex-shrink-0 mt-0.5"></i>
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300">Personalized for You</p>
            <p class="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
              {{ loading ? 'Analyzing traffic patterns and your booking history...' : summary || 'AI-ranked time slots based on salon traffic and your preferences.' }}
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="card p-12 flex flex-col items-center gap-4">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <i class="ri-robot-2-line text-[var(--color-primary)] text-xl"></i>
            </div>
          </div>
          <p class="text-sm text-[var(--color-text-secondary)] text-center">
            Gemini is finding the best appointment times for you...
          </p>
        </div>

        <!-- Slots -->
        <ng-container *ngIf="!loading">

          <!-- Best slot -->
          <div *ngIf="slots.length > 0" class="space-y-3">
            <div class="flex items-center gap-2">
              <i class="ri-star-fill text-amber-400"></i>
              <h3 class="font-semibold text-[var(--color-text-primary)]">Best Match</h3>
            </div>

            <div
              *ngFor="let slot of slots; let i = index"
              (click)="selectSlot(slot)"
              class="card p-4 cursor-pointer transition-all"
              [ngClass]="{
                'border-2 border-green-400': i === 0 && selectedKey !== slotKey(slot),
                'border-2 border-[var(--color-primary)] shadow-lg': selectedKey === slotKey(slot),
                'border border-[var(--color-border)]': i > 0 && selectedKey !== slotKey(slot)
              }"
            >
              <!-- Section label -->
              <p *ngIf="i === 1" class="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 -mt-1">
                Other Available Times
              </p>

              <div class="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-border)]">
                <div>
                  <p class="font-semibold text-[var(--color-text-primary)]">{{ slot.dayName }}</p>
                  <p class="text-sm text-[var(--color-text-secondary)]">
                    {{ slot.date | date:'MMM d' }}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm">
                    {{ slot.time }}
                  </span>
                  <div *ngIf="selectedKey === slotKey(slot)" class="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                    <i class="ri-check-line text-white text-sm"></i>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-1 rounded-full font-semibold border"
                        [ngClass]="popularityClass(slot.popularity)">
                    {{ popularityLabel(slot.popularity) }}
                  </span>
                  <span *ngIf="slot.discount" class="text-xs px-2 py-1 rounded-full bg-red-500 text-white font-bold">
                    {{ slot.discount }}% OFF
                  </span>
                  <span class="text-xs text-[var(--color-text-muted)] ml-auto">
                    <i class="ri-time-line mr-0.5"></i>{{ slot.waitTime }}
                  </span>
                </div>

                <div class="flex items-start gap-2 p-2.5 bg-[var(--color-background)] rounded-xl">
                  <i class="ri-robot-2-line text-[var(--color-primary)] text-sm flex-shrink-0 mt-0.5"></i>
                  <p class="text-xs text-[var(--color-text-primary)] leading-relaxed">{{ slot.aiReason }}</p>
                </div>
              </div>

              <!-- Best badge -->
              <div *ngIf="i === 0" class="absolute -top-2 -left-2">
                <span class="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow">⭐ Best</span>
              </div>
            </div>
          </div>

          <p *ngIf="slots.length === 0 && !loading" class="text-sm text-[var(--color-text-secondary)] text-center py-8">
            No AI recommendations available. Please use manual booking.
          </p>

          <!-- OR Manual -->
          <div class="flex items-center gap-4">
            <div class="flex-1 h-px bg-[var(--color-border)]"></div>
            <span class="text-sm text-[var(--color-text-muted)]">OR</span>
            <div class="flex-1 h-px bg-[var(--color-border)]"></div>
          </div>

          <button
            (click)="goManual()"
            class="w-full py-3 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl text-sm font-semibold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            Choose Time Manually
          </button>

          <!-- Book button -->
          <button
            [disabled]="!selectedKey"
            (click)="bookSelected()"
            class="w-full py-4 rounded-2xl text-base font-bold transition-opacity"
            [ngClass]="selectedKey ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed'"
          >
            {{ selectedKey ? 'Book Selected Time' : 'Select a Time Slot Above' }}
          </button>
        </ng-container>

      </div>
    </div>
  `,
})
export class AiSmartScheduleComponent implements OnInit {
  slots: SmartSlot[] = [];
  summary = '';
  loading = true;
  selectedKey: string | null = null;

  private beauticianId = '';
  private serviceId = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.beauticianId = this.route.snapshot.queryParams['beauticianId'] || '';
    this.serviceId = this.route.snapshot.queryParams['serviceId'] || '';
    this.loadSchedule();
  }

  loadSchedule() {
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/ai/smart-schedule`, {
      beauticianId: this.beauticianId,
      serviceId: this.serviceId,
    }).subscribe({
      next: (res) => {
        this.slots = res.data.recommendations;
        this.summary = res.data.summary;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Could not load AI schedule. Try manual booking.');
        this.loading = false;
      },
    });
  }

  slotKey(slot: SmartSlot) { return `${slot.date}-${slot.time}`; }
  selectSlot(slot: SmartSlot) { this.selectedKey = this.slotKey(slot); }

  popularityLabel(p: string) {
    return { low: 'Low Traffic', medium: 'Moderate', high: 'High Traffic' }[p] || p;
  }

  popularityClass(p: string) {
    return {
      low: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      medium: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
      high: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    }[p] || '';
  }

  bookSelected() {
    if (!this.selectedKey) return;
    this.router.navigate(['/client/book'], {
      queryParams: { beauticianId: this.beauticianId, serviceId: this.serviceId },
    });
  }

  goManual() {
    this.router.navigate(['/client/book'], {
      queryParams: { beauticianId: this.beauticianId, serviceId: this.serviceId },
    });
  }
}