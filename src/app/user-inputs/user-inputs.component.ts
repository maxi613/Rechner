import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormserviceService } from '../services/formservice/formservice.service';
import { energyClass, insolation } from '../shared/models/energyClass';
@Component({
  selector: 'app-user-inputs',
  templateUrl: './user-inputs.component.html',
  styleUrl: './user-inputs.component.scss'
})
export class UserInputsComponent {
  public hasEnergyclass: boolean = false;
  
  private formservice = inject(FormserviceService); 

  Insulations = [
    "KfW-Effizienzhaus 100",
    "KfW-Effizienzhaus 85",
    "KfW-Effizienzhaus 55",
    "KfW-Effizienzhaus 40+",
    "Passivhaus"
  ]

  energyClasses = [
    "A+", 
    "A", 
    "B", 
    "C",
    "D", 
    "E", 
    "F",
    "G", 
    "H"
  ]
  
  index: any; 
  house: FormGroup  = new FormGroup({
    area: new FormControl(0, [Validators.required]), 
    energyHeating: new FormControl(0, [Validators.required]),
    energyWater: new FormControl(0, [Validators.required]),
    hasEnergyId: new FormControl(false),
    energyClass: new FormControl(''),
    electricCar: new FormControl(false),
    floorHeating: new FormControl(false), 
    insolation: new FormControl(''), 
    kilometersCar: new FormControl(0)
  })

  ngOnInit(){
    this.house = this.formservice.Gethouse; 
  }
  submit(){
    this.formservice.SetHouse = this.house; 
  }

  checkEnergyclass(){
    if(!this.hasEnergyclass){
      this.hasEnergyclass=true; 
      this.house.controls['hasEnergyId'].setValue(this.hasEnergyclass);
    }else{
      this.hasEnergyclass= false; 
      this.house.controls['hasEnergyId'].setValue(this.hasEnergyclass);
    }
  }

  insolationSelected(){
    this.house.get('insolation')?.setValue(this.index); 
    console.log('hallo')

  }
}
