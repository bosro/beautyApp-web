import { Component, OnInit } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { ToastMessage } from '@core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: false,
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <div *ngFor="let toast of toasts$ | async; trackBy: trackById"
        class="flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium pointer-events-auto"
        [ngClass]="{
          'bg-green-600': toast.type === 'success',
          'bg-red-600': toast.type === 'error',
          'bg-orange-500': toast.type === 'warning',
          'bg-blue-600': toast.type === 'info'
        }">
        <i class="text-lg flex-shrink-0 mt-0.5"
          [ngClass]="{
            'ri-checkbox-circle-line': toast.type === 'success',
            'ri-error-warning-line': toast.type === 'error',
            'ri-alert-line': toast.type === 'warning',
            'ri-information-line': toast.type === 'info'
          }"></i>
        <span class="flex-1 leading-snug">{{ toast.message }}</span>
        <button (click)="dismiss(toast.id)" class="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity">
          <i class="ri-close-line text-lg"></i>
        </button>
      </div>
    </div>
  `,
})
export class ToastComponent implements OnInit {
  toasts$!: Observable<ToastMessage[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void { this.toasts$ = this.toastService.toasts$; }

  dismiss(id: string): void { this.toastService.remove(id); }

  trackById(_: number, toast: ToastMessage): string { return toast.id; }
}
