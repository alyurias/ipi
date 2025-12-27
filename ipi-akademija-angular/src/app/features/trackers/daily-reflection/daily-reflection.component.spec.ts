import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyReflectionComponent } from './daily-reflection.component';

describe('DailyReflectionComponent', () => {
  let component: DailyReflectionComponent;
  let fixture: ComponentFixture<DailyReflectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyReflectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DailyReflectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
