import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatingpumpIntputsComponent } from './heatingpump-intputs.component';

describe('HeatingpumpIntputsComponent', () => {
  let component: HeatingpumpIntputsComponent;
  let fixture: ComponentFixture<HeatingpumpIntputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeatingpumpIntputsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeatingpumpIntputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
