import { Injectable, inject } from '@angular/core';
import { FormGroup, FormControl, Validators
 } from '@angular/forms';
import { SuperbaseService } from '../superbase.service';
import { Wärmepumpe } from '../../shared/models/heatingpump';

@Injectable({
  providedIn: 'root'
})
export class FormserviceService {
  supabaseService = inject(SuperbaseService);
  energyClasses = new Map();


  private _house: FormGroup  = new FormGroup({
    area: new FormControl(0, [Validators.required]), 
    energyHeating: new FormControl(0, [Validators.required]),
    energyWater: new FormControl(0, [Validators.required]),
    hasEnergyId: new FormControl(false),
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

  public getJaz(){
    if(!this._heatingPump.controls['hasPump'].value){
      let pump:string = this._heatingPump.controls['version'].value ?? '';
      this.supabaseService.getJazHeating(Wärmepumpe['Sole-Wasser mit Erdkollektor'], this.LeistungsgrößeWärmepumpe(), true);
    }
  }

  private LeistungsgrößeWärmepumpe(): number{
    return (this.WasserEnergiebeadarf() + this.Heizenergiebeadarf())/2100; 
  }

  private WasserEnergiebeadarf(): number{
    if(this._house.controls['hasEnergyId'].value){
      return this._house.controls['energyWater'].value; 
    }else{
      let WasserenergieErwachsen:number = 711.14;
      let WasserenergieKind: number = 355.57;
      let WasserenergieErwachsenBaden: number = 1418.03;
      let WasserenergieKindBaden: number = 709.01;

      if(this._residents.controls['isBathing'].value){
        let child; 
        let parents; 
        if(this._residents.controls['numberOfKids'].value != null){
          child = this._residents.controls['numberOfKids'].value * WasserenergieKindBaden;
        }else{
          child =0; 
        }
        if(this._residents.controls['numberOfPersons'].value != null){
          parents = this._residents.controls['numberOfPersons'].value * WasserenergieErwachsenBaden;
        }else{
          parents =0; 
        }
        console.log(`Mit Baden Kind: ${child}`); 
        console.log(`Mit Baden Erwachsen: ${parents}`); 
        
        return child + parents;
      }else{
        let child = this._residents.controls['numberOfKids'].value  ?? 0 * WasserenergieKind;
        let parents = this._residents.controls['numberOfPersons'].value ?? 0 * WasserenergieErwachsen;
        console.log(`Ohne Baden Kind: ${child}`); 
        console.log(`Ohne Baden Erwachsen: ${parents}`); 
        return child + parents;
      }
    }
  }

  private Heizenergiebeadarf():number{
    if(this._house.controls['hasEnergyId'].value){
      return this._house.controls['energyHeating'].value; 
    }else{
      let spezHeizlast = this.energyClasses.get(this._house.controls['insolation'].value); 
      return this._house.controls['area'].value *  spezHeizlast;
    }
  }
}
