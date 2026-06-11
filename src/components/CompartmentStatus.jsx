import React from 'react';
import { Archive } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const colorMap = {
  1: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400' },
  2: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400' },
  3: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400' },
  4: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-400' }
};

export function CompartmentStatus({ compartments }) {
  return (
    <div className="panel-glass w-full h-[280px] flex flex-col overflow-y-auto">
      <div className="p-3 border-b border-border bg-[#051021] sticky top-0 z-10">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
          <Archive className="w-4 h-4 text-cyan-400" /> COMPARTMENT STATUS
        </h2>
      </div>
      
      <div className="flex-1 p-2 grid grid-cols-4 gap-2 items-end">
        {compartments.map(c => {
          const colors = colorMap[c.id];
          const fillPercent = Math.min((c.count / c.capacity) * 100, 100);
          const isWarning = fillPercent >= 80;

          return (
            <div key={c.id} className="flex flex-col items-center w-full">
              <span className="text-[9px] xl:text-[10px] text-slate-400 mb-2 font-mono truncate w-full text-center">{c.type}</span>
              
              {/* The bar */}
              <div 
                className={cn(
                  "relative w-full max-w-[40px] h-[120px] rounded-t-sm border-2 border-b-0 overflow-hidden bg-[#051021]",
                  colors.border,
                  isWarning ? 'animate-flash-red' : ''
                )}
              >
                {/* Fill element */}
                <div 
                  className={cn("absolute bottom-0 left-0 right-0 transition-all duration-500", colors.bg)}
                  style={{ height: `${fillPercent}%`, boxShadow: `0 0 10px ${colors.bg}` }}
                />
              </div>
              
              <div className="mt-3 text-center">
                <p className={cn("text-lg font-bold", colors.text)}>{fillPercent.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 font-mono">{c.count}/{c.capacity}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
