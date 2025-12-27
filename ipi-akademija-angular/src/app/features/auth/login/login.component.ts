
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  loginData = {
    email: '',
    password: ''
  };

  loading = false;

  ngOnInit(): void {
    this.themeService.applyUserTheme();
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (this.loading) return;
    
    this.loading = true;

    try {
      const result = await this.authService.login(
        this.loginData.email,
        this.loginData.password
      );

      if (result.success) {
        this.notificationService.success(result.message);
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      } else {
        this.notificationService.error(result.message);
      }
    } catch (error) {
      this.notificationService.error('Došlo je do greške pri prijavi');
    } finally {
      this.loading = false;
    }
  }
}