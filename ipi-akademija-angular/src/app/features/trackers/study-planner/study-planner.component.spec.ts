import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyPlannerComponent } from './study-planner.component';

describe('StudyPlannerComponent', () => {
  let component: StudyPlannerComponent;
  let fixture: ComponentFixture<StudyPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyPlannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudyPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
