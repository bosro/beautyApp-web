import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-schedule',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Working Hours</h1>
        <button (click)="save()" [disabled]="saving" class="btn-primary text-sm px-3 py-2">
          <span *ngIf="!saving">Save</span>
          <span *ngIf="saving" class="flex items-center gap-1.5"><i class="ri-loader-4-line animate-spin"></i> Saving</span>
        </button>
      </div>

      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div *ngFor="let i of [1,2,3,4,5,6,7]" class="skeleton h-16 rounded-xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-3">

        <p class="text-sm text-[var(--color-text-secondary)]">Set your availability for each day. Clients can only book within these hours.</p>

        <div *ngFor="let day of schedule" class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <button (click)="day.isOpen = !day.isOpen"
                class="relative w-11 h-6 rounded-full transition-colors"
                [ngClass]="day.isOpen ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  [ngClass]="day.isOpen ? 'translate-x-5' : 'translate-x-0'"></span>
              </button>
              <span class="font-semibold text-[var(--color-text-primary)]">{{ day.day }}</span>
            </div>
            <span *ngIf="!day.isOpen" class="text-xs text-[var(--color-text-muted)]">Closed</span>
            <span *ngIf="day.isOpen" class="text-xs text-green-500 font-medium">Open</span>
          </div>

          <div *ngIf="day.isOpen" class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-[var(--color-text-muted)] mb-1">Opens at</label>
              <input [(ngModel)]="day.openTime" type="time" class="form-input text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[var(--color-text-muted)] mb-1">Closes at</label>
              <input [(ngModel)]="day.closeTime" type="time" class="form-input text-sm" />
            </div>
          </div>
        </div>

        <!-- Break Time -->
        <div class="card p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-[var(--color-text-primary)]">Lunch Break</h3>
              <p class="text-xs text-[var(--color-text-muted)]">Block time for a daily break</p>
            </div>
            <button (click)="hasBreak = !hasBreak"
              class="relative w-11 h-6 rounded-full transition-colors"
              [ngClass]="hasBreak ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [ngClass]="hasBreak ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>
          <div *ngIf="hasBreak" class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-[var(--color-text-muted)] mb-1">Break start</label>
              <input [(ngModel)]="breakStart" type="time" class="form-input text-sm" />
            </div>
            <div>
              <label class="block text-xs text-[var(--color-text-muted)] mb-1">Break end</label>
              <input [(ngModel)]="breakEnd" type="time" class="form-input text-sm" />
            </div>
          </div>
        </div>

        <!-- Booking Buffer -->
        <div class="card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Booking Buffer</h3>
          <p class="text-xs text-[var(--color-text-muted)]">Minimum time between bookings</p>
          <select [(ngModel)]="bufferTime" class="form-input">
            <option [value]="0">No buffer</option>
            <option [value]="15">15 minutes</option>
            <option [value]="30">30 minutes</option>
            <option [value]="60">1 hour</option>
          </select>
        </div>

      </div>
    </div>
  `,
})
export class ScheduleComponent implements OnInit {
  loading = true;
  saving = false;
  hasBreak = false;
  breakStart = '13:00';
  breakEnd = '14:00';
  bufferTime = 15;

  schedule = [
    { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
    { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '14:00' },
  ];

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/beauticians/schedule`).subscribe({
      next: (res) => {
        if (res.data?.schedule) this.schedule = res.data.schedule;
        if (res.data?.break) {
          this.hasBreak = true;
          this.breakStart = res.data.break.start;
          this.breakEnd = res.data.break.end;
        }
        this.bufferTime = res.data?.bufferTime ?? 15;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  save() {
    this.saving = true;
    const body = {
      schedule: this.schedule,
      break: this.hasBreak ? { start: this.breakStart, end: this.breakEnd } : null,
      bufferTime: this.bufferTime,
    };
    this.http.put(`${environment.apiUrl}/beauticians/schedule`, body).subscribe({
      next: () => { this.saving = false; this.toast.success('Schedule saved!'); },
      error: () => { this.saving = false; this.toast.error('Save failed'); }
    });
  }
}
