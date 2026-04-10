import { Component, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { Shared } from '../../../shared/shared.module';
import { FormGroup } from '@angular/forms';
import { regStep2Form } from '../../../shared/forms.config';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

const TIMER_STORAGE_KEY = 'reg-step2-timer-end';
const RESEND_DISABLED_KEY = 'reg-step2-resend-disabled';

@Component({
  selector: 'app-reg-step-2',
  imports: [Shared],
  templateUrl: './reg-step-2.html',
  styleUrl: './reg-step-2.scss',
})
export class RegStep2 {
  regStep2Form: FormGroup = regStep2Form;
  isSubmitted: boolean = false;
  authService = inject(AuthService);
  timer: number = 0; // seconds
  intervalId: ReturnType<typeof setInterval> | null = null;
  isResendDisabled: boolean = false;
  zone = inject(NgZone);
  cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const timerEnd = Number(localStorage.getItem(TIMER_STORAGE_KEY));
    if (!Number.isNaN(timerEnd) && timerEnd > Date.now()) {
      this.isResendDisabled = true;
      this.syncTimerWithStorage(timerEnd);
      this.startDynamicInterval();
    } else {
      this.clearTimerStorage();
      this.isResendDisabled = false;
      this.timer = 0;
    }
  }

  private clearTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private clearTimerStorage() {
    localStorage.removeItem(TIMER_STORAGE_KEY);
    localStorage.removeItem(RESEND_DISABLED_KEY);
  }

  private syncTimerWithStorage(timerEnd: number) {
    const remainMs = timerEnd - Date.now();
    this.timer = remainMs > 0 ? Math.ceil(remainMs / 1000) : 0;
    this.cdr.markForCheck();
  }

  private startDynamicInterval() {
    this.clearTimer();

    this.zone.runOutsideAngular(() => {
      this.intervalId = window.setInterval(() => {
        this.zone.run(() => {
          const timerEnd = Number(localStorage.getItem(TIMER_STORAGE_KEY));
          if (Number.isNaN(timerEnd) || timerEnd <= Date.now()) {
            this.timer = 0;
            this.isResendDisabled = false;
            this.clearTimer();
            this.clearTimerStorage();
            this.cdr.markForCheck();
            return;
          }

          this.syncTimerWithStorage(timerEnd);

          if (this.timer <= 0) {
            this.isResendDisabled = false;
            this.clearTimer();
            this.clearTimerStorage();
          }

          this.cdr.markForCheck();
        });
      }, 1000);
    });
  }

  startTimer() {
    this.clearTimer();

    this.isResendDisabled = true;
    const timerSeconds = 60;
    const timerEnd = Date.now() + timerSeconds * 1000;

    localStorage.setItem(TIMER_STORAGE_KEY, String(timerEnd));
    localStorage.setItem(RESEND_DISABLED_KEY, 'true');

    this.timer = timerSeconds;
    this.cdr.markForCheck();

    this.startDynamicInterval();
  }
get formattedTime(): string {
  const minutes = Math.floor(this.timer / 60);
  const seconds = this.timer % 60;

  return `${this.pad(minutes)}:${this.pad(seconds)}`;
}

pad(num: number): string {
  return num < 10 ? '0' + num : num.toString();
}
  
router:Router = inject(Router)

  submitForm(){
this.isSubmitted = true
this.regStep2Form.markAllAsTouched()
if(!this.regStep2Form.valid) return

this.authService.verifyOtp(this.regStep2Form.value).subscribe({
  next:(res)=>{
    console.log(res)
    this.router.navigate(['/reg-step-3'])
  },
  error:(err)=>{
    console.error(err)
  }
})

console.log(this.regStep2Form.value)
  }


resendOtp() {
  if (this.isResendDisabled) return;

  this.authService.resendOtp().subscribe({
    next: (res) => {
      this.startTimer();
      console.log(res);
    },
    error: () => {
      // if request failed, keep resend enabled and don't start timer
      this.isResendDisabled = false;
      this.clearTimerStorage();
    },
  });
}








ngOnDestroy() {
  this.clearTimer();
}


}
