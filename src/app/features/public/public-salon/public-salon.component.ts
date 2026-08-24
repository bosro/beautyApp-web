// public-salon.component.ts
//
// Read-only salon preview for guests — reuses the public GET
// /beauticians/:id endpoint. Any action that needs a session (book,
// message, favorite, see full reviews) routes through requireAuth(),
// which sends the visitor to login with a clear reason and brings them
// back here afterward via returnUrl.

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-public-salon',
  template: `
    <div style="background-color: var(--color-background); min-height: 100vh;">
      <div *ngIf="loading" class="flex items-center justify-center" style="height: 60vh">
        <app-spinner></app-spinner>
      </div>

      <ng-container *ngIf="!loading && salon">
        <!-- Cover -->
        <div class="relative" style="height: 220px">
          <img
            [src]="salon.coverImage || salon.profileImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop'"
            alt="Cover"
            class="w-full h-full object-cover"
          />
          <button
            (click)="router.navigate(['/'])"
            class="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
            style="background: rgba(0,0,0,0.4)"
          >
            <i class="ri-arrow-left-line text-white"></i>
          </button>
        </div>

        <div class="px-4 -mt-10 relative">
          <img
            [src]="salon.profileImage || salon.coverImage"
            [alt]="salon.businessName"
            class="w-20 h-20 rounded-2xl object-cover border-4"
            style="border-color: var(--color-background)"
          />

          <h1 class="text-xl font-bold mt-3" style="color: var(--color-text-primary)">
            {{ salon.businessName }}
          </h1>
          <p class="text-sm" style="color: var(--color-text-secondary)">
            {{ salon.businessCategory }} · {{ salon.city }}, {{ salon.region }}
          </p>

          <div class="flex items-center gap-1.5 mt-2" *ngIf="salon.rating">
            <i class="ri-star-fill text-yellow-400 text-sm"></i>
            <span class="text-sm font-semibold" style="color: var(--color-text-primary)">{{ salon.rating | number: '1.1-1' }}</span>
            <span class="text-sm" style="color: var(--color-text-secondary)">({{ salon.totalReviews }} reviews)</span>
          </div>

          <p class="text-sm mt-4 leading-relaxed" style="color: var(--color-text-secondary)" *ngIf="salon.bio">
            {{ salon.bio }}
          </p>

          <div class="flex items-center gap-2 mt-4 text-sm" style="color: var(--color-text-secondary)" *ngIf="salon.openingTime">
            <i class="ri-time-line"></i>
            <span>{{ salon.openingTime }} – {{ salon.closingTime }}</span>
          </div>

          <!-- Guest CTA banner -->
          <div
            class="mt-6 p-4 rounded-2xl"
            style="background-color: var(--color-bg-secondary)"
          >
            <p class="text-sm font-medium mb-3" style="color: var(--color-text-primary)">
              Sign in to book an appointment, message {{ salon.businessName }}, or save it to your favorites.
            </p>
            <div class="flex gap-2">
              <button
                (click)="requireAuth()"
                class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
                style="background-color: var(--color-primary)"
              >
                Sign in
              </button>
              <button
                (click)="router.navigate(['/auth/register'])"
                class="flex-1 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                style="border: 1px solid var(--color-border-light); color: var(--color-text-primary)"
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <app-empty-state
        *ngIf="!loading && !salon"
        icon="ri-error-warning-line"
        title="Salon not found"
        subtitle="This profile may have been removed."
      ></app-empty-state>
    </div>
  `,
})
export class PublicSalonComponent implements OnInit, OnDestroy {
  salon: any = null;
  loading = true;
  private jsonLdScript?: HTMLScriptElement;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private titleService: Title,
    private metaService: Meta,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }
    this.http.get<any>(`${environment.apiUrl}/beauticians/${id}`).subscribe({
      next: (res) => {
        this.salon = res?.data?.beautician || res?.data || null;
        this.loading = false;
        if (this.salon) this.setSeoTags(this.salon);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    // Reset to the site-wide defaults from index.html so navigating away
    // (e.g. back to the public home) doesn't leave a stale salon title/meta
    // behind on a page that never sets its own.
    this.titleService.setTitle(
      "Bigluxx — Discover, Book, and Experience Luxury Beauty in Ghana",
    );
    this.metaService.updateTag({
      name: 'description',
      content:
        "Bigluxx connects you with Ghana's top-rated hair, nail, spa and makeup professionals. Browse verified beauticians, compare reviews, and book your next appointment in minutes.",
    });
    this.jsonLdScript?.remove();
  }

  private setSeoTags(salon: any): void {
    const name = salon.businessName || 'Beauty professional';
    const location = [salon.city, salon.region].filter(Boolean).join(', ');
    const category = salon.businessCategory || 'Beauty services';
    const description = salon.bio
      ? this.truncate(salon.bio, 155)
      : `Book ${name} on Bigluxx — ${category}${location ? ` in ${location}` : ''}. Compare reviews and book your appointment in minutes.`;
    const image =
      salon.profileImage ||
      salon.coverImage ||
      `${this.siteUrl()}/assets/icons/icon-512x512.png`;
    const pageTitle = `${name} — ${category}${location ? ` in ${location}` : ''} | Bigluxx`;
    const pageUrl = `${this.siteUrl()}${this.router.url}`;

    this.titleService.setTitle(pageTitle);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'business.business' });
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ name: 'twitter:title', content: pageTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    this.injectJsonLd(salon, name, description, image, pageUrl);
  }

  /** Structured data so search engines can render a rich result (name,
   * rating, address) for this salon directly in search — this only helps
   * crawlers that execute JS (Googlebot does); it doesn't affect what
   * link-preview scrapers like WhatsApp/Facebook show, since those read the
   * raw HTML without running JS. A proper fix for social-preview cards
   * would need server-side rendering or prerendering per salon, which is a
   * bigger change than this component can do on its own. */
  private injectJsonLd(
    salon: any,
    name: string,
    description: string,
    image: string,
    pageUrl: string,
  ): void {
    this.jsonLdScript?.remove();

    const data: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name,
      description,
      image,
      url: pageUrl,
    };
    if (salon.city || salon.region) {
      data['address'] = {
        '@type': 'PostalAddress',
        addressLocality: salon.city,
        addressRegion: salon.region,
        addressCountry: 'GH',
      };
    }
    if (salon.rating) {
      data['aggregateRating'] = {
        '@type': 'AggregateRating',
        ratingValue: salon.rating,
        reviewCount: salon.totalReviews || 0,
      };
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    this.jsonLdScript = script;
  }

  private truncate(text: string, max: number): string {
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
  }

  private siteUrl(): string {
    return typeof window !== 'undefined' ? window.location.origin : 'https://bigluxx.com';
  }

  requireAuth(): void {
    this.toast.info('Sign in to continue');
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url },
    });
  }
}




