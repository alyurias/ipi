import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface GratitudeEntry {
  id: string;
  date: string;
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  createdAt: Date;
}

@Component({
  selector: 'app-gratitude-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gratitude-journal.component.html',
  styleUrl: './gratitude-journal.component.css'
})
export class GratitudeJournalComponent implements OnInit {
  private authService = inject(AuthService);


  showModal: boolean = false;


  gratitude1: string = '';
  gratitude2: string = '';
  gratitude3: string = '';

 
  entries: GratitudeEntry[] = [];
  todayEntry: GratitudeEntry | null = null;

 
  totalEntries: number = 0;
  currentStreak: number = 0;
  longestStreak: number = 0;

  ngOnInit(): void {
    this.loadEntries();
    this.checkTodayEntry();
    this.calculateStats();
  }

  loadEntries(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const stored = localStorage.getItem(`gratitude_${userId}`);
    if (stored) {
      this.entries = JSON.parse(stored);
      this.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  checkTodayEntry(): void {
    const today = new Date().toISOString().split('T')[0];
    this.todayEntry = this.entries.find(e => e.date === today) || null;

    if (this.todayEntry) {
      this.gratitude1 = this.todayEntry.gratitude1;
      this.gratitude2 = this.todayEntry.gratitude2;
      this.gratitude3 = this.todayEntry.gratitude3;
    }
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveGratitude(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    if (!this.gratitude1.trim() || !this.gratitude2.trim() || !this.gratitude3.trim()) {
      alert('Molimo popunite sve tri zahvalnosti!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (this.todayEntry) {
      this.todayEntry.gratitude1 = this.gratitude1.trim();
      this.todayEntry.gratitude2 = this.gratitude2.trim();
      this.todayEntry.gratitude3 = this.gratitude3.trim();
    } else {
      const newEntry: GratitudeEntry = {
        id: Date.now().toString(),
        date: today,
        gratitude1: this.gratitude1.trim(),
        gratitude2: this.gratitude2.trim(),
        gratitude3: this.gratitude3.trim(),
        createdAt: new Date()
      };

      this.entries.unshift(newEntry);
      this.todayEntry = newEntry;
    }

    this.saveToStorage();
    this.calculateStats();
    this.closeModal();
  }

  saveToStorage(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    localStorage.setItem(`gratitude_${userId}`, JSON.stringify(this.entries));
  }

  deleteEntry(id: string): void {
    if (confirm('Da li ste sigurni da želite obrisati ovaj unos?')) {
      this.entries = this.entries.filter(e => e.id !== id);
      
      const deletedWasToday = this.todayEntry?.id === id;
      
      if (deletedWasToday) {
        this.todayEntry = null;
        this.clearForm();
      }

      this.saveToStorage();
      this.calculateStats();
    }
  }

  clearForm(): void {
    this.gratitude1 = '';
    this.gratitude2 = '';
    this.gratitude3 = '';
  }

  calculateStats(): void {
    this.totalEntries = this.entries.length;
    this.currentStreak = this.calculateStreak();
    this.longestStreak = this.calculateLongestStreak();
  }

  calculateStreak(): number {
    if (this.entries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < this.entries.length; i++) {
      const entryDate = new Date(this.entries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);

      const entryDateStr = entryDate.toISOString().split('T')[0];
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (entryDateStr === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  calculateLongestStreak(): number {
    if (this.entries.length === 0) return 0;

    let longestStreak = 0;
    let currentStreakCount = 1;

    for (let i = 0; i < this.entries.length - 1; i++) {
      const currentDate = new Date(this.entries[i].date);
      const nextDate = new Date(this.entries[i + 1].date);
      
      const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreakCount++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreakCount);
        currentStreakCount = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreakCount);
    return longestStreak;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('bs-BA', options);
  }

  getTodayPreview(): string {
    if (!this.todayEntry) return '';
    return this.todayEntry.gratitude1.substring(0, 50) + (this.todayEntry.gratitude1.length > 50 ? '...' : '');
  }
}