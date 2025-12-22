import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Za *ngIf

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],  // ← VAŽNO za *ngIf
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;

  ngOnInit(): void {
    // Učitaj trenutnog korisnika iz localStorage
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
      console.log('✅ Prijavljen korisnik:', this.currentUser);
      
      // Primijeni temu
      this.applyTheme(this.currentUser.theme);
    } else {
      console.log('⚠️ Nema prijavljenog korisnika');
    }
  }

  applyTheme(theme: string) {
    if (theme && theme !== 'default') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  logout() {
    if (confirm('Želite li se odjaviti?')) {
      localStorage.removeItem('currentUser');
      window.location.href = 'http://localhost:5500/index.html';
    }
  }
}