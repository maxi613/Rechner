import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  AuthTokenResponse,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { usage } from '../shared/models/usage.model';
import { SuperbaseEnv, userLogin } from '../shared/environment';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SuperbaseService {
  private superbaseClient: SupabaseClient; 
  private _currentUser: BehaviorSubject<boolean|User| any> = new BehaviorSubject(null);  

  constructor() {
    this.superbaseClient = createClient(SuperbaseEnv.url, SuperbaseEnv.key); 

    this.superbaseClient.auth.getUser().then((user)=>{
      if(user.data){
        this._currentUser.next(user.data.user)
      }else{
        this._currentUser.next(false)
      }

    }); 


    this.superbaseClient.auth.onAuthStateChange((event, session)=>{
      if(event == 'SIGNED_IN'){
        console.log(`User: ${session?.user.email} signed in`); 
        this._currentUser.next(session?.user)
      }{
        this._currentUser.next(false)
      }

      if(event == 'SIGNED_OUT'){
        console.log(`User: ${session?.user.email} signed out`); 
        this._currentUser.next(false)
      }

      if(event == 'INITIAL_SESSION'){
        console.log(`Session: ${session} initialed`); 
      }
    }); 
  }

  get currentUser(){
    return this._currentUser.asObservable(); 
  }

  async getUsage(){

    const { data, error } = await this.superbaseClient
    .from('Verbräuche')
    .select('*')

    return { data, error }
  }

  public getUser() {
    return this.superbaseClient.auth.getUser()
  }

  public signIn(): Promise<AuthTokenResponse>{
    return this.superbaseClient.auth.signInWithPassword({
      email: userLogin.email, 
      password: userLogin.pw
    }); 

  }

  public signOut(){
    return this.superbaseClient.auth.signOut(); 
  }

}
