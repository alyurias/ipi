
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit {
  private notificationService = inject(NotificationService);

  visible = false;
  message = '';
  type: 'success' | 'error' | 'warning' | 'info' = 'info';
  private timeoutId?: number;

  ngOnInit(): void {
    this.notificationService.notification$.subscribe((notification: Notification) => {
      this.show(notification.message, notification.type);
    });
  }

  show(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.message = message;
    this.type = type;
    this.visible = true;

    this.timeoutId = window.setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}