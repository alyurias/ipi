import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceTrackerComponent } from './finance-tracker.component';

describe('FinanceTrackerComponent', () => {
  let component: FinanceTrackerComponent;
  let fixture: ComponentFixture<FinanceTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceTrackerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinanceTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
