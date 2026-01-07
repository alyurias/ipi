import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';

import { SleepTrackerComponent } from '../trackers/sleep-tracker/sleep-tracker.component';
import { StudyPlannerComponent } from '../trackers/study-planner/study-planner.component';
import { FitnessPlannerComponent } from '../trackers/fitness-planner/fitness-planner.component';
import { TaskPlannerComponent } from '../trackers/task-planner/task-planner.component';
import { MealPlannerComponent } from '../trackers/meal-planner/meal-planner.component';
import { MoodTrackerComponent } from '../trackers/mood-tracker/mood-tracker.component';
import { CalendarTrackerComponent } from '../trackers/calendar-tracker/calendar-tracker.component';
import { FinanceTrackerComponent } from '../trackers/finance-tracker/finance-tracker.component';
import { GratitudeJournalComponent } from '../trackers/gratitude-journal/gratitude-journal.component';
import { DailyReflectionComponent } from '../trackers/daily-reflection/daily-reflection.component';
import { WaterIntakeComponent } from '../trackers/water-intake/water-intake.component';

interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
  comingSoon?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FooterComponent, 
    DragDropModule,
    SleepTrackerComponent,
    StudyPlannerComponent,
    FitnessPlannerComponent,
    TaskPlannerComponent,
    MealPlannerComponent,
    MoodTrackerComponent,
    CalendarTrackerComponent,
    FinanceTrackerComponent,
    GratitudeJournalComponent,
    DailyReflectionComponent,
    WaterIntakeComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  sidebarOpen = true;
  sidebarVisible = true;
  modulesSelected = false;
  selectedModules: string[] = [];

  availableModules: Module[] = [
    { id: 'sleep', name: 'Sleep Tracker', icon: '', description: 'Pratite san' },
    { id: 'study', name: 'Study Planner', icon: '', description: 'Organizujte učenje' },
    { id: 'fitness', name: 'Fitness Planner', icon: '', description: 'Vježbanje', comingSoon: true },
    { id: 'tasks', name: 'Task Planner', icon: '', description: 'Upravljajte planovima', comingSoon: true },
    { id: 'meal', name: 'Meal Planner', icon: '', description: 'Planirajte obroke' },
    { id: 'mood', name: 'Mood Tracker', icon: '', description: 'Pratite raspoloženje' },
    { id: 'finance', name: 'Finance Tracker', icon: '', description: 'Budžet', comingSoon: true },
    { id: 'gratitude', name: 'Gratitude Journal', icon: '', description: 'Dnevnik zahvalnosti' },
    { id: 'reflection', name: 'Daily Reflection', icon: '', description: 'Dnevni osvrt' },
    { id: 'water', name: 'Water Intake', icon: '', description: 'Praćenje hidratacije' }
  ];

  ngOnInit(): void {
    this.themeService.applyUserTheme();
    this.loadUserModules();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dobro jutro';
    if (hour < 18) return 'Dobar dan';
    return 'Dobro veče';
  }

  getUserInitials(): string {
    const name = this.currentUser()?.name || 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
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
    localStorage.setItem('sidebarHidden', 'false');
  }

  loadUserModules(): void {
    const saved = localStorage.getItem(`modules_${this.currentUser()?.uid}`);
    if (saved) {
      this.selectedModules = JSON.parse(saved);
      this.modulesSelected = true;
    }
    
    const sidebarHidden = localStorage.getItem('sidebarHidden');
    if (sidebarHidden === 'true') {
      this.sidebarVisible = false;
    }
  }

  isModuleSelected(id: string): boolean {
    return this.selectedModules.includes(id);
  }

  toggleModule(id: string): void {
    const module = this.availableModules.find(m => m.id === id);
    
 
    if (module?.comingSoon) {
      this.notificationService.success('Ovaj tracker će biti dostupan uskoro!');
      return;
    }
    
    const index = this.selectedModules.indexOf(id);
    
    if (index > -1) {
      this.selectedModules.splice(index, 1);
    } else if (this.selectedModules.length < 3) {
      this.selectedModules.push(id);
    }
  }

  confirmModules(): void {
    if (this.selectedModules.length === 3) {
      localStorage.setItem(`modules_${this.currentUser()?.uid}`, JSON.stringify(this.selectedModules));
      this.modulesSelected = true;
      this.notificationService.success('Trackeri su uspješno odabrani!');
    }
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
}