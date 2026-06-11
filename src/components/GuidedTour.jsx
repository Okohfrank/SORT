import React, { useState, useEffect } from 'react';

const steps = [
  {
    target: null,
    title: 'Welcome to SORT Dashboard',
    content: 'This interface allows you to monitor and control the ChemXAI pneumatic waste sorting system in real-time. Let us take a quick tour.',
  },
  {
    target: '.tour-controls',
    title: 'System Controls',
    content: 'Use these controls to Start, Pause, or Stop the sorting simulation or live hardware.',
  },
  {
    target: '.tour-ai',
    title: 'AI Backend',
    content: 'Toggle this switch to connect directly to your custom AI Backend instead of running the local simulation.',
  },
  {
    target: '.tour-properties',
    title: 'Material Properties',
    content: 'This panel shows the advanced Material Property estimations directly calculated by the ChemXAI Computer Vision model (Density, Mass, Moisture, etc).',
  },
  {
    target: '.tour-visualizer',
    title: 'Sorting Visualizer',
    content: 'Watch as the AI predicts the correct air-jet pulse duration to eject particles into their designated bins.',
  }
];

export function GuidedTour() {
  const [run, setRun] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('sort_tour_completed');
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  if (!run) return null;

  const step = steps[currentStep];

  // Optional: highlight logic if we wanted, but for simplicity we'll just show a modal tour
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a192f] border border-[#1e2d4a] rounded-xl shadow-2xl p-6 max-w-md w-full relative">
        <div className="text-cyan-400 font-bold mb-2 uppercase tracking-widest text-xs">
          Step {currentStep + 1} of {steps.length}
        </div>
        <h2 className="text-xl font-bold text-white mb-4">{step.title}</h2>
        <p className="text-slate-300 mb-8 leading-relaxed">
          {step.content}
        </p>

        <div className="flex justify-between items-center">
          <button 
            onClick={() => {
              setRun(false);
              localStorage.setItem('sort_tour_completed', 'true');
            }}
            className="text-slate-400 hover:text-white text-sm"
          >
            Skip Tour
          </button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-cyan-400 border border-cyan-400/30 rounded hover:bg-cyan-400/10 transition-colors"
              >
                Back
              </button>
            )}
            
            <button 
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(prev => prev + 1);
                } else {
                  setRun(false);
                  localStorage.setItem('sort_tour_completed', 'true');
                }
              }}
              className="px-4 py-2 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition-colors"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
