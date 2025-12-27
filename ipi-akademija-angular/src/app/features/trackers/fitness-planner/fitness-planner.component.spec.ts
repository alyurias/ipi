import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FitnessPlannerComponent } from './fitness-planner.component';

describe('FitnessPlannerComponent', () => {
  let component: FitnessPlannerComponent;
  let fixture: ComponentFixture<FitnessPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FitnessPlannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FitnessPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
