import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface StudyEntry {
  id: string;
  date: string;
  subject: string;
  hours: number;
  minutes: number;
  totalMinutes: number;
  note: string;
  createdAt: Date;
}

@Component({
  selector: 'app-study-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './study-planner.component.html',
  styleUrl: './study-planner.component.css'
})
export class StudyPlannerComponent implements OnInit {
  private authService = inject(AuthService);


  showModal: boolean = false;


  subject: string = '';
  hours: number = 0;
  minutes: number = 0;
  note: string = '';


  entries: StudyEntry[] = [];
  todayEntries: StudyEntry[] = [];


  totalHoursToday: number = 0;
  totalHoursWeek: number = 0;
  totalHoursMonth: number = 0;
  averageHoursPerDay: number = 0;
  mostStudiedSubject: string = '';

  ngOnInit(): void {
    this.loadEntries();
    this.checkTodayEntries();
    this.calculateStats();
  }

  loadEntries(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const stored = localStorage.getItem(`study_${userId}`);
    if (stored) {
      this.entries = JSON.parse(stored);
      this.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  checkTodayEntries(): void {
    const today = new Date().toISOString().split('T')[0];
    this.todayEntries = this.entries.filter(e => e.date === today);
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.clearForm();
  }

  saveStudy(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    if (!this.subject.trim()) {
      alert('Molimo unesite predmet!');
      return;
    }

    if (this.hours === 0 && this.minutes === 0) {
      alert('Molimo unesite vrijeme učenja!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const totalMinutes = this.hours * 60 + this.minutes;

    const newEntry: StudyEntry = {
      id: Date.now().toString(),
      date: today,
      subject: this.subject.trim(),
      hours: this.hours,
      minutes: this.minutes,
      totalMinutes: totalMinutes,
      note: this.note.trim(),
      createdAt: new Date()
    };

    this.entries.unshift(newEntry);
    this.todayEntries.unshift(newEntry);

    this.saveToStorage();
    this.calculateStats();
    this.clearForm();
  }

  saveToStorage(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    localStorage.setItem(`study_${userId}`, JSON.stringify(this.entries));
  }

  deleteEntry(id: string): void {
    if (confirm('Da li ste sigurni da želite obrisati ovaj unos?')) {
      this.entries = this.entries.filter(e => e.id !== id);
      this.checkTodayEntries();
      this.saveToStorage();
      this.calculateStats();
    }
  }

  clearForm(): void {
    this.subject = '';
    this.hours = 0;
    this.minutes = 0;
    this.note = '';
  }

  calculateStats(): void {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

 
    this.totalHoursToday = this.calculateTotalHours(
      this.entries.filter(e => e.date === todayStr)
    );

    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    this.totalHoursWeek = this.calculateTotalHours(
      this.entries.filter(e => new Date(e.date) >= sevenDaysAgo)
    );

 
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.totalHoursMonth = this.calculateTotalHours(
      this.entries.filter(e => new Date(e.date) >= thirtyDaysAgo)
    );

   
    if (this.entries.length > 0) {
      const uniqueDates = [...new Set(this.entries.map(e => e.date))];
      const totalMinutes = this.entries.reduce((sum, e) => sum + e.totalMinutes, 0);
      this.averageHoursPerDay = Math.round((totalMinutes / uniqueDates.length / 60) * 10) / 10;
    } else {
      this.averageHoursPerDay = 0;
    }

 
    this.mostStudiedSubject = this.calculateMostStudiedSubject();
  }

  calculateTotalHours(entries: StudyEntry[]): number {
    const totalMinutes = entries.reduce((sum, e) => sum + e.totalMinutes, 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }

  calculateMostStudiedSubject(): string {
    if (this.entries.length === 0) return 'N/A';

    const subjectMinutes: { [key: string]: number } = {};
    
    this.entries.forEach(entry => {
      if (!subjectMinutes[entry.subject]) {
        subjectMinutes[entry.subject] = 0;
      }
      subjectMinutes[entry.subject] += entry.totalMinutes;
    });

    let maxMinutes = 0;
    let topSubject = 'N/A';

    Object.entries(subjectMinutes).forEach(([subject, minutes]) => {
      if (minutes > maxMinutes) {
        maxMinutes = minutes;
        topSubject = subject;
      }
    });

    return topSubject;
  }

  formatTime(hours: number, minutes: number): string {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
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

  getTodayTotal(): string {
    if (this.todayEntries.length === 0) return '0h';
    return this.totalHoursToday + 'h';
  }
}