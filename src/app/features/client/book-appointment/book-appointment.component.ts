import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ToastService } from "../../../core/services/toast.service";
import { environment } from "../../../../environments/environment";

interface TimeSlot {
  time: string;
  available: boolean;
}
interface DayOption {
  date: string;
  label: string;
  dayNum: string;
  month: string;
  isToday: boolean;
}

@Component({
  selector: "app-book-appointment",
  template: `
    <div class="min-h-screen" style="background-color: var(--color-bg-primary)">
      <!-- HEADER -->
      <div class="flex items-center justify-between px-4 pt-4 pb-3 lg:px-6">
        <button
          (click)="goBack()"
          class="w-9 h-9 rounded-full flex items-center justify-center"
          style="background-color: var(--color-bg-secondary)"
        >
          <i
            class="ri-arrow-left-s-line text-xl"
            style="color: var(--color-text-primary)"
          ></i>
        </button>
        <h1
          class="text-base font-bold"
          style="color: var(--color-text-primary)"
        >
          Book Appointment
        </h1>
        <button
          (click)="toggleFavorite()"
          class="w-9 h-9 rounded-full flex items-center justify-center"
          style="background-color: var(--color-bg-secondary)"
        >
          <i
            class="text-lg"
            [class]="isFavorited ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
            [style.color]="
              isFavorited
                ? 'var(--color-primary)'
                : 'var(--color-text-secondary)'
            "
          ></i>
        </button>
      </div>

      <div class="px-4 lg:px-6 pb-40 max-w-2xl mx-auto">
        <!-- SERVICE CARD -->
        <div
          *ngIf="loadingService"
          class="skeleton h-24 rounded-2xl mb-4"
        ></div>
        <div
          *ngIf="!loadingService && service"
          class="rounded-2xl p-4 mb-4"
          style="background-color: var(--color-bg-secondary)"
        >
          <p
            class="font-semibold text-sm mb-2"
            style="color: var(--color-text-primary)"
          >
            {{ service.name }}
          </p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <i class="ri-star-fill text-yellow-400 text-xs"></i>
              <span class="text-xs" style="color: var(--color-text-secondary)">
                {{ beautician?.averageRating || 0 }} ({{
                  beautician?.totalReviews || 0
                }})
              </span>
            </div>
            <div class="text-right">
              <p class="font-bold text-sm" style="color: var(--color-primary)">
                GHS {{ service.price.toFixed(2) }}
              </p>
              <p class="text-xs" style="color: var(--color-text-secondary)">
                {{ service.duration }} mins
              </p>
            </div>
          </div>
        </div>

        <!-- EXISTING BOOKING WARNING -->
        <div
          *ngIf="existingBooking"
          class="rounded-2xl p-4 mb-4 flex items-start gap-3"
          style="background-color: #1C1C1E; border: 1px solid #2C2C2E"
        >
          <i
            class="ri-information-line text-lg mt-0.5 flex-shrink-0"
            style="color: #fff"
          ></i>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm mb-1" style="color: #fff">
              Existing Booking
            </p>
            <p
              class="text-xs leading-relaxed mb-2"
              style="color: rgba(255,255,255,0.6)"
            >
              You have booking #{{ existingBooking.bookingNumber }} ({{
                existingBooking.status
              }}) at this salon.
            </p>
            <button
              (click)="viewExistingBooking()"
              class="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style="background-color: #fff; color: #000"
            >
              View Booking
            </button>
          </div>
        </div>

        <!-- AI SMART SCHEDULE -->
        <button
          (click)="openSmartSchedule()"
          class="w-full rounded-2xl p-4 mb-4 flex items-center gap-3 text-left transition-opacity hover:opacity-90"
          style="background-color: #1C1C1E; border: 1px solid #2C2C2E"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style="background-color: rgba(255,255,255,0.1)"
          >
            <i class="ri-sparkling-2-line text-white text-lg"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm text-white">
              Let AI Find the Best Time
            </p>
            <p class="text-xs mt-0.5" style="color: rgba(255,255,255,0.55)">
              Personalized schedule recommendations
            </p>
          </div>
          <i
            class="ri-arrow-right-s-line text-xl flex-shrink-0"
            style="color: rgba(255,255,255,0.4)"
          ></i>
        </button>

        <!-- DIVIDER -->
        <div class="flex items-center gap-3 mb-5">
          <div
            class="flex-1 h-px"
            style="background-color: var(--color-border-light)"
          ></div>
          <span
            class="text-xs font-medium"
            style="color: var(--color-text-secondary)"
            >Or select manually</span
          >
          <div
            class="flex-1 h-px"
            style="background-color: var(--color-border-light)"
          ></div>
        </div>

        <!-- SELECT DATE -->
        <div class="mb-6">
          <p
            class="font-semibold text-sm mb-3"
            style="color: var(--color-text-primary)"
          >
            Select date
          </p>
          <div
            class="flex gap-2 overflow-x-auto pb-1"
            style="-ms-overflow-style:none; scrollbar-width:none"
          >
            <button
              *ngFor="let day of dayOptions"
              (click)="selectDate(day.date)"
              class="flex flex-col items-center flex-shrink-0 rounded-2xl py-3 px-4 transition-all"
              [style.background-color]="
                selectedDate === day.date
                  ? 'var(--color-primary)'
                  : 'var(--color-bg-secondary)'
              "
              [style.color]="
                selectedDate === day.date
                  ? '#fff'
                  : 'var(--color-text-secondary)'
              "
            >
              <span class="text-xs font-medium mb-1">{{ day.label }}</span>
              <span
                class="text-xl font-bold leading-tight"
                [style.color]="
                  selectedDate === day.date
                    ? '#fff'
                    : 'var(--color-text-primary)'
                "
                >{{ day.dayNum }}</span
              >
              <span class="text-xs mt-1">{{ day.month }}</span>
              <div
                *ngIf="day.isToday"
                class="w-1.5 h-1.5 rounded-full mt-1"
                [style.background-color]="
                  selectedDate === day.date ? '#fff' : 'var(--color-primary)'
                "
              ></div>
            </button>
          </div>
        </div>

        <!-- SELECT TIME -->
        <div class="mb-6" *ngIf="selectedDate">
          <p
            class="font-semibold text-sm mb-3"
            style="color: var(--color-text-primary)"
          >
            Select time
          </p>
          <div *ngIf="loadingSlots" class="grid grid-cols-3 gap-2">
            <div
              *ngFor="let _ of [1, 2, 3, 4, 5, 6]"
              class="skeleton h-12 rounded-xl"
            ></div>
          </div>
          <ng-container *ngIf="!loadingSlots">
            <ng-container *ngIf="morningSlots.length > 0">
              <p
                class="text-xs font-medium mb-2"
                style="color: var(--color-text-secondary)"
              >
                Morning
              </p>
              <div class="grid grid-cols-3 gap-2 mb-4">
                <button
                  *ngFor="let slot of morningSlots"
                  (click)="slot.available && selectTime(slot.time)"
                  class="py-3 rounded-xl text-sm font-semibold transition-all"
                  [class.opacity-40]="!slot.available"
                  [style.background-color]="
                    selectedTime === slot.time
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-secondary)'
                  "
                  [style.color]="
                    selectedTime === slot.time
                      ? '#fff'
                      : 'var(--color-text-primary)'
                  "
                >
                  {{ slot.time }}
                </button>
              </div>
            </ng-container>
            <ng-container *ngIf="afternoonSlots.length > 0">
              <p
                class="text-xs font-medium mb-2"
                style="color: var(--color-text-secondary)"
              >
                Afternoon
              </p>
              <div class="grid grid-cols-3 gap-2 mb-4">
                <button
                  *ngFor="let slot of afternoonSlots"
                  (click)="slot.available && selectTime(slot.time)"
                  class="py-3 rounded-xl text-sm font-semibold transition-all"
                  [class.opacity-40]="!slot.available"
                  [style.background-color]="
                    selectedTime === slot.time
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-secondary)'
                  "
                  [style.color]="
                    selectedTime === slot.time
                      ? '#fff'
                      : 'var(--color-text-primary)'
                  "
                >
                  {{ slot.time }}
                </button>
              </div>
            </ng-container>
            <ng-container *ngIf="eveningSlots.length > 0">
              <p
                class="text-xs font-medium mb-2"
                style="color: var(--color-text-secondary)"
              >
                Evening
              </p>
              <div class="grid grid-cols-3 gap-2 mb-4">
                <button
                  *ngFor="let slot of eveningSlots"
                  (click)="slot.available && selectTime(slot.time)"
                  class="py-3 rounded-xl text-sm font-semibold transition-all"
                  [class.opacity-40]="!slot.available"
                  [style.background-color]="
                    selectedTime === slot.time
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-secondary)'
                  "
                  [style.color]="
                    selectedTime === slot.time
                      ? '#fff'
                      : 'var(--color-text-primary)'
                  "
                >
                  {{ slot.time }}
                </button>
              </div>
            </ng-container>
            <div
              *ngIf="
                morningSlots.length === 0 &&
                afternoonSlots.length === 0 &&
                eveningSlots.length === 0
              "
              class="text-center py-8"
            >
              <i
                class="ri-calendar-close-line text-3xl mb-2"
                style="color: var(--color-text-placeholder)"
              ></i>
              <p class="text-sm" style="color: var(--color-text-secondary)">
                No available slots for this date
              </p>
            </div>
          </ng-container>
        </div>

        <!-- CONTACT -->
        <div class="mb-5">
          <p
            class="font-semibold text-sm mb-2"
            style="color: var(--color-text-primary)"
          >
            Contact
          </p>
          <input
            [(ngModel)]="contact"
            type="tel"
            placeholder="Input contact here"
            class="form-input w-full"
          />
        </div>

        <!-- NOTE -->
        <div class="mb-6">
          <p
            class="font-semibold text-sm mb-2"
            style="color: var(--color-text-primary)"
          >
            Short note
            <span style="color: var(--color-text-secondary)">(Optional)</span>
          </p>
          <textarea
            [(ngModel)]="note"
            placeholder="Write comment here"
            rows="3"
            class="form-input w-full resize-none"
          ></textarea>
        </div>
      </div>

      <!-- STICKY SLIDE-TO-BOOK -->
      <div
        class="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 lg:px-6"
        style="background: linear-gradient(to top, var(--color-bg-primary) 80%, transparent)"
      >
        <div class="max-w-2xl mx-auto">
          <!-- Slider track -->
          <div
            #sliderTrack
            class="relative h-16 rounded-2xl overflow-hidden flex items-center select-none"
            [style.background-color]="
              isFormComplete()
                ? 'rgba(0,0,0,0.08)'
                : 'var(--color-bg-secondary)'
            "
            [style.border]="
              isFormComplete() ? '1.5px solid rgba(0,0,0,0.12)' : 'none'
            "
          >
            <!-- Fill behind thumb -->
            <div
              class="absolute left-0 top-0 bottom-0 rounded-2xl transition-none"
              [style.width.px]="sliderFillWidth"
              style="background-color: var(--color-primary); opacity: 0.15"
            ></div>

            <!-- Label -->
            <span
              class="absolute inset-0 flex items-center justify-center text-sm font-bold pointer-events-none z-10"
              [style.color]="
                isFormComplete()
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-placeholder)'
              "
            >
              <ng-container *ngIf="!booking">
                {{
                  isFormComplete()
                    ? sliderProgress > 0.5
                      ? "Release to confirm!"
                      : "Slide to Book →"
                    : "Complete form to continue"
                }}
              </ng-container>
              <span *ngIf="booking" class="flex items-center gap-2">
                <i class="ri-loader-4-line animate-spin"></i> Processing...
              </span>
            </span>

            <!-- Thumb -->
            <div
              *ngIf="!booking"
              class="absolute top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center z-20 cursor-grab active:cursor-grabbing shadow-md"
              [style.left.px]="sliderThumbLeft"
              [style.background-color]="
                isFormComplete() ? 'var(--color-primary)' : '#ccc'
              "
              [style.transition]="isDragging ? 'none' : 'left 0.3s ease'"
              (mousedown)="onSliderMouseDown($event)"
              (touchstart)="onSliderTouchStart($event)"
            >
              <i class="ri-arrow-right-line text-white text-lg"></i>
            </div>
          </div>

          <p
            *ngIf="isFormComplete() && !booking"
            class="text-center text-xs mt-2 flex items-center justify-center gap-1"
            style="color: var(--color-primary)"
          >
            <i class="ri-information-line"></i> Review your details before
            confirming
          </p>
        </div>
      </div>

      <!-- ===== CONFIRM MODAL ===== -->
      <div
        *ngIf="showConfirmModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px)"
        (click)="showConfirmModal = false"
      >
        <div
          class="w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
          style="background-color: var(--color-bg-primary)"
          (click)="$event.stopPropagation()"
        >
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)"
          >
            <i
              class="ri-calendar-check-line text-2xl"
              style="color: var(--color-primary)"
            ></i>
          </div>
          <h3
            class="font-bold text-lg mb-2"
            style="color: var(--color-text-primary)"
          >
            Confirm Booking
          </h3>
          <p
            class="text-sm leading-relaxed mb-6"
            style="color: var(--color-text-secondary)"
          >
            Book
            <span
              class="font-semibold"
              style="color: var(--color-text-primary)"
              >{{ service?.name }}</span
            >
            at
            <span
              class="font-semibold"
              style="color: var(--color-text-primary)"
              >{{ beautician?.businessName }}</span
            >
            on {{ selectedDate }} at {{ selectedTime }}?
          </p>
          <div class="flex gap-3">
            <button
              (click)="showConfirmModal = false"
              class="flex-1 py-3 rounded-xl font-semibold text-sm"
              style="background-color: var(--color-bg-secondary); color: var(--color-text-primary)"
            >
              Cancel
            </button>
            <button
              (click)="confirmBooking()"
              class="flex-1 py-3 rounded-xl font-semibold text-sm"
              style="background-color: var(--color-primary); color: #fff"
              [disabled]="booking"
            >
              <span *ngIf="!booking">Confirm</span>
              <i *ngIf="booking" class="ri-loader-4-line animate-spin"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BookAppointmentComponent implements OnInit {
  salonId = "";
  serviceId = "";
  service: any = null;
  beautician: any = null;
  loadingService = true;
  loadingSlots = false;
  booking = false;

  selectedDate = "";
  selectedTime = "";
  contact = "";
  note = "";
  isFavorited = false;
  showConfirmModal = false;
  existingBooking: any = null;

  // Slider state
  isDragging = false;
  sliderThumbLeft = 4;
  sliderFillWidth = 60;
  sliderProgress = 0;
  private sliderTrackWidth = 0;
  private readonly THUMB_SIZE = 52;
  private readonly THUMB_PADDING = 4;
  private dragStartX = 0;
  private dragStartLeft = 4;

  dayOptions: DayOption[] = [];
  allSlots: TimeSlot[] = [];

  get morningSlots() {
    return this.allSlots.filter((s) => {
      const h = +s.time.split(":")[0];
      return h >= 6 && h < 12;
    });
  }
  get afternoonSlots() {
    return this.allSlots.filter((s) => {
      const h = +s.time.split(":")[0];
      return h >= 12 && h < 17;
    });
  }
  get eveningSlots() {
    return this.allSlots.filter((s) => {
      const h = +s.time.split(":")[0];
      return h >= 17;
    });
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.salonId = this.route.snapshot.paramMap.get("id") || "";
    this.serviceId =
      this.route.snapshot.queryParamMap.get("services")?.split(",")[0] || "";
    this.buildDayOptions();
    this.loadData();
    this.checkExistingBooking();
    this.initSliderListeners();

    // Measure track width after render
    setTimeout(() => {
      const track =
        (document.querySelector("[\\#sliderTrack]") as HTMLElement) ||
        (document.querySelector(".relative.h-16.rounded-2xl") as HTMLElement);
      if (track) this.sliderTrackWidth = track.offsetWidth;
    }, 300);
  }

  private initSliderListeners(): void {
    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging || !this.isFormComplete() || this.booking) return;
      const maxLeft = this.getMaxLeft();
      const delta = e.clientX - this.dragStartX;
      const newLeft = Math.max(
        this.THUMB_PADDING,
        Math.min(this.dragStartLeft + delta, maxLeft),
      );
      this.sliderThumbLeft = newLeft;
      this.sliderProgress =
        (newLeft - this.THUMB_PADDING) /
        Math.max(1, maxLeft - this.THUMB_PADDING);
      this.sliderFillWidth = newLeft + this.THUMB_SIZE;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!this.isDragging || !this.isFormComplete() || this.booking) return;
      const maxLeft = this.getMaxLeft();
      const delta = e.touches[0].clientX - this.dragStartX;
      const newLeft = Math.max(
        this.THUMB_PADDING,
        Math.min(this.dragStartLeft + delta, maxLeft),
      );
      this.sliderThumbLeft = newLeft;
      this.sliderProgress =
        (newLeft - this.THUMB_PADDING) /
        Math.max(1, maxLeft - this.THUMB_PADDING);
      this.sliderFillWidth = newLeft + this.THUMB_SIZE;
    };

    const onRelease = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      if (this.sliderProgress >= 0.85) {
        this.sliderThumbLeft = this.getMaxLeft();
        setTimeout(() => {
          this.showConfirmModal = true;
          this.resetSlider();
        }, 200);
      } else {
        this.resetSlider();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onRelease);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onRelease);
  }

  onSliderMouseDown(e: MouseEvent): void {
    if (!this.isFormComplete() || this.booking) return;
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartLeft = this.sliderThumbLeft;
    // Measure track width
    const track = (e.target as HTMLElement).closest(
      ".relative.h-16",
    ) as HTMLElement;
    if (track) this.sliderTrackWidth = track.offsetWidth;
    e.preventDefault();
  }

  onSliderTouchStart(e: TouchEvent): void {
    if (!this.isFormComplete() || this.booking) return;
    this.isDragging = true;
    this.dragStartX = e.touches[0].clientX;
    this.dragStartLeft = this.sliderThumbLeft;
    const track = (e.target as HTMLElement).closest(
      ".relative.h-16",
    ) as HTMLElement;
    if (track) this.sliderTrackWidth = track.offsetWidth;
  }

  private getMaxLeft(): number {
    return Math.max(
      this.THUMB_PADDING,
      this.sliderTrackWidth - this.THUMB_SIZE - this.THUMB_PADDING,
    );
  }

  private resetSlider(): void {
    this.sliderThumbLeft = this.THUMB_PADDING;
    this.sliderFillWidth = this.THUMB_SIZE + this.THUMB_PADDING;
    this.sliderProgress = 0;
  }

  private buildDayOptions(): void {
    const today = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    this.dayOptions = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      return {
        date: dateStr,
        label: i === 0 ? "Today" : days[d.getDay()],
        dayNum: d.getDate().toString(),
        month: months[d.getMonth()],
        isToday: i === 0,
      };
    });
    this.selectedDate = this.dayOptions[0].date;
    this.loadTimeSlots();
  }

  private loadData(): void {
    this.http
      .get<any>(`${environment.apiUrl}/services/${this.serviceId}`)
      .subscribe({
        next: (res) => {
          this.service = res?.data?.service || null;
          this.loadingService = false;
        },
        error: () => {
          this.loadingService = false;
        },
      });
    this.http
      .get<any>(`${environment.apiUrl}/beauticians/${this.salonId}`)
      .subscribe({
        next: (res) => {
          this.beautician = res?.data?.beautician || null;
        },
        error: () => {},
      });
  }

  private checkExistingBooking(): void {
    this.http
      .get<any>(`${environment.apiUrl}/bookings/my-bookings`, {
        params: { limit: "100" },
      })
      .subscribe({
        next: (res) => {
          const bookings = res?.data?.bookings || [];
          this.existingBooking =
            bookings.find(
              (b: any) =>
                b.beauticianId === this.salonId &&
                ["PENDING", "CONFIRMED"].includes(b.status),
            ) || null;
        },
        error: () => {},
      });
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.selectedTime = "";
    this.loadTimeSlots();
  }
  selectTime(time: string): void {
    this.selectedTime = time;
  }

  loadTimeSlots(): void {
    if (!this.selectedDate || !this.salonId) return;
    this.loadingSlots = true;
    this.http
      .get<any>(`${environment.apiUrl}/bookings/available-slots`, {
        params: { beauticianId: this.salonId, date: this.selectedDate },
      })
      .subscribe({
        next: (res) => {
          const slots: string[] =
            res?.data?.slots || res?.data?.availableSlots || [];
          this.allSlots = slots.map((t) => ({ time: t, available: true }));
          this.loadingSlots = false;
        },
        error: () => {
          this.allSlots = this.generateFallbackSlots();
          this.loadingSlots = false;
        },
      });
  }

  private generateFallbackSlots(): TimeSlot[] {
    const open = this.beautician?.openingTime || "08:00";
    const close = this.beautician?.closingTime || "18:00";
    const slots: TimeSlot[] = [];
    let [h, m] = open.split(":").map(Number);
    const [endH, endM] = close.split(":").map(Number);
    while (h < endH || (h === endH && m < endM)) {
      slots.push({
        time: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
        available: true,
      });
      m += 30;
      if (m >= 60) {
        m -= 60;
        h++;
      }
    }
    return slots;
  }

  isFormComplete(): boolean {
    return !!(this.selectedDate && this.selectedTime && this.contact.trim());
  }

  openConfirmModal(): void {
    if (this.isFormComplete()) this.showConfirmModal = true;
  }

  async confirmBooking(): Promise<void> {
    this.showConfirmModal = false;
    this.booking = true;

    // Duplicate check
    try {
      const res = await this.http
        .get<any>(`${environment.apiUrl}/bookings/my-bookings`, {
          params: { limit: "100" },
        })
        .toPromise();
      const bookings = res?.data?.bookings || [];
      const duplicate = bookings.find(
        (b: any) =>
          b.beauticianId === this.salonId &&
          b.serviceId === this.serviceId &&
          new Date(b.bookingDate).toISOString().startsWith(this.selectedDate) &&
          b.bookingTime === this.selectedTime &&
          ["PENDING", "CONFIRMED"].includes(b.status),
      );
      if (duplicate) {
        this.toast.warning(
          `You already have a booking at this time (#${duplicate.bookingNumber}). Cancel it first.`,
        );
        this.booking = false;
        return;
      }
    } catch {}

    this.http
      .post<any>(`${environment.apiUrl}/bookings`, {
        beauticianId: this.salonId,
        serviceId: this.serviceId,
        date: this.selectedDate,
        time: this.selectedTime,
        note: this.note || undefined,
      })
      .subscribe({
        next: (res) => {
          const booking = res?.data?.booking;
          this.booking = false;
          this.router.navigate(["/client/booking-success"], {
            queryParams: {
              bookingId: booking.id,
              bookingNumber: booking.bookingNumber,
              serviceName: this.service?.name || "",
              salonName: this.beautician?.businessName || "",
              date: this.selectedDate,
              time: this.selectedTime,
              contact: this.contact,
              note: this.note,
              totalPrice:
                booking.price?.toString() ||
                this.service?.price?.toString() ||
                "0",
            },
          });
        },
        error: (err) => {
          this.booking = false;
          this.toast.error(err?.error?.message || "Failed to create booking");
        },
      });
  }

  viewExistingBooking(): void {
    this.router.navigate(["/client/bookings", this.existingBooking.id]);
  }
  openSmartSchedule(): void {
    this.toast.info("AI Smart Scheduling coming soon!");
  }
  toggleFavorite(): void {
    this.http
      .post<any>(`${environment.apiUrl}/favorites/toggle`, {
        beauticianId: this.salonId,
      })
      .subscribe({
        next: () => {
          this.isFavorited = !this.isFavorited;
        },
        error: () => {},
      });
  }
  goBack(): void {
    this.router.navigate(["/client/salon", this.salonId]);
  }
}
