import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ChatbotComponent } from './shared/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChatbotComponent],
  template: `
    <router-outlet></router-outlet>
    @if (chatbotEnabled) {
      <app-chatbot></app-chatbot>
    }
  `
})
export class AppComponent implements OnInit {
  chatbotEnabled = false;

  ngOnInit(): void {
    this.loadChatbotState();
    
    // Listen for chatbot toggle events from settings
    window.addEventListener('chatbotToggle', ((event: CustomEvent) => {
      this.chatbotEnabled = event.detail.enabled;
    }) as EventListener);
  }

  private loadChatbotState(): void {
    const chatbotState = localStorage.getItem('chatbotEnabled');
    this.chatbotEnabled = chatbotState === 'true';
  }
}