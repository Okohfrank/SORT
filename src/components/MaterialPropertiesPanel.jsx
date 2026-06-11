import React from 'react';
import { Microscope } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function MaterialPropertiesPanel({ currentParticle }) {
  const [sensorJitter, setSensorJitter] = React.useState({ mass: 0, moisture: 0, size: 0, ref: 0 });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSensorJitter({
        mass: Math.random() * 4 - 2,
        moisture: Math.random() * 2 - 1,
        size: Math.random() * 5 - 2.5,
        ref: Math.random() * 10 - 5
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  if (!currentParticle) {
    return (
      <div className="panel-glass w-full min-h-[350px] flex flex-col items-center justify-center text-slate-500">
        <Microscope className="w-12 h-12 mb-4 opacity-50" />
        <p>AWAITING PROPERTY ESTIMATION...</p>
      </div>
    );
  }

  // Properties come from the simulated state
  const { properties } = currentParticle;

  return (
    <div className="panel-glass w-full min-h-[350px] flex flex-col tour-properties overflow-y-auto">
      <div className="p-3 border-b border-border bg-[#051021] flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
          <Microscope className="w-4 h-4 text-purple-400" /> MATERIAL PROPERTY ESTIMATION
        </h2>
        <span className="text-[10px] text-slate-500 font-mono">CV MODEL LINKED</span>
      </div>

      <div className="p-4 grid grid-cols-3 gap-4">
        
        <PropertyGauge label="DENSITY" value={properties.density} unit="kg/m³" max={1500} color="text-blue-400" bg="bg-blue-500" />
        <PropertyGauge label="MASS" value={properties.mass} unit="g" max={500} color="text-amber-400" bg="bg-amber-500" />
        <PropertyGauge label="SIZE" value={properties.size} unit="mm" max={300} color="text-emerald-400" bg="bg-emerald-500" />
        
        <PropertyGauge label="DRAG COEFF." value={properties.dragCoeff} unit="Cd" max={1.5} color="text-cyan-400" bg="bg-cyan-500" />
        <PropertyGauge label="MOISTURE" value={properties.moisture} unit="%" max={100} color="text-indigo-400" bg="bg-indigo-500" />
        <PropertyGauge label="SHAPE FACTOR" value={properties.shapeFactor} unit="Φ" max={1.0} color="text-pink-400" bg="bg-pink-500" />

      </div>

      <div className="mt-auto border-t border-border bg-[#051021]/50 p-3">
        <div className="text-[10px] text-slate-500 font-mono mb-2">LIVE SENSOR TELEMETRY (RAW INPUTS)</div>
        <div className="flex justify-between items-center text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px]">L-CELL</span>
            <span className="text-amber-400">{Math.max(0, properties.mass + sensorJitter.mass).toFixed(1)} g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px]">IR-MOISTURE</span>
            <span className="text-indigo-400">{Math.max(0, properties.moisture + sensorJitter.moisture).toFixed(1)} %</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px]">LASER-SIZE</span>
            <span className="text-emerald-400">{Math.max(0, properties.size + sensorJitter.size).toFixed(1)} mm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px]">OPTICAL-REF</span>
            <span className="text-cyan-400">{Math.max(0, 50 + sensorJitter.ref).toFixed(1)} %</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyGauge({ label, value, unit, max, color, bg }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className="bg-[#051021] border border-border rounded p-2 flex flex-col justify-between">
      <div className="text-[10px] text-slate-500 font-mono mb-1">{label}</div>
      <div className={cn("text-lg font-bold", color)}>
        {value.toFixed(1)} <span className="text-xs font-normal text-slate-500">{unit}</span>
      </div>
      <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
        <div className={cn("h-full transition-all duration-300", bg)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
