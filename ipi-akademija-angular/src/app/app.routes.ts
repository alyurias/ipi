import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'statistics',
    loadComponent: () => import('./features/statistics/statistics.component').then(m => m.StatisticsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'fun-zone',
    loadComponent: () => import('./features/fun-zone/fun-zone.component').then(m => m.FunZoneComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
 
  {
    path: 'fun-zone',
    canActivate: [authGuard],
    children: [
      {
        path: 'whiteboard',
        loadComponent: () => import('./features/fun-zone/whiteboard/whiteboard.component').then(m => m.WhiteboardComponent)
      },
      {
        path: 'bingo',
        loadComponent: () => import('./features/fun-zone/bingo/bingo.component').then(m => m.BingoComponent)
      },
      {
        path: 'quiz',
        loadComponent: () => import('./features/fun-zone/quiz/quiz.component').then(m => m.QuizComponent)
      },
      {
        path: 'kanban',
        loadComponent: () => import('./features/fun-zone/kanban/kanban.component').then(m => m.KanbanComponent)
      },
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/fun-zone/fun-zone.component').then(m => m.FunZoneComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];