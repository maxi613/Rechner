import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

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

  externalFinance(){
    this.finance.get('hasPump')?.value == true ?  this.finance.get('externalFincance')?.setValue(false) : this.finance.get('externalFincance')?.setValue(true);
  }
  submit(){
    console.log(this.finance);
  }
}
