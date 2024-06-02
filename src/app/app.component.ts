import { Component, inject, Inject } from '@angular/core';
import { SuperbaseService } from './services/superbase.service';
import { usage } from './shared/models/usage.model';
import { LoginComponent } from './login/login.component';
import { AuthSession, User } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private superbaseService: SuperbaseService = inject(SuperbaseService); 
  _user! : User | boolean; 
  islogouted! : boolean; 
  ngOnInit(){
    
    this.superbaseService.currentUser.subscribe((user: User | boolean)=>{
      if(  typeof user !=  "boolean"){
        this._user = user; 
        this.islogouted = false;
      }else{
        this._user = user;
        this.islogouted = true; 
      }
    })
  }


  logout(){
    this.superbaseService.signOut(); 
  }

}
