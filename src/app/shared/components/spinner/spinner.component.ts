import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: false,
  template: `
    <div class="flex flex-col items-center justify-center"
      [class.min-h-screen]="fullPage"
      [class.py-20]="!fullPage">
      <div class="rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"
        [style.width.px]="size"
        [style.height.px]="size">
      </div>
      <p *ngIf="label" class="mt-3 text-sm text-[var(--color-text-secondary)]">{{ label }}</p>
    </div>
  `,
})
export class SpinnerComponent {
  @Input() size = 40;
  @Input() label = '';
  @Input() fullPage = false;
}
