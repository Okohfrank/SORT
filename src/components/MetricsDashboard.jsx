import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Zap, CheckCircle, Clock } from 'lucide-react';

export function MetricsDashboard({ stats, history, isRunning, isPaused, accuracyHistory }) {
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - stats.sessionStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, stats.sessionStartTime]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const ppm = sessionTime > 0 ? ((stats.totalSorted / sessionTime) * 60).toFixed(0) : 0;

  return (
    <div className="panel-glass w-full flex flex-col min-h-[350px] overflow-y-auto">
      <div className="p-3 border-b border-border bg-[#051021] sticky top-0 z-10">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
          <BarChart className="w-4 h-4 text-cyan-400" /> SYSTEM METRICS
        </h2>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4 mb-2">
        <div className="bg-panel border border-border p-3 rounded-lg text-center">
          <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-xs text-slate-500 font-mono mb-1">TOTAL SORTED</p>
          <p className="text-xl font-bold text-white">{stats.totalSorted}</p>
        </div>
        
        <div className="bg-panel border border-border p-3 rounded-lg text-center">
          <TargetIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <p className="text-xs text-slate-500 font-mono mb-1">ACCURACY</p>
          <p className="text-xl font-bold text-cyan-400">{stats.accuracy.toFixed(1)}%</p>
        </div>
        
        <div className="bg-panel border border-border p-3 rounded-lg text-center">
          <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-xs text-slate-500 font-mono mb-1">PARTICLES/MIN</p>
          <p className="text-xl font-bold text-white">{ppm}</p>
        </div>
        
        <div className="bg-panel border border-border p-3 rounded-lg text-center">
          <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-slate-500 font-mono mb-1">SESSION TIME</p>
          <p className="text-xl font-bold text-white">{formatTime(sessionTime)}</p>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={accuracyHistory}>
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 100]} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0a192f', borderColor: '#1e2d4a', color: '#fff' }}
              itemStyle={{ color: '#4facfe' }}
            />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#4facfe" 
              strokeWidth={3}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TargetIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
