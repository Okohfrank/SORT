import React from 'react';
import { useSimulation } from './store/useSimulation';
import { Sidebar } from './components/Sidebar';
import { CameraFeed } from './components/CameraFeed';
import { AIDecisionPanel } from './components/AIDecisionPanel';
import { MaterialPropertiesPanel } from './components/MaterialPropertiesPanel';
import { SortingVisualizer } from './components/SortingVisualizer';
import { CompartmentStatus } from './components/CompartmentStatus';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ConfidenceMonitor } from './components/ConfidenceMonitor';
import { DataLogTable } from './components/DataLogTable';
import { GuidedTour } from './components/GuidedTour';

function App() {
  const { state, dispatch } = useSimulation();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-background font-sans overflow-x-hidden">
      <GuidedTour />
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Left Sidebar */}
      <div className="z-10 lg:w-72 lg:h-screen lg:sticky lg:top-0 shrink-0 border-r border-border shadow-2xl bg-panel/80 backdrop-blur-md">
        <Sidebar state={state} dispatch={dispatch} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 p-4 lg:p-6 z-10 overflow-y-auto">
        
        {/* Top Row: Camera, AI Decision, Material Properties */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
          <div className="xl:col-span-1">
            <CameraFeed 
              currentParticle={state.currentParticle} 
              isRunning={state.isRunning} 
              isPaused={state.isPaused} 
              useRealBackend={state.useRealBackend}
              cameraFrame={state.cameraFrame}
            />
          </div>
          <div className="xl:col-span-1 flex justify-center w-full">
            <AIDecisionPanel 
              currentParticle={state.currentParticle} 
            />
          </div>
          <div className="xl:col-span-1">
            <MaterialPropertiesPanel 
              currentParticle={state.currentParticle} 
            />
          </div>
        </div>

        {/* Middle Row: Visualizer, Status, Metrics */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-5">
            <SortingVisualizer currentParticle={state.currentParticle} />
          </div>
          <div className="xl:col-span-3">
            <CompartmentStatus compartments={state.compartments} />
          </div>
          <div className="xl:col-span-4">
            <MetricsDashboard 
              stats={state.stats} 
              history={state.history} 
              isRunning={state.isRunning} 
              isPaused={state.isPaused}
              accuracyHistory={state.accuracyHistory}
            />
          </div>
        </div>

        {/* Bottom Row: Monitor and Table */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
          <div>
            <ConfidenceMonitor 
              history={state.history} 
              sensitivity={state.sensitivity} 
            />
          </div>
          <div>
            <DataLogTable history={state.history} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
