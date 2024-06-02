import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SuperbaseService } from '../services/superbase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  login = new FormGroup({
    mail :new FormControl(''),
    pw :new FormControl('')
  });

  private superbaseService: SuperbaseService = inject(SuperbaseService); 

  submit(){
    this.superbaseService.signIn(this.login.value.mail, this.login.value.pw);
  }
}
