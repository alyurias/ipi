import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string; 
  waketime: string; 
  hours: number; 
  quality: number; 
  note: string;
  createdAt: Date;
}

@Component({
  selector: 'app-sleep-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sleep-tracker.component.html',
  styleUrl: './sleep-tracker.component.css'
})
export class SleepTrackerComponent implements OnInit {
  private authService = inject(AuthService);


  showModal: boolean = false;

 
  bedtime: string = '22:00';
  waketime: string = '06:00';
  quality: number = 3;
  note: string = '';

 
  entries: SleepEntry[] = [];
  todayEntry: SleepEntry | null = null;

 
  totalEntries: number = 0;
  averageHours: number = 0;
  averageQuality: number = 0;
  bestSleep: number = 0;

  ngOnInit(): void {
    this.loadEntries();
    this.checkTodayEntry();
    this.calculateStats();
  }

  loadEntries(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const stored = localStorage.getItem(`sleep_${userId}`);
    if (stored) {
      this.entries = JSON.parse(stored);
      this.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  checkTodayEntry(): void {
    const today = new Date().toISOString().split('T')[0];
    this.todayEntry = this.entries.find(e => e.date === today) || null;

    if (this.todayEntry) {
      this.bedtime = this.todayEntry.bedtime;
      this.waketime = this.todayEntry.waketime;
      this.quality = this.todayEntry.quality;
      this.note = this.todayEntry.note;
    }
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  calculateHours(): number {
    const [bedHour, bedMin] = this.bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = this.waketime.split(':').map(Number);

    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;

   
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    const totalMinutes = wakeMinutes - bedMinutes;
    return Math.round((totalMinutes / 60) * 10) / 10;
  }

  saveSleep(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const hours = this.calculateHours();
    const today = new Date().toISOString().split('T')[0];

    if (this.todayEntry) {
      this.todayEntry.bedtime = this.bedtime;
      this.todayEntry.waketime = this.waketime;
      this.todayEntry.hours = hours;
      this.todayEntry.quality = this.quality;
      this.todayEntry.note = this.note.trim();
    } else {
      const newEntry: SleepEntry = {
        id: Date.now().toString(),
        date: today,
        bedtime: this.bedtime,
        waketime: this.waketime,
        hours: hours,
        quality: this.quality,
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

    localStorage.setItem(`sleep_${userId}`, JSON.stringify(this.entries));
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
    this.bedtime = '22:00';
    this.waketime = '06:00';
    this.quality = 3;
    this.note = '';
  }

  calculateStats(): void {
    this.totalEntries = this.entries.length;

    if (this.entries.length > 0) {
     
      const totalHours = this.entries.reduce((sum, e) => sum + e.hours, 0);
      this.averageHours = Math.round((totalHours / this.entries.length) * 10) / 10;

      
      const totalQuality = this.entries.reduce((sum, e) => sum + e.quality, 0);
      this.averageQuality = Math.round((totalQuality / this.entries.length) * 10) / 10;

     
      this.bestSleep = Math.max(...this.entries.map(e => e.hours));
    } else {
      this.averageHours = 0;
      this.averageQuality = 0;
      this.bestSleep = 0;
    }
  }

  getQualityLabel(quality: number): string {
    const labels = ['Vrlo loše', 'Loše', 'Osrednje', 'Dobro', 'Odlično'];
    return labels[quality - 1] || 'Osrednje';
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

  formatTime(time: string): string {
    return time;
  }

  getTodayHours(): number {
    if (!this.todayEntry) return 0;
    return this.todayEntry.hours;
  }
}