// schedule.component.ts
// Replaces the simple "Working Hours" web component.
// Mirrors mobile BeauticianScheduleScreen: per-day toggle, slot grid, edit-hours nav.
// Mobile uses GET /users/beautician/profile to get beauticianId, then GET/PUT /beauticians/schedule.
// Slot shape: { id, startTime, isAvailable, isBooked }
// Day shape:  { day, isOpen, openingTime, closingTime, slotDuration, slots[], breakTimes[] }

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

interface DaySchedule {
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  slotDuration: number;
  slots: SlotRecord[];
  breakTimes: { startTime: string; endTime: string }[];
}

interface SlotRecord {
  id: string;
  startTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  isBreak?: boolean; // ← add this
}

@Component({
  selector: "app-schedule",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <!-- Header -->
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center justify-between"
      >
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
          My Schedule
        </h1>
        <button
          (click)="loadSchedule()"
          class="text-sm text-[var(--color-primary)] font-medium flex items-center gap-1"
        >
          <i class="ri-refresh-line"></i> Refresh
        </button>
      </div>

      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div
          *ngFor="let i of [1, 2, 3, 4, 5, 6, 7]"
          class="skeleton h-16 rounded-xl"
        ></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
        <!-- Summary Banner — mirrors mobile summaryCard -->
        <div
          class="rounded-xl p-4 flex items-center gap-3"
          style="background: color-mix(in srgb, var(--color-primary) 12%, transparent)"
        >
          <i class="ri-calendar-line text-[var(--color-primary)] text-2xl"></i>
          <div>
            <p class="font-semibold text-[var(--color-primary)]">
              Weekly Schedule
            </p>
            <p class="text-sm text-[var(--color-text-secondary)]">
              {{ activeDaysCount }} days active this week
            </p>
          </div>
        </div>

        <!-- Working Days — mirrors mobile dayCard list -->
        <div>
          <h2 class="font-semibold text-[var(--color-text-primary)] mb-3">
            Working Days
          </h2>
          <div class="space-y-2">
            <div
              *ngFor="let day of schedule"
              class="card p-4 flex items-center justify-between"
            >
              <div class="flex-1">
                <p class="font-semibold text-[var(--color-text-primary)]">
                  {{ day.day }}
                </p>
                <p
                  *ngIf="day.isOpen"
                  class="text-xs text-[var(--color-text-secondary)]"
                >
                  {{ day.openingTime }} – {{ day.closingTime }}
                </p>
                <p *ngIf="!day.isOpen" class="text-xs text-red-400">Closed</p>
              </div>
              <!-- Toggle -->
              <button
                (click)="toggleDay(day)"
                [disabled]="togglingDay === day.day"
                class="relative w-11 h-6 rounded-full transition-colors disabled:opacity-50"
                [ngClass]="
                  day.isOpen
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-gray-300 dark:bg-gray-600'
                "
              >
                <span
                  *ngIf="togglingDay === day.day"
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <i
                    class="ri-loader-4-line animate-spin text-white text-xs"
                  ></i>
                </span>
                <span
                  *ngIf="togglingDay !== day.day"
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  [ngClass]="day.isOpen ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Day selector for time slots — mirrors mobile horizontal day selector -->
        <div>
          <h2 class="font-semibold text-[var(--color-text-primary)] mb-3">
            Manage Time Slots
          </h2>
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              *ngFor="let day of schedule"
              (click)="selectedDay = day.day"
              [disabled]="!day.isOpen"
              class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-40"
              [ngClass]="
                selectedDay === day.day
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-[var(--color-background)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
              "
            >
              {{ day.day.substring(0, 3) }}
            </button>
          </div>
        </div>

        <!-- Slots for selected day -->
        <div *ngIf="selectedDaySchedule as day">
          <!-- Slot header + Edit Hours link -->
          <div class="flex items-center justify-between mb-3">
            <p class="font-semibold text-[var(--color-text-primary)]">
              {{ selectedDay }} Time Slots
            </p>
            <button
              (click)="editHours(selectedDay)"
              class="flex items-center gap-1 text-sm text-[var(--color-primary)] font-medium"
            >
              <i class="ri-pencil-line"></i> Edit Hours
            </button>
          </div>

          <!-- No slots yet -->
          <div
            *ngIf="!day.slots || day.slots.length === 0"
            class="card p-8 flex flex-col items-center text-center"
          >
            <i
              class="ri-time-line text-4xl text-[var(--color-text-muted)] mb-3"
            ></i>
            <p class="font-semibold text-[var(--color-text-primary)] mb-1">
              No time slots configured
            </p>
            <p class="text-sm text-[var(--color-text-secondary)] mb-4">
              Set working hours to generate slots automatically
            </p>
            <button
              (click)="editHours(selectedDay)"
              class="btn-primary text-sm px-4 py-2"
            >
              Add Time Slots
            </button>
          </div>

          <!-- Slot grid — mirrors mobile slotsGrid -->
          <div
            *ngIf="day.slots && day.slots.length > 0"
            class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2"
          >
            <button
              *ngFor="let slot of day.slots"
              (click)="!slot.isBreak && toggleSlot(slot)"
              [disabled]="
                slot.isBooked || slot.isBreak || togglingSlot === slot.id
              "
              class="rounded-xl p-2 text-center border-2 transition-colors disabled:cursor-not-allowed"
              [ngClass]="getSlotClass(slot)"
            >
              <p class="text-xs font-semibold mb-1">{{ slot.startTime }}</p>
              <span *ngIf="togglingSlot === slot.id" class="text-[10px]">
                <i class="ri-loader-4-line animate-spin"></i>
              </span>
              <span
                *ngIf="togglingSlot !== slot.id && slot.isBooked"
                class="text-[10px] font-semibold text-red-500"
                >Booked</span
              >
              <span
                *ngIf="togglingSlot !== slot.id && slot.isBreak"
                class="text-[10px] font-semibold text-orange-500"
                >Break</span
              >
              <span
                *ngIf="
                  togglingSlot !== slot.id &&
                  !slot.isBooked &&
                  !slot.isBreak &&
                  slot.isAvailable
                "
                class="text-[10px] font-semibold text-green-500"
                >Open</span
              >
              <span
                *ngIf="
                  togglingSlot !== slot.id &&
                  !slot.isBooked &&
                  !slot.isBreak &&
                  !slot.isAvailable
                "
                class="text-[10px] font-semibold text-[var(--color-text-muted)]"
                >Blocked</span
              >
            </button>
          </div>

          <!-- Legend -->
          <div
            class="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-muted)]"
          >
            <span class="flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-full bg-green-400"></span> Open
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span> Booked
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Break
            </span>
            <span class="flex items-center gap-1">
              <span
                class="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"
              ></span>
              Blocked
            </span>
          </div>
        </div>

        <!-- Quick actions — mirrors mobile quickActions -->
        <div class="grid grid-cols-2 gap-3">
          <button
            (click)="openCopyModal()"
            class="card p-4 flex flex-col items-center gap-2 hover:border-[var(--color-primary)] transition-colors"
          >
            <i
              class="ri-file-copy-line text-2xl text-[var(--color-primary)]"
            ></i>
            <span class="text-sm font-medium text-[var(--color-text-primary)]"
              >Copy Schedule</span
            >
          </button>
          <button
            (click)="showHolidayModal = true"
            class="card p-4 flex flex-col items-center gap-2 hover:border-[var(--color-primary)] transition-colors"
          >
            <i
              class="ri-calendar-event-line text-2xl text-[var(--color-primary)]"
            ></i>
            <span class="text-sm font-medium text-[var(--color-text-primary)]"
              >Set Holiday</span
            >
          </button>
        </div>

        <!-- Holidays Section — add after quick actions grid -->
        <div *ngIf="holidays.length > 0 || isCurrentlyOnHoliday()">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-[var(--color-text-primary)]">
              Upcoming Holidays
            </h2>
            <span
              *ngIf="isCurrentlyOnHoliday()"
              class="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold"
            >
              On Holiday
            </span>
          </div>

          <div
            *ngIf="holidays.length === 0"
            class="card p-4 text-center text-sm text-[var(--color-text-muted)]"
          >
            No holidays scheduled
          </div>

          <div class="space-y-2">
            <div
              *ngFor="let h of holidays; let i = index"
              class="card p-4 flex items-start justify-between gap-3"
            >
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style="background: color-mix(in srgb, var(--color-primary) 12%, transparent)"
                >
                  <i
                    class="ri-calendar-event-line text-[var(--color-primary)]"
                  ></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="font-semibold text-sm text-[var(--color-text-primary)]"
                  >
                    {{ formatDateRange(h.startDate, h.endDate) }}
                  </p>
                  <p
                    *ngIf="h.reason"
                    class="text-xs text-[var(--color-text-secondary)] mt-0.5"
                  >
                    {{ h.reason }}
                  </p>
                  <p
                    *ngIf="!h.reason"
                    class="text-xs text-[var(--color-text-muted)] mt-0.5"
                  >
                    No reason given
                  </p>
                </div>
              </div>
              <button
                (click)="deleteHoliday(i)"
                [disabled]="deletingHoliday === i"
                class="flex-shrink-0 text-red-400 hover:text-red-500 disabled:opacity-50 p-1"
              >
                <i *ngIf="deletingHoliday !== i" class="ri-delete-bin-line"></i>
                <i
                  *ngIf="deletingHoliday === i"
                  class="ri-loader-4-line animate-spin"
                ></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Hours Modal — mirrors mobile EditScheduleTimeScreen -->
      <div
        *ngIf="showEditModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
      >
        <div
          class="w-full max-w-lg bg-[var(--color-surface)] rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        >
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-lg text-[var(--color-text-primary)]">
              Edit {{ editingDay }} Hours
            </h2>
            <button
              (click)="showEditModal = false"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]"
            >
              <i
                class="ri-close-line text-xl text-[var(--color-text-primary)]"
              ></i>
            </button>
          </div>

          <!-- Opening / closing time -->
          <div>
            <p class="font-semibold text-[var(--color-text-primary)] mb-3">
              Working Hours
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-[var(--color-text-muted)] mb-1"
                  >Opening time</label
                >
                <input
                  [(ngModel)]="editOpenTime"
                  type="time"
                  class="form-input text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-[var(--color-text-muted)] mb-1"
                  >Closing time</label
                >
                <input
                  [(ngModel)]="editCloseTime"
                  type="time"
                  class="form-input text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Slot duration — mirrors mobile slotDurations grid -->
          <div>
            <p class="font-semibold text-[var(--color-text-primary)] mb-3">
              Appointment Slot Duration
            </p>
            <div class="grid grid-cols-3 gap-2">
              <button
                *ngFor="let d of slotDurations"
                (click)="editSlotDuration = d"
                class="py-2 rounded-lg text-sm font-medium border-2 transition-colors"
                [ngClass]="
                  editSlotDuration === d
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                    : 'bg-[var(--color-background)] text-[var(--color-text-primary)] border-transparent'
                "
              >
                {{ d }} min
              </button>
            </div>
          </div>

          <!-- Break times -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <p class="font-semibold text-[var(--color-text-primary)]">
                Break Times
              </p>
              <button
                (click)="addBreak()"
                class="text-sm text-[var(--color-primary)] font-medium flex items-center gap-1"
              >
                <i class="ri-add-line"></i> Add Break
              </button>
            </div>

            <p
              *ngIf="editBreaks.length === 0"
              class="text-sm text-[var(--color-text-muted)] text-center py-3"
            >
              No break times set
            </p>

            <div
              *ngFor="let b of editBreaks; let i = index"
              class="flex items-end gap-2 mb-2 bg-[var(--color-background)] rounded-xl p-3"
            >
              <div class="flex-1">
                <label class="block text-xs text-[var(--color-text-muted)] mb-1"
                  >Start</label
                >
                <input
                  [(ngModel)]="b.startTime"
                  type="time"
                  class="form-input text-sm"
                />
              </div>
              <div class="flex-1">
                <label class="block text-xs text-[var(--color-text-muted)] mb-1"
                  >End</label
                >
                <input
                  [(ngModel)]="b.endTime"
                  type="time"
                  class="form-input text-sm"
                />
              </div>
              <button
                (click)="removeBreak(i)"
                class="mb-0.5 px-2 py-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          </div>

          <!-- Info banner -->
          <div class="rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20">
            <p class="text-xs text-blue-600 dark:text-blue-400">
              Time slots will be automatically generated based on your working
              hours, slot duration, and break times.
            </p>
          </div>

          <!-- Save button -->
          <button
            (click)="saveHours()"
            [disabled]="savingHours"
            class="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            <i *ngIf="savingHours" class="ri-loader-4-line animate-spin"></i>
            {{ savingHours ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>

      <!-- Copy Schedule Modal -->
      <div
        *ngIf="showCopyModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
      >
        <div
          class="w-full max-w-lg bg-[var(--color-surface)] rounded-2xl p-6 space-y-5"
        >
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-lg text-[var(--color-text-primary)]">
              Copy Schedule
            </h2>
            <button
              (click)="showCopyModal = false"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]"
            >
              <i class="ri-close-line text-xl"></i>
            </button>
          </div>

          <div>
            <p class="text-sm text-[var(--color-text-secondary)] mb-2">
              Copy from
            </p>
            <select [(ngModel)]="copyFromDay" class="form-input text-sm">
              <option
                *ngFor="let day of schedule"
                [value]="day.day"
                [disabled]="!day.isOpen"
              >
                {{ day.day }}
              </option>
            </select>
          </div>

          <div>
            <p class="text-sm text-[var(--color-text-secondary)] mb-2">
              Copy to
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                *ngFor="let day of schedule"
                (click)="toggleCopyDay(day.day)"
                [disabled]="day.day === copyFromDay"
                class="px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors disabled:opacity-30"
                [ngClass]="
                  copyToDays.includes(day.day)
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                    : 'border-[var(--color-border)] text-[var(--color-text-primary)]'
                "
              >
                {{ day.day.substring(0, 3) }}
              </button>
            </div>
          </div>

          <button
            (click)="copySchedule()"
            [disabled]="copyingSchedule || !copyToDays.length"
            class="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i
              *ngIf="copyingSchedule"
              class="ri-loader-4-line animate-spin"
            ></i>
            {{ copyingSchedule ? "Copying..." : "Copy Schedule" }}
          </button>
        </div>
      </div>

      <!-- Set Holiday Modal -->
      <div
        *ngIf="showHolidayModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
      >
        <div
          class="w-full max-w-lg bg-[var(--color-surface)] rounded-2xl p-6 space-y-5"
        >
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-lg text-[var(--color-text-primary)]">
              Set Holiday
            </h2>
            <button
              (click)="showHolidayModal = false"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]"
            >
              <i class="ri-close-line text-xl"></i>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-[var(--color-text-muted)] mb-1"
                >Start Date</label
              >
              <input
                [(ngModel)]="holidayStart"
                type="date"
                class="form-input text-sm"
              />
            </div>
            <div>
              <label class="block text-xs text-[var(--color-text-muted)] mb-1"
                >End Date</label
              >
              <input
                [(ngModel)]="holidayEnd"
                type="date"
                class="form-input text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs text-[var(--color-text-muted)] mb-1"
              >Reason (optional)</label
            >
            <input
              [(ngModel)]="holidayReason"
              type="text"
              class="form-input text-sm"
              placeholder="e.g. Public holiday, Vacation..."
            />
          </div>

          <div class="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/20">
            <p class="text-xs text-amber-600 dark:text-amber-400">
              No bookings will be accepted during this period.
            </p>
          </div>

          <button
            (click)="setHoliday()"
            [disabled]="settingHoliday || !holidayStart || !holidayEnd"
            class="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i *ngIf="settingHoliday" class="ri-loader-4-line animate-spin"></i>
            {{ settingHoliday ? "Saving..." : "Set Holiday" }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ScheduleComponent implements OnInit {
  loading = true;
  schedule: DaySchedule[] = [];
  selectedDay = "Monday";
  beauticianId = "";

  togglingDay: string | null = null;
  togglingSlot: string | null = null;

  // Edit hours modal state
  showEditModal = false;
  editingDay = "";
  editOpenTime = "09:00";
  editCloseTime = "18:00";
  editSlotDuration = 60;
  editBreaks: { startTime: string; endTime: string }[] = [];
  savingHours = false;

  slotDurations = [15, 30, 45, 60, 90, 120];

  dayOverrides: Record<string, any> = {};
  showCopyModal = false;
  showHolidayModal = false;
  copyFromDay = "";
  copyToDays: string[] = [];
  holidayStart = "";
  holidayEnd = "";
  holidayReason = "";
  settingHoliday = false;
  copyingSchedule = false;

  holidays: Array<{
    startDate: string;
    endDate: string;
    reason: string;
    createdAt: string;
  }> = [];
  loadingHolidays = false;
  deletingHoliday: number | null = null;

  get activeDaysCount() {
    return this.schedule.filter((d) => d.isOpen).length;
  }

  get selectedDaySchedule(): DaySchedule | undefined {
    return this.schedule.find((d) => d.day === this.selectedDay);
  }

  constructor(
    private http: HttpClient,
    public router: Router,
    public toast: ToastService,
  ) {}

  ngOnInit() {
    this.http
      .get<any>(`${environment.apiUrl}/users/beautician/profile`)
      .subscribe({
        next: (res) => {
          this.beauticianId = res.data?.beautician?.id || "";
          this.loadSchedule();
        },
        error: (err) => {
          console.error("Profile fetch failed:", err); // Add this
          this.loading = false;
          this.toast.error("Failed to load profile");
        },
      });
  }

  loadSchedule() {
    this.loading = true;
    this.http
      .get<any>(`${environment.apiUrl}/schedule/${this.beauticianId}`)
      .subscribe({
        next: (res) => {
          const raw = res.data?.schedule?.schedule || res.data?.schedule || [];
          this.http
            .get<any>(
              `${environment.apiUrl}/schedule/${this.beauticianId}/day-overrides`,
            )
            .subscribe({
              next: (ov) => {
                this.dayOverrides = ov.data?.overrides || {};
                this.schedule = raw.map((day: DaySchedule) => {
                  const override = this.dayOverrides[day.day];
                  if (override) {
                    return {
                      ...day,
                      openingTime: override.openingTime,
                      closingTime: override.closingTime,
                      slotDuration: override.slotDuration,
                      breakTimes: override.breakTimes || [],
                    };
                  }
                  return day;
                });
                const firstOpen = this.schedule.find(
                  (d: DaySchedule) => d.isOpen,
                );
                if (firstOpen) this.selectedDay = firstOpen.day;
                this.loading = false;
              },
              error: () => {
                this.schedule = raw;
                this.loading = false;
              },
            });
        },
        error: () => {
          this.schedule = this.defaultSchedule();
          this.loading = false;
        },
      });
    // Fetch holidays separately
    this.loadHolidays();
  }

  loadHolidays() {
    this.http
      .get<any>(`${environment.apiUrl}/schedule/${this.beauticianId}/holidays`)
      .subscribe({
        next: (res) => {
          this.holidays = res.data?.holidays || [];
        },
        error: () => {},
      });
  }

  defaultSchedule(): DaySchedule[] {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days.map((day, i) => ({
      day,
      isOpen: i < 6,
      openingTime: i === 5 ? "10:00" : "09:00",
      closingTime: i === 5 ? "16:00" : "18:00",
      slotDuration: 60,
      slots: [],
      breakTimes: [],
    }));
  }

  toggleDay(day: DaySchedule) {
    this.togglingDay = day.day;
    this.http
      .patch<any>(
        `${environment.apiUrl}/schedule/${this.beauticianId}/toggle`,
        { day: day.day, isOpen: !day.isOpen },
      )
      .subscribe({
        next: () => {
          day.isOpen = !day.isOpen;
          this.toast.success(`${day.day} ${day.isOpen ? "opened" : "closed"}`);
          this.togglingDay = null;
        },
        error: () => {
          this.toast.error("Failed to update day");
          this.togglingDay = null;
        },
      });
  }

  toggleSlot(slot: SlotRecord) {
    if (slot.isBooked) return;
    this.togglingSlot = slot.id;
    this.http
      .patch<any>(
        `${environment.apiUrl}/schedule/${this.beauticianId}/slot/${slot.id}`,
        { isAvailable: !slot.isAvailable },
      )
      .subscribe({
        next: () => {
          slot.isAvailable = !slot.isAvailable;
          this.togglingSlot = null;
        },
        error: () => {
          this.toast.error("Failed to toggle slot");
          this.togglingSlot = null;
        },
      });
  }

  getSlotClass(slot: SlotRecord): string {
    if (slot.isBooked) {
      return "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20 cursor-not-allowed";
    }
    if (slot.isBreak) {
      return "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-900/20 cursor-not-allowed opacity-70";
    }
    if (slot.isAvailable) {
      return "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/20 hover:border-green-400";
    }
    return "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-primary)]";
  }

  editHours(dayName: string) {
    const day = this.schedule.find((d) => d.day === dayName);
    if (!day) return;
    this.editingDay = dayName;
    this.editOpenTime = day.openingTime || "09:00";
    this.editCloseTime = day.closingTime || "18:00";
    this.editSlotDuration = day.slotDuration || 60;
    this.editBreaks = (day.breakTimes || []).map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
    }));
    this.showEditModal = true;
  }

  addBreak() {
    this.editBreaks = [
      ...this.editBreaks,
      { startTime: "12:00", endTime: "13:00" },
    ];
  }

  removeBreak(index: number) {
    this.editBreaks = this.editBreaks.filter((_, i) => i !== index);
  }

  saveHours() {
    this.savingHours = true;
    this.http
      .put<any>(
        `${environment.apiUrl}/schedule/${this.beauticianId}/day-override`,
        {
          day: this.editingDay,
          openingTime: this.editOpenTime,
          closingTime: this.editCloseTime,
          slotDuration: this.editSlotDuration,
          breakTimes: this.editBreaks,
        },
      )
      .subscribe({
        next: (res) => {
          const day = this.schedule.find((d) => d.day === this.editingDay);
          if (day) {
            day.openingTime = this.editOpenTime;
            day.closingTime = this.editCloseTime;
            day.slotDuration = this.editSlotDuration;
            day.breakTimes = [...this.editBreaks];
            day.slots = res.data?.slots || [];
          }
          this.savingHours = false;
          this.showEditModal = false;
          this.toast.success(`${this.editingDay} schedule updated!`);
        },
        error: () => {
          this.savingHours = false;
          this.toast.error("Save failed");
        },
      });
  }

  // Copy schedule
  openCopyModal() {
    this.copyFromDay = this.selectedDay;
    this.copyToDays = [];
    this.showCopyModal = true;
  }

  copySchedule() {
    if (!this.copyToDays.length) {
      this.toast.error("Select at least one day");
      return;
    }
    this.copyingSchedule = true;
    this.http
      .post<any>(
        `${environment.apiUrl}/schedule/${this.beauticianId}/copy-schedule`,
        {
          fromDay: this.copyFromDay,
          toDays: this.copyToDays,
        },
      )
      .subscribe({
        next: (res) => {
          this.copyingSchedule = false;
          this.showCopyModal = false;
          this.toast.success(
            `${this.copyFromDay} schedule copied to ${this.copyToDays.join(", ")}!`,
          );
          this.loadSchedule();
        },
        error: () => {
          this.copyingSchedule = false;
          this.toast.error("Failed to copy schedule");
        },
      });
  }

  toggleCopyDay(day: string) {
    if (this.copyToDays.includes(day)) {
      this.copyToDays = this.copyToDays.filter((d) => d !== day);
    } else {
      this.copyToDays = [...this.copyToDays, day];
    }
  }

  // Set holiday
  setHoliday() {
    if (!this.holidayStart || !this.holidayEnd) {
      this.toast.error("Select start and end dates");
      return;
    }
    this.settingHoliday = true;
    this.http
      .post<any>(
        `${environment.apiUrl}/schedule/${this.beauticianId}/holiday`,
        {
          startDate: this.holidayStart,
          endDate: this.holidayEnd,
          reason: this.holidayReason,
        },
      )
      .subscribe({
        next: () => {
          this.settingHoliday = false;
          this.showHolidayModal = false;
          this.toast.success("Holiday set!");
        },
        error: () => {
          this.settingHoliday = false;
          this.toast.error("Failed to set holiday");
        },
      });
  }

  deleteHoliday(index: number) {
    this.deletingHoliday = index;
    // Remove locally and re-save the array (add a DELETE endpoint or re-POST full list)
    const updated = this.holidays.filter((_, i) => i !== index);
    this.http
      .post<any>(
        `${environment.apiUrl}/schedule/${this.beauticianId}/holidays/replace`,
        {
          holidays: updated,
        },
      )
      .subscribe({
        next: () => {
          this.holidays = updated;
          this.deletingHoliday = null;
          this.toast.success("Holiday removed");
        },
        error: () => {
          this.deletingHoliday = null;
          this.toast.error("Failed to remove holiday");
        },
      });
  }

  formatDateRange(start: string, end: string): string {
    const s = new Date(start);
    const e = new Date(end);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    return start === end ? fmt(s) : `${fmt(s)} – ${fmt(e)}`;
  }

  isCurrentlyOnHoliday(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.holidays.some((h) => {
      const start = new Date(h.startDate);
      const end = new Date(h.endDate);
      return today >= start && today <= end;
    });
  }
}
