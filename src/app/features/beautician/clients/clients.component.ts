// ============================================================
// clients.component.ts  —  Enhanced UI
// ============================================================

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";

@Component({
  selector: "app-clients",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 pt-3 pb-3 space-y-3"
      >
        <div class="flex items-center justify-between">
          <h1
            class="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
          >
            Clients
          </h1>
          <span
            class="text-xs font-semibold px-2.5 py-1 rounded-lg"
            style="background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary)"
          >
            {{ filtered.length }} total
          </span>
        </div>
        <div class="relative">
          <i
            class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]"
          ></i>
          <input
            [(ngModel)]="search"
            (ngModelChange)="filterClients()"
            type="text"
            class="form-input pl-9 rounded-xl text-sm"
            placeholder="Search by name, phone, or email…"
          />
        </div>
      </div>

      <!-- ── Loading ── -->
      <div *ngIf="loading" class="p-4 space-y-2 max-w-2xl mx-auto">
        <div
          *ngFor="let i of [1, 2, 3, 4, 5]"
          class="skeleton h-20 rounded-2xl"
        ></div>
      </div>

      <!-- ── Empty ── -->
      <app-empty-state
        *ngIf="!loading && filtered.length === 0"
        icon="ri-group-line"
        title="No Clients Yet"
        subtitle="Clients who book with you will appear here."
      >
      </app-empty-state>

      <!-- ── List ── -->
      <div
        *ngIf="!loading && filtered.length > 0"
        class="p-4 max-w-2xl mx-auto space-y-2"
      >
        <div
          *ngFor="let client of filtered"
          class="card rounded-2xl flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:border-[var(--color-primary)] transition-colors group"
          (click)="viewClient(client.id)"
        >
          <!-- Avatar -->
          <div
            class="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-primary)]/10 flex items-center justify-center"
          >
            <img
              *ngIf="client.avatar"
              [src]="client.avatar"
              class="w-full h-full object-cover"
            />
            <span
              *ngIf="!client.avatar"
              class="font-black text-lg text-[var(--color-primary)]"
            >
              {{ (client.name || "U").charAt(0).toUpperCase() }}
            </span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p
              class="font-bold text-sm text-[var(--color-text-primary)] truncate"
            >
              {{ client.name }}
            </p>
            <p
              class="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate"
            >
              {{ client.phone || client.email }}
            </p>
          </div>

          <!-- Stats -->
          <div class="text-right flex-shrink-0">
            <p class="text-xs font-bold text-[var(--color-primary)]">
              {{ client.totalBookings }} bookings
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
              GH₵{{ client.totalSpent | number: "1.0-0" }} spent
            </p>
          </div>

          <i
            class="ri-arrow-right-s-line text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
          ></i>
        </div>
      </div>
    </div>
  `,
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  filtered: any[] = [];
  loading = true;
  search = "";

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/beauticians/clients`).subscribe({
      next: (res) => {
        this.clients = res.data?.customers || [];
        this.filtered = [...this.clients];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  filterClients() {
    const q = this.search.toLowerCase();
    this.filtered = this.clients.filter((c) =>
      `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q),
    );
  }

  viewClient(id: string) {
    this.router.navigate(["/beautician/clients", id]);
  }
}
