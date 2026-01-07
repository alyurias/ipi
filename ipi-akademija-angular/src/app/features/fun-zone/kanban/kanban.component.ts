import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface KanbanTask {
  id: number;
  title: string;
  description: string;
  column: 'todo' | 'inProgress' | 'done';
  createdAt: Date;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  tasks: KanbanTask[] = [];
  newTaskTitle = '';
  newTaskDescription = '';
  
  columns = [
    { id: 'todo', title: 'Za Uraditi', color: '#fa7c7cff' },
    { id: 'inProgress', title: 'U Toku', color: '#f59e0b' },
    { id: 'done', title: 'Završeno', color: '#10b981' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  addTask(): void {
    if (this.newTaskTitle.trim()) {
      const newTask: KanbanTask = {
        id: Date.now(),
        title: this.newTaskTitle.trim(),
        description: this.newTaskDescription.trim(),
        column: 'todo',
        createdAt: new Date()
      };

      this.tasks.push(newTask);
      this.saveTasks();
      
      this.newTaskTitle = '';
      this.newTaskDescription = '';
    }
  }

  moveTask(taskId: number, newColumn: 'todo' | 'inProgress' | 'done'): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.column = newColumn;
      this.saveTasks();
    }
  }

  removeTask(taskId: number): void {
    if (confirm('Da li ste sigurni da želite obrisati ovaj zadatak?')) {
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      this.saveTasks();
    }
  }

  clearBoard(): void {
    if (confirm('Da li ste sigurni da želite obrisati sve zadatke?')) {
      this.tasks = [];
      localStorage.removeItem('kanbanTasks');
    }
  }

  saveTasks(): void {
    localStorage.setItem('kanbanTasks', JSON.stringify(this.tasks));
  }

  loadTasks(): void {
    const saved = localStorage.getItem('kanbanTasks');
    if (saved) {
      this.tasks = JSON.parse(saved);
      this.tasks.forEach(task => {
        task.createdAt = new Date(task.createdAt);
      });
    }
  }

  getTasksByColumn(columnId: string): KanbanTask[] {
    return this.tasks.filter(task => task.column === columnId);
  }

  getTaskCountByColumn(columnId: string): number {
    return this.getTasksByColumn(columnId).length;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/fun-zone']);
  }
}