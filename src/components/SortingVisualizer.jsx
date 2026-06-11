import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const colorMap = {
  1: '#10b981', // Organic
  2: '#3b82f6', // Light
  3: '#f59e0b', // Heavy
  4: '#ef4444'  // Unknown
};

export function SortingVisualizer({ currentParticle }) {
  const [animatingParticle, setAnimatingParticle] = useState(null);

  useEffect(() => {
    if (!currentParticle) return;
    
    // Trigger animation when a new particle arrives
    setAnimatingParticle(currentParticle);
    const timer = setTimeout(() => {
      setAnimatingParticle(null);
    }, 1500); // clear after animation completes
    
    return () => clearTimeout(timer);
  }, [currentParticle]);

  return (
    <div className="panel-glass w-full h-[280px] flex flex-col">
      <div className="p-3 border-b border-border bg-[#051021]">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
          <Layers className="w-4 h-4 text-cyan-400" /> PNEUMATIC EJECTION VISUALIZER
        </h2>
      </div>
      
      <div className="relative flex-1 bg-[#020617] overflow-hidden tour-visualizer">
        {/* SVG Diagram */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
          
          {/* Main Air Supply Pipe */}
          <path d="M 230,200 L 230,160 L 250,160 L 250,200 Z" fill="url(#pipeGrad)" />
          {/* Air Valve */}
          <circle cx="240" cy="170" r="12" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          <path d="M 235,170 L 245,170" stroke="#0ea5e9" strokeWidth="3" />
          {/* Nozzle Head */}
          <path d="M 225,160 L 255,160 L 245,135 L 235,135 Z" fill="url(#nozzleGrad)" />
          
          {/* Conveyor Belt ending */}
          <path d="M -50,100 L 200,100 L 200,120 L -50,120 Z" fill="#1e293b" />
          <path d="M 180,100 L 200,100 L 200,120 L 180,120 Z" fill="#334155" />
          {/* Roller */}
          <circle cx="190" cy="110" r="10" fill="#0f172a" />

          {/* Compartment Bins arranged in an arc */}
          {[
            { id: 1, color: '#10b981', x: 350 },
            { id: 2, color: '#3b82f6', x: 450 },
            { id: 3, color: '#f59e0b', x: 550 },
            { id: 4, color: '#ef4444', x: 650 }
          ].map(bin => (
            <g key={bin.id} transform={`translate(${bin.x}, 140)`}>
              {/* Back lip */}
              <path d="M 5,0 L 55,0 L 45,10 L 15,10 Z" fill={bin.color} opacity="0.3" />
              {/* Main bin body */}
              <path d="M 0,10 L 60,10 L 50,60 L 10,60 Z" fill={bin.color} fillOpacity="0.15" stroke={bin.color} strokeWidth="2" />
              <text x="30" y="45" fill={bin.color} fontSize="14" textAnchor="middle" fontWeight="bold">0{bin.id}</text>
            </g>
          ))}

          {/* Ejection Animation Air Blast */}
          {animatingParticle && (
            <path 
              d={`M 240,135 Q ${240 + (animatingParticle.target * 30)},90 240,50`} 
              stroke="#00f2fe" strokeWidth="12" fill="none" opacity="0.5"
              strokeDasharray="15 10"
              className="animate-pulse-fast"
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="nozzleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated Particle HTML (easier to style with glow than SVG) */}
        {animatingParticle && (
          <div 
            className="absolute w-6 h-6 rounded-sm shadow-lg transition-all ease-in-out duration-[1000ms]"
            style={{
              backgroundColor: colorMap[animatingParticle.target],
              boxShadow: `0 0 15px ${colorMap[animatingParticle.target]}`,
              // Custom animation trajectory based on target
              left: `calc(${180 + (animatingParticle.target * 115)}px)`,
              top: '150px',
              animation: `ejectToBin${animatingParticle.target} 1s forwards cubic-bezier(0.25, 1, 0.5, 1)`
            }}
          />
        )}

        <style>{`
          @keyframes ejectToBin1 {
            0% { left: 180px; top: 90px; transform: scale(1) rotate(0deg); }
            50% { top: 40px; transform: scale(1.5) rotate(180deg); }
            100% { left: 380px; top: 150px; transform: scale(0.5) rotate(360deg); opacity: 0; }
          }
          @keyframes ejectToBin2 {
            0% { left: 180px; top: 90px; transform: scale(1) rotate(0deg); }
            50% { top: 20px; transform: scale(1.5) rotate(180deg); }
            100% { left: 480px; top: 150px; transform: scale(0.5) rotate(360deg); opacity: 0; }
          }
          @keyframes ejectToBin3 {
            0% { left: 180px; top: 90px; transform: scale(1) rotate(0deg); }
            50% { top: 0px; transform: scale(1.5) rotate(180deg); }
            100% { left: 580px; top: 150px; transform: scale(0.5) rotate(360deg); opacity: 0; }
          }
          @keyframes ejectToBin4 {
            0% { left: 180px; top: 90px; transform: scale(1) rotate(0deg); }
            50% { top: -20px; transform: scale(1.5) rotate(180deg); }
            100% { left: 680px; top: 150px; transform: scale(0.5) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
