import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface Reminder {
  date: string;
  text: string;
  id: string;
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasReminder: boolean;
  reminders: Reminder[];
}

@Component({
  selector: 'app-calendar-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-tracker.component.html',
  styleUrl: './calendar-tracker.component.css'
})
export class CalendarTrackerComponent implements OnInit {
  private authService = inject(AuthService);
  
  currentDate = new Date();
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  calendarDays: CalendarDay[] = [];
  
  monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];
  
  dayNames = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
  
  selectedDate: Date | null = null;
  showReminderModal = false;
  newReminderText = '';
  hoveredDay: CalendarDay | null = null;

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);
    
   
    let firstDayIndex = firstDay.getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const lastDayIndex = lastDay.getDay();
    const nextDays = lastDayIndex === 0 ? 0 : 7 - lastDayIndex;
    
    this.calendarDays = [];
    
    
    for (let i = firstDayIndex; i > 0; i--) {
      const day = prevLastDay.getDate() - i + 1;
      const date = new Date(this.currentYear, this.currentMonth - 1, day);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
    
 
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }
    

    for (let day = 1; day <= nextDays; day++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, day);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
    
    const dateString = this.getDateString(date);
    const reminders = this.getRemindersForDate(dateString);
    
    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday,
      hasReminder: reminders.length > 0,
      reminders
    };
  }

  getDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  selectDay(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    this.selectedDate = day.date;
    this.showReminderModal = true;
    this.newReminderText = '';
  }

  addReminder(): void {
    if (!this.selectedDate || !this.newReminderText.trim()) return;
    
    const dateString = this.getDateString(this.selectedDate);
    const reminders = this.getRemindersForDate(dateString);
    
    const newReminder: Reminder = {
      date: dateString,
      text: this.newReminderText.trim(),
      id: Date.now().toString()
    };
    
    reminders.push(newReminder);
    this.saveReminders(dateString, reminders);
    
    this.newReminderText = '';
    this.showReminderModal = false;
    this.generateCalendar();
  }

  deleteReminder(dateString: string, reminderId: string): void {
    let reminders = this.getRemindersForDate(dateString);
    reminders = reminders.filter(r => r.id !== reminderId);
    this.saveReminders(dateString, reminders);
    this.generateCalendar();
  }

  getRemindersForDate(dateString: string): Reminder[] {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return [];
    
    const key = `calendar_${userId}_${dateString}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  saveReminders(dateString: string, reminders: Reminder[]): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;
    
    const key = `calendar_${userId}_${dateString}`;
    if (reminders.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(reminders));
    }
  }

  closeModal(): void {
    this.showReminderModal = false;
    this.selectedDate = null;
    this.newReminderText = '';
  }

  onDayMouseEnter(day: CalendarDay): void {
    if (day.hasReminder && day.isCurrentMonth) {
      this.hoveredDay = day;
    }
  }

  onDayMouseLeave(): void {
    this.hoveredDay = null;
  }

  getSelectedDateReminders(): Reminder[] {
    if (!this.selectedDate) return [];
    const dateString = this.getDateString(this.selectedDate);
    return this.getRemindersForDate(dateString);
  }

  formatDate(date: Date): string {
    return `${date.getDate()}. ${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }
}