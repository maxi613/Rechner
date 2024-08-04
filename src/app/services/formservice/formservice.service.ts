import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators
 } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormserviceService {

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

    this.energyClasses.set('KfW-Effizienzhaus 100', 40); 
    this.energyClasses.set('KfW-Effizienzhaus 85', 35); 
    this.energyClasses.set('KfW-Effizienzhaus 55', 30);
    this.energyClasses.set('KfW-Effizienzhaus 40+',25); 
    this.energyClasses.set('Passivhaus', 15); 
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

  private GesamtEnergiebedarf(): number{
    return this.WasserEnergiebeadarf() + this.Heizenergiebeadarf(); 
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
        let child = this._residents.controls['numberOfKids'].value  ?? 0 * WasserenergieKindBaden;
        let parents = this._residents.controls['numberOfPersons'].value ?? 0 * WasserenergieErwachsenBaden;
        return child + parents;
      }else{
        let child = this._residents.controls['numberOfKids'].value  ?? 0 * WasserenergieKind;
        let parents = this._residents.controls['numberOfPersons'].value ?? 0 * WasserenergieErwachsen;
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
