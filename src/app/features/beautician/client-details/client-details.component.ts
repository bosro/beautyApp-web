// client-details.component.ts
// NEW — mirrors mobile ClientDetailsScreen exactly.
// API shape from mobile hooks:
//   useCustomer(id) → GET /beauticians/customers/:id
//   Response: { data: { customer, bookings, notes, stats } }
//   useAddCustomerNote → POST /beauticians/customers/:id/notes  { content }
//   useDeleteCustomerNote → DELETE /beauticians/customers/:id/notes/:noteId

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
      <!-- Header -->
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3"
      >
        <button
          (click)="router.navigate(['/beautician/clients'])"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]"
        >
          <i
            class="ri-arrow-left-line text-xl text-[var(--color-text-primary)]"
          ></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Client Profile
        </h1>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-48 rounded-2xl"></div>
        <div class="skeleton h-32 rounded-2xl"></div>
        <div class="skeleton h-48 rounded-2xl"></div>
      </div>

      <div
        *ngIf="!loading && !customer"
        class="flex flex-col items-center justify-center py-24 gap-3"
      >
        <i
          class="ri-error-warning-line text-4xl text-[var(--color-text-muted)]"
        ></i>
        <p class="text-[var(--color-text-secondary)]">Failed to load client</p>
        <button (click)="load()" class="btn-primary text-sm px-4 py-2">
          Retry
        </button>
      </div>

      <div
        *ngIf="!loading && customer"
        class="max-w-2xl mx-auto space-y-4 pb-8"
      >
        <!-- Hero banner — mirrors mobile LinearGradient clientHeader -->
        <div
          class="relative px-6 py-10 flex flex-col items-center text-white"
          style="background: linear-gradient(135deg, var(--color-primary), #D84A32)"
        >
          <!-- Avatar -->
          <div
            class="w-24 h-24 rounded-full border-4 border-white overflow-hidden mb-4 flex items-center justify-center bg-white/30"
          >
            <img
              *ngIf="customer.avatar"
              [src]="customer.avatar"
              [alt]="customer.name"
              class="w-full h-full object-cover"
            />
            <i
              *ngIf="!customer.avatar"
              class="ri-user-line text-4xl text-white"
            ></i>
          </div>

          <h2 class="text-2xl font-bold">{{ customer.name }}</h2>
          <p class="text-sm opacity-90 mt-0.5">
            Client since {{ customer.createdAt | date: "MMM y" }}
          </p>

          <div
            *ngIf="customer.averageRating > 0"
            class="flex items-center gap-1 mt-2 bg-white/20 px-3 py-1 rounded-full"
          >
            <i class="ri-star-fill text-amber-300 text-sm"></i>
            <span class="text-sm font-semibold"
              >{{ customer.averageRating | number: "1.1-1" }} Rating</span
            >
          </div>

          <!-- Contact buttons — mirrors mobile contactButtons -->
          <div class="flex gap-3 mt-4">
            <a
              *ngIf="customer.phone"
              [href]="'tel:' + customer.phone"
              class="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <i class="ri-phone-line text-white text-xl"></i>
            </a>
            <a
              *ngIf="customer.phone"
              [href]="'sms:' + customer.phone"
              class="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <i class="ri-message-line text-white text-xl"></i>
            </a>
            <a
              *ngIf="customer.email"
              [href]="'mailto:' + customer.email"
              class="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <i class="ri-mail-line text-white text-xl"></i>
            </a>
          </div>
        </div>

        <!-- Stats row — mirrors mobile statsCard -->
        <div class="mx-4 card p-4 flex items-center">
          <div class="flex-1 text-center">
            <p class="text-xl font-bold text-[var(--color-primary)]">
              {{ stats?.totalVisits || customer.totalBookings || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)]">Total Visits</p>
          </div>
          <div class="w-px h-10 bg-[var(--color-border)]"></div>
          <div class="flex-1 text-center">
            <p class="text-xl font-bold text-[var(--color-primary)]">
              GH₵
              {{
                stats?.totalSpent || customer.totalSpent || 0 | number: "1.0-0"
              }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)]">Total Spent</p>
          </div>
          <div class="w-px h-10 bg-[var(--color-border)]"></div>
          <div class="flex-1 text-center">
            <p class="text-sm font-bold text-[var(--color-primary)]">
              {{ stats?.lastVisit ? (stats.lastVisit | date: "MMM d") : "N/A" }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)]">Last Visit</p>
          </div>
        </div>

        <!-- Contact info -->
        <div class="mx-4 card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">
            Contact Information
          </h3>
          <div *ngIf="customer.phone" class="flex items-center gap-3">
            <i class="ri-phone-line text-[var(--color-primary)]"></i>
            <span class="text-sm text-[var(--color-text-primary)]">{{
              customer.phone
            }}</span>
          </div>
          <div *ngIf="customer.email" class="flex items-center gap-3">
            <i class="ri-mail-line text-[var(--color-primary)]"></i>
            <span class="text-sm text-[var(--color-text-primary)]">{{
              customer.email
            }}</span>
          </div>
          <div *ngIf="stats?.favoriteService" class="flex items-center gap-3">
            <i class="ri-scissors-2-line text-[var(--color-primary)]"></i>
            <span class="text-sm text-[var(--color-text-primary)]"
              >Favorite: {{ stats.favoriteService }}</span
            >
          </div>
        </div>

        <!-- Client Notes — mirrors mobile "Client Notes" card + TextInput + note cards -->
        <div class="mx-4 card p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-[var(--color-text-primary)]">
              Client Notes
            </h3>
            <button
              (click)="isAddingNote = !isAddingNote"
              class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
            >
              <i
                [class]="
                  isAddingNote
                    ? 'ri-close-line text-white'
                    : 'ri-add-line text-white'
                "
              ></i>
            </button>
          </div>

          <!-- Add note form -->
          <div *ngIf="isAddingNote" class="mb-4 space-y-2">
            <textarea
              [(ngModel)]="newNote"
              rows="3"
              class="form-input resize-none text-sm"
              placeholder="Add a note about this client..."
              [disabled]="addingNote"
            ></textarea>
            <button
              (click)="addNote()"
              [disabled]="!newNote.trim() || addingNote"
              class="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <i *ngIf="addingNote" class="ri-loader-4-line animate-spin"></i>
              {{ addingNote ? "Saving..." : "Save Note" }}
            </button>
          </div>

          <!-- Empty notes -->
          <p
            *ngIf="notes.length === 0 && !isAddingNote"
            class="text-sm text-[var(--color-text-muted)] text-center py-4"
          >
            No notes added yet
          </p>

          <!-- Note cards — mirrors mobile noteCard -->
          <div
            *ngFor="let note of notes"
            class="flex gap-2 p-3 rounded-xl mb-2"
            style="background: color-mix(in srgb, #FF9800 12%, transparent)"
          >
            <i
              class="ri-sticky-note-line text-amber-500 flex-shrink-0 mt-0.5"
            ></i>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-[var(--color-text-primary)]">
                {{ note.content }}
              </p>
              <p class="text-xs text-[var(--color-text-secondary)] mt-1">
                {{ note.createdAt | date: "MMM d, y" }}
              </p>
            </div>
            <button
              (click)="deleteNote(note.id)"
              [disabled]="deletingNote === note.id"
              class="flex-shrink-0 text-red-400 hover:text-red-500 disabled:opacity-50"
            >
              <i
                *ngIf="deletingNote !== note.id"
                class="ri-delete-bin-line text-sm"
              ></i>
              <i
                *ngIf="deletingNote === note.id"
                class="ri-loader-4-line animate-spin text-sm"
              ></i>
            </button>
          </div>
        </div>

        <!-- Booking history — mirrors mobile bookingHistory list -->
        <div class="mx-4 card p-4">
          <h3 class="font-semibold text-[var(--color-text-primary)] mb-4">
            Booking History
          </h3>

          <p
            *ngIf="bookingHistory.length === 0"
            class="text-sm text-[var(--color-text-muted)] text-center py-4"
          >
            No bookings yet
          </p>

          <div
            *ngFor="let booking of bookingHistory"
            class="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[var(--color-text-primary)]">
                {{ booking.service?.name }}
              </p>
              <p class="text-xs text-[var(--color-text-secondary)]">
                {{ booking.bookingDate | date: "MMM d, y" }} ·
                {{ booking.bookingTime }}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
              <p class="text-sm font-bold text-[var(--color-primary)]">
                GH₵ {{ booking.price | number: "1.2-2" }}
              </p>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-md"
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
    // Fix: /customers/:id not /beauticians/customers/:id
    this.http
      .get<any>(`${environment.apiUrl}/customers/${this.clientId}`)
      .subscribe({
        next: (res) => {
          this.customer = res.data?.customer;
          this.bookingHistory = res.data?.bookings || [];
          // Fix: notes use 'description' field, not 'content'
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
    // Fix: /customers/:id/notes
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
    // Fix: /customers/:id/notes/:noteId
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
