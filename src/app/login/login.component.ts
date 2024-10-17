import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SuperbaseService } from '../services/supabaseservice/superbase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  login = new FormGroup({
    mail :new FormControl('', [Validators.required]),
    pw :new FormControl('',[Validators.required])
  });

  private superbaseService: SuperbaseService = inject(SuperbaseService); 

  submit(){
    this.superbaseService.signIn(this.login.value.mail, this.login.value.pw);
  }

  getData(){
    this.superbaseService.getUsage(); 
  }
  
}
