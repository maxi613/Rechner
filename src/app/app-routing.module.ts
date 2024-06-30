import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResidentInputsComponent } from './resident-inputs/resident-inputs.component';
import { UserInputsComponent } from './user-inputs/user-inputs.component';

const routes: Routes = [
  {path: 'ResidentInputs', component: ResidentInputsComponent},
  {path: 'HomeInputs', component: UserInputsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
