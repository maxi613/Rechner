export interface consuptions {
    EFahrzeug: number;
    Monat: string;
    Strom: number;
    Stromertrag: number;
    Waerme9: number;
    Waerme11: number;
    Waerme12: number;
    Waerme13: number;
    Waerme14: number;
    Waerme15: number;
    Warmwasser: number;
  }
  

  export interface totalConsuptions {
    monat: string; 
    consuptions: number; 
  }

  export interface IStromertrag{
    monat: string; 
    ertrag: number; 
  }

  export interface IVerbrauchWH {
    monat: string; 
    consuptions: number; 
  }

  