import React, { useEffect, useState } from 'react';
import { Camera, Maximize2, Flag, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const colorMap = {
  'Organic': '#10b981',
  'HDPE/PP': '#3b82f6',
  'PET/PVC': '#f59e0b',
  'Unknown': '#ef4444'
};

export function CameraFeed({ currentParticle, isRunning, isPaused, useRealBackend, cameraFrame }) {
  const [particles, setParticles] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const [flagSuccess, setFlagSuccess] = useState(false);

  useEffect(() => {
    if (!currentParticle || useRealBackend) return;
    
    const newVisualParticle = {
      ...currentParticle,
      id: Math.random().toString(), 
      x: 0,
      y: 30 + Math.random() * 40,
    };
    
    setParticles(prev => [...prev, newVisualParticle]);
  }, [currentParticle, useRealBackend]);

  useEffect(() => {
    if (!isRunning || isPaused || useRealBackend) return;

    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({ ...p, x: p.x + 2 }))
          .filter(p => p.x < 110)
      );
    }, 50);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, useRealBackend]);

  const submitFlag = async (actual) => {
    setShowFlagMenu(false);
    try {
      await fetch("http://127.0.0.1:8000/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual_class: actual })
      });
      setFlagSuccess(true);
      setTimeout(() => setFlagSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend database.");
    }
  };

  const FlagMenuOverlay = () => {
    if (!showFlagMenu) return null;
    return (
      <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
        <h3 className="text-white text-lg font-bold mb-6">What is the actual material?</h3>
        <div className="flex gap-4">
          <button onClick={() => submitFlag('Organic')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all">
            Organic
          </button>
          <button onClick={() => submitFlag('HDPE/PP')} className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
            HDPE / PP
          </button>
          <button onClick={() => submitFlag('PET/PVC')} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all">
            PET / PVC
          </button>
        </div>
        <button onClick={() => setShowFlagMenu(false)} className="mt-8 text-slate-400 hover:text-white underline">
          Cancel
        </button>
      </div>
    );
  };

  const SuccessOverlay = () => {
    if (!flagSuccess) return null;
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-4 py-2 rounded-full shadow-lg z-30 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
        <CheckCircle2 className="w-5 h-5" /> Saved to Training Database!
      </div>
    );
  };

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <Camera className="w-6 h-6" /> LIVE FEED OVERHEAD
          </h2>
          <div className="flex gap-4 items-center">
            {useRealBackend && (
              <button 
                onClick={() => setShowFlagMenu(true)}
                className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded border border-red-500/50 hover:bg-red-500/40 transition-colors shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              >
                <Flag className="w-4 h-4" /> FLAG AI ERROR
              </button>
            )}
            <button onClick={() => setIsExpanded(false)} className="text-slate-400 hover:text-white">
              Close Fullscreen
            </button>
          </div>
        </div>
        <div className="relative flex-1 bg-black overflow-hidden border border-border/50 rounded flex items-center justify-center">
          <FlagMenuOverlay />
          <SuccessOverlay />
          
          {isRunning && !isPaused ? (
            useRealBackend && cameraFrame ? (
              <img src={cameraFrame} className="w-full h-full object-contain" alt="Live Feed" />
            ) : (
              <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 mix-blend-screen">
                <source src="https://assets.mixkit.co/videos/preview/mixkit-conveyor-belt-in-a-factory-4034-large.mp4" type="video/mp4" />
              </video>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono">
              SYSTEM {isPaused ? 'PAUSED' : 'OFFLINE'}
            </div>
          )}
          
          {!useRealBackend && particles.map(p => {
            const color = colorMap[p.type] || colorMap['Unknown'];
            return (
              <div 
                key={p.id}
                className="absolute w-24 h-24 border-2 transition-all duration-75"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  borderColor: color,
                  boxShadow: `0 0 15px ${color}60, inset 0 0 15px ${color}60`,
                  backgroundColor: `${color}30`
                }}
              >
                <div 
                  className="absolute -top-7 left-[-2px] text-sm font-mono px-2 py-0.5 whitespace-nowrap text-white"
                  style={{ backgroundColor: color }}
                >
                  {p.type} {(p.confidence * 100).toFixed(0)}%
                </div>
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: color, margin: '-4px' }} />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: color, margin: '-4px' }} />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: color, margin: '-4px' }} />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: color, margin: '-4px' }} />
              </div>
            );
          })}

          {!useRealBackend && (
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMCAwTDIwIDBMNDAgMEw0MCA0MEwwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')] pointer-events-none opacity-50" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="panel-glass flex-1 flex flex-col min-h-[350px]">
      <div className="p-3 border-b border-border flex justify-between items-center bg-[#051021] z-10 relative">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
          <Camera className="w-4 h-4 text-cyan-400" /> FEED: CAM_01_OVERHEAD
        </h2>
        <div className="flex gap-3 items-center text-xs font-mono">
          {useRealBackend && (
             <button onClick={() => setShowFlagMenu(true)} title="Flag AI Error" className="text-red-400 hover:text-red-300 transition-colors animate-pulse">
               <Flag className="w-4 h-4" />
             </button>
          )}
          <span className={cn("px-2 py-0.5 rounded", isRunning ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
            {isRunning ? 'LIVE' : 'OFFLINE'}
          </span>
          <Maximize2 
            className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" 
            onClick={() => setIsExpanded(true)}
          />
        </div>
      </div>
      
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center group">
        <FlagMenuOverlay />
        <SuccessOverlay />
        
        {useRealBackend && cameraFrame ? (
          <img src={cameraFrame} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Live Feed" />
        ) : (
          <div className={cn(
              "absolute inset-0 opacity-40 border-y border-[#333]", 
              "bg-[linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.1)_100%)] bg-[length:40px_100%]",
              (isRunning && !isPaused && !useRealBackend) ? "animate-conveyor" : ""
            )}
            style={{ top: '20%', bottom: '20%' }}
          />
        )}
        
        {!useRealBackend && particles.map(p => {
          const color = colorMap[p.type] || colorMap['Unknown'];
          return (
            <div 
              key={p.id}
              className="absolute w-12 h-12 border-2 transition-all duration-75"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                borderColor: color,
                boxShadow: `0 0 10px ${color}40, inset 0 0 10px ${color}40`,
                backgroundColor: `${color}20`
              }}
            >
              <div 
                className="absolute -top-5 left-[-2px] text-[9px] font-mono px-1 whitespace-nowrap text-white"
                style={{ backgroundColor: color }}
              >
                {p.type} {(p.confidence * 100).toFixed(0)}%
              </div>
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: color, margin: '-4px' }} />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: color, margin: '-4px' }} />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: color, margin: '-4px' }} />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: color, margin: '-4px' }} />
            </div>
          );
        })}
        
        {!useRealBackend && (
          <>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMCAwTDIwIDBMNDAgMEw0MCA0MEwwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none" />
          </>
        )}
      </div>
    </div>
  );
}
