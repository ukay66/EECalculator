
export type CalculatorCategory = 'solar' | 'electronics' | 'electrical' | 'resistor' | 'converter';

// --- Solar Types ---
export interface SolarData {
  energyConsumption: number;
  irradiation: number;
  efficiency: number;
  panelPower: number;
  systemLosses: number;
}

export interface SolarResults {
  dailyEnergyNeeded: number;
  totalSolarArrayPower: number; // kW
  numberOfPanels: number;
  inverterLow: number;
  inverterCenter: number;
  inverterMax: number;
  energyWithLosses: number;
  totalSolarArrayPowerW: number;
}

export interface InverterData {
  maxPower: number;
  unit: number; // 1 or 1000
}

export interface BatteryData {
  autonomousDays: number;
  dod: number;
  voltage: number;
  capacity: number;
}

export interface MonthlyData {
  usage: string[];
  tariff: string[];
}

// --- Electronics Types ---
export interface OhmsLawData { v: string; i: string; r: string; p: string; }
export interface LedData { supplyV: string; forwardV: string; current: string; customV?: string; }
export interface DividerData { vin: string; r1: string; r1Unit: number; r2: string; r2Unit: number; }
export interface CapacitorData { code: string; tolerance: string; }
export interface Timer555Data { 
  mode: 'astable-no-diode' | 'astable-with-diode' | 'monostable';
  r1: string; r1Unit: number;
  r2: string; r2Unit: number;
  c: string; cUnit: number;
}
export interface BatteryLifeData { capacity: string; capUnit: number; current: string; currUnit: number; eff: string; }
export interface RCTimeData { r: string; rUnit: number; c: string; cUnit: number; }
export interface OpAmpData { 
  config: 'non-inverting' | 'inverting' | 'differential' | 'comparator' | 'voltage-follower';
  r1: string; r1Unit: number;
  r2: string; r2Unit: number;
  v1?: string; v2?: string; // For differential
  vPlus?: string; vMinus?: string; vcc?: string; vee?: string; // For comparator
}
export interface FilterData {
  type: 'lowpass' | 'highpass' | 'bandpass';
  r: string; rUnit: number;
  c: string; cUnit: number;
  r2?: string; r2Unit?: number; // Bandpass
  c2?: string; c2Unit?: number; // Bandpass
}
export interface PcbData { current: string; tempRise: string; thickness: string; layer: 'external' | 'internal'; }

// --- Electrical Types ---
export interface Phase3Data { v: string; i: string; pf: string; eff: string; connection: 'star' | 'delta'; }
export interface StarDeltaData { direction: 'delta-to-star' | 'star-to-delta'; r1: string; r2: string; r3: string; }
export interface TransformerData { 
  phase: 'single' | 'three';
  load: string;
  loadUnit: 'kw' | 'kva';
  v1: string;
  v2: string;
  pf: string;
  loadType: 'resistive' | 'motor' | 'nonlinear';
}
export interface MotorData { power: string; unit: 'hp' | 'kw' | 'w'; voltage: string; type: 'single' | 'three'; pf: string; eff: string; start: string; }
export interface PowerFactorData { 
  power: string; 
  oldPf: string; 
  newPf: string; 
  voltage: string; 
  freq: '50' | '60'; 
  phase: 'single' | 'three'; 
}