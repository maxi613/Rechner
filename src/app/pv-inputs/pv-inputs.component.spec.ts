import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PvInputsComponent } from './pv-inputs.component';

describe('PvInputsComponent', () => {
  let component: PvInputsComponent;
  let fixture: ComponentFixture<PvInputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PvInputsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PvInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
