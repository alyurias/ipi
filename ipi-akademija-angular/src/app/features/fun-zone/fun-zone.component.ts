
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-fun-zone',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './fun-zone.component.html',
  styleUrl: './fun-zone.component.css'
})
export class FunZoneComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.applyUserTheme();
  }
}