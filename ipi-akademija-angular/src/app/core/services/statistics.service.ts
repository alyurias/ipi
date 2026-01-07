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

export interface WaterData {
  date: string;
  glasses: number;
  goal: number;
}

export interface StatisticsData {
  sleep: SleepData[];
  study: StudyData[];
  mood: MoodData[];
  water: WaterData[];
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
    water: []
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
    const waterData = this.loadWaterData(userId);

    this.statisticsSubject.next({
      sleep: sleepData,
      study: studyData,
      mood: moodData,
      water: waterData
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

  private loadWaterData(userId: string): WaterData[] {
    try {
      const stored = localStorage.getItem(`water_${userId}`);
      const goalStored = localStorage.getItem(`water_goal_${userId}`);
      const goal = goalStored ? parseInt(goalStored) : 8;
      
      if (!stored) return [];

      const entries = JSON.parse(stored);
      return entries.map((entry: any) => ({
        date: entry.date,
        glasses: entry.glasses || 0,
        goal: goal
      }));
    } catch (error) {
      console.error('Error loading water data:', error);
      return [];
    }
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
      water: allData.water.filter(w => w.date >= cutoffStr)
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
    const demoWater: WaterData[] = [];


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

    
      demoWater.push({
        date: dateStr,
        glasses: Math.floor(Math.random() * 10) + 3, 
        goal: 8
      });
    }

    this.statisticsSubject.next({
      sleep: demoSleep,
      study: demoStudy,
      mood: demoMood,
      water: demoWater
    });
  }

  refreshData(): void {
    this.loadAllData();
  }
}