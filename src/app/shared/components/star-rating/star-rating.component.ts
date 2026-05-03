import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `
    <div class="flex items-center gap-0.5">
      <i
        *ngFor="let star of stars"
        class="text-sm"
        [ngClass]="{
          'ri-star-fill': star <= Math.round(rating),
          'ri-star-line': star > Math.round(rating),
          'text-yellow-400': star <= Math.round(rating),
          'text-gray-300': star > Math.round(rating)
        }"
        [style.font-size.px]="starSize"
      ></i>
      <span *ngIf="showCount" class="text-xs ml-1" style="color: var(--color-text-secondary)">
        {{ rating.toFixed(1) }}
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

  Math = Math;
  stars = [1, 2, 3, 4, 5];
}
