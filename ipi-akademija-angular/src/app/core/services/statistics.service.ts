import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface SleepData {
  date: string;
  hours: number;
  quality: number;
}

export interface StudyData {
  date: string;
  hours: number;
  subject: string;
}

export interface MoodData {
  date: string;
  rating: number;
  factors: string[];
}

export interface TaskData {
  date: string;
  completed: number;
  total: number;
}

export interface StatisticsData {
  sleep: SleepData[];
  study: StudyData[];
  mood: MoodData[];
  tasks: TaskData[];
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private authService = inject(AuthService);
  
  private statisticsSubject = new BehaviorSubject<StatisticsData>({
    sleep: [],
    study: [],
    mood: [],
    tasks: []
  });

  statistics$ = this.statisticsSubject.asObservable();

  constructor() {
    this.loadAllData();
  }

  loadAllData(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) {
      this.loadDemoData();
      return;
    }

    const sleepData = this.loadSleepData(userId);
    const studyData = this.loadStudyData(userId);
    const moodData = this.loadMoodData(userId);
    const taskData = this.generateTaskData(); 

    this.statisticsSubject.next({
      sleep: sleepData,
      study: studyData,
      mood: moodData,
      tasks: taskData
    });
  }

  private loadSleepData(userId: string): SleepData[] {
    try {
      const stored = localStorage.getItem(`sleep_${userId}`);
      if (!stored) return [];

      const entries = JSON.parse(stored);
      return entries.map((entry: any) => ({
        date: entry.date,
        hours: entry.hours || 0,
        quality: entry.quality || 3
      }));
    } catch (error) {
      console.error('Error loading sleep data:', error);
      return [];
    }
  }

  private loadStudyData(userId: string): StudyData[] {
    try {
      const stored = localStorage.getItem(`study_${userId}`);
      if (!stored) return [];

      const entries = JSON.parse(stored);
      return entries.map((entry: any) => ({
        date: entry.date,
        hours: (entry.totalMinutes || 0) / 60,
        subject: entry.subject || 'Unknown'
      }));
    } catch (error) {
      console.error('Error loading study data:', error);
      return [];
    }
  }

  private loadMoodData(userId: string): MoodData[] {
    try {
      const stored = localStorage.getItem(`mood_${userId}`);
      if (!stored) return [];

      const entries = JSON.parse(stored);
      return entries.map((entry: any) => ({
        date: entry.date,
        rating: entry.mood || 5,
        factors: entry.factors || []
      }));
    } catch (error) {
      console.error('Error loading mood data:', error);
      return [];
    }
  }

  private generateTaskData(): TaskData[] {
 
    const tasks: TaskData[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      tasks.push({
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 8) + 2,
        total: Math.floor(Math.random() * 5) + 8
      });
    }

    return tasks;
  }

  getDataForPeriod(days: number): StatisticsData {
    const allData = this.statisticsSubject.value;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    return {
      sleep: allData.sleep.filter(s => s.date >= cutoffStr),
      study: allData.study.filter(s => s.date >= cutoffStr),
      mood: allData.mood.filter(m => m.date >= cutoffStr),
      tasks: allData.tasks.filter(t => t.date >= cutoffStr)
    };
  }

  resetToDemo(): void {
    this.loadDemoData();
  }

  private loadDemoData(): void {
    const today = new Date();
    const demoSleep: SleepData[] = [];
    const demoStudy: StudyData[] = [];
    const demoMood: MoodData[] = [];
    const demoTasks: TaskData[] = [];


    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

 
      demoSleep.push({
        date: dateStr,
        hours: 6 + Math.random() * 3, 
        quality: Math.floor(Math.random() * 3) + 3 
      });


      if (i % 2 === 0) { 
        demoStudy.push({
          date: dateStr,
          hours: 1 + Math.random() * 3, 
          subject: ['Matematika', 'Fizika', 'Programiranje', 'Engleski'][Math.floor(Math.random() * 4)]
        });
      }

     
      demoMood.push({
        date: dateStr,
        rating: Math.floor(Math.random() * 5) + 1, 
        factors: ['Posao', 'Porodica', 'Zdravlje']
      });

   
      demoTasks.push({
        date: dateStr,
        completed: Math.floor(Math.random() * 6) + 3,
        total: Math.floor(Math.random() * 4) + 8
      });
    }

    this.statisticsSubject.next({
      sleep: demoSleep,
      study: demoStudy,
      mood: demoMood,
      tasks: demoTasks
    });
  }

  refreshData(): void {
    this.loadAllData();
  }
}