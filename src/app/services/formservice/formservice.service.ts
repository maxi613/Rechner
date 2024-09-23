import { Injectable, inject } from '@angular/core';
import { FormGroup, FormControl, Validators
 } from '@angular/forms';
import { SuperbaseService } from '../supabaseservice/superbase.service';
import { Wärmepumpe } from '../../shared/models/heatingpump';
import { energyClass, insolation } from '../../shared/models/energyClass';
import { consuptions, IStromertrag, totalConsuptions } from '../../shared/models/consuptions';
import { bezugProMonat, überProduktionProMonat } from '../../shared/models/nutzungsaufteilung';
import { BatterKapazität, BezugProMonat, Einspeißung618, SpeicherNutzungMax, SpeicherNutzungNormal, SpeicherUngenutzt } from '../../shared/models/batterie';

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
  private _consuptions: consuptions[] | null ; 
  private _pvNutzung: number;

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
  private _stromverbrauchHeizen: number;
  _stromverbrauchWasser: number;
  private _stromertragProMonat: IStromertrag[];
  private _aufteilung: import("c:/Users/wiega/OneDrive/Dokumente/Programming/MasterProject/Rechner/src/app/shared/models/nutzungsaufteilung").nutzungsAufteilung | null;
  private _überproduktion618: überProduktionProMonat[];
  private _speicherNutzungMax: SpeicherNutzungMax[];
  private _speicherUngenutzt: SpeicherUngenutzt[];
  private _speicherNormal: SpeicherNutzungNormal[];
  private _stromertrag: IStromertrag[];

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
    laufzeit: new FormControl('')
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

  private async getJazHeating():Promise< number | null | undefined>{
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

  private async  getJazWater(): Promise< number | null | undefined>{
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

  private StromverbrauchWasser(): Promise<number | void | null>{
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

  private StromverbrauchHeizen(): Promise<number | void | null>{
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

  private Stromverbrauch():number{
    let numberOfPersons: number  = this._residents.controls['numberOfPersons'].value || 0; 
    let numberOfKids: number = this._residents.controls['numberOfKids'].value || 0;

    return numberOfPersons*1234+numberOfKids*617;
  }

  private stromverbrauchEfahrzeug():number{
    let kilometer:number =Number(String( this._house.controls['kilometersCar'].value).replace(',','.')); 
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

  private async caculateConsuptions(): Promise<totalConsuptions[]>{
    this._consuptions = await this.supabaseService.getConsuptions();
    let totalConsonsuptions: totalConsuptions[]= []; 
    this._stromverbrauchHeizen = await this.StromverbrauchHeizen() || 0;
    this._stromverbrauchWasser  = await this.StromverbrauchWasser() || 0;
    let stromVerbrauch =  this.Stromverbrauch(); 
    let verbraucheauto = this.stromverbrauchEfahrzeug(); 
    if(this._consuptions != null){
      for (const value  of this._consuptions){
        let verbrauchStrom = value.Strom *  stromVerbrauch;
        let verbrauchEfahrzeug = value.EFahrzeug * verbraucheauto;
        let verbrauchWärme10 = value.Waerme9 * this._stromverbrauchHeizen; 
        let verbrauchWärme12 = value.Waerme12 * this._stromverbrauchHeizen; 
        let verbrauchWärme15 = value.Waerme15 * this._stromverbrauchHeizen; 
        let verbrauchWasser = value.Warmwasser * this._stromverbrauchWasser; 
  
        let verbrauchGesamt =0;
        let Heizgrenztemperatur: number = 0; 

        if(this._house.controls['hasEnergyId'].value){
          Heizgrenztemperatur = this.supabaseService.getHeizgrenztemperatur(this._house.controls['energyClass'].value);
        }else{
          Heizgrenztemperatur = this.supabaseService.getHeizgrenztemperaturByInsolation(this._house.controls['insolation'].value);
        }

        switch(Heizgrenztemperatur){
          case 10:{
            verbrauchGesamt =  verbrauchStrom + verbrauchEfahrzeug + verbrauchWärme10 + verbrauchWasser; 
            break;
          }
          case 12:{
            verbrauchGesamt =  verbrauchStrom + verbrauchEfahrzeug + verbrauchWärme12 + verbrauchWasser; 
            break;
          }
          case 15:{
            verbrauchGesamt = verbrauchStrom + verbrauchEfahrzeug + verbrauchWärme15 + verbrauchWasser; 
            break;
          }default:{

            verbrauchGesamt = 0; 
          }
        };
        totalConsonsuptions.push({
          monat: value.Monat, 
          consuptions: verbrauchGesamt
        });
      }
      return totalConsonsuptions;
    }else{
      console.log('consuption undefined')
      totalConsonsuptions.push({
        monat: 'null', 
        consuptions: 0
      });

      return totalConsonsuptions; 
    }
  
  }
  
  public async PVErtrag(): Promise< number>{
    let richtung: number = Number( this._pvControl.controls['directionOfHouse'].value?.replace(',', '.') )|| 0; 
    let neigung: number = Number( this._pvControl.controls['angleOfRoof'].value?.replace(',', '.')) ||0 ; 
    let powerPv: number = Number ( this._pvControl.controls['powerOfPV'].value) || 0
    this._pvNutzung = await this.supabaseService.getPVNutzung(neigung, richtung) || 0 ; 

    const solarEinstrahlleistung: number = 1212.17; 
    if(this._pvControl.controls['hasPV'].value){
      let ertrag = this._pvNutzung/100 * solarEinstrahlleistung * powerPv; 
      console.log(`PV Ertrag: ${ertrag}`); 
      return ertrag;
    }else{
      let verbrauchProJahr = await this.caculateConsuptions(); 
      let verbrauchJahr: number = 0; 

      verbrauchProJahr.forEach((verbrauch: totalConsuptions)=>{
        verbrauchJahr += verbrauch.consuptions; 
      }); 

      let ertrag = this._pvNutzung/100 * solarEinstrahlleistung * verbrauchJahr * 0.001; 
      
      return ertrag; 
    }
  }

  private async PVPerformance(): Promise< number>{

    let powerPv: number = Number ( this._pvControl.controls['powerOfPV'].value) || 0

    if(this._pvControl.controls['hasPV'].value){
      console.log(`PV performance: ${powerPv}`); 
      return powerPv;
    }else{
      let verbrauchProJahr = await this.caculateConsuptions();
      let verbrauchJahr: number = 0; 
      verbrauchProJahr.forEach((verbrauch: totalConsuptions)=>{
        verbrauchJahr = verbrauchJahr + verbrauch.consuptions; 
      }); 
      console.log(`PV performance: ${verbrauchJahr*0.001 }`); 
      return verbrauchJahr*0.001; 
    }
  }

  private async StromertragProMonat():Promise< IStromertrag[]>{
    this._consuptions = await this.supabaseService.getConsuptions(); //Liste von verbräuchen pro monat
    let stromertragProMonat: IStromertrag[] =[];
    let pvErtrag = await this.PVErtrag();

    if(!this._consuptions){
      throw new Error('Consuptions null')
    }
      
    for( const consuption of this._consuptions) {
      let ertragStrom:number = pvErtrag * consuption.Stromertrag;
      console.log(`davor: ${ertragStrom}`)// es hat ein wert
      let stromertrag: IStromertrag = {
        monat: consuption.Monat, 
        ertrag: ertragStrom
      }
      
      console.log(stromertrag)
      stromertragProMonat.push(stromertrag);
      console.log(`danach: ${ertragStrom}`)// es hat ein wert
      console.log(stromertrag)
    }
    console.log(stromertragProMonat);
      
    console.log(`Stromertrag pro monat:`); 
    console.log(stromertragProMonat); //stromertragProMonat.ertrag = 0 ... 
    return stromertragProMonat;
  }

  private async überProduktion(zeitraum: string,):Promise< überProduktionProMonat[]>{
    
    let resp = this._consuptions
    let aufteilung = await this.supabaseService.getNutzungsAufteilung(zeitraum); 
    let überProduktionProMonat: überProduktionProMonat[] = []
    let stromverbrauchHeizen = this._stromverbrauchHeizen
    let stromverbrauchWasser = this._stromverbrauchWasser
    if (!resp || !aufteilung) {
      console.error('Fehler: Fehlende Daten');
      return [];
    }
    if(resp && aufteilung){
      for (let [index, ertrag] of this._stromertrag.entries()){
          let verbrauchStrom = resp[index].Strom *  this.Stromverbrauch(); 
          let verbrauchEfahrzeug = resp[index].EFahrzeug * this.stromverbrauchEfahrzeug();
          if(zeitraum == '18-6'){
            ertrag.ertrag = 0; 
          }
          let überProduktion:number = ertrag.ertrag - (verbrauchStrom* aufteilung.Strom) -  (stromverbrauchWasser*aufteilung.Wasser) - (stromverbrauchHeizen*aufteilung.Waerme)- (verbrauchEfahrzeug*aufteilung.LadenEfahrzeug); 
          if(überProduktion >0){
            überProduktionProMonat.push({
              value: überProduktion, 
              monat: ertrag.monat
            }); 
          }else{
            überProduktionProMonat.push({
              value: 0, 
              monat: ertrag.monat
            }); 
          }
      }
    }
    console.log(`Überproduktion pro monat:`); 
    console.log(überProduktionProMonat);
    return überProduktionProMonat; 
  }

  private async bezug618(){
    let überproduktion = this._überproduktion618;
    let bezugProMonat: bezugProMonat[] = []
    überproduktion.forEach((value)=>{
      if(value.value <=0 ){
        bezugProMonat.push({
          monat: value.monat, 
          value: value.value
        })
      }else{
        bezugProMonat.push({
          monat: value.monat, 
          value: 0
        })
      }
    }) 
    console.log(`Bezug 6-18 pro monat:`); 
    console.log(bezugProMonat);
    return bezugProMonat;
  }

  private async bezug186(){
    let überproduktion = await this.überProduktion('18-6'); 
    let bezugProMonat: bezugProMonat[] = []
    überproduktion.forEach((value)=>{
      if(value.value <=0 ){
        bezugProMonat.push({
          monat: value.monat, 
          value: value.value
        })
      }
    }) 
    console.log(`Bezug 18-6 pro monat:`); 
    console.log(bezugProMonat);
    return bezugProMonat;
  }

  public async calulateBatteriegröße():Promise< BatterKapazität[]>{
    let batteriegröße: number = 0; 
    if(!this._pvControl.controls['hasBattery'].value && this._pvControl.controls['wantsBattery']){
      let pvPerformance = await this.PVPerformance(); 
      let verbrauchProJahr = await this.caculateConsuptions(); 
      let verbrauchJahr: number = 0; 
      verbrauchProJahr?.forEach((verbrauch: totalConsuptions)=>{
        verbrauchJahr += verbrauch.consuptions; 
      }); 

      let verbrauchJahrtemp =Math.ceil( verbrauchJahr/1000)*1000;
      if(verbrauchJahrtemp>8000){
        verbrauchJahrtemp = 8000;
      }
      if(pvPerformance> 9.9){
        pvPerformance = 9.9;
      }

      batteriegröße = await this.supabaseService.batterieGröße(pvPerformance, verbrauchJahrtemp) || 0; 
    
    }
    if(this._pvControl.controls['hasBattery'].value ){
      batteriegröße = Number(this._pvControl.controls['capacityBattery'].value?.replace(',', '.'));
    }
    let capacityPerMonth: BatterKapazität[] = []; 
    for(let i = 1; i< 13; i++){
      capacityPerMonth.push({
        month: new Date(0, i - 1).toLocaleString("de-DE", { month: "long" }),
        value: batteriegröße * this.daysInMonth(i)
      })
    }
    console.log(`Batteriekapazität pro monat:`); 
    console.log(capacityPerMonth);
    return capacityPerMonth; 
  }


  private async SpeicherNutzungMax():Promise<SpeicherNutzungMax[]>{
    let überProduktion618 = this._überproduktion618;
    let batterycapacity = await this.calulateBatteriegröße(); 
    let SpeicherNutzungMax: SpeicherNutzungMax[] = []
    überProduktion618.forEach((value, index)=>{
        if(value.value <=  0){
          SpeicherNutzungMax.push({
            monat: value.monat, 
            value: 0
          });
        }
        if(value.value < batterycapacity[index].value && value.value > 0){
          SpeicherNutzungMax.push({
            monat: value.monat, 
            value: value.value
          });
        }
        if(value.value > batterycapacity[index].value && value.value > 0){
          SpeicherNutzungMax.push({
            monat: value.monat, 
            value: batterycapacity[index].value
          });
        }
      }
    ); 
    console.log(`Speichernutzung Max pro monat:`); 
    console.log(SpeicherNutzungMax);
    return SpeicherNutzungMax;
  }

  private async SpeicherNutzungNormal():Promise< SpeicherNutzungNormal[]>{
    let überProduktion186 = await this.überProduktion('18-6'); 
    let speicherNutzungMax = this._speicherNutzungMax;
    let speichernutzungNormal: SpeicherNutzungNormal[] = []; 
    console.log('Überproduktion bei speichernuetzuung normal:'); 
    console.log(überProduktion186); 
    überProduktion186.forEach((value, index)=>{
      if( Math.abs( value.value) < speicherNutzungMax[index].value){
        console.log('überproduktion kleiner als speichernutzung max')
        speichernutzungNormal.push({
          monat: value.monat, 
          value: Math.abs( value.value)
        });
      }

      if( Math.abs( value.value) > speicherNutzungMax[index].value){
        console.log('überproduktion größer als speichernutzung max')
        speichernutzungNormal.push({
          monat: value.monat, 
          value: speicherNutzungMax[index].value
        });
      }

      if( Math.abs( value.value) == speicherNutzungMax[index].value){
        console.log('überproduktion größer als speichernutzung max')
        speichernutzungNormal.push({
          monat: value.monat, 
          value: 0
        });
      }
    })
    console.log(`Speichernutzung Normal pro monat:`); 
    console.log(speichernutzungNormal);
    return speichernutzungNormal;
  }

  private async SpeicherUngenutzt():Promise< SpeicherUngenutzt[]>{
    let speichermax =  this._speicherNutzungMax; 
    this._speicherNormal = await this.SpeicherNutzungNormal(); 
    let speicherUngenutzt: SpeicherUngenutzt[] = [];
    this._speicherNormal .forEach((value, index)=>{
      speicherUngenutzt.push({
        monat: value.monat, 
        value: (speichermax[index].value -  value.value)
      })
    })
    console.log(`Speichernutzung ungenutzt pro monat:`); 
    console.log(speicherUngenutzt);
    return speicherUngenutzt;
  }

  private async Einspeißung618(): Promise<Einspeißung618[]>{
    let Einspeißung618: Einspeißung618[] = [];
    this._überproduktion618 = await this.überProduktion('6-18'); 
    this._speicherNutzungMax = await  this.SpeicherNutzungMax(); 
    this._speicherUngenutzt = await this.SpeicherUngenutzt(); 

    this._überproduktion618.forEach((value, index)=>{
      if(value.value <0){
        Einspeißung618.push({monat: value.monat, value :0}); 
      }else{
        Einspeißung618.push({value: (value.value+this._speicherUngenutzt[index].value)-this._speicherNutzungMax[index].value, monat: value.monat})
      }
    });
    console.log(`Einspeißung ungenutzt pro monat:`); 
    console.log(Einspeißung618);
    return Einspeißung618;
  }

  private async einnahmenEinspeißung(): Promise<number>{
    let einspeißung = await this.Einspeißung618(); 
    let einnahmen: number = 0; 
    let vergütungTemp: string =  this._finance.controls['vergütung'].value;
    einspeißung.forEach((value)=>{
      einnahmen = einnahmen + value.value *  Number(vergütungTemp.replace(',', '.'));
    })
    console.log(`Einahmen Einspeißung: ${einnahmen}`)
    return einnahmen; 
  }

  private async bezugGesamt(): Promise<BezugProMonat[]>{
    let bezug: BezugProMonat[] = []
    let speichernutzungNormal = await this.SpeicherNutzungNormal(); 
    let bezug186 = await this.bezug186(); 
    let bezug618 = await this.bezug618();

    speichernutzungNormal.forEach((value, index)=>{
      bezug.push({
        monat: value.monat, 
        value: value.value + bezug186[index].value + bezug618[index].value
      })
    });
    console.log(`Bezug pro monat:`); 
    console.log(bezug);
    return bezug; 
  }

  private async Stromkosten(): Promise<number>{
    let costs:string = this._finance.controls['energyCosts'].value
    let bezugProMonat = await this.bezugGesamt();
    let stromkosten: number = 0;
    bezugProMonat.forEach(value=>{
      stromkosten = stromkosten + value.value * Number( costs.replace(',','.'));
    }); 
    console.log(`Stromkosten: ${stromkosten}`);
    return stromkosten;
  }

  private async EinsparungJährlich(){
    let stromverbrauch = this.Stromverbrauch(); 
    let stromverbrauchEfahr = this.stromverbrauchEfahrzeug(); 
    let costs:string = this._finance.controls['energyCosts'].value
    let costsPrevois: string = this._finance.controls['costsPreviosHeating'].value; 
    console.log(`Einsparung jährlich: ${(stromverbrauch + stromverbrauchEfahr *0.7)* Number(costs.replace(',','.')) +Number( costsPrevois.replace(',', '.'))}`);
    return (stromverbrauch + stromverbrauchEfahr *0.7)* Number(costs.replace(',','.')) +Number( costsPrevois.replace(',', '.')); 

  }

  private async GuV(){
    let einsparung = await this.EinsparungJährlich(); 
    let einnahmen = await this.einnahmenEinspeißung(); 
    let stromkosten = await this.Stromkosten(); 
    console.log(`GuV: ${einsparung+einnahmen + stromkosten}`);
    return einsparung+einnahmen + stromkosten;
  }

  public async amortisationZeit(){
    const wartungÖl = 200;
    const wartungPV = 25; 
    const wartungPumpe = 300; 
    let Zinskosten= await this.zinskosten();
    let k_erspanis: number = await this.GuV() + wartungÖl; 
    let k_em: number = wartungPV +wartungPumpe + Zinskosten; 
    let k_a = k_erspanis - k_em; 
    return await this.invenstitionsKosten() / k_a
  }

  private async zinskosten(){
    if(this._finance.controls['externalFincance'].value){
      let rate:string = this._finance.controls['zinssatz'].value
      let kumzinsz = this.kumzinsz(Number(rate.replace(',', '.'))/12, Number(this._finance.controls['laufzeit'].value.replace(',','.'))*12, await this.invenstitionsKosten(), 1,Number(this._finance.controls['laufzeit'].value.replace(',','.'))*12,0); 
      return kumzinsz/Number(this._finance.controls['laufzeit'].value.replace(',','.')); 

    }else{
      return 0; 
    }
  }

  private kumzinsz(rate: number, nper: number, pv: number, startPeriod: number, endPeriod: number, type: number): number{
    let interest = 0;

    // Iteriere durch die Perioden vom Start- bis zum Endzeitpunkt
    for (let period = startPeriod; period <= endPeriod; period++) {
        let paymentPeriod: number;

        // Wenn der Typ 0 ist (Zahlung am Ende der Periode)
        if (type === 0) {
            paymentPeriod = period - 1;
        }
        // Wenn der Typ 1 ist (Zahlung zu Beginn der Periode)
        else if (type === 1) {
            paymentPeriod = period;
        } else {
            throw new Error("Der Typ muss entweder 0 oder 1 sein.");
        }

        // Berechne den kumulierten Zins für die aktuelle Periode
        let interestForPeriod = (pv * Math.pow(1 + rate, paymentPeriod) * rate);
        interest += interestForPeriod;
    }

    return interest;
  }

  public async invenstitionsKosten(){
    return await this.pvKosten() + await this.pumpenKosten() + await this.kostenBaterrieSpeicher(); 
  }

  private async pvKosten(){
    if(this._pvControl.controls['hasPV'].value){
      return Number(this._pvControl.controls['costsOfPv'].value?.replace(',', '.'));
    }else{
      return await this.PVPerformance() *1300;
    }
  }

  private async pumpenKosten(){
    if(this._heatingPump.controls['hasPump'].value){
      return Number(this._heatingPump.controls['costs'].value?.replace(',', '.'));
    }else{

      let pump = this._heatingPump.controls['version'].value ?? '';
      let pumpenLeistung = this.LeistungsgrößeWärmepumpe();
      if (pump == Wärmepumpe.SoleWassermitErdkollektor){
        if(pumpenLeistung <= 5){
          return 15000;
        }

        if( pumpenLeistung >5 && pumpenLeistung <= 10){
          return  21500; 
        }

        if(pumpenLeistung> 10 && pumpenLeistung <= 15){
          return 30000;
        }

        if(pumpenLeistung > 15){
          return 40000;
        }else{
          return 0; 
        }
      }

      if (pump == Wärmepumpe.SoleWassermitErdsonde){
        if(pumpenLeistung <= 5){
          return 17500;
        }

        if( pumpenLeistung >5 && pumpenLeistung <= 10){
          return  25000; 
        }

        if(pumpenLeistung> 10 && pumpenLeistung <= 15){
          return 35000;
        }

        if(pumpenLeistung > 15){
          return 45000;
        }else{
          return 0; 
        }
      }

      if (pump == Wärmepumpe.LuftWasser){
        if(pumpenLeistung <= 5){
          return 8500;
        }

        if( pumpenLeistung >5 && pumpenLeistung <= 10){
          return  11500;
        }

        if(pumpenLeistung> 10 && pumpenLeistung <= 15){
          return 14500;
        }

        if(pumpenLeistung > 15){
          return 18000;
        }else{
          return 0;
        }
      }else{
        return 0;
      }
    }
  }

  private async kostenBaterrieSpeicher(){
    if(this._pvControl.controls['hasBattery']){
      return Number(this._pvControl.controls['costsBattery'].value?.replace(',','.'));
    }else{
      let pvPerformance = await this.PVPerformance(); 
      let verbrauchProJahr = await this.caculateConsuptions(); 
      let verbrauchJahr: number = 0; 
      verbrauchProJahr.forEach((verbrauch: totalConsuptions)=>{
        verbrauchJahr = verbrauchJahr + verbrauch.consuptions; 
      }); 

      let verbrauchJahrtemp =Math.ceil( verbrauchJahr/1000)*1000;
      if(verbrauchJahrtemp>8000){
        verbrauchJahrtemp = 8000;
      }
      if(pvPerformance> 9.9){
        pvPerformance = 9.9;
      }

      let batteriegröße = await this.supabaseService.batterieGröße(pvPerformance, verbrauchJahrtemp) || 0; 
      console.log(`Kostenbatteriespeicher: ${batteriegröße *1400}`); 
      return batteriegröße *1400;
    }
  }

  public async autarkieGrad(){
    this._stromertrag = await this.StromertragProMonat(); 
    let einspeißung = await this.Einspeißung618();
    let bezugGesamt = await this.bezugGesamt();
    let stromertragJährlich: number= 0; 
    let einspeißungJärhlich: number =0;
    let bezugJährlich: number = 0;
    this._stromertrag.forEach(value=>{
      stromertragJährlich = stromertragJährlich + value.ertrag; 
    }); 
    einspeißung.forEach(value=>{
      einspeißungJärhlich = einspeißungJärhlich + value.value; 
    }); 
    bezugGesamt.forEach(value=>{
      bezugJährlich = bezugJährlich + value.value; 
    }); 
    console.log(`Autarkiegrad: ${(stromertragJährlich - einspeißungJärhlich)/(stromertragJährlich - einspeißungJärhlich+ Math.abs(bezugJährlich))}`);
    return (stromertragJährlich - einspeißungJärhlich)/(stromertragJährlich - einspeißungJärhlich+ Math.abs(bezugJährlich)); 
    
  }

  public async eingenVerbrauchsanteil(): Promise< number>{
    let stromertrag = this._stromertragProMonat;
    let einspeißung = await this.Einspeißung618();
    let pvPerfamnce = await this.PVPerformance();
    let stromertragJährlich: number= 0; 
    let einspeißungJärhlich: number =0;
    stromertrag.forEach(value=>{
      stromertragJährlich = stromertragJährlich + value.ertrag; 
    }); 
    einspeißung.forEach(value=>{
      einspeißungJärhlich = einspeißungJärhlich + value.value; 
    }); 

    if(pvPerfamnce>0){
      console.log(`Eigenverbrauchsanteil: ${(stromertragJährlich-einspeißungJärhlich)/stromertragJährlich}`); 
      return (stromertragJährlich-einspeißungJärhlich)/stromertragJährlich;
    }else{
      return 0;
    } 
  }

  private daysInMonth (month: any) {
    return new Date(2023, month, 0).getDate();
  }
}
