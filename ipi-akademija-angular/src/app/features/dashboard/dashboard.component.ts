import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { Subject, takeUntil } from 'rxjs';

// Import all tracker components
import { SleepTrackerComponent } from '../../features/trackers/sleep-tracker/sleep-tracker.component';
import { StudyPlannerComponent } from '../../features/trackers/study-planner/study-planner.component';
import { FitnessPlannerComponent } from '../../features/trackers/fitness-planner/fitness-planner.component';
import { TaskPlannerComponent } from '../../features/trackers/task-planner/task-planner.component';
import { MealPlannerComponent } from '../../features/trackers/meal-planner/meal-planner.component';
import { MoodTrackerComponent } from '../../features/trackers/mood-tracker/mood-tracker.component';
import { FinanceTrackerComponent } from '../../features/trackers/finance-tracker/finance-tracker.component';
import { GratitudeJournalComponent } from '../../features/trackers/gratitude-journal/gratitude-journal.component';
import { DailyReflectionComponent } from '../../features/trackers/daily-reflection/daily-reflection.component';
import { WaterIntakeComponent } from '../../features/trackers/water-intake/water-intake.component';
import { CalendarTrackerComponent } from '../../features/trackers/calendar-tracker/calendar-tracker.component';

interface Module {
  id: string;
  name: string;
  description: string;
  comingSoon?: boolean;
}

interface QuickStat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DragDropModule,
    SleepTrackerComponent,
    StudyPlannerComponent,
    FitnessPlannerComponent,
    TaskPlannerComponent,
    MealPlannerComponent,
    MoodTrackerComponent,
    FinanceTrackerComponent,
    GratitudeJournalComponent,
    DailyReflectionComponent,
    WaterIntakeComponent,
    CalendarTrackerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private statisticsService = inject(StatisticsService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser = this.authService.currentUser;

  sidebarOpen = true;
  sidebarVisible = true;
  modulesSelected = false;
  selectedModules: string[] = [];

  // Quick stats - real data
  quickStats: QuickStat[] = [
    { value: '0', label: 'Završenih zadataka' },
    { value: '0', label: 'Dnevni streak' },
    { value: '0h', label: 'Vrijeme učenja' },
    { value: '0/5', label: 'Raspoloženje' }
  ];

  availableModules: Module[] = [
    {
      id: 'sleep',
      name: 'Sleep Tracker',
      description: 'Pratite svoje navike spavanja'
    },
    {
      id: 'study',
      name: 'Study Planner',
      description: 'Planirajte svoje vrijeme za učenje'
    },
    {
      id: 'mood',
      name: 'Mood Tracker',
      description: 'Pratite svoje dnevno raspoloženje'
    },
    {
      id: 'tasks',
      name: 'Task Planner',
      description: 'Organizujte svoje zadatke'
    },
    {
      id: 'fitness',
      name: 'Fitness Planner',
      description: 'Pratite svoju fizičku aktivnost',
      comingSoon: true
    },
    {
      id: 'meal',
      name: 'Meal Planner',
      description: 'Planirajte svoje obroke',
      comingSoon: true
    },
    {
      id: 'finance',
      name: 'Finance Tracker',
      description: 'Pratite svoje finansije',
      comingSoon: true
    },
    {
      id: 'gratitude',
      name: 'Gratitude Journal',
      description: 'Dnevnik zahvalnosti',
      comingSoon: true
    },
    {
      id: 'reflection',
      name: 'Daily Reflection',
      description: 'Dnevna refleksija',
      comingSoon: true
    },
    {
      id: 'water',
      name: 'Water Intake',
      description: 'Pratite unos vode',
      comingSoon: true
    }
  ];

  ngOnInit(): void {
    this.loadUserModules();
    this.loadSidebarState();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStatistics(): void {
    this.statisticsService.statistics$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.updateQuickStats(data);
      });
  }

  updateQuickStats(data: any): void {
    const userId = this.currentUser()?.uid;
    if (!userId) return;

    // 1. Completed Tasks (from localStorage)
    const completedTasks = this.getCompletedTasksCount(userId);

    // 2. Daily Streak (consecutive days with data)
    const streak = this.calculateStreak(data);

    // 3. Study Time Today
    const studyTimeToday = this.getStudyTimeToday(data);

    // 4. Average Mood (last 7 days)
    const averageMood = this.getAverageMood(data);

    this.quickStats = [
      { value: completedTasks.toString(), label: 'Završenih zadataka' },
      { value: streak.toString(), label: 'Dnevni streak' },
      { value: studyTimeToday, label: 'Vrijeme učenja danas' },
      { value: averageMood, label: 'Prosječno raspoloženje' }
    ];
  }

  getCompletedTasksCount(userId: string): number {
    try {
      // Check if tasks are stored in localStorage
      const tasksKey = `tasks_${userId}`;
      const stored = localStorage.getItem(tasksKey);
      
      if (!stored) return 0;

      const tasks = JSON.parse(stored);
      
      // Count completed tasks
      if (Array.isArray(tasks)) {
        return tasks.filter((task: any) => task.completed === true).length;
      }
      
      return 0;
    } catch (error) {
      console.error('Error loading tasks:', error);
      return 0;
    }
  }

  calculateStreak(data: any): number {
    // Calculate consecutive days with any activity (sleep, study, or mood entries)
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasActivity = 
        data.sleep.some((s: any) => s.date === dateStr) ||
        data.study.some((s: any) => s.date === dateStr) ||
        data.mood.some((m: any) => m.date === dateStr);
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        // Stop counting if we hit a day with no activity (but not today)
        break;
      }
    }
    
    return streak;
  }

  getStudyTimeToday(data: any): string {
    const today = new Date().toISOString().split('T')[0];
    
    const todayStudy = data.study.filter((s: any) => s.date === today);
    
    if (todayStudy.length === 0) {
      return '0h';
    }
    
    const totalHours = todayStudy.reduce((sum: number, s: any) => sum + s.hours, 0);
    
    return `${totalHours.toFixed(1)}h`;
  }

  getAverageMood(data: any): string {
    if (!data.mood || data.mood.length === 0) {
      return '0/5';
    }

    // Get mood entries from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffStr = sevenDaysAgo.toISOString().split('T')[0];

    const recentMoods = data.mood.filter((m: any) => m.date >= cutoffStr);
    
    if (recentMoods.length === 0) {
      return '0/5';
    }

    const totalMood = recentMoods.reduce((sum: number, m: any) => sum + m.rating, 0);
    const average = totalMood / recentMoods.length;

    return `${average.toFixed(1)}/5`;
  }

  loadSidebarState(): void {
    const sidebarHidden = localStorage.getItem('sidebarHidden');
    if (sidebarHidden === 'true') {
      this.sidebarVisible = false;
    }
  }

  loadUserModules(): void {
    const userId = this.currentUser()?.uid;
    if (!userId) return;

    const stored = localStorage.getItem(`modules_${userId}`);
    if (stored) {
      this.selectedModules = JSON.parse(stored);
      this.modulesSelected = this.selectedModules.length > 0;
    }
  }

  saveUserModules(): void {
    const userId = this.currentUser()?.uid;
    if (!userId) return;

    localStorage.setItem(`modules_${userId}`, JSON.stringify(this.selectedModules));
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  hideSidebar(): void {
    this.sidebarVisible = false;
    localStorage.setItem('sidebarHidden', 'true');
  }

  showSidebar(): void {
    this.sidebarVisible = true;
    this.sidebarOpen = true;
    localStorage.setItem('sidebarHidden', 'false');
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  async logout(): Promise<void> {
    if (confirm('Želite li se odjaviti?')) {
      const result = await this.authService.logout();
      if (result.success) {
        this.notificationService.success(result.message);
      }
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Dobro jutro';
    } else if (hour < 18) {
      return 'Dobar dan';
    } else {
      return 'Dobro veče';
    }
  }

  isModuleSelected(moduleId: string): boolean {
    return this.selectedModules.includes(moduleId);
  }

  toggleModule(moduleId: string): void {
    const module = this.availableModules.find(m => m.id === moduleId);
    if (module?.comingSoon) {
      this.notificationService.info('Ova funkcionalnost dolazi uskoro!');
      return;
    }

    const index = this.selectedModules.indexOf(moduleId);
    if (index > -1) {
      this.selectedModules.splice(index, 1);
    } else if (this.selectedModules.length < 3) {
      this.selectedModules.push(moduleId);
    }
  }

  confirmModules(): void {
    if (this.selectedModules.length !== 3) {
      this.notificationService.warning('Molimo odaberite tačno 3 trackera');
      return;
    }

    this.modulesSelected = true;
    this.saveUserModules();
    this.notificationService.success('Vaši trackeri su sačuvani!');
  }

  onDrop(event: CdkDragDrop<string[]>): void {
    // Handle reordering of modules if needed
    const temp = this.selectedModules[event.previousIndex];
    this.selectedModules[event.previousIndex] = this.selectedModules[event.currentIndex];
    this.selectedModules[event.currentIndex] = temp;
    this.saveUserModules();
  }
}