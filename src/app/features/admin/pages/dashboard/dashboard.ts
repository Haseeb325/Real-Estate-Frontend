import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStatsService } from '../../admin.stats';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styles: [
    `
      @keyframes dot-bounce {
        0%,
        80%,
        100% {
          transform: scale(0.6);
          opacity: 0.3;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
      .dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        margin: 0 2px;
        background-color: currentColor;
        border-radius: 50%;
        animation: dot-bounce 1.4s infinite ease-in-out both;
      }
      .dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      .dot:nth-child(2) {
        animation-delay: -0.16s;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private statsService = inject(AdminStatsService);

  // Expose signals to template
  stats = this.statsService.dashboard;
  isLoading = this.statsService.isLoading;

  ngOnInit() {
    if (this.statsService.dashboard() === null) {
      this.statsService.getDashboardStats();
    }
  }
}
