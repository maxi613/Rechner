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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserInputsComponent,
    ResidentInputsComponent, 
  ],
  imports: [
    MatSelectModule,
    MatChipsModule,
    BrowserModule,
    AppRoutingModule, 
    ReactiveFormsModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
