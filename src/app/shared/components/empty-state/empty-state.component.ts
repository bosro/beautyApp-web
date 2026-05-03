import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        class="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl"
        style="background-color: var(--color-bg-secondary)"
      >
        <i [class]="icon" style="color: var(--color-text-placeholder)"></i>
      </div>
      <h3 class="text-lg font-bold mb-2" style="color: var(--color-text-primary)">{{ title }}</h3>
      <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">{{ subtitle }}</p>
      <button
        *ngIf="actionLabel"
        (click)="onAction()"
        class="mt-5 btn-primary text-sm px-6 py-2.5"
      >
        {{ actionLabel }}
      </button>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'ri-inbox-line';
  @Input() title = 'Nothing here yet';
  @Input() subtitle = '';
  @Input() actionLabel = '';
  @Input() onAction: () => void = () => {};
}
