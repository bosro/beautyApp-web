import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-clients',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 space-y-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Clients</h1>
          <span class="text-sm text-[var(--color-text-muted)]">{{ clients.length }} total</span>
        </div>
        <div class="relative">
          <i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"></i>
          <input [(ngModel)]="search" (ngModelChange)="filterClients()" type="text" class="form-input pl-9" placeholder="Search clients..." />
        </div>
      </div>

      <div *ngIf="loading" class="p-4 space-y-3">
        <div *ngFor="let i of [1,2,3,4,5]" class="skeleton h-20 rounded-xl"></div>
      </div>

      <app-empty-state
        *ngIf="!loading && filtered.length === 0"
        icon="ri-group-line"
        title="No Clients Yet"
        subtitle="Clients who book with you will appear here.">
      </app-empty-state>

      <div *ngIf="!loading && filtered.length > 0" class="divide-y divide-[var(--color-border)]">
        <div *ngFor="let client of filtered"
          class="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-background)] transition-colors cursor-pointer"
          (click)="viewClient(client.id)">

          <img
            [src]="client.avatar || 'https://ui-avatars.com/api/?name=' + client.firstName + '+' + client.lastName + '&size=40'"
            class="w-11 h-11 rounded-full object-cover flex-shrink-0"
          />

          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-[var(--color-text-primary)]">{{ client.firstName }} {{ client.lastName }}</p>
            <p class="text-xs text-[var(--color-text-secondary)]">{{ client.phone || client.email }}</p>
          </div>

          <div class="text-right flex-shrink-0">
            <p class="text-xs font-semibold text-[var(--color-primary)]">{{ client.totalBookings }} bookings</p>
            <p class="text-xs text-[var(--color-text-muted)]">GH₵ {{ client.totalSpent | number:'1.0-0' }} spent</p>
          </div>

          <i class="ri-arrow-right-s-line text-[var(--color-text-muted)]"></i>
        </div>
      </div>

    </div>
  `,
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  filtered: any[] = [];
  loading = true;
  search = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/beauticians/clients`).subscribe({
      next: (res) => { this.clients = res.data || []; this.filtered = [...this.clients]; this.loading = false; },
      error: () => this.loading = false
    });
  }

  filterClients() {
    const q = this.search.toLowerCase();
    this.filtered = this.clients.filter(c =>
      `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(q)
    );
  }

  viewClient(id: string) { this.router.navigate(['/beautician/clients', id]); }
}
