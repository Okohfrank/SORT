import React, { useState } from 'react';
import { Play, Pause, Square, Settings, Cpu, Activity, BarChart2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Sidebar({ state, dispatch }) {
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <div className="w-full panel-glass flex flex-col h-full overflow-y-auto">
      {/* Reset Modal Overlay */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-red-500/20 rounded-xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Wipe All Data?</h2>
            </div>
            <p className="text-slate-400 mb-8 leading-relaxed ml-16">
              Are you sure you want to completely wipe all sorting statistics, accuracy history, and compartment data? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2.5 rounded border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  dispatch({ type: 'RESET_STORAGE' });
                  setShowResetModal(false);
                }}
                className="px-5 py-2.5 rounded bg-red-500 hover:bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all text-sm"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          <img src="/ChemXAI.png" alt="ChemXAI Logo" className="w-full h-full object-contain" />
          {state.isRunning && !state.isPaused && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-fast"></span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">SORT</h1>
          <p className="text-xs text-cyan-500 font-medium">SORTING SYSTEM v2.4</p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8">
        {/* Controls */}
        <section className="tour-controls">
          <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" /> System Controls
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => dispatch({ type: 'START' })}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200",
                state.isRunning && !state.isPaused
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-panel border-border text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400"
              )}
            >
              <Play className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold">START</span>
            </button>
            <button
              onClick={() => dispatch({ type: 'PAUSE' })}
              disabled={!state.isRunning}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200",
                state.isPaused
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                  : "bg-panel border-border text-slate-400 hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Pause className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold">PAUSE</span>
            </button>
            <button
              onClick={() => dispatch({ type: 'STOP' })}
              disabled={!state.isRunning}
              className="flex flex-col items-center justify-center p-3 rounded-lg border bg-panel border-border text-slate-400 hover:border-red-500/30 hover:text-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold">STOP</span>
            </button>
          </div>
        </section>

        {/* Parameters */}
        <section className="tour-parameters">
          <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> Tuning Parameters
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Confidence Threshold</span>
                <span className="text-cyan-400 font-mono">{(state.sensitivity * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0.5" max="1.0" step="0.01" 
                value={state.sensitivity}
                onChange={(e) => dispatch({ type: 'SET_SENSITIVITY', payload: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Conveyor Speed</span>
                <span className="text-cyan-400 font-mono">{state.conveyorSpeed}x</span>
              </div>
              <input 
                type="range" 
                min="1" max="10" step="1" 
                value={state.conveyorSpeed}
                onChange={(e) => dispatch({ type: 'SET_SPEED', payload: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
              />
            </div>
          </div>
        </section>

        {/* AI Integration */}
        <section className="tour-ai">
          <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> AI Integration
          </h2>
          <div className="p-4 rounded-lg bg-electric/20 border border-electric/50 mb-6 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Real Backend Mode</span>
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_BACKEND', payload: !state.useRealBackend })}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-colors duration-200",
                  state.useRealBackend ? "bg-cyan-500" : "bg-slate-600"
                )}
              >
                <div className={cn(
                  "w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all duration-200 shadow-sm",
                  state.useRealBackend ? "left-[22px]" : "left-[3px]"
                )} />
              </button>
            </div>
            
            {state.useRealBackend ? (
              <div className="mt-4 pt-4 border-t border-cyan-500/30 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] text-cyan-400 uppercase tracking-wider mb-1 block">Phone IP Camera URL</label>
                <input 
                  type="text" 
                  placeholder="http://192.168...:8080/video"
                  className="w-full bg-black/60 border border-cyan-500/50 rounded px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                  onBlur={(e) => {
                     const url = e.target.value.trim() || "0";
                     fetch("http://127.0.0.1:8000/set_camera", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ url })
                     }).catch(() => console.error("Failed to set camera URL"));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.target.blur();
                  }}
                />
                <p className="text-[9px] text-slate-500 mt-2 leading-tight">
                  Enter your phone's IP Webcam URL and click Enter/away. Leave empty to fallback to your laptop's built-in webcam.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Enable to connect your custom AI model via WebSocket instead of using simulated data.
              </p>
            )}
          </div>

          <button 
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-colors text-xs font-semibold"
          >
            RESET ALL DATA
          </button>
        </section>
      </div>
      
      {/* Footer Status */}
      <div className="p-4 border-t border-border bg-[#051021] flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">SYSTEM STATUS</span>
          {state.isRunning && !state.isPaused ? (
            <span className="text-green-400">ACTIVE</span>
          ) : state.isPaused ? (
            <span className="text-amber-400">PAUSED</span>
          ) : (
            <span className="text-slate-500">STANDBY</span>
          )}
        </div>
        <div className="text-center text-[10px] text-slate-600 pt-2 border-t border-slate-800">
          POWERED BY <span className="font-bold text-slate-400">ChemXAI</span>
        </div>
      </div>
    </div>
  );
}
