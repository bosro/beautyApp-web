import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: false,
  template: `
    <div class="flex items-center gap-0.5">
      <i *ngFor="let star of stars" class="text-sm"
        [ngClass]="{
          'ri-star-fill text-amber-400': star <= roundedRating,
          'ri-star-line text-gray-300': star > roundedRating
        }"
        [style.font-size.px]="starSize">
      </i>
      <span *ngIf="showCount" class="text-xs ml-1 text-[var(--color-text-secondary)]">
        {{ rating | number:'1.1-1' }}
        <span *ngIf="count !== undefined">({{ count }})</span>
      </span>
    </div>
  `,
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() count?: number;
  @Input() showCount = true;
  @Input() starSize = 14;

  stars = [1, 2, 3, 4, 5];
  get roundedRating() { return Math.round(this.rating); }
}
