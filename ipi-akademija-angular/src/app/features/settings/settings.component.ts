import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';

interface ThemeOption {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
  icon?: string; 
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  sidebarOpen = true;
  sidebarVisible = true;

 
  availableThemes: ThemeOption[] = [
    { 
      id: 'default', 
      name: 'Default (Tamno plava)', 
      colors: { primary: '#0D1B2A', secondary: '#1B263B' } 
    },
    { 
      id: 'green', 
      name: 'Zelena', 
      colors: { primary: '#1A3A2A', secondary: '#2D5F47' } 
    },
    { 
      id: 'blue', 
      name: 'Plava', 
      colors: { primary: '#0F2540', secondary: '#1B3A5F' } 
    },
    { 
      id: 'pink', 
      name: 'Roze', 
      colors: { primary: '#4A1528', secondary: '#6B2A42' } 
    },
    { 
      id: 'orange', 
      name: 'Narandžasta', 
      colors: { primary: '#3D1F0A', secondary: '#5F3418' } 
    },
    { 
      id: 'dark', 
      name: 'Tamna', 
      colors: { primary: '#1C1C1E', secondary: '#2C2C2E' } 
    },
    { 
      id: 'cyberpunk', 
      name: 'Cyberpunk', 
      colors: { primary: '#0A0118', secondary: '#1A0B2E' } 
    },
    { 
      id: 'newyear', 
      name: 'Novogodišnja', 
      colors: { primary: '#1E3A5F', secondary: '#2B5278' },

    },
    { 
      id: 'spring', 
      name: 'Proljetna', 
      colors: { primary: '#C75B7A', secondary: '#D77A8E' },
   
    }
  ];
  
  selectedTheme: string = 'default';
  

  newUsername: string = '';
  isEditingUsername: boolean = false;
  
  
  showModulesResetModal: boolean = false;
  
 
  showDeleteModal: boolean = false;
  deleteConfirmText: string = '';

  ngOnInit(): void {
    this.loadSidebarState();
    this.loadCurrentTheme();
    this.newUsername = this.currentUser()?.name || '';
  }

  loadSidebarState(): void {
    const sidebarHidden = localStorage.getItem('sidebarHidden');
    if (sidebarHidden === 'true') {
      this.sidebarVisible = false;
    }
  }

  loadCurrentTheme(): void {
    this.selectedTheme = this.themeService.getCurrentTheme();
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
    localStorage.setItem('sidebarHidden', 'false');
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  
  changeTheme(themeId: string): void {
    this.selectedTheme = themeId;
    this.themeService.applyTheme(themeId);
  
    const user = this.currentUser();
    if (user) {
      const updatedUser = { ...user, theme: themeId };
      this.authService.updateUserProfile(updatedUser);
      
   
      if (themeId === 'newyear') {
        this.notificationService.success('Novogodišnja tema aktivirana!');
      } else if (themeId === 'spring') {
        this.notificationService.success('Proljetna tema aktivirana!');
      } else {
        this.notificationService.success('Tema je uspješno promijenjena!');
      }
    }
  }

  getThemePreview(themeId: string): any {
    const theme = this.availableThemes.find(t => t.id === themeId);
    return theme?.colors || { primary: '#0D1B2A', secondary: '#1B263B' };
  }

 
  startEditingUsername(): void {
    this.isEditingUsername = true;
    this.newUsername = this.currentUser()?.name || '';
  }

  cancelEditingUsername(): void {
    this.isEditingUsername = false;
    this.newUsername = this.currentUser()?.name || '';
  }

  saveUsername(): void {
    const trimmedName = this.newUsername.trim();
    
    if (!trimmedName) {
      this.notificationService.error('Ime ne može biti prazno!');
      return;
    }

    if (trimmedName.length < 3) {
      this.notificationService.error('Ime mora imati najmanje 3 karaktera!');
      return;
    }

    const user = this.currentUser();
    if (user) {
      const updatedUser = { ...user, name: trimmedName };
      this.authService.updateUserProfile(updatedUser);
      this.notificationService.success('Ime je uspješno promijenjeno!');
      this.isEditingUsername = false;
    }
  }


  openModulesResetModal(): void {
    this.showModulesResetModal = true;
  }

  closeModulesResetModal(): void {
    this.showModulesResetModal = false;
  }

  async confirmModulesReset(): Promise<void> {
    const user = this.currentUser();
    if (user) {
      try {
 
        await this.authService.updateUserProfile({ enabledModules: [] });
        
        
        localStorage.removeItem(`modules_${user.uid}`);
        
        this.notificationService.success('Trackeri su uspješno resetovani! Možete ponovo odabrati.');
        this.closeModulesResetModal();
        
    
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      } catch (error) {
        this.notificationService.error('Greška pri resetovanju trackera.');
      }
    }
  }


  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.deleteConfirmText = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteConfirmText = '';
  }

  async confirmDeleteAccount(): Promise<void> {
    if (this.deleteConfirmText !== 'OBRISI') {
      this.notificationService.error('Morate unijeti "OBRIŠI" da potvrdite!');
      return;
    }

    const confirmed = confirm('Da li ste SIGURNI da želite obrisati nalog? Ova akcija je NEPOVRATNA!');
    
    if (confirmed) {
      try {
        
        const result = await this.authService.deleteUserAccount();
        
        if (result.success) {
          this.notificationService.success(result.message);
          this.router.navigate(['/register']);
        } else {
          this.notificationService.error(result.message);
        }
      } catch (error) {
        this.notificationService.error('Greška pri brisanju naloga.');
      }
    }
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