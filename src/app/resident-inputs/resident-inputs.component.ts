import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resident-inputs',
  templateUrl: './resident-inputs.component.html',
  styleUrl: './resident-inputs.component.scss'
})
export class ResidentInputsComponent {

  residents = new FormGroup({
    numberOfPersons: new FormControl('', [Validators.required]), 
    numberOfKids: new FormControl('', [Validators.required]),
    isBathing: new FormControl(false, [Validators.required]),
  })

  submit(){
    console.log(this.residents); 
  }
}
