export interface BatterieGroesse {
    groessePV: number;
    2000: number;
    3000: number;
    4000: number;
    5000: number;
    6000: number;
    7000: number;
    8000: number;
  }

export interface BatterKapazität{
  month: string, 
  value: number,
}

export interface SpeicherNutzungMax{
  monat: string, 
  value: number
}
  
export interface SpeicherNutzungNormal{
  monat: string, 
  value: number
}

export interface SpeicherUngenutzt{
  monat: string, 
  value: number
}

export interface Einspeißung618{
  monat: string, 
  value: number
}

export interface BezugProMonat{
  monat: string, 
  value: number
}