

import { SolarData, SolarResults, TransformerData, PowerFactorData } from '../types';

// --- SOLAR ---
export const calculateSolarPanel = (data: SolarData): SolarResults | null => {
  const { energyConsumption, irradiation, efficiency, panelPower, systemLosses } = data;
  if (!energyConsumption || !irradiation || !efficiency || !panelPower) return null;

  const systemEfficiencyDecimal = efficiency / 100;
  const lossesDecimal = systemLosses / 100;
  
  // Daily Energy Needed equals Consumption (per user request)
  const dailyEnergyNeeded = energyConsumption;
  
  // Gross Energy calculation for Array Sizing:
  // Apply efficiency and losses to the base consumption to find what needs to be generated.
  // Formula: Consumption / Efficiency / (1 - Losses)
  const energyWithLosses = dailyEnergyNeeded / systemEfficiencyDecimal / (1 - lossesDecimal);
  
  // Calculate Array Power based on Peak Sun Hours (Irradiation)
  const totalSolarArrayPowerKW = energyWithLosses / irradiation;
  
  const totalSolarArrayPowerW = totalSolarArrayPowerKW * 1000;
  const numberOfPanels = Math.ceil(totalSolarArrayPowerW / panelPower);

  return {
    dailyEnergyNeeded,
    totalSolarArrayPower: totalSolarArrayPowerKW,
    numberOfPanels,
    inverterLow: totalSolarArrayPowerKW * 0.8,
    inverterCenter: totalSolarArrayPowerKW,
    inverterMax: totalSolarArrayPowerKW * 1.2,
    energyWithLosses,
    totalSolarArrayPowerW
  };
};

// --- ELECTRONICS ---
export const calculateOhmsLaw = (v: string, i: string, r: string, p: string) => {
  const V = parseFloat(v);
  const I = parseFloat(i);
  const R = parseFloat(r);
  const P = parseFloat(p);
  let result = { V: NaN, I: NaN, R: NaN, P: NaN };

  if (!isNaN(V) && !isNaN(I)) result = { V, I, R: V / I, P: V * I };
  else if (!isNaN(V) && !isNaN(R)) result = { V, I: V / R, R, P: (V * V) / R };
  else if (!isNaN(V) && !isNaN(P)) result = { V, I: P / V, R: (V * V) / P, P };
  else if (!isNaN(I) && !isNaN(R)) result = { V: I * R, I, R, P: I * I * R };
  else if (!isNaN(I) && !isNaN(P)) result = { V: P / I, I, R: P / (I * I), P };
  else if (!isNaN(R) && !isNaN(P)) result = { V: Math.sqrt(P * R), I: Math.sqrt(P / R), R, P };
  return result;
};

export const calculateLedResistor = (supply: number, forward: number, currentMa: number) => {
  if (supply <= forward) return null;
  const currentA = currentMa / 1000;
  const voltageAcross = supply - forward;
  const resistance = voltageAcross / currentA;
  const power = voltageAcross * currentA;
  
  // Standard E12 series finding logic
  const e12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  let multiplier = 1;
  let rTemp = resistance;
  while(rTemp >= 100) { rTemp /= 10; multiplier *= 10; }
  while(rTemp < 10 && rTemp > 0) { rTemp *= 10; multiplier /= 10; }
  
  let nearest = e12[0] * multiplier;
  let minDiff = Math.abs(resistance - nearest);
  for(let val of e12) {
    const test = val * multiplier;
    if(Math.abs(resistance - test) < minDiff && test >= resistance) {
       nearest = test;
       minDiff = Math.abs(resistance - test);
    }
  }
  
  return { resistance, power, nearest };
};

export const calculateCapacitorCode = (code: string, tol: string) => {
  if(code.length !== 3) return null;
  const d1 = parseInt(code[0]);
  const d2 = parseInt(code[1]);
  const mult = parseInt(code[2]);
  const valPf = (d1 * 10 + d2) * Math.pow(10, mult);
  
  let display = valPf + " pF";
  if(valPf >= 1000000) display = (valPf/1000000).toFixed(2) + " µF";
  else if(valPf >= 1000) display = (valPf/1000).toFixed(2) + " nF";
  
  return { valPf, display };
};

export const calculate555 = (mode: string, r1: number, r2: number, c: number) => {
  let period = 0, freq = 0, duty = 0, thigh = 0, tlow = 0;
  if(mode === 'astable-no-diode') {
    thigh = 0.693 * (r1 + r2) * c;
    tlow = 0.693 * r2 * c;
    period = thigh + tlow;
    freq = 1 / period;
    duty = (thigh / period) * 100;
  } else if (mode === 'astable-with-diode') {
    thigh = 0.693 * r1 * c;
    tlow = 0.693 * r2 * c;
    period = thigh + tlow;
    freq = 1 / period;
    duty = (thigh / period) * 100;
  } else {
    // Monostable
    const pulse = 1.1 * r1 * c;
    return { pulse };
  }
  return { period, freq, duty, thigh, tlow };
};

export const calculateFilter = (type: string, r: number, c: number, r2?: number, c2?: number) => {
  if (type === 'bandpass' && r2 && c2) {
    const fLow = 1 / (2 * Math.PI * r * c); // HPF
    const fHigh = 1 / (2 * Math.PI * r2 * c2); // LPF
    if (fLow >= fHigh) return { error: "f_low must be < f_high" };
    const center = Math.sqrt(fLow * fHigh);
    const bw = fHigh - fLow;
    const q = center / bw;
    return { fLow, fHigh, center, bw, q };
  } else {
    const fc = 1 / (2 * Math.PI * r * c);
    return { fc };
  }
};

// --- ELECTRICAL ---
export const calculate3Phase = (v: number, i: number, pf: number, eff: number, conn: string) => {
  const sqrt3 = Math.sqrt(3);
  const apparent = sqrt3 * v * i / 1000; // kVA
  const real = apparent * pf * (eff/100); // kW
  const reactive = apparent * Math.sin(Math.acos(pf));
  
  let phaseV = v, phaseI = i;
  if(conn === 'star') {
    phaseV = v / sqrt3;
  } else {
    phaseI = i / sqrt3;
  }

  const phaseAngle = Math.acos(pf) * (180 / Math.PI);
  const powerPerPhase = real / 3;

  return { apparent, real, reactive, phaseV, phaseI, phaseAngle, powerPerPhase };
};

export const calculateMotor = (p: number, unit: string, v: number, type: string, pf: number, eff: number, start: string) => {
  let pW = p;
  if(unit === 'hp') pW = p * 746;
  if(unit === 'kw') pW = p * 1000;
  
  const pHp = pW / 746;
  const pKw = pW / 1000;
  
  let current;
  if(type === 'single') current = pW / (v * pf * (eff/100));
  else current = pW / (Math.sqrt(3) * v * pf * (eff/100));
  
  let startFactor = 6;
  if(start === 'star-delta') startFactor = 2;
  if(start === 'soft') startFactor = 3;
  if(start === 'vfd') startFactor = 1;
  const startCurrent = current * startFactor;
  
  const torque = (pKw * 1000 * 60) / (2 * Math.PI * 1500); // Assuming 1500rpm
  
  return { pHp, pKw, pW, current, startCurrent, torque };
};

export const calculateTransformer = (data: TransformerData) => {
    const { phase, load, loadUnit, v1, v2, pf, loadType } = data;
    const l = parseFloat(load);
    const primV = parseFloat(v1);
    const secV = parseFloat(v2);
    const pFactor = parseFloat(pf);

    if(!l || !primV || !secV) return null;

    let baseKva = l;
    if(loadUnit === 'kw') {
        baseKva = l / (pFactor || 0.8);
    }

    let multiplier = 1.0;
    if(loadType === 'motor') multiplier = 1.25;
    if(loadType === 'nonlinear') multiplier = 1.35; // K-factor approx/Harmonics buffer

    const requiredKva = baseKva * multiplier;

    // Currents
    const factor = phase === 'three' ? Math.sqrt(3) : 1;
    const i1 = (requiredKva * 1000) / (factor * primV);
    const i2 = (requiredKva * 1000) / (factor * secV);

    return { requiredKva, i1, i2, multiplier };
};

export const calculatePFC = (data: PowerFactorData) => {
  const P = parseFloat(data.power); // kW
  const pfOld = parseFloat(data.oldPf);
  const pfNew = parseFloat(data.newPf);
  const V = parseFloat(data.voltage);
  const f = parseFloat(data.freq);
  const isThreePhase = data.phase === 'three';

  if (!P || !pfOld || !pfNew || !V || !f) return null;

  // Angles
  const phi1 = Math.acos(pfOld);
  const phi2 = Math.acos(pfNew);

  // Tan
  const tan1 = Math.tan(phi1);
  const tan2 = Math.tan(phi2);

  // Required kVAR
  const requiredKvar = P * (tan1 - tan2);

  // Apparent Power (kVA)
  const kvaOld = P / pfOld;
  const kvaNew = P / pfNew;

  // Current (Amps)
  // 1-phase: I = P*1000 / (V * PF)
  // 3-phase: I = P*1000 / (sqrt(3) * V * PF)
  const factor = isThreePhase ? Math.sqrt(3) : 1;
  const iOld = (P * 1000) / (factor * V * pfOld);
  const iNew = (P * 1000) / (factor * V * pfNew);
  
  // Reduction
  const iReduction = iOld - iNew;
  const percentReduction = (iReduction / iOld) * 100;

  // Capacitance (microfarads)
  // Q in VAR = requiredKvar * 1000
  // C = Q / (omega * V_cap^2)
  // Omega = 2 * PI * f
  const omega = 2 * Math.PI * f;
  const Q_var = requiredKvar * 1000;
  
  let capacitance = 0;
  if (isThreePhase) {
      // Assuming Delta Connection for Capacitors (Standard for LV)
      // Q_total = 3 * V_line^2 * omega * C_phase
      // C_phase = Q_total / (3 * V_line^2 * omega)
      capacitance = Q_var / (3 * V * V * omega);
  } else {
      // Single Phase
      // Q = V^2 * omega * C
      // C = Q / (V^2 * omega)
      capacitance = Q_var / (V * V * omega);
  }

  // Convert Farads to Microfarads
  const capacitanceMicro = capacitance * 1e6;

  return {
      requiredKvar,
      kvaOld, kvaNew,
      iOld, iNew,
      iReduction, percentReduction,
      capacitanceMicro,
      isThreePhase
  };
};

// --- CONVERTERS ---

// Prefix / Unit map including Area/Volume
export const unitMultipliers: Record<string, number> = {
  // Linear (Prefix)
  'prefix_1e-12': 1e-12, 'prefix_1e-9': 1e-9, 'prefix_1e-6': 1e-6, 
  'prefix_1e-3': 1e-3, 'prefix_1': 1, 'prefix_1e3': 1e3, 'prefix_1e6': 1e6,
  
  // Area (to m2)
  'area_1e-6': 1e-6, 'area_1e-4': 1e-4, 'area_1': 1, 'area_1e6': 1e6,
  
  // Volume (to m3)
  'volume_1e-9': 1e-9, 'volume_1e-6': 1e-6, 'volume_1e-3': 1e-3, 'volume_1': 1
};

// Imperial Maps
export const lengthMap: Record<string, number> = { 
  m: 1, cm: 0.01, mm: 0.001, km: 1000, 
  in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 
};
export const weightMap: Record<string, number> = { 
  g: 0.001, kg: 1, 
  lb: 0.453592, oz: 0.0283495, st: 6.35029 
};
export const volumeMap: Record<string, number> = { 
  L: 1, mL: 0.001, m3: 1000, cm3: 0.001, mm3: 1e-6,
  gal: 3.78541, qt: 0.946353, pt: 0.473176, floz: 0.0295735 
};
export const areaMap: Record<string, number> = { 
  m2: 1, ha: 10000, 
  ft2: 0.092903, acre: 4046.86 
};

export const convertTemp = (val: number, from: string, to: string) => {
  let c = val;
  if(from === 'F') c = (val - 32) * 5/9;
  if(from === 'K') c = val - 273.15;
  
  if(to === 'C') return c;
  if(to === 'F') return c * 9/5 + 32;
  if(to === 'K') return c + 273.15;
  return c;
}

// --- RESISTOR UTILS ---
export const resistorColors: Record<number | string, {color: string, name: string, text: string, hex: string}> = {
  0: { color: 'bg-black', name: 'Black', text: 'text-white', hex: '#000000' },
  1: { color: 'bg-[#8B4513]', name: 'Brown', text: 'text-white', hex: '#8B4513' },
  2: { color: 'bg-red-600', name: 'Red', text: 'text-white', hex: '#FF0000' },
  3: { color: 'bg-orange-500', name: 'Orange', text: 'text-black', hex: '#FFA500' },
  4: { color: 'bg-yellow-400', name: 'Yellow', text: 'text-black', hex: '#FFFF00' },
  5: { color: 'bg-green-600', name: 'Green', text: 'text-white', hex: '#008000' },
  6: { color: 'bg-blue-600', name: 'Blue', text: 'text-white', hex: '#0000FF' },
  7: { color: 'bg-purple-600', name: 'Violet', text: 'text-white', hex: '#8B00FF' },
  8: { color: 'bg-gray-500', name: 'Gray', text: 'text-white', hex: '#808080' },
  9: { color: 'bg-white', name: 'White', text: 'text-black', hex: '#FFFFFF' },
  // Multipliers/Tolerance specific
  '-1': { color: 'bg-[#FFD700]', name: 'Gold', text: 'text-black', hex: '#FFD700' }, // Gold (x0.1)
  '-2': { color: 'bg-[#C0C0C0]', name: 'Silver', text: 'text-black', hex: '#C0C0C0' }, // Silver (x0.01)
};

export const getValidColors = (type: 'digit' | 'multiplier' | 'tolerance') => {
  const base = [0,1,2,3,4,5,6,7,8,9];
  if(type === 'digit') return base;
  if(type === 'multiplier') return [...base, -1, -2]; // Add Gold/Silver
  if(type === 'tolerance') return [1, 2, 0.5, 0.25, 0.1, 0.05, 5, 10]; // 5=Gold, 10=Silver
  return base;
}

export const getToleranceColor = (tol: number) => {
    if(tol === 5) return -1; // Gold
    if(tol === 10) return -2; // Silver
    return tol;
}

export const calculate4BandResistor = (b1: number, b2: number, mult: number, tol: number) => {
  const val = (b1 * 10 + b2) * Math.pow(10, mult);
  let display = val + " Ω";
  if(val >= 1e6) display = (val/1e6).toFixed(2) + " MΩ";
  else if(val >= 1e3) display = (val/1e3).toFixed(2) + " kΩ";
  return { value: display, tolerance: `±${tol}%` };
};

export const calculate5BandResistor = (b1: number, b2: number, b3: number, mult: number, tol: number) => {
  const val = (b1 * 100 + b2 * 10 + b3) * Math.pow(10, mult);
  let display = val + " Ω";
  if(val >= 1e6) display = (val/1e6).toFixed(2) + " MΩ";
  else if(val >= 1e3) display = (val/1e3).toFixed(2) + " kΩ";
  return { value: display, tolerance: `±${tol}%` };
};

export const getResistorColorsFromValue = (ohms: number, bands: 4 | 5, tolerance: number) => {
    if(ohms <= 0) return null;

    let multiplier = 0;
    let tempVal = ohms;

    // Normalize to significant digits window
    // 4-band needs [10, 99.9...]
    // 5-band needs [100, 999.9...]
    const lowerBound = bands === 4 ? 10 : 100;
    const upperBound = bands === 4 ? 100 : 1000;

    // Shift decimal
    while (tempVal < lowerBound) {
        tempVal *= 10;
        multiplier--;
    }
    while (tempVal >= upperBound) {
        tempVal /= 10;
        multiplier++;
    }

    // Round to nearest integer to get digits
    const digitsVal = Math.round(tempVal);
    const dStr = digitsVal.toString();
    
    // Extract digits
    const d1 = parseInt(dStr[0]);
    const d2 = parseInt(dStr[1]);
    const d3 = bands === 5 ? parseInt(dStr[2]) : 0;
    
    // Ensure multiplier is within valid range (-2 to 9)
    // If rounding caused overflow (e.g. 99.9 -> 100 in 4-band), adjust
    if (bands === 4 && digitsVal >= 100) {
        // e.g. 99.9 -> 100. Should be 1, 0, mult+1
        return { b1: 1, b2: 0, b3: 0, mult: multiplier + 1, tol: tolerance };
    }
    if (bands === 5 && digitsVal >= 1000) {
        return { b1: 1, b2: 0, b3: 0, mult: multiplier + 1, tol: tolerance };
    }

    return {
        b1: d1,
        b2: d2,
        b3: d3,
        mult: multiplier,
        tol: tolerance
    };
};