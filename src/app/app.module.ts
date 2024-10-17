import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import {ReactiveFormsModule} from '@angular/forms';
import { UserInputsComponent } from './user-inputs/user-inputs.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import {MatChipsModule} from '@angular/material/chips';
import {MatSelectModule} from '@angular/material/select';
import { ResidentInputsComponent } from './resident-inputs/resident-inputs.component';
import { PvInputsComponent } from './pv-inputs/pv-inputs.component';
import { HeatingpumpIntputsComponent } from './heatingpump-intputs/heatingpump-intputs.component';
import { FinanceComponent } from './finance/finance.component';
import { OutputComponent } from './output/output.component';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserInputsComponent,
    ResidentInputsComponent,
    PvInputsComponent,
    HeatingpumpIntputsComponent,
    FinanceComponent,
    OutputComponent
  ],
  imports: [
    MatSelectModule,
    MatChipsModule,
    BrowserModule,
    AppRoutingModule, 
    ReactiveFormsModule, 
    PlotlyModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
