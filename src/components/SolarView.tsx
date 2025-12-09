
import React, { useState, useRef } from 'react';
import { InputGroup } from './InputGroup';
import { SelectGroup } from './SelectGroup';
import { calculateSolarPanel } from '../utils/calculations';
import { usePersistedState } from '../hooks/usePersistedState';
import { SolarData, SolarResults, InverterData, BatteryData, MonthlyData } from '../types';

export const SolarView: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Toggle details state
  const [showPanelDetails, setShowPanelDetails] = useState(false);
  const [showInverterDetails, setShowInverterDetails] = useState(false);
  const [showBatteryDetails, setShowBatteryDetails] = useState(false);

  // State
  const [solarData, setSolarData] = usePersistedState<SolarData>('solar_data', {
    energyConsumption: 0,
    irradiation: 0,
    efficiency: 80, // Default to typical System Efficiency (Performance Ratio) ~80%
    panelPower: 450,
    systemLosses: 15
  });
  const [solarResults, setSolarResults] = useState<SolarResults | null>(null);

  const [inverterData, setInverterData] = usePersistedState<InverterData>('inverter_data', { maxPower: 0, unit: 1 });
  const [batteryData, setBatteryData] = usePersistedState<BatteryData>('battery_data', { autonomousDays: 0, dod: 50, voltage: 12, capacity: 100 });
  
  // Monthly Consumption
  const [monthlyData, setMonthlyData] = usePersistedState<MonthlyData>('monthly_data', {
    usage: Array(12).fill(''),
    tariff: Array(12).fill('')
  });
  const [monthlyResults, setMonthlyResults] = useState<any>(null);

  const [sameUsage, setSameUsage] = useState(false);
  const [sameTariff, setSameTariff] = useState(false);

  const scrollToResults = () => {
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSolarCalc = () => {
    const res = calculateSolarPanel(solarData);
    setSolarResults(res);
    scrollToResults();
  };

  const handleMonthlyCalc = () => {
    let totalUsage = 0, totalCost = 0, valid = 0;
    monthlyData.usage.forEach((u, i) => {
      const use = parseFloat(u);
      const tar = parseFloat(monthlyData.tariff[i]);
      if(use > 0 && tar > 0) { totalUsage += use; totalCost += use * tar; valid++; }
    });
    if(valid === 0) return;
    const avgMonthly = totalUsage / valid;
    const avgDaily = avgMonthly / 30;
    const annualCost = avgMonthly * 12 * (totalCost/totalUsage);
    
    setMonthlyResults({ avgMonthly, avgDaily, annualCost });
    // Auto-fill solar
    setSolarData(prev => ({...prev, energyConsumption: parseFloat(avgDaily.toFixed(2))}));
    scrollToResults();
  };

  const updateMonthlyData = (index: number, type: 'usage' | 'tariff', val: string) => {
    const newData = { ...monthlyData };
    if (type === 'usage') {
      newData.usage = [...newData.usage];
      newData.usage[index] = val;
      if (index === 0 && sameUsage) {
        for(let i=1; i<12; i++) newData.usage[i] = val;
      }
    } else {
      newData.tariff = [...newData.tariff];
      newData.tariff[index] = val;
      if (index === 0 && sameTariff) {
        for(let i=1; i<12; i++) newData.tariff[i] = val;
      }
    }
    setMonthlyData(newData);
  };

  const toggleSameUsage = (checked: boolean) => {
    setSameUsage(checked);
    if (checked && monthlyData.usage[0]) {
      const newUsage = Array(12).fill(monthlyData.usage[0]);
      setMonthlyData({ ...monthlyData, usage: newUsage });
    }
  };

  const toggleSameTariff = (checked: boolean) => {
    setSameTariff(checked);
    if (checked && monthlyData.tariff[0]) {
      const newTariff = Array(12).fill(monthlyData.tariff[0]);
      setMonthlyData({ ...monthlyData, tariff: newTariff });
    }
  };

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      <Card icon="📊" title="Monthly Consumption" desc="Track usage & savings" onClick={() => setActiveCalc('monthly')} />
      <Card icon="☀️" title="Solar Panel Sizing" desc="Calculate panel quantity" onClick={() => setActiveCalc('panel')} />
      <Card icon="⚡" title="Inverter Sizing" desc="Determine capacity" onClick={() => setActiveCalc('inverter')} />
      <Card icon="🔋" title="Battery Bank" desc="Energy storage sizing" onClick={() => setActiveCalc('battery')} />
    </div>
  );

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div>
      {activeCalc ? (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white capitalize">{activeCalc.replace('-', ' ')} Calculator</h2>
            <button onClick={() => setActiveCalc(null)} className="text-slate-400 hover:text-white flex items-center gap-1">← Back</button>
          </div>

          {activeCalc === 'monthly' && (
            <div className="space-y-6">
               <div className="flex gap-6 mb-4 p-4 bg-slate-800 rounded border border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sameUsage} onChange={e => toggleSameUsage(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500 bg-slate-700 border-slate-600" />
                    <span className="text-sm text-slate-300">Same Usage (All Months)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sameTariff} onChange={e => toggleSameTariff(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500 bg-slate-700 border-slate-600" />
                    <span className="text-sm text-slate-300">Same Tariff (All Months)</span>
                  </label>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                      <tr>
                        <th className="px-4 py-2">Month</th>
                        <th className="px-4 py-2">Usage (kWh)</th>
                        <th className="px-4 py-2">Tariff ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {months.map((m, i) => (
                        <tr key={m} className="border-b border-slate-700">
                          <td className="px-4 py-2 font-medium">{m}</td>
                          <td className="px-4 py-2">
                            <input type="number" className="bg-transparent w-full focus:outline-none" placeholder="0" 
                              value={monthlyData.usage[i]} 
                              onChange={(e) => updateMonthlyData(i, 'usage', e.target.value)} 
                            />
                          </td>
                          <td className="px-4 py-2">
                             <input type="number" className="bg-transparent w-full focus:outline-none" placeholder="0.00"
                              value={monthlyData.tariff[i]} 
                              onChange={(e) => updateMonthlyData(i, 'tariff', e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
               <button onClick={handleMonthlyCalc} className="btn-primary w-full">Calculate</button>
               {monthlyResults && (
                 <div ref={scrollRef} className="result-box grid grid-cols-2 gap-4">
                    <ResultItem label="Avg Monthly Usage" value={`${monthlyResults.avgMonthly.toFixed(2)} kWh`} />
                    <ResultItem label="Avg Daily Usage" value={`${monthlyResults.avgDaily.toFixed(2)} kWh`} />
                    <ResultItem label="Est. Annual Cost" value={`$${monthlyResults.annualCost.toFixed(2)}`} />
                    <div className="col-span-2 text-xs text-green-400 mt-2">
                      ✓ Daily usage copied to Solar Calculator
                    </div>
                 </div>
               )}
            </div>
          )}

          {activeCalc === 'panel' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Daily Consumption" value={solarData.energyConsumption} onChange={v => setSolarData({...solarData, energyConsumption: parseFloat(v)})} unit="kWh" />
                <InputGroup label="Irradiation" value={solarData.irradiation} onChange={v => setSolarData({...solarData, irradiation: parseFloat(v)})} unit="kWh/m²" />
                <InputGroup label="System Efficiency" value={solarData.efficiency} onChange={v => setSolarData({...solarData, efficiency: parseFloat(v)})} unit="%" hint="Typical: 80%" />
                <InputGroup label="Panel Power" value={solarData.panelPower} onChange={v => setSolarData({...solarData, panelPower: parseFloat(v)})} unit="W" />
                <InputGroup label="System Losses" value={solarData.systemLosses} onChange={v => setSolarData({...solarData, systemLosses: parseFloat(v)})} unit="%" />
              </div>
              <button onClick={handleSolarCalc} className="btn-primary w-full">Calculate</button>
              
              {solarResults && (
                <div ref={scrollRef} className="space-y-4">
                  <div className="result-box grid grid-cols-2 gap-4">
                    <div className="col-span-2 text-center">
                        <div className="text-sm text-slate-400">Panels Required</div>
                        <div className="text-4xl font-bold text-yellow-400">{solarResults.numberOfPanels}</div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                        <ResultItem label="Array Power" value={`${solarResults.totalSolarArrayPower.toFixed(2)} kW`} />
                    </div>
                  </div>

                  {/* Detailed Calculation Dropdown */}
                  <div className="border border-slate-700 rounded bg-slate-900 overflow-hidden">
                      <button onClick={() => setShowPanelDetails(!showPanelDetails)} className="w-full p-3 text-left text-sm text-slate-400 hover:text-white bg-slate-800 flex justify-between items-center">
                          <span>📊 Show Detailed Calculation</span>
                          <span>{showPanelDetails ? '▲' : '▼'}</span>
                      </button>
                      {showPanelDetails && (
                          <div className="p-4 space-y-4 text-sm text-slate-300 animate-fade-in">
                              <DetailStep step={1} title="Daily Energy Needed" formula="From Consumption Input" 
                                calc={`${solarData.energyConsumption.toFixed(2)} kWh`} />
                              
                              <DetailStep step={2} title="Gross Energy Required" formula="Energy ÷ Efficiency ÷ (1 - Losses)" 
                                calc={`${solarResults.dailyEnergyNeeded.toFixed(2)} ÷ ${(solarData.efficiency/100).toFixed(2)} ÷ ${(1 - solarData.systemLosses/100).toFixed(2)} = ${solarResults.energyWithLosses.toFixed(2)} kWh`} />
                              
                              <DetailStep step={3} title="Total Array Power" formula="Gross Energy ÷ Irradiation" 
                                calc={`${solarResults.energyWithLosses.toFixed(2)} ÷ ${solarData.irradiation} = ${solarResults.totalSolarArrayPower.toFixed(2)} kW`} />
                              
                              <DetailStep step={4} title="Number of Panels" formula="Array Power (W) ÷ Panel Power" 
                                calc={`${solarResults.totalSolarArrayPowerW.toFixed(0)} W ÷ ${solarData.panelPower} W = ${(solarResults.totalSolarArrayPowerW / solarData.panelPower).toFixed(2)} → ${solarResults.numberOfPanels} Panels`} />
                          </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCalc === 'inverter' && (
            <div className="space-y-6">
               {!solarResults ? (
                 <div className="text-yellow-500 bg-yellow-900/20 p-4 rounded">⚠ Please calculate Solar Panel sizing first.</div>
               ) : (
                 <div className="text-sm text-slate-400 bg-slate-800 p-3 rounded">
                    Solar Array: <strong>{solarResults.totalSolarArrayPower.toFixed(2)} kW</strong>
                 </div>
               )}
               <div className="flex gap-2">
                 <div className="flex-1"><InputGroup label="Max Input Power per Inverter" value={inverterData.maxPower} onChange={v => setInverterData({...inverterData, maxPower: parseFloat(v)})} /></div>
                 <div className="w-24">
                   <SelectGroup label="Unit" value={inverterData.unit} onChange={v => setInverterData({...inverterData, unit: parseFloat(v)})} options={[{label:'W',value:1}, {label:'kW',value:1000}]} />
                 </div>
               </div>
               
               {solarResults && inverterData.maxPower > 0 && (
                 <>
                 {(() => {
                    const invSize = (inverterData.maxPower * inverterData.unit) / 1000;
                    const countLow = Math.ceil(solarResults.inverterLow / invSize);
                    const countCenter = Math.ceil(solarResults.inverterCenter / invSize);
                    const countMax = Math.ceil(solarResults.inverterMax / invSize);
                    
                    return (
                        <>
                            <div className="text-center mb-6">
                                <div className="text-sm text-slate-400 mb-2">Inverters Required (Rated Sizing)</div>
                                <div className="text-5xl font-bold text-blue-400">{countCenter}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4 opacity-75">
                                <div className="bg-slate-800 p-3 rounded border border-slate-700 text-center flex flex-col justify-between">
                                    <div className="text-xs text-slate-400">Undersized (80%)</div>
                                    <div className="text-xl font-bold text-white my-1">{countLow}</div>
                                    <div className="text-[10px] text-slate-500">{solarResults.inverterLow.toFixed(2)} kW</div>
                                </div>
                                <div className="bg-slate-800 p-3 rounded border border-slate-700 text-center flex flex-col justify-between">
                                    <div className="text-xs text-slate-400">Oversized (120%)</div>
                                    <div className="text-xl font-bold text-white my-1">{countMax}</div>
                                    <div className="text-[10px] text-slate-500">{solarResults.inverterMax.toFixed(2)} kW</div>
                                </div>
                            </div>

                            <div className="border border-slate-700 rounded bg-slate-900 overflow-hidden">
                                <button onClick={() => setShowInverterDetails(!showInverterDetails)} className="w-full p-3 text-left text-sm text-slate-400 hover:text-white bg-slate-800 flex justify-between items-center">
                                    <span>📊 Show Detailed Calculation</span>
                                    <span>{showInverterDetails ? '▲' : '▼'}</span>
                                </button>
                                {showInverterDetails && (
                                    <div className="p-4 space-y-4 text-sm text-slate-300 animate-fade-in">
                                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Parameters</div>
                                        <div className="grid grid-cols-1 gap-1 mb-4 text-xs font-mono">
                                            <div>Inverter Unit Size: <span className="text-white">{invSize.toFixed(2)} kW</span></div>
                                            <div>Array Power: <span className="text-white">{solarResults.totalSolarArrayPower.toFixed(2)} kW</span></div>
                                        </div>
                                        
                                        <DetailStep step={1} title="Rated Calculation (100%)" formula="Array Power ÷ Inverter Size" 
                                            calc={`${solarResults.totalSolarArrayPower.toFixed(2)} kW ÷ ${invSize.toFixed(2)} kW = ${(solarResults.totalSolarArrayPower/invSize).toFixed(2)} → ${countCenter} Inverters`} />
                                        
                                        <div className="text-xs text-slate-500 mt-2 italic">Note: Undersized (80%) means Inverter Capacity is 80% of Array (Overpaneling). Oversized (120%) means Inverter Capacity is 120% of Array.</div>
                                    </div>
                                )}
                            </div>
                        </>
                    )
                 })()}
                 </>
               )}
            </div>
          )}

          {activeCalc === 'battery' && (
             <div className="space-y-6">
                {!solarResults ? (
                 <div className="text-yellow-500 bg-yellow-900/20 p-4 rounded">⚠ Please calculate Solar Panel sizing first.</div>
               ) : (
                 <div className="text-sm text-slate-400 bg-slate-800 p-3 rounded">
                    Daily Load: <strong>{solarData.energyConsumption.toFixed(2)} kWh</strong>
                 </div>
               )}
               <InputGroup label="Autonomous Days" value={batteryData.autonomousDays} onChange={v => setBatteryData({...batteryData, autonomousDays: parseFloat(v)})} unit="days" />
               <InputGroup label="Depth of Discharge" value={batteryData.dod} onChange={v => setBatteryData({...batteryData, dod: parseFloat(v)})} unit="%" />
               <SelectGroup label="System Voltage" value={batteryData.voltage} onChange={v => setBatteryData({...batteryData, voltage: parseFloat(v)})} options={[{label:'12V',value:12},{label:'24V',value:24},{label:'48V',value:48}]} />
               <InputGroup label="Battery Capacity" value={batteryData.capacity} onChange={v => setBatteryData({...batteryData, capacity: parseFloat(v)})} unit="Ah" />
               
               {solarResults && batteryData.autonomousDays > 0 && (
                 <>
                 <div className="result-box text-center">
                    {(() => {
                        // Use raw consumption from input for battery sizing, not the efficient-adjusted panel load
                        const dailyLoad = solarData.energyConsumption;
                        const totalEnergy = dailyLoad * batteryData.autonomousDays;
                        const capKwh = totalEnergy / (batteryData.dod / 100);
                        const totalAh = (capKwh * 1000) / batteryData.voltage;
                        const count = Math.ceil(totalAh / batteryData.capacity);
                        return (
                            <>
                                <div className="text-sm text-slate-400">Batteries Required</div>
                                <div className="text-4xl font-bold text-green-400">{count}</div>
                                <div className="grid grid-cols-2 gap-2 mt-4 text-left">
                                    <ResultItem label="Total Bank Capacity" value={`${totalAh.toFixed(0)} Ah`} />
                                    <ResultItem label="Total Energy" value={`${capKwh.toFixed(2)} kWh`} />
                                </div>
                            </>
                        )
                    })()}
                 </div>

                 <div className="border border-slate-700 rounded bg-slate-900 overflow-hidden">
                      <button onClick={() => setShowBatteryDetails(!showBatteryDetails)} className="w-full p-3 text-left text-sm text-slate-400 hover:text-white bg-slate-800 flex justify-between items-center">
                          <span>📊 Show Detailed Calculation</span>
                          <span>{showBatteryDetails ? '▲' : '▼'}</span>
                      </button>
                      {showBatteryDetails && (
                          <div className="p-4 space-y-4 text-sm text-slate-300 animate-fade-in">
                              <DetailStep step={1} title="Total Energy Needed" formula="Daily Load × Days" 
                                calc={`${solarData.energyConsumption.toFixed(2)} × ${batteryData.autonomousDays} = ${(solarData.energyConsumption * batteryData.autonomousDays).toFixed(2)} kWh`} />
                              
                              <DetailStep step={2} title="Adjust for Depth of Discharge" formula="Total Energy ÷ (DoD/100)" 
                                calc={`${(solarData.energyConsumption * batteryData.autonomousDays).toFixed(2)} ÷ ${batteryData.dod/100} = ${((solarData.energyConsumption * batteryData.autonomousDays)/(batteryData.dod/100)).toFixed(2)} kWh`} />
                              
                              <DetailStep step={3} title="Convert to Amp-Hours" formula="(kWh × 1000) ÷ Voltage" 
                                calc={`(${((solarData.energyConsumption * batteryData.autonomousDays)/(batteryData.dod/100)).toFixed(2)} × 1000) ÷ ${batteryData.voltage} = ${(((solarData.energyConsumption * batteryData.autonomousDays)/(batteryData.dod/100))*1000/batteryData.voltage).toFixed(0)} Ah`} />

                                <DetailStep step={4} title="Number of Batteries" formula="Total Ah ÷ Single Battery Ah" 
                                calc={`${(((solarData.energyConsumption * batteryData.autonomousDays)/(batteryData.dod/100))*1000/batteryData.voltage).toFixed(0)} ÷ ${batteryData.capacity} = ${Math.ceil((((solarData.energyConsumption * batteryData.autonomousDays)/(batteryData.dod/100))*1000/batteryData.voltage)/batteryData.capacity)}`} />
                          </div>
                      )}
                  </div>
                 </>
               )}
             </div>
          )}

        </div>
      ) : renderGrid()}
    </div>
  );
};

const DetailStep = ({step, title, formula, calc}: {step: number, title: string, formula: string, calc: string}) => (
    <div className="pl-4 border-l-2 border-slate-700">
        <div className="text-xs text-blue-400 font-bold mb-1">STEP {step}: {title}</div>
        <div className="text-xs text-slate-500 font-mono mb-1">{formula}</div>
        <div className="text-white font-mono">{calc}</div>
    </div>
);

const Card = ({icon, title, desc, onClick}: any) => (
  <div onClick={onClick} className="bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  </div>
);

const ResultItem = ({label, value, highlight}: any) => (
  <div className={`p-2 rounded ${highlight ? 'bg-slate-700' : ''}`}>
    <div className="text-xs text-slate-400">{label}</div>
    <div className={`font-mono font-bold ${highlight ? 'text-yellow-400 text-lg' : 'text-white'}`}>{value}</div>
  </div>
);
