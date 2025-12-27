
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private notificationService = inject(NotificationService);
  newsletterEmail = '';

  onNewsletterSubmit(event: Event): void {
    event.preventDefault();
    
    if (this.newsletterEmail) {
      this.notificationService.success('Uspješno ste se prijavili na newsletter! 📧');
      this.newsletterEmail = '';
    }
  }
}