import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StatisticsService, StatisticsData } from '../../core/services/statistics.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Subject, takeUntil } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit, OnDestroy, AfterViewInit {
  private statisticsService = inject(StatisticsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  @ViewChild('sleepChart') sleepChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('studyChart') studyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('moodChart') moodChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('progressChart') progressChartRef!: ElementRef<HTMLCanvasElement>;

  private sleepChart?: Chart;
  private studyChart?: Chart;
  private moodChart?: Chart;
  private progressChart?: Chart;

  statisticsData?: StatisticsData;
  

  sidebarOpen = true;
  sidebarVisible = true;
  
  selectedPeriod: 'week' | 'month' | 'all' = 'week';
  customDays = 7;

  averageSleep = 0;
  averageStudy = 0;
  averageMood = 0;
  totalTasksCompleted = 0;
  totalTasks = 0;
  completionRate = 0;

  ngOnInit(): void {
    this.loadStatistics();
    const sidebarHidden = localStorage.getItem('sidebarHidden');
    if (sidebarHidden === 'true') {
      this.sidebarVisible = false;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
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

  loadStatistics(): void {
    this.statisticsService.statistics$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('Statistics data loaded:', data);
        this.statisticsData = this.getFilteredData();
        this.calculateAverages();
        this.updateCharts();
      });
  }

  getFilteredData(): StatisticsData {
    let days: number;
    
    switch (this.selectedPeriod) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'all':
        days = 365;
        break;
      default:
        days = this.customDays;
    }

    return this.statisticsService.getDataForPeriod(days);
  }

  onPeriodChange(): void {
    this.statisticsData = this.getFilteredData();
    this.calculateAverages();
    this.updateCharts();
  }

  calculateAverages(): void {
    if (!this.statisticsData) return;

    if (this.statisticsData.sleep.length > 0) {
      const totalSleep = this.statisticsData.sleep.reduce((sum, s) => sum + s.hours, 0);
      this.averageSleep = parseFloat((totalSleep / this.statisticsData.sleep.length).toFixed(1));
    } else {
      this.averageSleep = 0;
    }

    if (this.statisticsData.study.length > 0) {
      const totalStudy = this.statisticsData.study.reduce((sum, s) => sum + s.hours, 0);
      this.averageStudy = parseFloat((totalStudy / this.statisticsData.study.length).toFixed(1));
    } else {
      this.averageStudy = 0;
    }

    if (this.statisticsData.mood.length > 0) {
      const totalMood = this.statisticsData.mood.reduce((sum, m) => sum + m.rating, 0);
      this.averageMood = parseFloat((totalMood / this.statisticsData.mood.length).toFixed(1));
    } else {
      this.averageMood = 0;
    }

    if (this.statisticsData.tasks.length > 0) {
      this.totalTasksCompleted = this.statisticsData.tasks.reduce((sum, t) => sum + t.completed, 0);
      this.totalTasks = this.statisticsData.tasks.reduce((sum, t) => sum + t.total, 0);
      this.completionRate = this.totalTasks > 0 
        ? parseFloat(((this.totalTasksCompleted / this.totalTasks) * 100).toFixed(1))
        : 0;
    } else {
      this.completionRate = 0;
    }
  }

  createCharts(): void {
    if (!this.statisticsData) {
      console.warn('No statistics data available');
      return;
    }

    this.createSleepChart();
    this.createStudyChart();
    this.createMoodChart();
    this.createProgressChart();
  }

  createSleepChart(): void {
    if (!this.sleepChartRef?.nativeElement || !this.statisticsData) return;

    const ctx = this.sleepChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.statisticsData.sleep.map(s => this.formatDate(s.date));
    const data = this.statisticsData.sleep.map(s => s.hours);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Sati spavanja',
          data,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 12,
            ticks: {
              stepSize: 2
            }
          }
        }
      }
    };

    this.sleepChart = new Chart(ctx, config);
  }

  createStudyChart(): void {
    if (!this.studyChartRef?.nativeElement || !this.statisticsData) return;

    const ctx = this.studyChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.statisticsData.study.map(s => this.formatDate(s.date));
    const data = this.statisticsData.study.map(s => s.hours);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Vrijeme učenja (sati)',
          data,
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.studyChart = new Chart(ctx, config);
  }

  createMoodChart(): void {
    if (!this.moodChartRef?.nativeElement || !this.statisticsData) return;

    const ctx = this.moodChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const moodCounts = [0, 0, 0, 0, 0];
    
    this.statisticsData.mood.forEach(m => {
      const rating = Math.round(m.rating);
      if (rating >= 1 && rating <= 5) {
        moodCounts[rating - 1]++;
      }
    });

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: ['Vrlo loše (1)', 'Loše (2)', 'Neutralno (3)', 'Dobro (4)', 'Odlično (5)'],
        datasets: [{
          data: moodCounts,
          backgroundColor: [
            'rgba(255, 83, 83, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(255, 213, 107, 0.8)',
            'rgba(85, 255, 147, 0.8)',
            'rgba(148, 189, 255, 0.8)'
          ],
          borderColor: [
            'rgba(255, 83, 83, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(255, 213, 107, 0.8)',
            'rgba(85, 255, 147, 0.8)',
            'rgba(148, 189, 255, 0.8)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          title: {
            display: false
          }
        }
      }
    };

    this.moodChart = new Chart(ctx, config);
  }

  createProgressChart(): void {
    if (!this.progressChartRef?.nativeElement || !this.statisticsData) return;

    const ctx = this.progressChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const weeklyData = this.groupByWeek(this.statisticsData);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: weeklyData.labels,
        datasets: [
          {
            label: 'Završeni zadaci',
            data: weeklyData.completed,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2
          },
          {
            label: 'Ukupno zadataka',
            data: weeklyData.total,
            backgroundColor: 'rgba(156, 163, 175, 0.5)',
            borderColor: 'rgba(156, 163, 175, 1)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    this.progressChart = new Chart(ctx, config);
  }

  groupByWeek(data: StatisticsData): { labels: string[], completed: number[], total: number[] } {
    const weeks = new Map<string, { completed: number, total: number }>();

    data.tasks.forEach(task => {
      const date = new Date(task.date);
      const weekStart = this.getWeekStart(date);
      const weekLabel = this.formatDate(weekStart);

      if (!weeks.has(weekLabel)) {
        weeks.set(weekLabel, { completed: 0, total: 0 });
      }

      const week = weeks.get(weekLabel)!;
      week.completed += task.completed;
      week.total += task.total;
    });

    const labels: string[] = [];
    const completed: number[] = [];
    const total: number[] = [];

    weeks.forEach((value, key) => {
      labels.push(key);
      completed.push(value.completed);
      total.push(value.total);
    });

    return { labels, completed, total };
  }

  getWeekStart(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  }

  updateCharts(): void {
    this.destroyCharts();
    setTimeout(() => this.createCharts(), 100);
  }

  destroyCharts(): void {
    if (this.sleepChart) {
      this.sleepChart.destroy();
      this.sleepChart = undefined;
    }
    if (this.studyChart) {
      this.studyChart.destroy();
      this.studyChart = undefined;
    }
    if (this.moodChart) {
      this.moodChart.destroy();
      this.moodChart = undefined;
    }
    if (this.progressChart) {
      this.progressChart.destroy();
      this.progressChart = undefined;
    }
  }

  resetData(): void {
    if (confirm('Da li ste sigurni da želite resetovati sve podatke na demo verziju?')) {
      this.statisticsService.resetToDemo();
    }
  }
}