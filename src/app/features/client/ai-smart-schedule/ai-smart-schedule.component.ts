// src/app/features/client/ai-smart-schedule/ai-smart-schedule.component.ts
//
// FIXES vs previous version:
//  1. Works standalone — no longer crashes when beauticianId/serviceId
//     are missing from query params. Shows a service picker instead.
//  2. Sends serviceName and serviceDuration to backend (was missing)
//  3. bookSelected() correctly passes beauticianId/serviceId when available
//  4. Loading state is correct — shows spinner during the full API call

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

interface SmartSlot {
  dayName: string;
  date: string;
  time: string;
  popularity: "low" | "medium" | "high";
  discount?: number;
  waitTime: string;
  aiReason: string;
  score: number;
}

@Component({
  selector: "app-ai-smart-schedule",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-16">
      <!-- Header -->
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3"
      >
        <button
          onclick="history.back()"
          class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center"
        >
          <i class="ri-arrow-left-line text-[var(--color-text-primary)]"></i>
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
            Smart Scheduling
          </h1>
          <p
            *ngIf="salonName"
            class="text-xs text-[var(--color-text-muted)] mt-0.5"
          >
            {{ salonName }}
          </p>
        </div>
        <!-- <span
          class="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1"
        >
          <i class="ri-robot-2-line"></i> AI Powered
        </span> -->
      </div>

      <div class="max-w-2xl mx-auto p-4 space-y-5">
        <!-- ── STEP 1: No params — ask what service they want ── -->
        <ng-container *ngIf="!beauticianId && !hasSubmittedService">
          <div class="card p-5 space-y-4">
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"
              >
                <i class="ri-robot-2-line text-blue-500"></i>
              </div>
              <div>
                <p class="font-semibold text-[var(--color-text-primary)]">
                  What are you looking for?
                </p>
                <p class="text-sm text-[var(--color-text-muted)] mt-0.5">
                  Tell me the service and I'll find the best times at Accra
                  salons.
                </p>
              </div>
            </div>

            <div>
              <label class="field-label">Service name</label>
              <input
                [(ngModel)]="serviceNameInput"
                type="text"
                class="form-input rounded-xl"
                placeholder="e.g. Box Braids, Fade, Gel Nails, Makeup..."
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Estimated duration</label>
                <select
                  [(ngModel)]="durationInput"
                  class="form-input rounded-xl"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4+ hours</option>
                </select>
              </div>
              <div>
                <label class="field-label">Preferred day</label>
                <select
                  [(ngModel)]="preferredDay"
                  class="form-input rounded-xl"
                >
                  <option value="">Any day</option>
                  <option value="weekday">Weekday</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>
            </div>

            <button
              (click)="submitServiceAndLoad()"
              [disabled]="!serviceNameInput.trim()"
              class="btn-primary w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <i class="ri-robot-2-line"></i>
              Find Best Times
            </button>
          </div>

          <!-- Quick service chips -->
          <div>
            <p
              class="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3"
            >
              Popular services
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                *ngFor="let s of popularServices"
                (click)="
                  serviceNameInput = s.name;
                  durationInput = s.duration;
                  submitServiceAndLoad()
                "
                class="px-3 py-2 rounded-xl border text-sm font-medium transition-colors"
                style="border-color: var(--color-border); color: var(--color-text-primary)"
              >
                {{ s.name }}
              </button>
            </div>
          </div>
        </ng-container>

        <!-- ── Info banner (shown once we have params / service) ── -->
        <div
          *ngIf="beauticianId || hasSubmittedService"
          class="card p-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800"
        >
          <i
            class="ri-lightbulb-line text-amber-500 text-xl flex-shrink-0 mt-0.5"
          ></i>
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {{
                loading ? "Finding best times for you…" : "Personalized for You"
              }}
            </p>
            <p
              class="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed"
            >
              {{
                loading
                  ? "Analysing traffic patterns and your booking history…"
                  : summary ||
                    "AI-ranked time slots based on salon traffic and your preferences."
              }}
            </p>
          </div>
        </div>

        <!-- ── Loading spinner ── -->
        <div *ngIf="loading" class="card p-12 flex flex-col items-center gap-4">
          <div class="relative w-16 h-16">
            <div
              class="absolute inset-0 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin"
            ></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <i
                class="ri-robot-2-line text-[var(--color-primary)] text-xl"
              ></i>
            </div>
          </div>
          <p class="text-sm text-[var(--color-text-secondary)] text-center">
            Finding the best appointment times for
            <strong>{{ currentServiceName }}</strong
            >...
          </p>
        </div>

        <!-- ── Results ── -->
        <ng-container *ngIf="!loading && (beauticianId || hasSubmittedService)">
          <!-- Change service link -->
          <div *ngIf="!beauticianId" class="flex items-center justify-between">
            <p class="text-sm font-semibold text-[var(--color-text-primary)]">
              Results for:
              <span style="color: var(--color-primary)">{{
                currentServiceName
              }}</span>
            </p>
            <button
              (click)="resetService()"
              class="text-xs text-[var(--color-text-muted)] flex items-center gap-1 hover:opacity-80"
            >
              <i class="ri-refresh-line"></i> Change
            </button>
          </div>

          <!-- Slots -->
          <div *ngIf="slots.length > 0" class="space-y-3">
            <div class="flex items-center gap-2">
              <i class="ri-star-fill text-amber-400"></i>
              <h3 class="font-semibold text-[var(--color-text-primary)]">
                Best Times
              </h3>
            </div>

            <div
              *ngFor="let slot of slots; let i = index"
              (click)="selectSlot(slot)"
              class="card p-4 cursor-pointer transition-all relative"
              [ngClass]="{
                'border-2 border-green-400':
                  i === 0 && selectedKey !== slotKey(slot),
                'border-2 border-[var(--color-primary)] shadow-lg scale-[1.01]':
                  selectedKey === slotKey(slot),
                'border border-[var(--color-border)]':
                  i > 0 && selectedKey !== slotKey(slot),
              }"
            >
              <!-- "Other times" divider -->
              <p
                *ngIf="i === 1"
                class="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 -mt-1"
              >
                Other Available Times
              </p>

              <div
                class="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-border)]"
              >
                <div>
                  <p class="font-semibold text-[var(--color-text-primary)]">
                    {{ slot.dayName }}
                  </p>
                  <p class="text-sm text-[var(--color-text-secondary)]">
                    {{ slot.date | date: "EEE, MMM d" }}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <span
                    class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm"
                  >
                    {{ slot.time }}
                  </span>
                  <div
                    *ngIf="selectedKey === slotKey(slot)"
                    class="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                  >
                    <i class="ri-check-line text-white text-sm"></i>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="text-xs px-2 py-1 rounded-full font-semibold border"
                    [ngClass]="popularityClass(slot.popularity)"
                  >
                    {{ popularityLabel(slot.popularity) }}
                  </span>
                  <span
                    *ngIf="slot.discount"
                    class="text-xs px-2 py-1 rounded-full bg-red-500 text-white font-bold"
                  >
                    {{ slot.discount }}% OFF
                  </span>
                  <span class="text-xs text-[var(--color-text-muted)] ml-auto">
                    <i class="ri-time-line mr-0.5"></i>{{ slot.waitTime }}
                  </span>
                </div>

                <div
                  class="flex items-start gap-2 p-2.5 bg-[var(--color-background)] rounded-xl"
                >
                  <i
                    class="ri-robot-2-line text-sm flex-shrink-0 mt-0.5"
                    style="color: var(--color-primary)"
                  ></i>
                  <p
                    class="text-xs text-[var(--color-text-primary)] leading-relaxed"
                  >
                    {{ slot.aiReason }}
                  </p>
                </div>
              </div>

              <!-- Best badge -->
              <div *ngIf="i === 0" class="absolute -top-2.5 left-3">
                <span
                  class="bg-green-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm"
                >
                  ⭐ Best Pick
                </span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div
            *ngIf="slots.length === 0"
            class="card p-10 flex flex-col items-center gap-3 text-center"
          >
            <i
              class="ri-calendar-close-line text-4xl text-[var(--color-text-muted)]"
            ></i>
            <p class="font-semibold text-[var(--color-text-primary)]">
              No slots found
            </p>
            <p class="text-sm text-[var(--color-text-muted)]">
              Try a different service or use manual booking.
            </p>
          </div>

          <!-- Divider -->
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

          <!-- Book CTA -->
          <button
            [disabled]="!selectedKey"
            (click)="bookSelected()"
            class="w-full py-4 rounded-2xl text-base font-bold transition-all"
            [ngClass]="
              selectedKey
                ? 'bg-[var(--color-primary)] text-white active:scale-[0.98]'
                : 'bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed'
            "
          >
            {{
              selectedKey ? "Book This Time Slot" : "Select a Time Slot Above"
            }}
          </button>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .field-label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 6px;
      }
    `,
  ],
})
export class AiSmartScheduleComponent implements OnInit {
  // From route params (when launched from salon/booking page)
  beauticianId = "";
  serviceId = "";
  salonName = "";

  // Standalone mode (when launched from AI hub with no params)
  hasSubmittedService = false;
  serviceNameInput = "";
  durationInput = "60";
  preferredDay = "";
  currentServiceName = "Beauty Service";

  slots: SmartSlot[] = [];
  summary = "";
  loading = false;
  selectedKey: string | null = null;

  selectedSlot: SmartSlot | null = null;

  popularServices = [
    { name: "Box Braids", duration: "180" },
    { name: "Fade Haircut", duration: "60" },
    { name: "Gel Nails", duration: "90" },
    { name: "Full Makeup", duration: "90" },
    { name: "Cornrows", duration: "120" },
    { name: "Hair Treatment", duration: "60" },
    { name: "Pedicure", duration: "60" },
    { name: "Lash Extension", duration: "90" },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.beauticianId = this.route.snapshot.queryParams["beauticianId"] || "";
    this.serviceId = this.route.snapshot.queryParams["serviceId"] || "";
    this.salonName = this.route.snapshot.queryParams["salonName"] || "";

    // Pre-fill service name from query params if provided
    const paramServiceName =
      this.route.snapshot.queryParams["serviceName"] || "";
    const paramServiceDuration =
      this.route.snapshot.queryParams["serviceDuration"] || "60";

    if (paramServiceName) {
      this.serviceNameInput = paramServiceName;
      this.durationInput = paramServiceDuration;
      this.currentServiceName = paramServiceName;
    }

    // If we have both beauticianId and serviceId, load immediately
    if (this.beauticianId && this.serviceId) {
      this.currentServiceName = paramServiceName || "Beauty Service";
      this.loadSchedule();
    }
    // Otherwise show the service picker (handled by template)
  }

  submitServiceAndLoad() {
    if (!this.serviceNameInput.trim()) return;
    this.currentServiceName = this.serviceNameInput.trim();
    this.hasSubmittedService = true;
    this.loadSchedule();
  }

  resetService() {
    this.hasSubmittedService = false;
    this.slots = [];
    this.summary = "";
    this.selectedKey = null;
    this.selectedSlot = null;
  }

  loadSchedule() {
    this.loading = true;
    this.slots = [];
    this.selectedKey = null;

    this.http
      .post<any>(`${environment.apiUrl}/ai/smart-schedule`, {
        beauticianId: this.beauticianId || undefined,
        serviceId: this.serviceId || undefined,
        serviceName: this.currentServiceName,
        serviceDuration: Number(this.durationInput),
      })
      .subscribe({
        next: (res) => {
          this.slots = res.data.recommendations || [];
          this.summary = res.data.summary || "";
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toast.error(
            err?.error?.message ||
              "Could not load AI schedule. Try manual booking.",
          );
          // If it was standalone mode, go back to picker
          if (!this.beauticianId) {
            this.hasSubmittedService = false;
          }
        },
      });
  }

  slotKey(slot: SmartSlot) {
    return `${slot.date}-${slot.time}`;
  }
  selectSlot(slot: SmartSlot) {
    this.selectedKey = this.slotKey(slot);
    this.selectedSlot = slot;
  }

  popularityLabel(p: string): string {
    return (
      { low: "Low Traffic", medium: "Moderate", high: "High Traffic" }[p] || p
    );
  }

  popularityClass(p: string): string {
    return (
      (
        {
          low: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300",
          medium:
            "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
          high: "bg-red-100   text-red-700   border-red-300   dark:bg-red-900/30   dark:text-red-300",
        } as Record<string, string>
      )[p] || ""
    );
  }

  bookSelected() {
    if (!this.selectedKey || !this.selectedSlot) return;

    const queryParams: any = {};
    if (this.beauticianId) queryParams["beauticianId"] = this.beauticianId;
    if (this.serviceId) queryParams["serviceId"] = this.serviceId;
    if (this.selectedSlot) {
      queryParams["date"] = this.selectedSlot.date;
      queryParams["time"] = this.selectedSlot.time;
    }

    this.router.navigate(
      ["/client/book-appointment", this.beauticianId || ""],
      { queryParams },
    );
  }

  goManual() {
    if (this.beauticianId) {
      this.router.navigate(["/client/book-appointment", this.beauticianId], {
        queryParams: { serviceId: this.serviceId },
      });
    } else {
      this.router.navigate(["/client/discover"]);
    }
  }
}


