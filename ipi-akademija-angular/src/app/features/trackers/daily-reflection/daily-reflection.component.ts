import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface ReflectionEntry {
  id: string;
  date: string;
  gratitude: string;
  achievement: string;
  improvement: string;
  mood: number; 
  createdAt: Date;
}

@Component({
  selector: 'app-daily-reflection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-reflection.component.html',
  styleUrl: './daily-reflection.component.css'
})
export class DailyReflectionComponent implements OnInit {
  private authService = inject(AuthService);


  showModal: boolean = false;

  
  gratitude: string = '';
  achievement: string = '';
  improvement: string = '';
  selectedMood: number = 3;


  entries: ReflectionEntry[] = [];
  todayEntry: ReflectionEntry | null = null;


  totalEntries: number = 0;
  currentStreak: number = 0;
  averageMood: number = 0;

  ngOnInit(): void {
    this.loadEntries();
    this.checkTodayEntry();
    this.calculateStats();
  }

  loadEntries(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const stored = localStorage.getItem(`reflections_${userId}`);
    if (stored) {
      this.entries = JSON.parse(stored);
      this.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  checkTodayEntry(): void {
    const today = new Date().toISOString().split('T')[0];
    this.todayEntry = this.entries.find(e => e.date === today) || null;

    if (this.todayEntry) {
      this.gratitude = this.todayEntry.gratitude;
      this.achievement = this.todayEntry.achievement;
      this.improvement = this.todayEntry.improvement;
      this.selectedMood = this.todayEntry.mood;
    }
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveReflection(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    if (!this.gratitude.trim() || !this.achievement.trim() || !this.improvement.trim()) {
      alert('Molimo popunite sva polja!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (this.todayEntry) {
      this.todayEntry.gratitude = this.gratitude.trim();
      this.todayEntry.achievement = this.achievement.trim();
      this.todayEntry.improvement = this.improvement.trim();
      this.todayEntry.mood = this.selectedMood;
    } else {
      const newEntry: ReflectionEntry = {
        id: Date.now().toString(),
        date: today,
        gratitude: this.gratitude.trim(),
        achievement: this.achievement.trim(),
        improvement: this.improvement.trim(),
        mood: this.selectedMood,
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

    localStorage.setItem(`reflections_${userId}`, JSON.stringify(this.entries));
  }

  deleteEntry(id: string): void {
    if (confirm('Da li ste sigurni da želite obrisati ovu refleksiju?')) {
      this.entries = this.entries.filter(e => e.id !== id);
      
      const today = new Date().toISOString().split('T')[0];
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
    this.gratitude = '';
    this.achievement = '';
    this.improvement = '';
    this.selectedMood = 3;
  }

  calculateStats(): void {
    this.totalEntries = this.entries.length;

    if (this.entries.length > 0) {
      const moodSum = this.entries.reduce((sum, entry) => sum + entry.mood, 0);
      this.averageMood = Math.round((moodSum / this.entries.length) * 10) / 10;
    } else {
      this.averageMood = 0;
    }

    this.currentStreak = this.calculateStreak();
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

  getMoodLabel(mood: number): string {
    const labels = ['Vrlo loše', 'Loše', 'Neutralno', 'Dobro', 'Odlično'];
    return labels[mood - 1] || 'Neutralno';
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
}