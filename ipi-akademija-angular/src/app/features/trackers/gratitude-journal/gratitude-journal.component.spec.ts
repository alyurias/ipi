import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GratitudeJournalComponent } from './gratitude-journal.component';

describe('GratitudeJournalComponent', () => {
  let component: GratitudeJournalComponent;
  let fixture: ComponentFixture<GratitudeJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GratitudeJournalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GratitudeJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
