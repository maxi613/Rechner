import { Injectable, Signal } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  AuthTokenResponse,
  createClient,
  PostgrestError,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { usage } from '../shared/models/usage.model';
import { SuperbaseEnv, userLogin } from '../shared/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Wärmepumpe } from '../shared/models/heatingpump';
import { energyClass, insolation } from '../shared/models/energyClass';
import { consuptions } from '../shared/models/consupzions';
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

  async getJazHeatingErdkollektor(leistung: number, fbh : boolean | null): Promise<number|null| undefined>{
    let  jazFBHH = await this.superbaseClient
    .from('jaz_sole')
    .select('JAZmitFBHH').gt('Wärmeleistung', leistung).limit(1).single(); 

    let  jazOFBHH = await this.superbaseClient
    .from('jaz_sole')
    .select('JAZohneFBHH').gt('Wärmeleistung', leistung).limit(1).single(); 
    if( jazFBHH.data != null && jazOFBHH.data != null){
      return fbh ? Number( jazFBHH.data.JAZmitFBHH) : Number( jazOFBHH.data.JAZohneFBHH)
    }else{
      console.log(jazFBHH.error)
      console.log(jazOFBHH.error)
      return null;
    }
  }

  async getJazWaterErdkollektor( leistung: number): Promise<number | null>{
    let  jaz = await this.superbaseClient
    .from('jaz_sole')
    .select('JAZmitFBHWW').gt('Wärmeleistung', leistung).limit(1).single();

    if(jaz.data != null){
      return Number(jaz.data.JAZmitFBHWW);
    }else{
      console.log(jaz.error)
      return null;
    }
  }

  async getJazHeatingErdsonde(leistung: number, fbh : boolean | null): Promise<number|null| undefined>{
    let  jazFBHH = await this.superbaseClient
    .from('jaz_sole_sonde')
    .select('JAZmitFBHH').gt('Wärmeleistung', leistung).limit(1).single();

    let  jazOFBHH = await this.superbaseClient
    .from('jaz_sole')
    .select('JAZohneFBHH').gt('Wärmeleistung', leistung).limit(1).single();

    if( jazFBHH.data != null && jazOFBHH.data != null){
      return fbh ? Number( jazFBHH.data.JAZmitFBHH) : Number(jazOFBHH.data.JAZohneFBHH);
    }else{
      console.log(jazFBHH.error); 
      console.log(jazOFBHH.error)
      return null;
    }
  }

  async getJazWaterErdsonde( leistung: number): Promise<number | null>{
    let  jaz = await this.superbaseClient
    .from('jaz_sole_sonde')
    .select('JAZmitFBHWW').gt('Wärmeleistung', leistung).limit(1).single();

    if(jaz.data != null){
      return Number(jaz.data.JAZmitFBHWW);
    }else{
      console.log(jaz.error);
      return null;
    }
  }

  async getJazLuftHeating(leistung: number,energyClass: string, insolation: string, fbh: boolean, hasEnergy: boolean ): Promise<number | null>{
    let Heizgrenztemperatur: number; 

    if(hasEnergy){
      Heizgrenztemperatur = this.getHeizgrenztemperatur(energyClass);
    }else {
      Heizgrenztemperatur = this.getHeizgrenztemperaturByInsolation(insolation); 
    }
    let jazFBHH = await this.superbaseClient.from('jaz_luft').select('JAZFBHH').eq('Heizgrenztemperatur', Heizgrenztemperatur).gt('Wärmeleistung', leistung).limit(1).single(); 
    let jazOhneFBHH = await this.superbaseClient.from('jaz_luft').select('JAZohneFBHH').eq('Heizgrenztemperatur', Heizgrenztemperatur).gt('Wärmeleistung', leistung).limit(1).single();
    if( jazFBHH.data != null && jazOhneFBHH.data != null){
      return fbh ? Number( jazFBHH.data.JAZFBHH ): Number( jazOhneFBHH.data.JAZohneFBHH); 
    }else{
      console.log(jazFBHH.error)
      console.log(jazOhneFBHH.error)
      return null; 
    }
  }

  
  async getJazLuftWater(leistung: number,energyClass: string, insolation: string, hasEnergyClass: boolean): Promise<number | null>{
    let Heizgrenztemperatur: number; 

    if(hasEnergyClass){
      Heizgrenztemperatur = this.getHeizgrenztemperatur(energyClass);
    }else{
      Heizgrenztemperatur = this.getHeizgrenztemperaturByInsolation(insolation);
    } 

    let JAZFBHWW = await this.superbaseClient.from('jaz_luft').select('JAZFBHWW').eq('Heizgrenztemperatur', Heizgrenztemperatur).gt('Wärmeleistung', leistung).limit(1).single();
    if( JAZFBHWW.data != null ){
      return JAZFBHWW.data.JAZFBHWW;
    }else{
      console.log(JAZFBHWW.error); 
      return null; 
    }
  }

  public async getConsuptions():Promise<consuptions[] | null>{
    let reps = await this.superbaseClient.from('Verbraeuche').select<any>('*').returns<consuptions[]>();
    if(reps.error){
      console.log(reps.error)
      return null;
    }else{
      let datas  = reps.data; 
      return datas; 
    }
  }

  public async getPVNutzung(neigung: number, richtung: number): Promise<number| null>{
    let resp = await this.superbaseClient.from('PVNutzung').select('Nutzung').eq('Richtung', richtung).eq('Neigung', neigung).limit(1).single();
    if(resp.error){
      console.log(resp.error)
      return null;
    }else{
      let datas  = Number(resp.data.Nutzung); 
      return datas; 
    }
  }

  public getHeizgrenztemperatur(energyClass: string): number{

    switch(energyClass){
      case "A+":{
        return 10;
      }
      case "A":{
        return 10; 
      }
      case "B":{
        return 10; 
      }
      case "C": {
        return 12; 
      }
      case "D": {
        return 12;
      }
      case "E" :{
        return 12;
      }
      case "F":{
        return 15;
      }
      case "G" :{
        return 15; 
      }
      case "H":{
        return 15;
      } 
      default:{
        return 0;
      }
    }
  }

  public getHeizgrenztemperaturByInsolation(Insolation: string): number{
    switch(Insolation){
      case "KfW-Effizienzhaus 100":{
        return 15;
      }
      case "KfW-Effizienzhaus 85":{
        return 12;
      }
      case "KfW-Effizienzhaus 55":{
        return 12; 
      }
      case "KfW-Effizienzhaus 40+":{
        return 10;
      }
      case "Passivhaus":{
        return 10;
      } default:{
        return 0; 
      }
    
    }
  }
}

