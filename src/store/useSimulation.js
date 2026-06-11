import { useReducer, useEffect, useCallback } from 'react';

// Initial state reading from localStorage
const getInitialState = () => {
  try {
    const saved = localStorage.getItem('sortai_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        isRunning: false,
        isPaused: false,
        sensitivity: parsed.sensitivity ?? 0.75,
        conveyorSpeed: parsed.conveyorSpeed ?? 5,
        useRealBackend: parsed.useRealBackend ?? false,
        currentParticle: null,
        history: parsed.history || [],
        stats: parsed.stats || { totalSorted: 0, accuracy: 98.5, sessionStartTime: Date.now() },
        compartments: parsed.compartments || [
          { id: 1, name: 'Organic', type: 'Organic', count: 0, capacity: 500 },
          { id: 2, name: 'Light Plastics', type: 'HDPE/PP', count: 0, capacity: 500 },
          { id: 3, name: 'Heavy Plastics', type: 'PET/PVC', count: 0, capacity: 500 },
          { id: 4, name: 'Unknown', type: 'Unknown', count: 0, capacity: 200 },
        ],
        accuracyHistory: parsed.accuracyHistory || []
      };
    }
  } catch (e) {
    console.error("Failed to load local storage", e);
  }
  
  return {
    isRunning: false,
    isPaused: false,
    sensitivity: 0.75,
    conveyorSpeed: 5,
    useRealBackend: false,
    currentParticle: null,
    history: [],
    stats: { totalSorted: 0, accuracy: 98.5, sessionStartTime: Date.now() },
    compartments: [
      { id: 1, name: 'Organic', type: 'Organic', count: 0, capacity: 500 },
      { id: 2, name: 'Light Plastics', type: 'HDPE/PP', count: 0, capacity: 500 },
      { id: 3, name: 'Heavy Plastics', type: 'PET/PVC', count: 0, capacity: 500 },
      { id: 4, name: 'Unknown', type: 'Unknown', count: 0, capacity: 200 },
    ],
    accuracyHistory: [],
  };
};

const materials = [
  { type: 'Organic', pMin: 15, pMax: 40, dMin: 30, dMax: 80, target: 1 },
  { type: 'HDPE/PP', pMin: 40, pMax: 80, dMin: 60, dMax: 150, target: 2 },
  { type: 'PET/PVC', pMin: 80, pMax: 140, dMin: 120, dMax: 280, target: 3 },
  { type: 'Unknown', pMin: 0, pMax: 0, dMin: 0, dMax: 0, target: 4 }
];

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, isRunning: true, isPaused: false, stats: { ...state.stats, sessionStartTime: state.isRunning ? state.stats.sessionStartTime : Date.now() } };
    case 'PAUSE':
      return { ...state, isPaused: true };
    case 'STOP':
      return { ...state, isRunning: false, isPaused: false, currentParticle: null };
    case 'SET_SENSITIVITY':
      return { ...state, sensitivity: action.payload };
    case 'SET_SPEED':
      return { ...state, conveyorSpeed: action.payload };
    case 'TOGGLE_BACKEND':
      return { ...state, useRealBackend: action.payload };
    case 'SET_CAMERA_FRAME':
      return { ...state, cameraFrame: action.payload };
    case 'RESET_STORAGE':
      localStorage.removeItem('sortai_data');
      return getInitialState();
    case 'PROCESS_PARTICLE': {
      const p = action.payload;
      const targetCompartment = p.confidence >= state.sensitivity ? p.target : 4;
      const materialLabel = p.confidence >= state.sensitivity ? p.type : 'Unknown';
      
      const particle = {
        ...p,
        id: state.stats.totalSorted + 1,
        time: new Date().toLocaleTimeString(),
        compartment: targetCompartment,
        type: materialLabel
      };

      const newHistory = [particle, ...state.history].slice(0, 50);
      
      const newCompartments = state.compartments.map(c => 
        c.id === targetCompartment ? { ...c, count: c.count + 1 } : c
      );

      const total = state.stats.totalSorted + 1;
      const accurateCount = newHistory.filter(x => x.confidence >= state.sensitivity).length;
      const currentAccuracy = (accurateCount / Math.max(newHistory.length, 1)) * 100;
      
      const newAccuracyHistory = [...state.accuracyHistory, {
        time: particle.time,
        accuracy: currentAccuracy
      }].slice(-20);

      return {
        ...state,
        currentParticle: particle,
        history: newHistory,
        compartments: newCompartments,
        stats: {
          ...state.stats,
          totalSorted: total,
          accuracy: currentAccuracy,
        },
        accuracyHistory: newAccuracyHistory,
        cameraFrame: p.cameraFrame !== undefined ? p.cameraFrame : state.cameraFrame
      };
    }
    default:
      return state;
  }
}

export function useSimulation() {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('sortai_data', JSON.stringify({
      history: state.history,
      stats: state.stats,
      compartments: state.compartments,
      accuracyHistory: state.accuracyHistory,
      sensitivity: state.sensitivity,
      conveyorSpeed: state.conveyorSpeed,
      useRealBackend: state.useRealBackend
    }));
  }, [state.history, state.stats, state.compartments, state.accuracyHistory, state.sensitivity, state.conveyorSpeed, state.useRealBackend]);

  // Generate simulated particle
  const generateParticle = useCallback(() => {
    // Pick random material based on weights
    const rand = Math.random();
    let matIndex = 0;
    if (rand > 0.4) matIndex = 1;
    if (rand > 0.7) matIndex = 2;
    if (rand > 0.95) matIndex = 3;
    
    const mat = materials[matIndex];
    const confidence = 0.6 + (Math.random() * 0.4); // 0.6 to 1.0
    
    // Calculate pressure and duration
    const pressure = Math.floor(Math.random() * (mat.pMax - mat.pMin) + mat.pMin);
    const pulse = Math.floor(Math.random() * (mat.dMax - mat.dMin) + mat.dMin);
    
    // Calculate properties based on material type for realistic simulation
    const properties = {
      density: matIndex === 0 ? 300 + Math.random() * 500 : (matIndex === 1 ? 900 + Math.random() * 100 : (matIndex === 2 ? 1300 + Math.random() * 150 : 0)),
      mass: 50 + Math.random() * 200,
      size: 20 + Math.random() * 150,
      dragCoeff: 0.4 + Math.random() * 0.8,
      moisture: matIndex === 0 ? 40 + Math.random() * 40 : Math.random() * 5,
      shapeFactor: 0.5 + Math.random() * 0.4
    };

    dispatch({
      type: 'PROCESS_PARTICLE',
      payload: {
        type: mat.type,
        confidence,
        pressure,
        pulse,
        target: mat.target,
        properties
      }
    });
  }, []);

  useEffect(() => {
    let ws = null;
    let interval;

    if (state.isRunning && !state.isPaused) {
      if (state.useRealBackend) {
        ws = new WebSocket('ws://127.0.0.1:8000/ws');
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PARTICLE_DATA') {
              const particle = data.particle;
              
              dispatch({
                type: 'PROCESS_PARTICLE',
                payload: {
                  type: particle.type,
                  confidence: particle.confidence,
                  pressure: particle.pressure,
                  pulse: particle.pulse,
                  target: particle.compartment,
                  cameraFrame: data.image || null, // Optimization: Batch frame update
                  properties: {
                    density: particle.density,
                    mass: particle.mass,
                    size: particle.size,
                    dragCoeff: 0.5,
                    moisture: particle.moisture,
                    shapeFactor: 0.8
                  }
                }
              });
            }
          } catch (e) {
            console.error("WebSocket message parsing error:", e);
          }
        };
      } else {
        const intervalTime = Math.max(500, 3000 - (state.conveyorSpeed * 200));
        interval = setInterval(generateParticle, intervalTime);
        dispatch({ type: 'SET_CAMERA_FRAME', payload: null });
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (ws) ws.close();
    };
  }, [state.isRunning, state.isPaused, state.conveyorSpeed, state.useRealBackend, generateParticle]);

  return { state, dispatch };
}
