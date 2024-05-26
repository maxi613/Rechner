export interface usage{
    Monat: string, 
    Strom: number, 
    Warmwasser: number, 
    EFahrzeug: number, 
    Stromertrag: number, 
    Waerme9: number, 
    Waerme11:number,
    Waerme12:number,
    Waerme13:number,
    Waerme14:number,
    Waerme15:number
}

export interface PVNutzung{
    Richtung:number, 
    Neigung:number, 
    Nutzung: number
}

export interface Nutzungsaufteilung{
    Zeitraum:string, 
    Wasser: number, 
    Strom: number, 
    Wärme: number
}