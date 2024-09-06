import { Injectable, inject } from '@angular/core';
import { FormGroup, FormControl, Validators
 } from '@angular/forms';
import { SuperbaseService } from '../superbase.service';
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

  public async caculateConsuptions(): Promise<totalConsuptions[]>{
    let resp = await this.supabaseService.getConsuptions();
    let totalConsonsuptions: totalConsuptions[]= []; 
    if(resp != null){
      resp.forEach(async (value: consuptions, index: number)=>{
        let stromverbrauchHeizen : number = await this.StromverbrauchHeizen() || 0;
        let stromverbrauchWasser: number = await this.StromverbrauchWasser() || 0;
        let verbrauchStrom = value.Strom *  this.Stromverbrauch(); 
        let verbrauchEfahrzeug = value.EFahrzeug * this.stromverbrauchEfahrzeug(); 
        let verbrauchWärme10 = value.Waerme9 * stromverbrauchHeizen; 
        let verbrauchWärme12 = value.Waerme12 * stromverbrauchHeizen; 
        let verbrauchWärme15 = value.Waerme15 * stromverbrauchHeizen; 
        let verbrauchWasser = value.Warmwasser * stromverbrauchWasser; 

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

      });
    }
    return totalConsonsuptions;
  }
  
  public async PVErtrag(): Promise< number>{
    let richtung: number = Number( this._pvControl.controls['directionOfHouse'].value?.replace(',', '.') )|| 0; 
    let neigung: number = Number( this._pvControl.controls['angleOfRoof'].value?.replace(',', '.')) ||0 ; 
    let powerPv: number = Number ( this._pvControl.controls['powerOfPV'].value) || 0
    let pvNutzung = await this.supabaseService.getPVNutzung(neigung, richtung) || 0 ; 

    const solarEinstrahlleistung: number = 1212.17; 
    if(this._pvControl.controls['hasPV'].value){
      let ertrag = pvNutzung * solarEinstrahlleistung * powerPv; 
      return ertrag;
    }else{
      let verbrauchProJahr = await this.caculateConsuptions();
      let verbrauchJahr: number = 0; 
      verbrauchProJahr.forEach((verbrauch: totalConsuptions)=>{
        verbrauchJahr = verbrauchJahr + verbrauch.consuptions; 
      }); 
      let ertrag = pvNutzung * solarEinstrahlleistung * verbrauchJahr * 0.001; 
      return ertrag; 
    }
  }

  public async PVPerformance(): Promise< number>{
    let richtung: number = Number( this._pvControl.controls['directionOfHouse'].value?.replace(',', '.') )|| 0; 
    let neigung: number = Number( this._pvControl.controls['angleOfRoof'].value?.replace(',', '.')) ||0 ; 
    let powerPv: number = Number ( this._pvControl.controls['powerOfPV'].value) || 0
    let pvNutzung = await this.supabaseService.getPVNutzung(neigung, richtung) || 0 ; 

    if(this._pvControl.controls['hasPV'].value){
      let ertrag =  powerPv; 
      return ertrag;
    }else{
      let verbrauchProJahr = await this.caculateConsuptions();
      let verbrauchJahr: number = 0; 
      verbrauchProJahr.forEach((verbrauch: totalConsuptions)=>{
        verbrauchJahr = verbrauchJahr + verbrauch.consuptions; 
      }); 
      let ertrag = pvNutzung*  0.001; 
      return ertrag; 
    }
  }

  public async StromertragProMonat():Promise< IStromertrag[]>{
    let consuptions: consuptions[] | null = await this.supabaseService.getConsuptions();
    let stromertragProMonat: IStromertrag[] =[]; 
    consuptions?.forEach(async (consuptions)=>{
        let pvErtrag = await this.PVErtrag(); 
        stromertragProMonat.push({
          monat: consuptions.Monat, 
          ertrag: pvErtrag * consuptions.Stromertrag
        });
    });
    return stromertragProMonat;
  }

  private async überProduktion(zeitraum: string):Promise< überProduktionProMonat[]>{
    let stromertragProMonat = await this.StromertragProMonat(); 
    let resp = await this.supabaseService.getConsuptions();
    let aufteilung = await this.supabaseService.getNutzungsAufteilung(zeitraum); 
    let überProduktionProMonat: überProduktionProMonat[] = []

    if(resp && aufteilung){
      stromertragProMonat.forEach(async (ertrag, index)=>{
          let stromverbrauchHeizen : number = await this.StromverbrauchHeizen() || 0;
          let stromverbrauchWasser: number = await this.StromverbrauchWasser() || 0;
          let verbrauchStrom = resp[index].Strom *  this.Stromverbrauch(); 
          let verbrauchEfahrzeug = resp[index].EFahrzeug * this.stromverbrauchEfahrzeug();
          if(zeitraum == '18-6'){
            ertrag.ertrag = 0; 
          }
          let überProduktion = ertrag.ertrag - (verbrauchStrom* aufteilung.Strom) -  (stromverbrauchWasser*aufteilung.Wasser) - (stromverbrauchHeizen*aufteilung.Waerme)- (verbrauchEfahrzeug*aufteilung.LadenEfahrzeuge); 

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
      })
    }

    return überProduktionProMonat; 
  }

  public async bezug618(){
    let überproduktion = await this.überProduktion('6-18'); 
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

    return bezugProMonat;
  }

  public async bezug186(){
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

    return bezugProMonat;
  }

  private async calulateBatteriegröße():Promise< BatterKapazität[]>{
    let batteriegröße: number = 0; 
    if(!this._pvControl.controls['hasBattery'].value && this._pvControl.controls['wantsBattery']){
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
    return capacityPerMonth; 
  }


  public async SpeicherNutzungMax():Promise<SpeicherNutzungMax[]>{
    let überProduktion618 = await this.überProduktion('6-18'); 
    let batterycapacity = await this.calulateBatteriegröße(); 
    let SpeicherNutzungMax: SpeicherNutzungMax[] = []
    überProduktion618.forEach((value, index)=>{
      if(value.monat = batterycapacity[index].month){
        if(value.value <=  0){
          SpeicherNutzungMax.push({
            monat: value.monat, 
            value: 0
          });
        }
        if(value.value < batterycapacity[index].value){
          SpeicherNutzungMax.push({
            monat: value.monat, 
            value: value.value
          });
        }
        if(value.value > batterycapacity[index].value){
          SpeicherNutzungMax.push({
            monat: value.monat, 
            value: batterycapacity[index].value
          });
        }
      }
    }); 
    return SpeicherNutzungMax;
  }

  public async SpeicherNutzungNormal():Promise< SpeicherNutzungNormal[]>{
    let überProduktion186 = await this.überProduktion('18-6'); 
    let speicherNutzungMax =await this.SpeicherNutzungMax();
    let speichernutzungNormal: SpeicherNutzungNormal[] = []; 
    überProduktion186.forEach((value, index)=>{
      if( Math.abs( value.value) < speicherNutzungMax[index].value){
        speichernutzungNormal.push({
          monat: value.monat, 
          value: Math.abs( value.value)
        });
      }

      if( Math.abs( value.value) > speicherNutzungMax[index].value){
        speichernutzungNormal.push({
          monat: value.monat, 
          value: speicherNutzungMax[index].value
        });
      }
    })

    return speichernutzungNormal;
  }

  public async SpeicherUngenutzt():Promise< SpeicherUngenutzt[]>{
    let speichermax = await this.SpeicherNutzungMax(); 
    let speicherNormal = await this.SpeicherNutzungNormal(); 
    let speicherUngenutzt: SpeicherUngenutzt[] = [];
    speicherNormal.forEach((value, index)=>{
      speicherUngenutzt.push({
        monat: value.monat, 
        value: (speichermax[index].value -  value.value)
      })
    })

    return speicherUngenutzt;
  }

  public async Einspeißung618(): Promise<Einspeißung618[]>{
    let Einspeißung618: Einspeißung618[] = [];
    let überproduktion618 = await this.überProduktion('6-18'); 
    let speicherNutzungMax =await  this.SpeicherNutzungMax(); 
    let speicherUngenutzt = await this.SpeicherUngenutzt(); 

    überproduktion618.forEach((value, index)=>{
      if(value.value <0){
        Einspeißung618.push({monat: value.monat, value :0}); 
      }else{
        Einspeißung618.push({value: (value.value+speicherUngenutzt[index].value)-speicherNutzungMax[index].value, monat: value.monat})
      }
    });

    return Einspeißung618;
  }

  public async einnahmenEinspeißung(): Promise<number>{
    let einspeißung = await this.Einspeißung618(); 
    let einnahmen: number = 0; 
    let vergütungTemp: string =  this._finance.controls['vergütung'].value;
    einspeißung.forEach((value)=>{
      einnahmen = einnahmen + value.value *  Number(vergütungTemp.replace(',', '.'));
    })
    return einnahmen; 
  }

  public async bezugGesamt(): Promise<BezugProMonat[]>{
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

    return bezug; 
  }

  public async Stromkosten(): Promise<number>{
    let costs:string = this._finance.controls['energyCosts'].value
    let bezugProMonat = await this.bezugGesamt();
    let stromkosten: number = 0;
    bezugProMonat.forEach(value=>{
      stromkosten = stromkosten + value.value * Number( costs.replace(',','.'));
    }); 
    return stromkosten;
  }

  public async EinsparungJährlich(){
    let stromverbrauch = this.Stromverbrauch(); 
    let stromverbrauchEfahr = this.stromverbrauchEfahrzeug(); 
    let costs:string = this._finance.controls['energyCosts'].value
    let costsPrevois: string = this._finance.controls['costsPreviosHeating'].value; 

    return (stromverbrauch + stromverbrauchEfahr *0.7)* Number(costs.replace(',','.')) +Number( costsPrevois.replace(',', '.')); 

  }

  public async GuV(){
    let einsparung = await this.EinsparungJährlich(); 
    let einnahmen = await this.einnahmenEinspeißung(); 
    let stromkosten = await this.Stromkosten(); 

    return einsparung+einnahmen + stromkosten;
  }

  public async amortisationZeit(){

  }

  public async autarkieGrad(){
    let stromertrag = await this.StromertragProMonat(); 
    let einspeißung = await this.Einspeißung618();
    let bezugGesamt = await this.bezugGesamt();
    let stromertragJährlich: number= 0; 
    let einspeißungJärhlich: number =0;
    let bezugJährlich: number = 0;
    stromertrag.forEach(value=>{
      stromertragJährlich = stromertragJährlich + value.ertrag; 
    }); 
    einspeißung.forEach(value=>{
      einspeißungJärhlich = einspeißungJärhlich + value.value; 
    }); 
    bezugGesamt.forEach(value=>{
      bezugJährlich = bezugJährlich + value.value; 
    }); 

    return (stromertragJährlich - einspeißungJärhlich)/(stromertragJährlich - einspeißungJärhlich+ Math.abs(bezugJährlich)); 
    
  }

  public async eingenVerbrauchsanteil(){
    let stromertrag = await this.StromertragProMonat(); 
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
      return (stromertragJährlich-einspeißungJärhlich)/stromertragJährlich;
    }else{
      return 0;
    }
  }

  private daysInMonth (month: any) {
    return new Date(2023, month, 0).getDate();
  }
}
