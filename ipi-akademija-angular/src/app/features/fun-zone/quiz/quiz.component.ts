import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; text-align: center;">
      <h1>Quiz Component</h1>
      <button (click)="goBack()" style="padding: 10px 20px; margin-top: 20px;">
        ← Povratak
      </button>
    </div>
  `
})
export class QuizComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/fun-zone']);
  }
}