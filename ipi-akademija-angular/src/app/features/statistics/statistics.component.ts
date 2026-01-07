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
  @ViewChild('overviewChart') overviewChartRef!: ElementRef<HTMLCanvasElement>;

  private sleepChart?: Chart;
  private studyChart?: Chart;
  private overviewChart?: Chart;

  statisticsData?: StatisticsData;
  
  sidebarOpen = true;
  sidebarVisible = true;
  
  selectedPeriod: 'week' | 'month' | 'all' = 'week';
  customDays = 7;

  averageSleep = 0;
  averageStudy = 0;
  averageMood = 0;

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
  }

  createCharts(): void {
    if (!this.statisticsData) {
      console.warn('No statistics data available');
      return;
    }

    this.createSleepChart();
    this.createStudyChart();
    this.createOverviewChart();
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
          backgroundColor: 'rgba(99, 161, 241, 0.8)',
          borderColor: 'hsla(199, 100%, 77%, 1.00)',
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

  createOverviewChart(): void {
    if (!this.overviewChartRef?.nativeElement || !this.statisticsData) return;

    const ctx = this.overviewChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

  
    const totalSleep = this.statisticsData.sleep.reduce((sum, s) => sum + s.hours, 0);
    const totalStudy = this.statisticsData.study.reduce((sum, s) => sum + s.hours, 0);
    
 
    const days = this.statisticsData.sleep.length || 1;
    const avgSleep = totalSleep / days;
    const avgStudy = totalStudy / days;
    const avgOther = Math.max(0, 24 - avgSleep - avgStudy); 

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: ['Spavanje', 'Učenje', 'Ostale aktivnosti'],
        datasets: [{
          data: [avgSleep, avgStudy, avgOther],
          backgroundColor: [
            'rgba(160, 201, 255, 0.8)',    
            'rgba(220, 255, 243, 0.8)',    
            'rgba(255, 202, 248, 0.8)'     
          ],
          borderColor: [
            'rgba(160, 201, 255, 0.8)',    
            'rgba(220, 255, 243, 0.8)',     
            'rgba(255, 202, 248, 0.8)'      
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
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage = ((value / 24) * 100).toFixed(1);
                return `${label}: ${value.toFixed(1)}h (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.overviewChart = new Chart(ctx, config);
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
    if (this.overviewChart) {
      this.overviewChart.destroy();
      this.overviewChart = undefined;
    }
  }

  resetData(): void {
    if (confirm('Da li ste sigurni da želite resetovati sve podatke na demo verziju?')) {
      this.statisticsService.resetToDemo();
    }
  }
}