import React from 'react';
import { Database, Download } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const rowColorMap = {
  'Organic': 'text-emerald-400',
  'HDPE/PP': 'text-blue-400',
  'PET/PVC': 'text-orange-400',
  'Unknown': 'text-red-400'
};

export function DataLogTable({ history }) {
  const handleExport = () => {
    if (history.length === 0) return;
    const headers = "ID,Time,Material,Confidence,Pressure,Pulse,Compartment\n";
    const csv = history.map(p => 
      `${p.id},${p.time},${p.type},${p.confidence.toFixed(3)},${p.pressure},${p.pulse},${p.compartment}`
    ).join("\n");
    
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_sorting_log_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-glass w-full h-[350px] flex flex-col">
      <div className="p-3 border-b border-border bg-[#051021] flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
          <Database className="w-4 h-4 text-cyan-400" /> EVENT LOG
        </h2>
        <button 
          onClick={handleExport}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors bg-electric/20 px-2 py-1 rounded border border-electric/40"
        >
          <Download className="w-3 h-3" /> EXPORT CSV
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-[#020617]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-[#051021] shadow-md z-10 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">TIME</th>
              <th className="px-4 py-2 font-medium">MATERIAL</th>
              <th className="px-4 py-2 font-medium text-right">CONF.</th>
              <th className="px-4 py-2 font-medium text-right">PRESS.</th>
              <th className="px-4 py-2 font-medium text-right">PULSE</th>
              <th className="px-4 py-2 font-medium text-center">BIN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {history.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-600">NO DATA AVAILABLE</td>
              </tr>
            ) : (
              history.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-1.5 text-slate-500">{p.id.toString().padStart(4, '0')}</td>
                  <td className="px-4 py-1.5 text-slate-400">{p.time}</td>
                  <td className={cn("px-4 py-1.5 font-bold", rowColorMap[p.type] || 'text-slate-400')}>{p.type}</td>
                  <td className="px-4 py-1.5 text-right text-slate-300">{(p.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-1.5 text-right text-cyan-400">{p.pressure} <span className="text-[10px] text-slate-600">kPa</span></td>
                  <td className="px-4 py-1.5 text-right text-white">{p.pulse} <span className="text-[10px] text-slate-600">ms</span></td>
                  <td className="px-4 py-1.5 text-center text-slate-300">0{p.compartment}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
