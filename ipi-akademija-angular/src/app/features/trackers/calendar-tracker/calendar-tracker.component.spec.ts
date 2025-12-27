import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarTrackerComponent } from './calendar-tracker.component';

describe('CalendarTrackerComponent', () => {
  let component: CalendarTrackerComponent;
  let fixture: ComponentFixture<CalendarTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarTrackerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalendarTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
