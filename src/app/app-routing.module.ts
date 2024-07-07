import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResidentInputsComponent } from './resident-inputs/resident-inputs.component';
import { UserInputsComponent } from './user-inputs/user-inputs.component';
import { PvInputsComponent } from './pv-inputs/pv-inputs.component';
import { HeatingpumpIntputsComponent } from './heatingpump-intputs/heatingpump-intputs.component';
import { FinanceComponent } from './finance/finance.component';

const routes: Routes = [
  {path: 'ResidentInputs', component: ResidentInputsComponent},
  {path: 'HomeInputs', component: UserInputsComponent},
  {path: 'PVInputs', component: PvInputsComponent },
  {path: 'HeatingpumpIntputs', component: HeatingpumpIntputsComponent},
  {path: 'FinanceInputs', component: FinanceComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
