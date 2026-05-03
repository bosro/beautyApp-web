import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: false,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-20 h-20 rounded-full bg-[var(--color-background)] flex items-center justify-center mb-4">
        <i [class]="icon" class="text-4xl text-[var(--color-text-muted)]"></i>
      </div>
      <h3 class="text-lg font-bold mb-2 text-[var(--color-text-primary)]">{{ title }}</h3>
      <p class="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xs">{{ subtitle }}</p>
      <button *ngIf="actionLabel" (click)="actionFn()" class="mt-5 btn-primary text-sm px-6 py-2.5">
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
  @Input() actionFn: () => void = () => {};
}
