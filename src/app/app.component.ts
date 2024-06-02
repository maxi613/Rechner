import { Component, inject, Inject } from '@angular/core';
import { SuperbaseService } from './services/superbase.service';
import { usage } from './shared/models/usage.model';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private superbaseService: SuperbaseService = inject(SuperbaseService); 
  ngOnInit(){
  }

  login(){
    this.superbaseService.signIn().then((resp)=>{
      console.log(`Login: ${resp.data}`)
    }); 
  }

  logout(){
    this.superbaseService.signOut(); 
  }

  async getData(){
    let data = await  this.superbaseService.getUsage();
    console.log(data)
  }
}
