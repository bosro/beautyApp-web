// ============================================================
// client-details.component.ts  —  Enhanced UI
// All HTTP calls, data mapping, and business logic unchanged.
// ============================================================

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-client-details",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3"
      >
        <button
          (click)="router.navigate(['/beautician/clients'])"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors"
        >
          <i
            class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"
          ></i>
        </button>
        <h1
          class="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
        >
          Client Profile
        </h1>
      </div>

      <!-- ── Loading ── -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-52 rounded-3xl"></div>
        <div class="skeleton h-24 rounded-2xl"></div>
        <div class="skeleton h-36 rounded-2xl"></div>
        <div class="skeleton h-48 rounded-2xl"></div>
      </div>

      <!-- ── Error ── -->
      <div
        *ngIf="!loading && !customer"
        class="flex flex-col items-center justify-center py-28 gap-4 px-6 text-center"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"
        >
          <i class="ri-error-warning-line text-2xl text-red-400"></i>
        </div>
        <div>
          <p class="font-semibold text-[var(--color-text-primary)]">
            Failed to load client
          </p>
          <p class="text-sm text-[var(--color-text-secondary)] mt-1">
            Something went wrong. Please try again.
          </p>
        </div>
        <button
          (click)="load()"
          class="btn-primary text-sm px-6 py-2.5 rounded-xl"
        >
          Retry
        </button>
      </div>

      <!-- ── Content ── -->
      <div *ngIf="!loading && customer" class="max-w-2xl mx-auto">
        <!-- Hero Banner -->
        <div
          class="relative px-6 pt-10 pb-8 flex flex-col items-center text-white overflow-hidden"
          style="background: linear-gradient(145deg, var(--color-primary) 0%, #C84428 100%)"
        >
          <!-- Decorative circles -->
          <div
            class="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
            style="background: rgba(255,255,255,0.4)"
          ></div>
          <div
            class="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10"
            style="background: rgba(255,255,255,0.4)"
          ></div>

          <!-- Avatar -->
          <div
            class="w-24 h-24 rounded-full border-4 border-white/80 overflow-hidden mb-3 flex items-center justify-center bg-white/20 shadow-xl relative z-10"
          >
            <img
              *ngIf="customer.avatar"
              [src]="customer.avatar"
              [alt]="customer.name"
              class="w-full h-full object-cover"
            />
            <span
              *ngIf="!customer.avatar"
              class="text-3xl font-bold text-white"
              >{{ customer.name?.charAt(0) || "?" }}</span
            >
          </div>

          <h2 class="text-xl font-bold tracking-tight relative z-10">
            {{ customer.name }}
          </h2>
          <p class="text-xs text-white/70 mt-0.5 relative z-10">
            Client since {{ customer.createdAt | date: "MMMM y" }}
          </p>

          <!-- Rating badge -->
          <div
            *ngIf="customer.averageRating > 0"
            class="flex items-center gap-1.5 mt-3 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full relative z-10"
          >
            <i class="ri-star-fill text-amber-300 text-xs"></i>
            <span class="text-sm font-semibold">{{
              customer.averageRating | number: "1.1-1"
            }}</span>
            <span class="text-xs text-white/70">rating</span>
          </div>

          <!-- Contact buttons -->
          <div class="flex gap-2.5 mt-5 relative z-10">
            <a
              *ngIf="customer.phone"
              [href]="'tel:' + customer.phone"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
            >
              <i class="ri-phone-line text-white"></i>
              <span class="text-white">Call</span>
            </a>
            <a
              *ngIf="customer.phone"
              [href]="'sms:' + customer.phone"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
            >
              <i class="ri-message-line text-white"></i>
              <span class="text-white">SMS</span>
            </a>
            <a
              *ngIf="customer.email"
              [href]="'mailto:' + customer.email"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
            >
              <i class="ri-mail-line text-white"></i>
              <span class="text-white">Email</span>
            </a>
          </div>
        </div>

        <!-- Stats Row -->
        <div
          class="mx-4 -mt-4 card rounded-2xl p-4 flex items-center shadow-lg relative z-10"
        >
          <div class="flex-1 text-center py-1">
            <p class="text-2xl font-bold text-[var(--color-primary)]">
              {{ stats?.totalVisits || customer.totalBookings || 0 }}
            </p>
            <p
              class="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium"
            >
              Visits
            </p>
          </div>
          <div class="w-px h-10 bg-[var(--color-border)]"></div>
          <div class="flex-1 text-center py-1">
            <p class="text-2xl font-bold text-[var(--color-primary)]">
              GH₵{{
                stats?.totalSpent || customer.totalSpent || 0 | number: "1.0-0"
              }}
            </p>
            <p
              class="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium"
            >
              Spent
            </p>
          </div>
          <div class="w-px h-10 bg-[var(--color-border)]"></div>
          <div class="flex-1 text-center py-1">
            <p class="text-sm font-bold text-[var(--color-primary)]">
              {{ stats?.lastVisit ? (stats.lastVisit | date: "MMM d") : "N/A" }}
            </p>
            <p
              class="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium"
            >
              Last Visit
            </p>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="mx-4 mt-3 card rounded-2xl p-4 space-y-3">
          <h3
            class="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
          >
            Contact
          </h3>
          <div *ngIf="customer.phone" class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
            >
              <i class="ri-phone-line text-[var(--color-primary)] text-sm"></i>
            </div>
            <span class="text-sm text-[var(--color-text-primary)]">{{
              customer.phone
            }}</span>
          </div>
          <div *ngIf="customer.email" class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
            >
              <i class="ri-mail-line text-[var(--color-primary)] text-sm"></i>
            </div>
            <span class="text-sm text-[var(--color-text-primary)]">{{
              customer.email
            }}</span>
          </div>
          <div *ngIf="stats?.favoriteService" class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
            >
              <i
                class="ri-scissors-2-line text-[var(--color-primary)] text-sm"
              ></i>
            </div>
            <span class="text-sm text-[var(--color-text-primary)]"
              >Fav: <strong>{{ stats.favoriteService }}</strong></span
            >
          </div>
        </div>

        <!-- Client Notes -->
        <div class="mx-4 mt-3 card rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h3
              class="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
            >
              Client Notes
            </h3>
            <button
              (click)="isAddingNote = !isAddingNote"
              class="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              [style.background-color]="
                isAddingNote
                  ? 'rgba(239,68,68,0.1)'
                  : 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
              "
            >
              <i
                [class]="
                  isAddingNote
                    ? 'ri-close-line text-red-500'
                    : 'ri-add-line text-[var(--color-primary)]'
                "
              ></i>
            </button>
          </div>

          <!-- Add note -->
          <div *ngIf="isAddingNote" class="mb-4 space-y-2">
            <textarea
              [(ngModel)]="newNote"
              rows="3"
              class="form-input resize-none text-sm rounded-xl"
              placeholder="Add a note about this client..."
              [disabled]="addingNote"
            ></textarea>
            <button
              (click)="addNote()"
              [disabled]="!newNote.trim() || addingNote"
              class="btn-primary w-full text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i
                *ngIf="addingNote"
                class="ri-loader-4-line animate-spin text-sm"
              ></i>
              {{ addingNote ? "Saving…" : "Save Note" }}
            </button>
          </div>

          <!-- Empty -->
          <div
            *ngIf="notes.length === 0 && !isAddingNote"
            class="py-6 text-center"
          >
            <i
              class="ri-sticky-note-line text-2xl text-[var(--color-text-muted)] opacity-40 mb-2 block"
            ></i>
            <p class="text-sm text-[var(--color-text-muted)]">No notes yet</p>
          </div>

          <!-- Note cards -->
          <div
            *ngFor="let note of notes"
            class="flex gap-3 p-3 rounded-xl mb-2 last:mb-0"
            style="background: color-mix(in srgb, #FF9800 10%, transparent)"
          >
            <i
              class="ri-sticky-note-line text-amber-500 flex-shrink-0 mt-0.5 text-sm"
            ></i>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm text-[var(--color-text-primary)] leading-relaxed"
              >
                {{ note.content }}
              </p>
              <p class="text-xs text-[var(--color-text-muted)] mt-1">
                {{ note.createdAt | date: "MMM d, y" }}
              </p>
            </div>
            <button
              (click)="deleteNote(note.id)"
              [disabled]="deletingNote === note.id"
              class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <i
                *ngIf="deletingNote !== note.id"
                class="ri-delete-bin-line text-sm text-red-400"
              ></i>
              <i
                *ngIf="deletingNote === note.id"
                class="ri-loader-4-line animate-spin text-sm text-red-400"
              ></i>
            </button>
          </div>
        </div>

        <!-- Booking History -->
        <div class="mx-4 mt-3 mb-6 card rounded-2xl p-4">
          <h3
            class="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 mb-3"
          >
            Booking History
          </h3>

          <div *ngIf="bookingHistory.length === 0" class="py-6 text-center">
            <i
              class="ri-calendar-line text-2xl text-[var(--color-text-muted)] opacity-40 mb-2 block"
            ></i>
            <p class="text-sm text-[var(--color-text-muted)]">
              No bookings yet
            </p>
          </div>

          <div
            *ngFor="let booking of bookingHistory; let last = last"
            class="flex items-center gap-3 py-3"
            [class.border-b]="!last"
            [class.border-[var(--color-border)]]="!last"
          >
            <!-- Service icon -->
            <div
              class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
            >
              <i
                class="ri-scissors-2-line text-[var(--color-primary)] text-sm"
              ></i>
            </div>

            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-semibold text-[var(--color-text-primary)] truncate"
              >
                {{ booking.service?.name }}
              </p>
              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {{ booking.bookingDate | date: "MMM d, y" }} ·
                {{ booking.bookingTime }}
              </p>
            </div>

            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <p class="text-sm font-bold text-[var(--color-primary)]">
                GH₵{{ booking.price | number: "1.2-2" }}
              </p>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                [ngClass]="
                  booking.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                "
              >
                {{
                  booking.status.charAt(0) +
                    booking.status.slice(1).toLowerCase()
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ClientDetailsComponent implements OnInit {
  clientId = "";
  customer: any = null;
  bookingHistory: any[] = [];
  notes: any[] = [];
  stats: any = null;
  loading = true;
  isAddingNote = false;
  newNote = "";
  addingNote = false;
  deletingNote: string | null = null;

  constructor(
    private http: HttpClient,
    public router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get("id") || "";
    this.load();
  }

  load() {
    this.loading = true;
    this.http
      .get<any>(`${environment.apiUrl}/customers/${this.clientId}`)
      .subscribe({
        next: (res) => {
          this.customer = res.data?.customer;
          this.bookingHistory = res.data?.bookings || [];
          this.notes = (res.data?.notes || []).map((n: any) => ({
            ...n,
            content: n.description,
          }));
          this.stats = res.data?.stats;
          this.loading = false;
        },
        error: () => {
          this.toast.error("Failed to load client details");
          this.loading = false;
        },
      });
  }

  addNote() {
    if (!this.newNote.trim()) return;
    this.addingNote = true;
    this.http
      .post<any>(`${environment.apiUrl}/customers/${this.clientId}/notes`, {
        content: this.newNote.trim(),
      })
      .subscribe({
        next: (res) => {
          const note = res.data?.note
            ? { ...res.data.note, content: res.data.note.description }
            : {
                id: Date.now().toString(),
                content: this.newNote.trim(),
                createdAt: new Date().toISOString(),
              };
          this.notes = [note, ...this.notes];
          this.newNote = "";
          this.isAddingNote = false;
          this.addingNote = false;
          this.toast.success("Note added");
        },
        error: () => {
          this.addingNote = false;
          this.toast.error("Failed to add note");
        },
      });
  }

  deleteNote(noteId: string) {
    this.deletingNote = noteId;
    this.http
      .delete(
        `${environment.apiUrl}/customers/${this.clientId}/notes/${noteId}`,
      )
      .subscribe({
        next: () => {
          this.notes = this.notes.filter((n) => n.id !== noteId);
          this.deletingNote = null;
          this.toast.success("Note deleted");
        },
        error: () => {
          this.deletingNote = null;
          this.toast.error("Failed to delete note");
        },
      });
  }
}
