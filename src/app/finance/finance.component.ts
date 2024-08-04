import { Component , inject} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormserviceService } from '../services/formservice/formservice.service';
@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss'
})
export class FinanceComponent {

  finance: FormGroup = new FormGroup({
    externalFincance: new FormControl(false), 
    zinssatz: new FormControl(''), 
    energyCosts: new FormControl(''),
    vergütung: new FormControl(''), 
    costsPreviosHeating: new FormControl(''),  

  }); 

  private formservice = inject(FormserviceService); 

  ngOnInit(){
    this.finance = this.formservice.GetFinance; 
  }
  externalFinance(){
    this.finance.get('hasPump')?.value == true ?  this.finance.get('externalFincance')?.setValue(false) : this.finance.get('externalFincance')?.setValue(true);
  }
  submit(){
    this.formservice.SetFinance = this.finance; 
  }
}
