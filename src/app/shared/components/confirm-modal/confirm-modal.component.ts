import { Component, Input, Output, EventEmitter } from "@angular/core";

export type ModalType = "success" | "error" | "warning" | "info";

@Component({
  selector: "app-confirm-modal",
  standalone: false,
  template: `
    <div
      *ngIf="visible"
      class="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50"
      (click)="onOverlay($event)"
    >
      <div
        class="w-full max-w-sm bg-[var(--color-surface)] rounded-2xl p-6 shadow-2xl"
        (click)="$event.stopPropagation()"
      >
        <!-- Icon -->
        <div class="flex justify-center mb-4">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            [ngClass]="{
              'bg-green-100 dark:bg-green-900/30 text-green-600':
                type === 'success',
              'bg-red-100 dark:bg-red-900/30 text-red-600': type === 'error',
              'bg-orange-100 dark:bg-orange-900/30 text-orange-600':
                type === 'warning',
              'bg-blue-100 dark:bg-blue-900/30 text-blue-600': type === 'info',
            }"
          >
            <i
              [ngClass]="{
                'ri-checkbox-circle-line': type === 'success',
                'ri-error-warning-line': type === 'error',
                'ri-alert-line': type === 'warning',
                'ri-information-line': type === 'info',
              }"
            ></i>
          </div>
        </div>

        <h3
          class="text-lg font-bold text-center mb-2 text-[var(--color-text-primary)]"
        >
          {{ title }}
        </h3>
        <p class="text-sm text-center mb-6 text-[var(--color-text-secondary)]">
          {{ message }}
        </p>

        <div class="flex gap-3">
          <button
            *ngIf="showCancel"
            (click)="cancelled.emit()"
            class="flex-1 py-3 px-4 rounded-xl border-2 border-[var(--color-border)] font-semibold text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors"
          >
            {{ cancelText }}
          </button>
          <button
            (click)="confirmed.emit()"
            [disabled]="loading"
            class="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            [ngClass]="{
              'bg-green-600 hover:bg-green-700': type === 'success',
              'bg-red-600 hover:bg-red-700': type === 'error',
              'bg-orange-500 hover:bg-orange-600': type === 'warning',
              'bg-blue-600 hover:bg-blue-700': type === 'info',
              'opacity-70 cursor-not-allowed': loading,
            }"
          >
            <i *ngIf="loading" class="ri-loader-4-line animate-spin"></i>
            <span>{{ loading ? "Please wait..." : confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() title = "Confirm";
  @Input() message = "Are you sure?";
  @Input() type: ModalType = "warning";
  @Input() confirmText = "Confirm";
  @Input() cancelText = "Cancel";
  @Input() showCancel = true;
  @Input() loading = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onOverlay(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.cancelled.emit();
      this.closed.emit(); // ← emit closed as well
    }
  }
}
