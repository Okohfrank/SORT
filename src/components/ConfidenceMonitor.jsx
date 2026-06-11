import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export function ConfidenceMonitor({ history, sensitivity }) {
  // Reverse history so new items appear on the right
  const data = [...history].reverse().map((p, i) => ({
    index: i,
    time: p.time,
    confidence: p.confidence,
    isLow: p.confidence < sensitivity
  }));

  // Recharts gradient to color below threshold red
  const off = data.length > 0 ? (1 - ((sensitivity - 0.5) / 0.5)) : 0.5;

  return (
    <div className="panel-glass w-full h-[350px] flex flex-col">
      <div className="p-3 border-b border-border bg-[#051021] flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
          <Activity className="w-4 h-4 text-cyan-400" /> CONFIDENCE MONITOR
        </h2>
        <span className="text-xs font-mono text-slate-500">THRESHOLD: {sensitivity.toFixed(2)}</span>
      </div>

      <div className="flex-1 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.8}/>
                <stop offset="80%" stopColor="#00f2fe" stopOpacity={0.1}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="index" hide />
            <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0a192f', borderColor: '#1e2d4a', color: '#fff' }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: '#00f2fe' }}
              formatter={(value) => [(value * 100).toFixed(1) + '%', 'Confidence']}
            />
            <Area 
              type="monotone" 
              dataKey="confidence" 
              stroke="#00f2fe" 
              fillOpacity={1} 
              fill="url(#colorConf)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
