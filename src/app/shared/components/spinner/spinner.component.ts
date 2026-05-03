import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div
      class="flex flex-col items-center justify-center"
      [class.min-h-screen]="fullPage"
      [class.py-20]="!fullPage"
    >
      <div
        class="rounded-full border-4 border-t-transparent animate-spin"
        [ngStyle]="{
          'width.px': size,
          'height.px': size,
          'border-color': 'var(--color-primary)',
          'border-top-color': 'transparent'
        }"
      ></div>
      <p *ngIf="label" class="mt-3 text-sm" style="color: var(--color-text-secondary)">
        {{ label }}
      </p>
    </div>
  `,
})
export class SpinnerComponent {
  @Input() size = 40;
  @Input() label = '';
  @Input() fullPage = false;
}
