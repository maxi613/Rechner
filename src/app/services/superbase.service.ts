import { Injectable, Signal } from '@angular/core';
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
import { BehaviorSubject, Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SuperbaseService {
  private superbaseClient: SupabaseClient; 
  private _currentUser: Subject<User | boolean> = new Subject();  
  private _session: BehaviorSubject<AuthSession| null | any> = new BehaviorSubject(null);
  
  constructor() {
    this.superbaseClient = createClient(SuperbaseEnv.url, SuperbaseEnv.key); 

    this.superbaseClient.auth.getUser().then((user)=>{
      if(user.data.user != null){
        this._currentUser.next(user.data.user)
      }else{
        this._currentUser.next(false)
      }

    }); 

    this.superbaseClient.auth.onAuthStateChange((event, session)=>{

      this._session.next(session);

      if(event == 'SIGNED_IN' && session?.user != undefined){
   
        this._currentUser.next(session?.user)
      }

      if(event == 'SIGNED_OUT'){
        this._currentUser.next(false)
        console.log("loged out"); 
      }
    }); 
  }

  get currentUser(): Observable<User | boolean>{
    return this._currentUser.asObservable(); 
  }
  get currentSession(): Observable<AuthSession>{
    return this._session.asObservable(); 
  }

  async getUsage(){

    const { data, error } = await this.superbaseClient
    .from('Verbräuche')
    .select('*')

    return { data, error }
  }

  public signIn(email: string|null | undefined, pw: string|null | undefined,): Promise<AuthTokenResponse>| null{
    if(email != null && email != undefined && pw != null && pw != undefined){
      return this.superbaseClient.auth.signInWithPassword({
        email: email,
        password: pw
      }); 
    }else{
      return null;
    }

  }

  public signOut(){
    return this.superbaseClient.auth.signOut(); 
  }

}
