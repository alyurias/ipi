import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskPlannerComponent } from './task-planner.component';

describe('TaskPlannerComponent', () => {
  let component: TaskPlannerComponent;
  let fixture: ComponentFixture<TaskPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskPlannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
