import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormserviceService } from '../services/formservice/formservice.service';
@Component({
  selector: 'app-pv-inputs',
  templateUrl: './pv-inputs.component.html',
  styleUrl: './pv-inputs.component.scss'
})
export class PvInputsComponent {

  pvControl = new FormGroup({
    hasPV : new FormControl(false), 
    powerOfPV: new FormControl(''),
    costsOfPv: new FormControl(''),
    directionOfHouse: new FormControl('', ), 
    angleOfRoof: new FormControl('', ), 
    hasBattery: new FormControl(false, ),
    capacityBattery: new FormControl('',),
    costsBattery : new FormControl('', ), 
    wantsBattery: new FormControl(false, )
  });

  private formservice = inject(FormserviceService); 

  ngOnInit(){
    this.pvControl = this.formservice.GetPV;
  }
  submit(){
    this.formservice.SetPv = this.pvControl; 
  }

  hasPV(){
    this.pvControl.get('hasPV')?.value == true ?  this.pvControl.get('hasPV')?.setValue(false) : this.pvControl.get('hasPV')?.setValue(true);

  }

  
  hasBattery(){
    this.pvControl.get('hasBattery')?.value == true ?  this.pvControl.get('hasBattery')?.setValue(false) : this.pvControl.get('hasBattery')?.setValue(true);
  }
}
