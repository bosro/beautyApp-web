import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

export type ModalType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-confirm-modal',
  template: `
    <div
      *ngIf="visible"
      class="fixed inset-0 flex items-center justify-center z-50 p-4"
      style="background-color: rgba(0,0,0,0.5)"
      (click)="onOverlayClick($event)"
    >
      <div
        class="w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        style="background-color: var(--color-bg-primary)"
        (click)="$event.stopPropagation()"
      >
        <!-- Icon -->
        <div class="flex justify-center mb-4">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            [ngClass]="{
              'bg-green-100 text-green-600': type === 'success',
              'bg-red-100 text-red-600': type === 'error',
              'bg-orange-100 text-orange-600': type === 'warning',
              'bg-blue-100 text-blue-600': type === 'info'
            }"
          >
            <i
              [ngClass]="{
                'ri-checkbox-circle-line': type === 'success',
                'ri-error-warning-line': type === 'error',
                'ri-alert-line': type === 'warning',
                'ri-information-line': type === 'info'
              }"
            ></i>
          </div>
        </div>

        <!-- Content -->
        <h3 class="text-lg font-bold text-center mb-2" style="color: var(--color-text-primary)">
          {{ title }}
        </h3>
        <p class="text-sm text-center mb-6" style="color: var(--color-text-secondary)">
          {{ message }}
        </p>

        <!-- Actions -->
        <div class="flex gap-3" [class.flex-col]="!showCancel">
          <button
            *ngIf="showCancel"
            (click)="onCancel()"
            class="flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all"
            style="border-color: var(--color-border-light); color: var(--color-text-secondary)"
          >
            {{ cancelText }}
          </button>
          <button
            (click)="onConfirm()"
            class="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
            [ngClass]="{
              'bg-green-600 hover:bg-green-700': type === 'success',
              'bg-red-600 hover:bg-red-700': type === 'error',
              'bg-orange-500 hover:bg-orange-600': type === 'warning',
              'bg-blue-600 hover:bg-blue-700': type === 'info'
            }"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() type: ModalType = 'info';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() showCancel = true;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.closed.emit();
  }

  onOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      this.closed.emit();
    }
  }
}
