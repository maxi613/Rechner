export interface nutzungsAufteilung{
    Zeitraum: string, 
    Wasser: number, 
    Strom: number, 
    Waerme: number, 
    LadenEfahrzeug: number, 
}

export interface überProduktionProMonat{
    monat: string, 
    value: number
}

export interface bezugProMonat{
    monat: string, 
    value: number
}