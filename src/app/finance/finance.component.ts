import { Component , inject} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormserviceService } from '../services/formservice/formservice.service';
import { SuperbaseService } from '../services/supabaseservice/superbase.service';
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
    laufzeit: new FormControl('')
  }); 
  duration: number | null = null;
  private formservice = inject(FormserviceService); 
  private superbase = inject(SuperbaseService); 
  ngOnInit(){
    this.finance = this.formservice.GetFinance; 
  }
  externalFinance(){
    this.finance.get('hasPump')?.value == true ?  this.finance.get('externalFincance')?.setValue(false) : this.finance.get('externalFincance')?.setValue(true);
  }
  submit(){
    this.formservice.SetFinance = this.finance; 
  }

  caculate(){
    
   /* Promise.all([this.formservice.autarkieGrad(), this.formservice.amortisationZeit(), this.formservice.eingenVerbrauchsanteil(), this.formservice.invenstitionsKosten() ]).then(([
      autarkeiGrad,
      armortisationsZeit, 
      eigenverbrauchsanteil, 
      investitionskosten
    ])=>{
      console.log(`Autarkiegrad: ${autarkeiGrad}`); 
      console.log(`armortisationszeit: ${armortisationsZeit}`); 
      console.log(`Eigenverbrauchsanteil: ${eigenverbrauchsanteil}`); 
      console.log(`Investitionskosten: ${investitionskosten}`); 
    }); */
    const startTime = new Date().getTime();
    this.formservice.autarkieGrad().then(value=>{
      console.log(`Autakiegrad: ${value}`); 
      const endTime = new Date().getTime();
      this.duration = endTime - startTime;
      console.log(`Dauer Berechnung: ${this.duration} ms`)
    });
  }

  
}
