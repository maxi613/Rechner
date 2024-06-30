import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentInputsComponent } from './resident-inputs.component';

describe('ResidentInputsComponent', () => {
  let component: ResidentInputsComponent;
  let fixture: ComponentFixture<ResidentInputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResidentInputsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResidentInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
