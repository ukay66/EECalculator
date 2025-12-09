import React, { useState, useEffect } from 'react';
import { CalculatorCategory } from './types';
import { SolarView } from './components/SolarView';
import { ElectronicsView } from './components/ElectronicsView';
import { ElectricalView } from './components/ElectricalView';
import { ResistorView } from './components/ResistorView';
import { ConverterView } from './components/ConverterView';

function App() {
  const [activeTab, setActiveTab] = useState<CalculatorCategory>('solar');

  // Update document title based on active tab
  useEffect(() => {
    const titles: Record<string, string> = {
      solar: 'Solar Calculator',
      electronics: 'Electronics Calculator',
      electrical: 'Electrical Calculator',
      resistor: 'Resistor Calculator',
      converter: 'Unit Converter'
    };
    document.title = `${titles[activeTab]} | EE Calc`;
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'solar': return <SolarView />;
      case 'electronics': return <ElectronicsView />;
      case 'electrical': return <ElectricalView />;
      case 'resistor': return <ResistorView />;
      case 'converter': return <ConverterView />;
      default: return <SolarView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-xl shadow-lg ring-1 ring-white/10 shrink-0">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">EE Calculator</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Engineering Suite for Web & Mobile</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-500 border border-slate-800 rounded px-2 py-1">v1.0.0 Web</span>
          </div>
        </div>
      </header>

      <nav className="bg-slate-900/50 border-b border-slate-800 overflow-x-auto scrollbar-hide sticky top-[73px] z-40 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 flex space-x-1 min-w-max">
          <TabButton active={activeTab === 'solar'} onClick={() => setActiveTab('solar')} icon="☀️" label="Solar" />
          <TabButton active={activeTab === 'electronics'} onClick={() => setActiveTab('electronics')} icon="⚡" label="Electronics" />
          <TabButton active={activeTab === 'electrical'} onClick={() => setActiveTab('electrical')} icon="🔌" label="Electrical" />
          <TabButton active={activeTab === 'resistor'} onClick={() => setActiveTab('resistor')} icon="🎨" label="Resistor" />
          <TabButton active={activeTab === 'converter'} onClick={() => setActiveTab('converter')} icon="🔄" label="Convert" />
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 md:p-8 animate-slide-up ring-1 ring-white/5 min-h-[500px]">
            {renderContent()}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-900 bg-slate-950">
        <p className="font-medium text-slate-500">Electrical Engineering Calculator</p>
        <p className="text-xs mt-2 text-slate-700">Works offline. Calculations performed locally.</p>
      </footer>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap outline-none select-none
      ${active 
        ? 'border-blue-500 text-blue-400 bg-slate-800/50' 
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}
    `}
  >
    <span className="text-lg opacity-80">{icon}</span>
    {label}
  </button>
);

export default App;