import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-booking-success",
  template: `
    <div class="min-h-screen flex flex-col" style="background-color: var(--color-bg-primary)">
      <div class="flex-1 overflow-y-auto px-4 lg:px-6 max-w-2xl mx-auto w-full pt-16 pb-32">

        <!-- SUCCESS ICON -->
        <div class="flex flex-col items-center mb-8 animate-bounce-once">
          <div class="w-28 h-28 rounded-full flex items-center justify-center mb-6"
            style="background-color: rgba(76, 175, 80, 0.15)">
            <i class="ri-checkbox-circle-fill text-6xl" style="color: #4CAF50"></i>
          </div>
          <h1 class="text-2xl font-bold mb-2 text-center" style="color: var(--color-text-primary)">
            Booking Confirmed!
          </h1>
          <p class="text-sm text-center" style="color: var(--color-text-secondary)">
            Your appointment has been successfully booked
          </p>
        </div>

        <!-- BOOKING NUMBER BADGE -->
        <div class="flex flex-col items-center mb-8">
          <div class="px-6 py-3 rounded-2xl text-center"
            style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
            <p class="text-xs mb-1" style="color: var(--color-text-secondary)">Booking Number</p>
            <p class="text-2xl font-bold" style="color: var(--color-primary)">#{{ bookingNumber }}</p>
          </div>
        </div>

        <!-- DETAILS CARD -->
        <div class="rounded-2xl p-5 mb-4" style="background-color: var(--color-bg-secondary)">
          <h2 class="font-bold text-base mb-4" style="color: var(--color-text-primary)">Booking Details</h2>

          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
                <i class="ri-calendar-line" style="color: var(--color-primary)"></i>
              </div>
              <div>
                <p class="text-xs mb-0.5" style="color: var(--color-text-secondary)">Date & Time</p>
                <p class="text-sm font-medium" style="color: var(--color-text-primary)">{{ date }} at {{ time }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
                <i class="ri-scissors-line" style="color: var(--color-primary)"></i>
              </div>
              <div>
                <p class="text-xs mb-0.5" style="color: var(--color-text-secondary)">Service</p>
                <p class="text-sm font-medium" style="color: var(--color-text-primary)">{{ serviceName }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
                <i class="ri-map-pin-line" style="color: var(--color-primary)"></i>
              </div>
              <div>
                <p class="text-xs mb-0.5" style="color: var(--color-text-secondary)">Location</p>
                <p class="text-sm font-medium" style="color: var(--color-text-primary)">{{ salonName }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
                <i class="ri-money-dollar-circle-line" style="color: var(--color-primary)"></i>
              </div>
              <div>
                <p class="text-xs mb-0.5" style="color: var(--color-text-secondary)">Total Price</p>
                <p class="text-lg font-bold" style="color: var(--color-primary)">
                  GHS {{ (+totalPrice).toFixed(2) }}
                </p>
              </div>
            </div>

            <div *ngIf="note" class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
                <i class="ri-sticky-note-line" style="color: var(--color-primary)"></i>
              </div>
              <div>
                <p class="text-xs mb-0.5" style="color: var(--color-text-secondary)">Note</p>
                <p class="text-sm font-medium" style="color: var(--color-text-primary)">{{ note }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- INFO BANNER -->
        <div class="rounded-xl p-3 mb-6 flex items-center gap-2"
          style="background-color: rgba(100,210,255,0.12)">
          <i class="ri-information-line flex-shrink-0" style="color: #64D2FF"></i>
          <p class="text-xs" style="color: #64D2FF">A confirmation has been sent to {{ contact }}</p>
        </div>

      </div>

      <!-- STICKY BUTTONS -->
      <div class="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style="background: linear-gradient(to top, var(--color-bg-primary) 80%, transparent)">
        <div class="max-w-2xl mx-auto space-y-2">
          <button (click)="viewBookingDetails()"
            class="w-full py-4 rounded-2xl font-bold text-sm"
            style="background-color: #1a1a1a; color: #fff">
            View Booking Details
          </button>
          <div class="flex gap-2">
            <button (click)="viewBookings()"
              class="flex-1 py-3 rounded-xl font-semibold text-sm"
              style="background-color: var(--color-bg-secondary); color: var(--color-primary)">
              My Bookings
            </button>
            <button (click)="goHome()"
              class="flex-1 py-3 rounded-xl font-semibold text-sm"
              style="background-color: var(--color-bg-secondary); color: var(--color-text-secondary)">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BookingSuccessComponent implements OnInit {
  bookingId = "";
  bookingNumber = "";
  serviceName = "";
  salonName = "";
  date = "";
  time = "";
  contact = "";
  note = "";
  totalPrice = "0";

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const p = this.route.snapshot.queryParamMap;
    this.bookingId = p.get("bookingId") || "";
    this.bookingNumber = p.get("bookingNumber") || "";
    this.serviceName = p.get("serviceName") || "";
    this.salonName = p.get("salonName") || "";
    this.date = p.get("date") || "";
    this.time = p.get("time") || "";
    this.contact = p.get("contact") || "";
    this.note = p.get("note") || "";
    this.totalPrice = p.get("totalPrice") || "0";
  }

  viewBookingDetails(): void { this.router.navigate(["/client/bookings", this.bookingId]); }
  viewBookings(): void { this.router.navigate(["/client/bookings"]); }
  goHome(): void { this.router.navigate(["/client/home"]); }
}