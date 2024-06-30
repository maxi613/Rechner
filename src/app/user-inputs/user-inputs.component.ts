import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-user-inputs',
  templateUrl: './user-inputs.component.html',
  styleUrl: './user-inputs.component.scss'
})
export class UserInputsComponent {
  public hasEnergyclass: boolean = false;
  //floorheating

  Insulations = [
    "KfW-Effizienzhaus 100",
    "KfW-Effizienzhaus 85",
    "KfW-Effizienzhaus 55",
    "KfW-Effizienzhaus 40+",
    "Passivhaus"
  ]

  index: any; 
  house = new FormGroup({
    area: new FormControl('', [Validators.required]), 
    energyHeating: new FormControl('', [Validators.required]),
    energyWater: new FormControl('', [Validators.required]),
    electricCar: new FormControl(false),
    floorHeating: new FormControl(false), 
    insolation: new FormControl(''), 
    kilometersCar: new FormControl()
  })

  submit(){
    console.log(this.house); 
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
