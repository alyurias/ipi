
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    theme: ''
  };

  agreeToTerms = false;
  loading = false;
  showThemePreview = false;
  themeColors: { primary: string; secondary: string } | null = null;
  themePreviewGradient = '';

  ngOnInit(): void {
    this.themeService.applyUserTheme();
  }

  onThemeChange(): void {
    const theme = this.registerData.theme;
    
    if (theme) {
      this.themeColors = this.themeService.getThemeColors(theme);
      
      if (this.themeColors) {
        this.themePreviewGradient = `linear-gradient(135deg, ${this.themeColors.primary}, ${this.themeColors.secondary})`;
        this.showThemePreview = true;
      }
    } else {
      this.showThemePreview = false;
    }
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (this.loading) return;
    
    if (!this.agreeToTerms) {
      this.notificationService.error('Morate se složiti sa uslovima korištenja');
      return;
    }
    
    this.loading = true;

    try {
      const result = await this.authService.register(this.registerData);

      if (result.success) {
        this.notificationService.success(result.message);
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      } else {
        this.notificationService.error(result.message);
      }
    } catch (error) {
      this.notificationService.error('Došlo je do greške pri registraciji');
    } finally {
      this.loading = false;
    }
  }
}