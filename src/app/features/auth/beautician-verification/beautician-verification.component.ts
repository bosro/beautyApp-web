import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-beautician-verification',
  template: `
    <div class="page-enter text-center">
      <button (click)="router.navigate(['/auth/beautician-register'])"
        class="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 mx-auto"
        style="color: var(--color-text-secondary)">
        <i class="ri-arrow-left-line"></i> Back
      </button>

      <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
        <i class="ri-mail-check-line text-4xl" style="color: var(--color-primary)"></i>
      </div>

      <h2 class="text-2xl font-bold mb-2" style="color: var(--color-text-primary)">Verify Your Account</h2>
      <p class="text-sm mb-2" style="color: var(--color-text-secondary)">6-digit code sent to</p>
      <p class="text-sm font-bold mb-8" style="color: var(--color-primary)">{{ email }}</p>

      <div class="flex gap-2.5 justify-center mb-6">
        <input
          *ngFor="let c of code; let i = index"
          #otpInput
          type="text" inputmode="numeric" maxlength="1"
          [value]="code[i]"
          (input)="onInput($event, i)"
          (keydown)="onKeydown($event, i)"
          class="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all"
          [style.border-color]="code[i] ? 'var(--color-primary)' : 'var(--color-border-light)'"
          [style.background-color]="code[i] ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'var(--color-bg-secondary)'"
          style="color: var(--color-text-primary)"
        />
      </div>

      <div class="flex items-center justify-center gap-1 text-sm mb-6">
        <span style="color: var(--color-text-secondary)">Didn't receive?</span>
        <button (click)="resend()" [disabled]="timer > 0 || resending"
          class="font-semibold"
          [style.color]="timer > 0 ? 'var(--color-text-placeholder)' : 'var(--color-primary)'">
          {{ resending ? 'Sending...' : timer > 0 ? 'Resend (' + timer + 's)' : 'Resend' }}
        </button>
      </div>

      <!-- Info box -->
      <div class="flex items-start gap-3 p-4 rounded-xl mb-6 text-left"
        style="background-color: color-mix(in srgb, var(--color-info) 10%, transparent)">
        <i class="ri-lightbulb-line text-blue-500 mt-0.5 flex-shrink-0"></i>
        <p class="text-xs leading-relaxed" style="color: var(--color-text-secondary)">
          After verification, you can set up your beautician profile and start receiving bookings!
        </p>
      </div>

      <button (click)="verify()" class="btn-primary w-full" [disabled]="loading || !isComplete">
        <span class="spinner" *ngIf="loading"></span>
        {{ loading ? 'Verifying...' : 'Verify & Continue' }}
      </button>
    </div>
  `,
})
export class BeauticianVerificationComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  email = '';
  code = ['', '', '', '', '', ''];
  loading = false;
  resending = false;
  timer = 60;
  private timerInterval?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private toast: ToastService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.startTimer();
  }

  ngOnDestroy(): void { clearInterval(this.timerInterval); }

  get isComplete() { return this.code.every((c) => c !== ''); }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) this.timer--;
      else clearInterval(this.timerInterval);
    }, 1000);
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    this.code[index] = val;
    input.value = val;
    if (val && index < 5) {
      this.inputs.toArray()[index + 1]?.nativeElement.focus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      this.inputs.toArray()[index - 1]?.nativeElement.focus();
    }
  }

  verify(): void {
    if (!this.isComplete) return;
    this.loading = true;
    this.auth.verifyEmail(this.email, this.code.join('')).subscribe({
      next: () => {
        this.toast.success('Account verified! Welcome to BeautyHub!');
        this.router.navigate(['/beautician/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Verification failed');
      },
    });
  }

  resend(): void {
    if (this.timer > 0) return;
    this.resending = true;
    this.auth.resendOTP(this.email).subscribe({
      next: () => {
        this.toast.success('Code sent!');
        this.resending = false;
        this.timer = 60;
        this.startTimer();
      },
      error: (err) => {
        this.resending = false;
        this.toast.error(err?.error?.message || 'Failed to resend');
      },
    });
  }
}
