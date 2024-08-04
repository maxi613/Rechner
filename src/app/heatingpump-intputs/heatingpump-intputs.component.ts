import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormserviceService } from '../services/formservice/formservice.service';
@Component({
  selector: 'app-heatingpump-intputs',
  templateUrl: './heatingpump-intputs.component.html',
  styleUrl: './heatingpump-intputs.component.scss'
})
export class HeatingpumpIntputsComponent {
  heatingPump = new FormGroup({
    hasPump: new FormControl(false),
    performance: new FormControl(''), 
    costs: new FormControl(''),
    wantedType: new FormControl(''),
    power: new FormControl(''),
    version: new FormControl('')
  });

  private formservice = inject(FormserviceService); 

  ngOnInit(){
    this.heatingPump = this.formservice.GetHeatingpump; 
  }
  heatingPumpts:string[] = [
    'Luft-Wasser',
    'Sole-Wasser mit Erdkollektor', 
    'Sole-Wasser mit Erdsonde'
  ]
  submit(){
    this.formservice.SetHeatingpump = this.heatingPump; 
  }

  hasPump(){
    this.heatingPump.get('hasPump')?.value == true ?  this.heatingPump.get('hasPump')?.setValue(false) : this.heatingPump.get('hasPump')?.setValue(true);
  }
}
