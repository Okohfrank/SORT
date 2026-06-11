import React, { useState, useEffect } from 'react';
import { Activity, Zap, Droplets, Maximize, Weight } from 'lucide-react';

export function LiveSensorFeed({ currentParticle, isRunning, isPaused }) {
  // We'll generate jittery visual values based on base values
  const [sensorData, setSensorData] = useState({
    loadCell: 0,
    irMoisture: 0,
    laserSize: 0,
    opticalReflectance: 0
  });

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        // Base values (use current particle if exists, else idle noise)
        const baseMass = currentParticle?.properties?.mass || 5;
        const baseMoisture = currentParticle?.properties?.moisture || 2;
        const baseSize = currentParticle?.properties?.size || 10;

        setSensorData({
          loadCell: Math.max(0, baseMass + (Math.random() * 4 - 2)),
          irMoisture: Math.max(0, baseMoisture + (Math.random() * 2 - 1)),
          laserSize: Math.max(0, baseSize + (Math.random() * 5 - 2.5)),
          opticalReflectance: Math.random() * 100
        });
      }, 150); // Fast update for realistic sensor noise
    } else {
      // Zero out when stopped
      setSensorData({
        loadCell: 0,
        irMoisture: 0,
        laserSize: 0,
        opticalReflectance: 0
      });
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, currentParticle]);

  const SensorGauge = ({ label, value, unit, icon: Icon, colorClass }) => (
    <div className="bg-[#0f172a] rounded p-2 flex flex-col justify-between h-full min-h-[80px] border border-border/50 relative overflow-hidden">
      <div className="flex items-center justify-between text-slate-400 mb-1 z-10">
        <span className="text-[10px] font-bold tracking-wider">{label}</span>
        <Icon className={`w-3 h-3 ${colorClass}`} />
      </div>
      <div className="flex items-baseline gap-1 z-10">
        <span className={`text-xl font-mono font-bold ${colorClass}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      
      {/* Background animated bar representing intensity */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-75"
        style={{ width: `${Math.min(100, (value / (unit === '%' ? 100 : 300)) * 100)}%`, color: 'inherit' }}
      />
    </div>
  );

  return (
    <div className="panel-glass w-full flex flex-col h-full min-h-[250px] tour-sensors">
      <div className="p-3 border-b border-border bg-[#051021] flex justify-between items-center">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
          <Activity className="w-4 h-4 text-green-400" /> LIVE SENSOR TELEMETRY
        </h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRunning && !isPaused ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-xs text-slate-500 font-mono">150ms PING</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 flex-1">
          <SensorGauge 
            label="L-CELL (MASS)" 
            value={sensorData.loadCell} 
            unit="g" 
            icon={Weight} 
            colorClass="text-blue-400" 
          />
          <SensorGauge 
            label="IR (MOISTURE)" 
            value={sensorData.irMoisture} 
            unit="%" 
            icon={Droplets} 
            colorClass="text-cyan-400" 
          />
          <SensorGauge 
            label="LASER (SIZE)" 
            value={sensorData.laserSize} 
            unit="mm" 
            icon={Maximize} 
            colorClass="text-purple-400" 
          />
          <SensorGauge 
            label="OPTICAL (REF)" 
            value={sensorData.opticalReflectance} 
            unit="%" 
            icon={Zap} 
            colorClass="text-yellow-400" 
          />
        </div>
        <div className="text-[10px] text-slate-500 text-center font-mono uppercase tracking-wider">
          Raw inputs streaming to ChemXAI Core
        </div>
      </div>
    </div>
  );
}
