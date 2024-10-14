import { Injectable, inject } from '@angular/core';
import { FormGroup, FormControl, Validators
 } from '@angular/forms';
import { SuperbaseService } from '../superbase.service';
import { Wärmepumpe } from '../../shared/models/heatingpump';
import { energyClass, insolation } from '../../shared/models/energyClass';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class FormserviceService {
  supabaseService = inject(SuperbaseService);
  energyClasses = new Map();


  
  private readonly WATER_ENERGY_ADULT: number = 711.14;
  private readonly WATER_ENERGY_CHILD: number = 355.57;
  private readonly WATER_ENERGY_ADULT_BATHING: number = 1418.03;
  private readonly WATER_ENERGY_CHILD_BATHING: number = 709.01;


  private _house: FormGroup  = new FormGroup({
    area: new FormControl(0, [Validators.required]), 
    energyHeating: new FormControl(0, [Validators.required]),
    energyWater: new FormControl(0, [Validators.required]),
    hasEnergyId: new FormControl(false),
    energyClass: new FormControl(''),
    electricCar: new FormControl(false),
    floorHeating: new FormControl(false), 
    insolation: new FormControl(0), 
    kilometersCar: new FormControl(0)
  })

  constructor(){
    this.energyClasses.set('KfW-Effizienzhaus 100', 40*2.1); 
    this.energyClasses.set('KfW-Effizienzhaus 85', 35*2.1); 
    this.energyClasses.set('KfW-Effizienzhaus 55', 30*2.1);
    this.energyClasses.set('KfW-Effizienzhaus 40+',25*2.1); 
    this.energyClasses.set('Passivhaus', 15*2.1); 
  }
  
  _finance: FormGroup = new FormGroup({
    externalFincance: new FormControl(false), 
    zinssatz: new FormControl(''), 
    energyCosts: new FormControl(''),
    vergütung: new FormControl(''), 
    costsPreviosHeating: new FormControl(''),  

  }); 

  _heatingPump = new FormGroup({
    hasPump: new FormControl(false),
    performance: new FormControl(''), 
    costs: new FormControl(''),
    wantedType: new FormControl(''),
    power: new FormControl(''),
    version: new FormControl('')
  });

  _residents = new FormGroup({
    numberOfPersons: new FormControl(0, [Validators.required]), 
    numberOfKids: new FormControl(0, [Validators.required]),
    isBathing: new FormControl(false, [Validators.required]),
  }); 

  _pvControl = new FormGroup({
    hasPV : new FormControl(false), 
    powerOfPV: new FormControl(''),
    costsOfPv: new FormControl(''),
    directionOfHouse: new FormControl('', ), 
    angleOfRoof: new FormControl('', ), 
    hasBattery: new FormControl(false, ),
    capacityBattery: new FormControl('',),
    costsBattery : new FormControl('', ), 
    wantsBattery: new FormControl(false, )
  });

  public set SetHouse(houseParams: FormGroup){
    console.log(this._house);
    this._house = houseParams; 
  }
  public get Gethouse(): FormGroup{
    return this._house; 
  }

  public set SetFinance(financeParams: FormGroup){
    this._finance = financeParams; 
  }

  public get GetFinance(): FormGroup{
    return this._finance; 
  }

  public set SetHeatingpump(heatingpumpParams: FormGroup){
    this._heatingPump = heatingpumpParams; 
  }

  public get GetHeatingpump(): FormGroup{
    return this._heatingPump; 
  }

  public get GetResidents(): FormGroup{
    return this._residents;
  }

  public set SetResidents(ResidentsParams: FormGroup){
    this._residents = ResidentsParams; 
  }

  public get GetPV(): FormGroup{
    return this._pvControl; 
  }

  public set SetPv(PvParams: FormGroup){
    this._pvControl = PvParams;
  }

  public async getJazHeating():Promise< number | null | undefined>{
    if(!this._heatingPump.controls['hasPump'].value){
      let pump = this._heatingPump.controls['version'].value ?? '';

      if (pump == Wärmepumpe.SoleWassermitErdkollektor){
        return await this.supabaseService.getJazHeatingErdkollektor(this.LeistungsgrößeWärmepumpe(), this._house.controls['floorHeating'].value).then(value=>{
          return value;
        });

      }

      if (pump == Wärmepumpe.SoleWassermitErdsonde){
        return await this.supabaseService.getJazHeatingErdsonde(this.LeistungsgrößeWärmepumpe(), this._house.controls['floorHeating'].value).then(value=>{
          return value
        });

      }

      if (pump == Wärmepumpe.LuftWasser){
        let _insolation:string  = this._house.controls['insolation'].value; 
        let _energyClass:string  = this._house.controls['energyClass'].value; 
        let hasEnergyClass = this._house.controls['hasEnergyId'].value;
        return await this.supabaseService.getJazLuftHeating(this.LeistungsgrößeWärmepumpe(),_energyClass?.valueOf(),_insolation, this._house.controls['floorHeating'].value, hasEnergyClass).then(value=>{
          return value;
        });
        
      }else{
        return 0;
      }
    }else{
      return 0;
    }
  }

  public async  getJazWater(): Promise< number | null | undefined>{
    if(!this._heatingPump.controls['hasPump'].value){
      let pump = this._heatingPump.controls['version'].value ?? '';

      if (pump == Wärmepumpe.SoleWassermitErdkollektor){
        return await this.supabaseService.getJazWaterErdkollektor(this.LeistungsgrößeWärmepumpe()).then(value=>{
          return value 
        });
      }
      
      if (pump == Wärmepumpe.SoleWassermitErdsonde){

        return await this.supabaseService.getJazWaterErdsonde(this.LeistungsgrößeWärmepumpe()).then(value=>{
          return value 
        });
      }

      if (pump == Wärmepumpe.LuftWasser){
        let _insolation:string  = this._house.controls['insolation'].value; 
        let _energyClass = this._house.controls['energyClass'].value; 
        let hasEnergyClass = this._house.controls['hasEnergyId'].value;
        
        return await this.supabaseService.getJazLuftWater(this.LeistungsgrößeWärmepumpe(),_energyClass, _insolation, hasEnergyClass).then(value=>{
          return value; 
        });
        
      }else{
        return 0;
      }
    }else{
      return 0;
    }
  }

  private LeistungsgrößeWärmepumpe(): number{ 
    return (this.WasserEnergiebeadarf() + this.Heizenergiebeadarf())/2100; 
  }

  public StromverbrauchWasser(): Promise<number | void | null>{
    if(this._heatingPump.controls['hasPump'].value){
      let stromverbrauch:number =  this.WasserEnergiebeadarf()/ Number(this._heatingPump.controls['performance'].value?.replace(',','.')); 

      return new Promise((resolve) => {
        resolve(stromverbrauch);
      });

    }else{
      let jazWater: number | null | undefined;

      return this.getJazWater().then(value => {
        jazWater = value
      
        // Überprüfe, ob die Werte gültig sind (nicht 0 oder undefined)
        if (jazWater) {
          let verbrauch = this.WasserEnergiebeadarf() /  Number(jazWater.valueOf())
          return verbrauch;
        } else {
          console.error("Ungültige Werte für jazWater oder jazHeating.");
          return null;
        }
      }).catch(error => {
        console.error("Fehler beim Abrufen der Werte: ", error);
      });
      
    }
  }

  public StromverbrauchHeizen(): Promise<number | void | null>{
    if(this._heatingPump.controls['hasPump'].value){
      let stromverbrauch:number =  this.Heizenergiebeadarf()/ Number(this._heatingPump.controls['performance'].value?.replace(',','.')); 

      return new Promise((resolve) => {
        resolve(stromverbrauch);
      });

    }else{
      let jazHeating: number | null | undefined;

      return this.getJazHeating().then(value => {
        jazHeating = value
      
        // Überprüfe, ob die Werte gültig sind (nicht 0 oder undefined)
        if (jazHeating) {
          let verbrauch = this.Heizenergiebeadarf() /  Number(jazHeating.valueOf())
          return verbrauch;
        } else {
          console.error("Ungültige Werte für jazWater oder jazHeating.");
          return null;
        }
      }).catch(error => {
        console.error("Fehler beim Abrufen der Werte: ", error);
      });
      
    }
  }

  public Stromverbrauch():number{
    let numberOfPersons: number  = this._residents.controls['numberOfPersons'].value || 0; 
    let numberOfKids: number = this._residents.controls['numberOfKids'].value || 0;

    return numberOfPersons*1234+numberOfKids*617;
  }

  public stromverbrauchEfahrzeug():number{
    let kilometer:number =Number(String( this._house.controls['kilometersCar'].value).replace(',','.')); 
    console.log(kilometer*0.15); 
    return kilometer * 0.15;
  }

  private WasserEnergiebeadarf(): number {
    if (this._house.controls['hasEnergyId'].value) {
      return Number( this._house.controls['energyWater'].value);
    } else {
      const isBathing = this._residents.controls['isBathing'].value;
      const numberOfKids = this._residents.controls['numberOfKids'].value || 0;
      const numberOfAdults = this._residents.controls['numberOfPersons'].value || 0;

      const childEnergy = numberOfKids * (isBathing ? this.WATER_ENERGY_CHILD_BATHING : this.WATER_ENERGY_CHILD);
      const adultEnergy = numberOfAdults * (isBathing ? this.WATER_ENERGY_ADULT_BATHING : this.WATER_ENERGY_ADULT);

      return childEnergy + adultEnergy;
    }
  }


  private Heizenergiebeadarf():number{
    if(this._house.controls['hasEnergyId'].value){
      return Number( this._house.controls['energyHeating'].value); 
    }else{
      let spezHeizlast = this.energyClasses.get(this._house.controls['insolation'].value); 
      return Number( this._house.controls['area'].value *  spezHeizlast);
    }
  }

  public async calculateConsuption(){
   let consuptions:PostgrestSingleResponse<any> = await  this.supabaseService.getConsuption();
    return consuptions.data; 
   console.log(consuptions.data); 
  }

  private getHeizgrenztemperatur(energyClass: string): number{

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
}
