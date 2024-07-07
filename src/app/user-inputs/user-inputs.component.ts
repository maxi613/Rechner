import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormserviceService } from '../services/formservice/formservice.service';
@Component({
  selector: 'app-user-inputs',
  templateUrl: './user-inputs.component.html',
  styleUrl: './user-inputs.component.scss'
})
export class UserInputsComponent {
  public hasEnergyclass: boolean = false;
  
  private formservice = inject(FormserviceService); 

  ngOnInit(){
  }
  Insulations = [
    "KfW-Effizienzhaus 100",
    "KfW-Effizienzhaus 85",
    "KfW-Effizienzhaus 55",
    "KfW-Effizienzhaus 40+",
    "Passivhaus"
  ]

  index: any; 
  house: FormGroup  = new FormGroup({
    area: new FormControl(0, [Validators.required]), 
    energyHeating: new FormControl(0, [Validators.required]),
    energyWater: new FormControl(0, [Validators.required]),
    electricCar: new FormControl(false),
    floorHeating: new FormControl(false), 
    insolation: new FormControl(0), 
    kilometersCar: new FormControl(0)
  })

  submit(){
    console.log(this.house.value); 

  }

  checkEnergyclass(){
    if(!this.hasEnergyclass){
      this.hasEnergyclass=true; 
    }else{
      this.hasEnergyclass= false; 
    }
  }

  insolationSelected(){
    this.house.get('insolation')?.setValue(this.index); 
    console.log('hallo')

  }
}
