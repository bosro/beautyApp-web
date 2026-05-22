// ============================================================
// schedule.component.ts  —  Enhanced UI
// All HTTP calls, toggle logic, modal state unchanged.
// ============================================================

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
  isBreak?: boolean;
}

@Component({
  selector: "app-schedule",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between"
      >
        <button
          (click)="goBack()"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors"
        >
          <i
            class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"
          ></i>
        </button>
        <h1
          class="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
        >
          My Schedule
        </h1>
        <button
          (click)="loadSchedule()"
          class="flex items-center gap-1.5 text-sm text-[var(--color-primary)] font-semibold px-3 py-1.5 rounded-xl hover:bg-[var(--color-primary)]/10 transition-colors"
        >
          <i class="ri-refresh-line text-sm"></i> Refresh
        </button>
      </div>

      <!-- ── Loading ── -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-20 rounded-2xl"></div>
        <div
          *ngFor="let i of [1, 2, 3, 4, 5, 6, 7]"
          class="skeleton h-14 rounded-xl"
        ></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
        <!-- Summary Banner -->
        <div
          class="rounded-2xl p-4 flex items-center gap-4"
          style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
        >
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style="background: color-mix(in srgb, var(--color-primary) 15%, transparent)"
          >
            <i class="ri-calendar-line text-[var(--color-primary)] text-xl"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-[var(--color-primary)]">Weekly Schedule</p>
            <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">
              <span class="font-semibold">{{ activeDaysCount }}</span> working
              day{{ activeDaysCount !== 1 ? "s" : "" }} this week
            </p>
          </div>
          <div class="flex-shrink-0 text-right">
            <p class="text-2xl font-black text-[var(--color-primary)]">
              {{ activeDaysCount
              }}<span class="text-sm font-medium opacity-60">/7</span>
            </p>
          </div>
        </div>

        <!-- Working Days -->
        <div>
          <h2
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 mb-3"
          >
            Working Days
          </h2>
          <div class="space-y-2">
            <div
              *ngFor="let day of schedule"
              class="card shadow-none rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <!-- Day abbrev pill -->
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs"
                [ngClass]="
                  day.isOpen
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'bg-[var(--color-background)] text-[var(--color-text-muted)]'
                "
              >
                {{ day.day.substring(0, 3).toUpperCase() }}
              </div>

              <div class="flex-1 min-w-0">
                <p
                  class="font-semibold text-sm text-[var(--color-text-primary)]"
                >
                  {{ day.day }}
                </p>
                <p
                  *ngIf="day.isOpen"
                  class="text-xs text-[var(--color-text-secondary)] mt-0.5"
                >
                  {{ day.openingTime }} – {{ day.closingTime }}
                  <span *ngIf="day.slotDuration" class="ml-1 opacity-60"
                    >· {{ day.slotDuration }}min slots</span
                  >
                </p>
                <p *ngIf="!day.isOpen" class="text-xs text-red-400 mt-0.5">
                  Closed
                </p>
              </div>

              <!-- Toggle -->
              <button
                (click)="toggleDay(day)"
                [disabled]="togglingDay === day.day"
                class="relative w-12 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-60"
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
                  [ngClass]="day.isOpen ? 'translate-x-6' : 'translate-x-0'"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Day selector for slots -->
        <div>
          <h2
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 mb-3"
          >
            Manage Time Slots
          </h2>
          <div
            class="flex gap-2 overflow-x-auto pb-2"
            style="-ms-overflow-style:none; scrollbar-width:none"
          >
            <button
              *ngFor="let day of schedule"
              (click)="selectedDay = day.day"
              [disabled]="!day.isOpen"
              class="flex flex-col items-center px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all disabled:opacity-30 flex-shrink-0 min-w-[52px]"
              [ngClass]="
                selectedDay === day.day
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]'
              "
            >
              <span class="text-[10px] mb-0.5">{{
                day.day.substring(0, 3)
              }}</span>
              <span
                *ngIf="day.isOpen"
                class="w-1.5 h-1.5 rounded-full"
                [ngClass]="
                  selectedDay === day.day
                    ? 'bg-white/60'
                    : 'bg-[var(--color-primary)]'
                "
              ></span>
              <span
                *ngIf="!day.isOpen"
                class="w-1.5 h-1.5 rounded-full bg-gray-300"
              ></span>
            </button>
          </div>
        </div>

        <!-- Slots for selected day -->
        <div *ngIf="selectedDaySchedule as day">
          <div class="flex items-center justify-between mb-3">
            <p class="font-bold text-sm text-[var(--color-text-primary)]">
              {{ selectedDay }} Slots
            </p>
            <button
              (click)="editHours(selectedDay)"
              class="flex items-center gap-1.5 text-sm text-[var(--color-primary)] font-semibold px-3 py-1.5 rounded-xl hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              <i class="ri-pencil-line text-sm"></i> Edit Hours
            </button>
          </div>

          <!-- No slots -->
          <div
            *ngIf="!day.slots || day.slots.length === 0"
            class="card rounded-2xl p-8 flex flex-col items-center text-center"
          >
            <div
              class="w-14 h-14 rounded-2xl bg-[var(--color-background)] flex items-center justify-center mb-3"
            >
              <i
                class="ri-time-line text-2xl text-[var(--color-text-muted)]"
              ></i>
            </div>
            <p class="font-bold text-[var(--color-text-primary)] mb-1">
              No time slots yet
            </p>
            <p class="text-sm text-[var(--color-text-secondary)] mb-4">
              Set working hours to generate slots automatically
            </p>
            <button
              (click)="editHours(selectedDay)"
              class="btn-primary text-sm px-5 py-2.5 rounded-xl"
            >
              Add Time Slots
            </button>
          </div>

          <!-- Slot grid -->
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
              class="rounded-xl p-2.5 text-center border-2 transition-all disabled:cursor-not-allowed"
              [ngClass]="getSlotClass(slot)"
            >
              <p class="text-xs font-bold mb-1">{{ slot.startTime }}</p>
              <span *ngIf="togglingSlot === slot.id" class="text-[10px]">
                <i class="ri-loader-4-line animate-spin"></i>
              </span>
              <span
                *ngIf="togglingSlot !== slot.id && slot.isBooked"
                class="text-[10px] font-bold text-red-500"
                >Booked</span
              >
              <span
                *ngIf="togglingSlot !== slot.id && slot.isBreak"
                class="text-[10px] font-bold text-orange-500"
                >Break</span
              >
              <span
                *ngIf="
                  togglingSlot !== slot.id &&
                  !slot.isBooked &&
                  !slot.isBreak &&
                  slot.isAvailable
                "
                class="text-[10px] font-bold text-green-600"
                >Open</span
              >
              <span
                *ngIf="
                  togglingSlot !== slot.id &&
                  !slot.isBooked &&
                  !slot.isBreak &&
                  !slot.isAvailable
                "
                class="text-[10px] font-bold text-[var(--color-text-muted)]"
                >Off</span
              >
            </button>
          </div>

          <!-- Legend -->
          <div class="flex items-center gap-4 mt-4 flex-wrap">
            <span
              class="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> Open
            </span>
            <span
              class="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span> Booked
            </span>
            <span
              class="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Break
            </span>
            <span
              class="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
            >
              <span
                class="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"
              ></span>
              Blocked
            </span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 gap-3">
          <button
            (click)="openCopyModal()"
            class="card rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:border-[var(--color-primary)] transition-colors group"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
            >
              <i
                class="ri-file-copy-line text-[var(--color-primary)] text-lg group-hover:scale-110 transition-transform"
              ></i>
            </div>
            <span class="text-sm font-semibold text-[var(--color-text-primary)]"
              >Copy Schedule</span
            >
          </button>
          <button
            (click)="showHolidayModal = true"
            class="card rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:border-[var(--color-primary)] transition-colors group"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
            >
              <i
                class="ri-calendar-event-line text-[var(--color-primary)] text-lg group-hover:scale-110 transition-transform"
              ></i>
            </div>
            <span class="text-sm font-semibold text-[var(--color-text-primary)]"
              >Set Holiday</span
            >
          </button>
        </div>

        <!-- Holidays -->
        <div *ngIf="holidays.length > 0 || isCurrentlyOnHoliday()">
          <div class="flex items-center justify-between mb-3">
            <h2
              class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
            >
              Upcoming Holidays
            </h2>
            <span
              *ngIf="isCurrentlyOnHoliday()"
              class="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold"
            >
              On Holiday Now
            </span>
          </div>

          <div
            *ngIf="holidays.length === 0"
            class="card rounded-2xl p-4 text-center text-sm text-[var(--color-text-muted)]"
          >
            No holidays scheduled
          </div>

          <div class="space-y-2">
            <div
              *ngFor="let h of holidays; let i = index"
              class="card rounded-2xl p-4 flex items-start gap-3"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style="background: color-mix(in srgb, #FF9800 12%, transparent)"
              >
                <i class="ri-calendar-event-line text-amber-500"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm text-[var(--color-text-primary)]">
                  {{ formatDateRange(h.startDate, h.endDate) }}
                </p>
                <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {{ h.reason || "No reason given" }}
                </p>
              </div>
              <button
                (click)="deleteHoliday(i)"
                [disabled]="deletingHoliday === i"
                class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-400 disabled:opacity-50"
              >
                <i
                  *ngIf="deletingHoliday !== i"
                  class="ri-delete-bin-line text-sm"
                ></i>
                <i
                  *ngIf="deletingHoliday === i"
                  class="ri-loader-4-line animate-spin text-sm"
                ></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Edit Hours Modal ── -->
      <div
        *ngIf="showEditModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div
          class="w-full max-w-lg bg-[var(--color-surface)] rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        >
          <div
            class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)]"
          >
            <h2 class="font-bold text-base text-[var(--color-text-primary)]">
              Edit {{ editingDay }}
            </h2>
            <button
              (click)="showEditModal = false"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors"
            >
              <i
                class="ri-close-line text-lg text-[var(--color-text-primary)]"
              ></i>
            </button>
          </div>

          <div class="p-5 space-y-5">
            <!-- Working hours -->
            <div>
              <p
                class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 mb-3"
              >
                Working Hours
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label
                    class="block text-xs text-[var(--color-text-muted)] mb-1.5"
                    >Opening time</label
                  >
                  <input
                    [(ngModel)]="editOpenTime"
                    type="time"
                    class="form-input rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs text-[var(--color-text-muted)] mb-1.5"
                    >Closing time</label
                  >
                  <input
                    [(ngModel)]="editCloseTime"
                    type="time"
                    class="form-input rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Slot duration -->
            <div>
              <p
                class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 mb-3"
              >
                Slot Duration
              </p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  *ngFor="let d of slotDurations"
                  type="button"
                  (click)="editSlotDuration = d"
                  class="py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                  [ngClass]="
                    editSlotDuration === d
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--color-background)] text-[var(--color-text-primary)] border-transparent hover:border-[var(--color-border)]'
                  "
                >
                  {{ d }}m
                </button>
              </div>
            </div>

            <!-- Break times -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <p
                  class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
                >
                  Break Times
                </p>
                <button
                  (click)="addBreak()"
                  class="flex items-center gap-1 text-sm text-[var(--color-primary)] font-semibold"
                >
                  <i class="ri-add-line"></i> Add Break
                </button>
              </div>

              <p
                *ngIf="editBreaks.length === 0"
                class="text-sm text-[var(--color-text-muted)] text-center py-4 rounded-xl bg-[var(--color-background)]"
              >
                No break times set
              </p>

              <div
                *ngFor="let b of editBreaks; let i = index"
                class="flex items-end gap-2 mb-2 bg-[var(--color-background)] rounded-xl p-3"
              >
                <div class="flex-1">
                  <label
                    class="block text-xs text-[var(--color-text-muted)] mb-1"
                    >Start</label
                  >
                  <input
                    [(ngModel)]="b.startTime"
                    type="time"
                    class="form-input text-sm rounded-xl"
                  />
                </div>
                <div class="flex-1">
                  <label
                    class="block text-xs text-[var(--color-text-muted)] mb-1"
                    >End</label
                  >
                  <input
                    [(ngModel)]="b.endTime"
                    type="time"
                    class="form-input text-sm rounded-xl"
                  />
                </div>
                <button
                  (click)="removeBreak(i)"
                  class="mb-0.5 w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <i class="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>

            <!-- Info -->
            <div
              class="rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20 flex items-start gap-2"
            >
              <i
                class="ri-information-line text-blue-500 flex-shrink-0 mt-0.5"
              ></i>
              <p
                class="text-xs text-blue-600 dark:text-blue-400 leading-relaxed"
              >
                Slots are generated automatically from your working hours,
                duration, and break times.
              </p>
            </div>

            <button
              (click)="saveHours()"
              [disabled]="savingHours"
              class="btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold"
            >
              <i *ngIf="savingHours" class="ri-loader-4-line animate-spin"></i>
              {{ savingHours ? "Saving…" : "Save Changes" }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Copy Schedule Modal ── -->
      <div
        *ngIf="showCopyModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div
          class="w-full max-w-lg bg-[var(--color-surface)] rounded-3xl shadow-2xl"
        >
          <div
            class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)]"
          >
            <h2 class="font-bold text-base text-[var(--color-text-primary)]">
              Copy Schedule
            </h2>
            <button
              (click)="showCopyModal = false"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]"
            >
              <i class="ri-close-line text-lg"></i>
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <p
                class="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
              >
                Copy from
              </p>
              <select
                [(ngModel)]="copyFromDay"
                class="form-input rounded-xl text-sm"
              >
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
              <p
                class="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2"
              >
                Copy to
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  *ngFor="let day of schedule"
                  (click)="toggleCopyDay(day.day)"
                  [disabled]="day.day === copyFromDay"
                  class="px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-30"
                  [ngClass]="
                    copyToDays.includes(day.day)
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]'
                  "
                >
                  {{ day.day.substring(0, 3) }}
                </button>
              </div>
            </div>
            <button
              (click)="copySchedule()"
              [disabled]="copyingSchedule || !copyToDays.length"
              class="btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
            >
              <i
                *ngIf="copyingSchedule"
                class="ri-loader-4-line animate-spin"
              ></i>
              {{ copyingSchedule ? "Copying…" : "Copy Schedule" }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Set Holiday Modal ── -->
      <div
        *ngIf="showHolidayModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div
          class="w-full max-w-lg bg-[var(--color-surface)] rounded-3xl shadow-2xl"
        >
          <div
            class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)]"
          >
            <h2 class="font-bold text-base text-[var(--color-text-primary)]">
              Set Holiday
            </h2>
            <button
              (click)="showHolidayModal = false"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]"
            >
              <i class="ri-close-line text-lg"></i>
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="block text-xs text-[var(--color-text-muted)] mb-1.5"
                  >Start Date</label
                >
                <input
                  [(ngModel)]="holidayStart"
                  type="date"
                  class="form-input rounded-xl text-sm"
                />
              </div>
              <div>
                <label
                  class="block text-xs text-[var(--color-text-muted)] mb-1.5"
                  >End Date</label
                >
                <input
                  [(ngModel)]="holidayEnd"
                  type="date"
                  class="form-input rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs text-[var(--color-text-muted)] mb-1.5"
                >Reason (optional)</label
              >
              <input
                [(ngModel)]="holidayReason"
                type="text"
                class="form-input rounded-xl text-sm"
                placeholder="e.g. Public holiday, Vacation…"
              />
            </div>
            <div
              class="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/20 flex items-start gap-2"
            >
              <i
                class="ri-information-line text-amber-500 flex-shrink-0 mt-0.5"
              ></i>
              <p class="text-xs text-amber-600 dark:text-amber-400">
                No bookings will be accepted during this period.
              </p>
            </div>
            <button
              (click)="setHoliday()"
              [disabled]="settingHoliday || !holidayStart || !holidayEnd"
              class="btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
            >
              <i
                *ngIf="settingHoliday"
                class="ri-loader-4-line animate-spin"
              ></i>
              {{ settingHoliday ? "Saving…" : "Set Holiday" }}
            </button>
          </div>
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
        error: () => {
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
                  return override
                    ? {
                        ...day,
                        openingTime: override.openingTime,
                        closingTime: override.closingTime,
                        slotDuration: override.slotDuration,
                        breakTimes: override.breakTimes || [],
                      }
                    : day;
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
    return [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day, i) => ({
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
    if (slot.isBooked)
      return "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20 cursor-not-allowed";
    if (slot.isBreak)
      return "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-900/20 cursor-not-allowed opacity-70";
    if (slot.isAvailable)
      return "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/20 hover:border-green-400";
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

  openCopyModal() {
    this.copyFromDay = this.selectedDay;
    this.copyToDays = [];
    this.showCopyModal = true;
  }
  toggleCopyDay(day: string) {
    this.copyToDays = this.copyToDays.includes(day)
      ? this.copyToDays.filter((d) => d !== day)
      : [...this.copyToDays, day];
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
        { fromDay: this.copyFromDay, toDays: this.copyToDays },
      )
      .subscribe({
        next: () => {
          this.copyingSchedule = false;
          this.showCopyModal = false;
          this.toast.success(
            `Schedule copied to ${this.copyToDays.join(", ")}!`,
          );
          this.loadSchedule();
        },
        error: () => {
          this.copyingSchedule = false;
          this.toast.error("Failed to copy schedule");
        },
      });
  }

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
          this.loadHolidays();
        },
        error: () => {
          this.settingHoliday = false;
          this.toast.error("Failed to set holiday");
        },
      });
  }

  deleteHoliday(index: number) {
    this.deletingHoliday = index;
    const updated = this.holidays.filter((_, i) => i !== index);
    this.http
      .post<any>(
        `${environment.apiUrl}/schedule/${this.beauticianId}/holidays/replace`,
        { holidays: updated },
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
    const s = new Date(start),
      e = new Date(end);
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
      const s = new Date(h.startDate),
        e = new Date(h.endDate);
      return today >= s && today <= e;
    });
  }

  goBack() {
    this.router.navigate(["/beautician/settings"]);
  }
}
