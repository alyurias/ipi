import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface WaterEntry {
  id: string;
  date: string;
  glasses: number; 
  note: string;
  createdAt: Date;
}

@Component({
  selector: 'app-water-intake',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './water-intake.component.html',
  styleUrl: './water-intake.component.css'
})
export class WaterIntakeComponent implements OnInit {
  private authService = inject(AuthService);


  showModal: boolean = false;

  
  glasses: number = 0;
  note: string = '';
  dailyGoal: number = 8; 


  entries: WaterEntry[] = [];
  todayEntry: WaterEntry | null = null;

 
  totalGlassesWeek: number = 0;
  averageGlasses: number = 0;
  currentStreak: number = 0;
  goalAchievedDays: number = 0;

  ngOnInit(): void {
    this.loadEntries();
    this.loadGoal();
    this.checkTodayEntry();
    this.calculateStats();
  }

  loadEntries(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const stored = localStorage.getItem(`water_${userId}`);
    if (stored) {
      this.entries = JSON.parse(stored);
      this.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  loadGoal(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const stored = localStorage.getItem(`water_goal_${userId}`);
    if (stored) {
      this.dailyGoal = parseInt(stored);
    }
  }

  saveGoal(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    localStorage.setItem(`water_goal_${userId}`, this.dailyGoal.toString());
    this.calculateStats();
  }

  checkTodayEntry(): void {
    const today = new Date().toISOString().split('T')[0];
    this.todayEntry = this.entries.find(e => e.date === today) || null;

    if (this.todayEntry) {
      this.glasses = this.todayEntry.glasses;
      this.note = this.todayEntry.note;
    }
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  addGlass(): void {
    this.glasses++;
    this.saveWater();
  }

  removeGlass(): void {
    if (this.glasses > 0) {
      this.glasses--;
      this.saveWater();
    }
  }

  saveWater(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    if (this.todayEntry) {
      this.todayEntry.glasses = this.glasses;
      this.todayEntry.note = this.note.trim();
    } else {
      const newEntry: WaterEntry = {
        id: Date.now().toString(),
        date: today,
        glasses: this.glasses,
        note: this.note.trim(),
        createdAt: new Date()
      };

      this.entries.unshift(newEntry);
      this.todayEntry = newEntry;
    }

    this.saveToStorage();
    this.calculateStats();
  }

  saveToStorage(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    localStorage.setItem(`water_${userId}`, JSON.stringify(this.entries));
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
    this.glasses = 0;
    this.note = '';
  }

  calculateStats(): void {
   
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.totalGlassesWeek = this.entries
      .filter(e => new Date(e.date) >= sevenDaysAgo)
      .reduce((sum, e) => sum + e.glasses, 0);

    
    if (this.entries.length > 0) {
      const totalGlasses = this.entries.reduce((sum, e) => sum + e.glasses, 0);
      this.averageGlasses = Math.round((totalGlasses / this.entries.length) * 10) / 10;
    } else {
      this.averageGlasses = 0;
    }

   
    this.goalAchievedDays = this.entries.filter(e => e.glasses >= this.dailyGoal).length;

 
    this.currentStreak = this.calculateStreak();
  }

  calculateStreak(): number {
    if (this.entries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const entryDate = new Date(entry.date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);

      const entryDateStr = entryDate.toISOString().split('T')[0];
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (entryDateStr === expectedDateStr && entry.glasses >= this.dailyGoal) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  getTodayProgress(): number {
    if (!this.todayEntry) return 0;
    return Math.min(Math.round((this.todayEntry.glasses / this.dailyGoal) * 100), 100);
  }

  getLiters(): number {
    return Math.round((this.glasses * 0.25) * 10) / 10;
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