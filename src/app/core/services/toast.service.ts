import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage, ToastType } from '../models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this._toasts.asObservable();

  show(message: string, type: ToastType = 'info', duration = 3000): void {
    const id = Date.now().toString();
    const toast: ToastMessage = { id, message, type, duration };

    this._toasts.next([...this._toasts.value, toast]);

    setTimeout(() => this.remove(id), duration);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  remove(id: string): void {
    this._toasts.next(this._toasts.value.filter((t) => t.id !== id));
  }
}
