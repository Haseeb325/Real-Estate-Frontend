import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private audioCtx: AudioContext | null = null;
  private permissionGranted = false;

  constructor() {
    this.requestPermission();
  }

  // ════════════════════════════════════════════
  // Request Browser Notification Permission
  // ════════════════════════════════════════════

  async requestPermission(): Promise<void> {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
    } else if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      this.permissionGranted = result === 'granted';
    }
  }

  // ════════════════════════════════════════════
  // Trigger: Sound + Browser Notification
  // ════════════════════════════════════════════

  notify(senderName: string, messageContent: string): void {
    this.playBeep();
    this.showBrowserNotification(senderName, messageContent);
  }

  // ════════════════════════════════════════════
  // Play a soft WhatsApp-style notification beep
  // Uses Web Audio API — no external file needed
  // ════════════════════════════════════════════

  playBeep(): void {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      const ctx = this.audioCtx;

      // Note 1 — short high tone
      this.playTone(ctx, 880, 0,    0.06, 0.08);
      // Note 2 — slightly higher
      this.playTone(ctx, 1050, 0.09, 0.06, 0.1);
    } catch (e) {
      // Silently fail if AudioContext is blocked
    }
  }

  private playTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    gain: number,
  ): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    oscillator.start(ctx.currentTime + startTime);
    oscillator.stop(ctx.currentTime + startTime + duration + 0.05);
  }

  // ════════════════════════════════════════════
  // Show Browser Push Notification
  // ════════════════════════════════════════════

  private showBrowserNotification(senderName: string, body: string): void {
    if (!this.permissionGranted) return;

    // Only show when the tab is not focused
    if (document.visibilityState === 'visible') return;

    new Notification(`💬 ${senderName}`, {
      body: body.length > 80 ? body.substring(0, 77) + '...' : body,
      icon: '/favicon.ico',
      tag: 'chat-message', // replaces the previous notification instead of stacking
      silent: true,        // we play our own sound
    });
  }
}
