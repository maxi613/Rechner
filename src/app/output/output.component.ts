import { Component, inject } from '@angular/core';
import { FormserviceService } from '../services/formservice/formservice.service';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrl: './output.component.scss'
})
export class OutputComponent {

  formservice = inject(FormserviceService);

  autakie: number = 0; 
  investition: number =0; 
  eigenverbrauch: number = 0; 
  amortisation: number = 0; 
  netzbezug: number = 0;
  netzeinspeißung: number = 0;
  public graph = {
    data: [{
      values: [0, 0 ],
      labels: ['Autarkie', 'Netzbezug'],
      type: 'pie'
    }
    ],
    layout: {width: 500, height: 365, title: 'Autarkiegrad', paper_bgcolor: "rgba(0,0,0,0)", //background color of the chart container space
      plot_bgcolor: "#ffff",
        font: {
        color: 'white'
    }}
};

public graph2 = {
  data: [{
    values: [0, 0 ],
    marker: {
      colors: [
        '#83e05e',
        'rgb(255, 60, 0)',
      ]
    },
    labels: ['Eigenverbrauch', 'Netzeinspeisung'],
    type: 'pie'
  }
  ],
  layout: {width: 500, height: 365, title: 'Eigenverbrauchsanteil', paper_bgcolor: "rgba(0,0,0,0)", //background color of the chart container space
    plot_bgcolor: "#ffff",
      font: {
      color: 'white'
  }}
};


  calculate(){
   /* try{
      Promise.all([this.formservice.autarkieGrad() ]).then(([
        autarkeiGrad,

      ])=>{
        console.log(`Autarkiegrad: ${autarkeiGrad}`); 
        this.graph.data[0].values= [ autarkeiGrad,1-autarkeiGrad]; 
      });
    }catch(e ){
      console.log(e);
      console.log("catch");
    }*/

    Promise.all([this.formservice.autarkieGrad(),  this.formservice.invenstitionsKosten()]).then(([
      autarkeiGrad, // 0 autakiegrad 1 eigenverbrauchsanteil
      investitionskosten, //0 investionskosten 1 armotitsationszeit
    ])=>{
      this.graph.data[0].values= [ autarkeiGrad[0],1-autarkeiGrad[0]]; 
      console.log(`Eigenverbrauchsanteil: ${autarkeiGrad[1]}`); 
      console.log(`Investitionskosten: ${investitionskosten}`); 
      console.log(`Armotisationszeit: ${investitionskosten[1]}`); 
      this.graph2.data[0].values= [ autarkeiGrad[1],1-autarkeiGrad[1]]; 
      console.log(`Autarkiegrad: ${autarkeiGrad}`); 
      
      this.investition = Math.round( investitionskosten[0]*100)/100; 
      this.amortisation = Math.round( investitionskosten[1]*100)/100; 
    });
  }

}
