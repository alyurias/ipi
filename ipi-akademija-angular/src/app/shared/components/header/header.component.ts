
import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  menuOpen = false;
  showUserMenu = false;
  menuPosition = { top: 0, right: 0 };
  
  currentUser = this.authService.currentUser;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
    
    if (this.showUserMenu) {
      const button = event.target as HTMLElement;
      const rect = button.getBoundingClientRect();
      this.menuPosition = {
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right
      };
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-menu') && !target.closest('.login-btn')) {
      this.showUserMenu = false;
    }
  }

  goToDashboard(): void {
    this.showUserMenu = false;
    this.router.navigate(['/dashboard']);
  }

  async logout(): Promise<void> {
    if (confirm('Želite li se odjaviti?')) {
      const result = await this.authService.logout();
      if (result.success) {
        this.notificationService.success(result.message);
        this.showUserMenu = false;
      }
    }
  }
}