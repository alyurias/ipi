import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-fun-zone',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fun-zone.component.html',
  styleUrl: './fun-zone.component.css'
})
export class FunZoneComponent implements OnInit {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  sidebarOpen = true;
  sidebarVisible = true;
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    // KRITIČNO: Primijeni temu odmah pri učitavanju komponente
    this.themeService.applyUserTheme();
    this.loadSidebarState();
  }

  loadSidebarState(): void {
    const sidebarHidden = localStorage.getItem('sidebarHidden');
    if (sidebarHidden === 'true') {
      this.sidebarVisible = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  hideSidebar(): void {
    this.sidebarVisible = false;
    localStorage.setItem('sidebarHidden', 'true');
  }

  showSidebar(): void {
    this.sidebarVisible = true;
    this.sidebarOpen = true;
    localStorage.setItem('sidebarHidden', 'false');
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  async logout(): Promise<void> {
    if (confirm('Želite li se odjaviti?')) {
      const result = await this.authService.logout();
      if (result.success) {
        this.notificationService.success(result.message);
      }
    }
  }
}