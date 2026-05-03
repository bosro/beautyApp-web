import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-verification',
  template: `
    <div class="page-enter text-center">
      <button (click)="goBack()" class="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
        style="color: var(--color-text-secondary)">
        <i class="ri-arrow-left-line"></i> Back
      </button>

      <!-- Icon -->
      <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
        <i class="ri-shield-check-line text-4xl" style="color: var(--color-primary)"></i>
      </div>

      <h2 class="text-2xl font-bold mb-2" style="color: var(--color-text-primary)">Verify your email</h2>
      <p class="text-sm mb-2" style="color: var(--color-text-secondary)">
        We sent a 6-digit code to
      </p>
      <p class="text-sm font-semibold mb-8" style="color: var(--color-primary)">{{ email }}</p>

      <!-- OTP inputs -->
      <div class="flex gap-2.5 justify-center mb-6">
        <input
          *ngFor="let c of code; let i = index"
          #otpInput
          type="text"
          inputmode="numeric"
          maxlength="1"
          [value]="code[i]"
          (input)="onInput($event, i)"
          (keydown)="onKeydown($event, i)"
          (paste)="onPaste($event)"
          class="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all"
          [style.border-color]="code[i] ? 'var(--color-primary)' : 'var(--color-border-light)'"
          [style.background-color]="code[i] ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'var(--color-bg-secondary)'"
          style="color: var(--color-text-primary)"
        />
      </div>

      <!-- Resend -->
      <div class="flex items-center justify-center gap-1 text-sm mb-8">
        <span style="color: var(--color-text-secondary)">Didn't receive the code?</span>
        <button
          (click)="resend()"
          [disabled]="timer > 0 || resending"
          class="font-semibold transition-opacity"
          [style.color]="timer > 0 ? 'var(--color-text-placeholder)' : 'var(--color-primary)'"
        >
          {{ resending ? 'Sending...' : timer > 0 ? 'Resend (' + timer + 's)' : 'Resend' }}
        </button>
      </div>

      <button
        (click)="verify()"
        class="btn-primary w-full"
        [disabled]="loading || !isComplete"
      >
        <span class="spinner" *ngIf="loading"></span>
        {{ loading ? 'Verifying...' : 'Continue' }}
      </button>
    </div>
  `,
})
export class VerificationComponent implements OnInit, OnDestroy {
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  get isComplete(): boolean {
    return this.code.every((c) => c !== '');
  }

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
      const nextInputs = this.inputs.toArray();
      nextInputs[index + 1]?.nativeElement.focus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      const prevInputs = this.inputs.toArray();
      prevInputs[index - 1]?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    const data = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || '';
    if (data.length === 6) {
      event.preventDefault();
      this.code = data.split('');
      this.inputs.toArray().forEach((inp, i) => {
        inp.nativeElement.value = this.code[i];
      });
    }
  }

  verify(): void {
    if (!this.isComplete) return;
    this.loading = true;
    const otp = this.code.join('');

    this.auth.verifyEmail(this.email, otp).subscribe({
      next: () => {
        this.toast.success('Email verified!');
        this.router.navigate([this.auth.getDashboardRoute()]);
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

  goBack(): void {
    this.router.navigate(['/auth/register']);
  }
}
