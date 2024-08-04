import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormserviceService } from '../services/formservice/formservice.service';

@Component({
  selector: 'app-resident-inputs',
  templateUrl: './resident-inputs.component.html',
  styleUrl: './resident-inputs.component.scss'
})
export class ResidentInputsComponent {

  residents = new FormGroup({
    numberOfPersons: new FormControl(0, [Validators.required]), 
    numberOfKids: new FormControl(0, [Validators.required]),
    isBathing: new FormControl(false, [Validators.required]),
  })

  private formservice = inject(FormserviceService); 

  ngOnInit(){
    this.residents  = this.formservice.GetResidents; 
  }

  submit(){
    this.formservice.SetResidents = this.residents; 
  }
}
