import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface MoodEntry {
  id: string;
  date: string;
  mood: number; 
  factors: string[];
  activities: string;
  note: string;
  createdAt: Date;
}

@Component({
  selector: 'app-mood-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-tracker.component.html',
  styleUrl: './mood-tracker.component.css'
})
export class MoodTrackerComponent implements OnInit {
  private authService = inject(AuthService);


  showModal: boolean = false;


  selectedMood: number = 3;
  selectedFactors: string[] = [];
  activities: string = '';
  note: string = '';

  
  availableFactors = [
    'San',
    'Ishrana',
    'Vježba',
    'Posao',
    'Porodica',
    'Prijatelji',
    'Zdravlje',
    'Vrijeme'
  ];


  entries: MoodEntry[] = [];
  todayEntry: MoodEntry | null = null;

  
  totalEntries: number = 0;
  averageMood: number = 0;
  currentStreak: number = 0;
  mostCommonFactor: string = '';
  moodDistribution: { [key: number]: number } = {};

  ngOnInit(): void {
    this.loadEntries();
    this.checkTodayEntry();
    this.calculateStats();
  }

  loadEntries(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const stored = localStorage.getItem(`mood_${userId}`);
    if (stored) {
      this.entries = JSON.parse(stored);
      this.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  checkTodayEntry(): void {
    const today = new Date().toISOString().split('T')[0];
    this.todayEntry = this.entries.find(e => e.date === today) || null;

    if (this.todayEntry) {
      this.selectedMood = this.todayEntry.mood;
      this.selectedFactors = [...this.todayEntry.factors];
      this.activities = this.todayEntry.activities;
      this.note = this.todayEntry.note;
    }
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  toggleFactor(factor: string): void {
    const index = this.selectedFactors.indexOf(factor);
    if (index > -1) {
      this.selectedFactors.splice(index, 1);
    } else {
      this.selectedFactors.push(factor);
    }
  }

  isFacorSelected(factor: string): boolean {
    return this.selectedFactors.includes(factor);
  }

  saveMood(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    if (this.todayEntry) {
      this.todayEntry.mood = this.selectedMood;
      this.todayEntry.factors = [...this.selectedFactors];
      this.todayEntry.activities = this.activities.trim();
      this.todayEntry.note = this.note.trim();
    } else {
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        date: today,
        mood: this.selectedMood,
        factors: [...this.selectedFactors],
        activities: this.activities.trim(),
        note: this.note.trim(),
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

    localStorage.setItem(`mood_${userId}`, JSON.stringify(this.entries));
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
    this.selectedMood = 3;
    this.selectedFactors = [];
    this.activities = '';
    this.note = '';
  }

  calculateStats(): void {
    this.totalEntries = this.entries.length;

    if (this.entries.length > 0) {
     
      const totalMood = this.entries.reduce((sum, e) => sum + e.mood, 0);
      this.averageMood = Math.round((totalMood / this.entries.length) * 10) / 10;

     
      this.moodDistribution = {};
      this.entries.forEach(entry => {
        this.moodDistribution[entry.mood] = (this.moodDistribution[entry.mood] || 0) + 1;
      });


      this.mostCommonFactor = this.calculateMostCommonFactor();
    } else {
      this.averageMood = 0;
      this.moodDistribution = {};
      this.mostCommonFactor = 'N/A';
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

  calculateMostCommonFactor(): string {
    if (this.entries.length === 0) return 'N/A';

    const factorCounts: { [key: string]: number } = {};
    
    this.entries.forEach(entry => {
      entry.factors.forEach(factor => {
        factorCounts[factor] = (factorCounts[factor] || 0) + 1;
      });
    });

    let maxCount = 0;
    let topFactor = 'N/A';

    Object.entries(factorCounts).forEach(([factor, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topFactor = factor;
      }
    });

    return topFactor;
  }

  getMoodLabel(mood: number): string {
    const labels = ['Vrlo loše', 'Loše', 'Neutralno', 'Dobro', 'Odlično'];
    return labels[mood - 1] || 'Neutralno';
  }

  getMoodColor(mood: number): string {
    const colors = ['#f44336', '#ff9800', '#ffc107', '#8bc34a', '#4caf50'];
    return colors[mood - 1] || '#ffc107';
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