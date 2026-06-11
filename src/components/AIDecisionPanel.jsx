import React from 'react';
import { BrainCircuit, Target, Wind, Clock } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const colorMap = {
  'Organic': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  'HDPE/PP': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'PET/PVC': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  'Unknown': 'text-red-400 bg-red-400/10 border-red-400/30'
};

export function AIDecisionPanel({ currentParticle }) {
  if (!currentParticle) {
    return (
      <div className="panel-glass w-full flex flex-col items-center justify-center text-slate-500 min-h-[350px]">
        <BrainCircuit className="w-12 h-12 mb-4 opacity-50" />
        <p>AWAITING SIGNAL...</p>
      </div>
    );
  }

  const { type, confidence, pressure, pulse, target } = currentParticle;
  const colorClass = colorMap[type] || colorMap['Unknown'];

  return (
    <div className="panel-glass w-full flex flex-col flex-1 min-h-[350px] overflow-y-auto">
      <div className="p-3 border-b border-border bg-[#051021] flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
          <BrainCircuit className="w-4 h-4 text-cyan-400" /> AI DECISION MATRIX
        </h2>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Classification */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1 font-mono">DETECTED MATERIAL</p>
            <div className={cn("inline-block px-3 py-1 rounded border text-lg font-bold tracking-wider", colorClass)}>
              {type}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1 font-mono">CONFIDENCE</p>
            <p className="text-2xl font-light text-white">
              {(confidence * 100).toFixed(1)}<span className="text-slate-500 text-lg">%</span>
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-border my-4" />

        {/* Pneumatic Specs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#051021] border border-border rounded p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
              <Wind className="w-4 h-4 text-cyan-500" /> PRESSURE
            </div>
            <p className="text-xl font-semibold text-cyan-400">
              {pressure} <span className="text-sm font-normal text-cyan-700">kPa</span>
            </p>
          </div>
          
          <div className="bg-[#051021] border border-border rounded p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
              <Clock className="w-4 h-4 text-electric" /> PULSE DUR.
            </div>
            <p className="text-xl font-semibold text-white">
              {pulse} <span className="text-sm font-normal text-slate-500">ms</span>
            </p>
          </div>
        </div>

        {/* Target */}
        <div className="mt-4 flex items-center justify-between bg-electric/20 border border-electric/40 rounded p-3">
          <div className="flex items-center gap-2 text-sm text-slate-300 font-mono">
            <Target className="w-4 h-4 text-emerald-400" /> TARGET ROUTE
          </div>
          <div className="text-lg font-bold text-white tracking-widest">
            BIN_0{target}
          </div>
        </div>
      </div>
    </div>
  );
}
