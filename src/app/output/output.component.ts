import { Component } from '@angular/core';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrl: './output.component.scss'
})
export class OutputComponent {
  public graph = {
    data: [{
      values: [1, 0.22 ],
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
    values: [0.35, 1 ],
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
}
