/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface AdjustmentPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ onApplyAdjustment, isLoading }) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [contrast, setContrast] = useState(0);

  const presets = [
    { name: 'Blur Background', prompt: 'Apply a realistic depth-of-field effect, making the background blurry while keeping the main subject in sharp focus.' },
    { name: 'Enhance Details', prompt: 'Slightly enhance the sharpness and details of the image without making it look unnatural.' },
    { name: 'Warmer Lighting', prompt: 'Adjust the color temperature to give the image warmer, golden-hour style lighting.' },
    { name: 'Studio Light', prompt: 'Add dramatic, professional studio lighting to the main subject.' },
  ];

  const activePrompt = selectedPresetPrompt || customPrompt;

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
    setContrast(0); // Reset other controls
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
    setContrast(0); // Reset other controls
  };
  
  const handleContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContrast(parseInt(e.target.value, 10));
    // Clear other inputs to avoid confusion
    setSelectedPresetPrompt(null);
    setCustomPrompt('');
  };

  const handleContrastApply = () => {
    const currentContrast = contrast; // Capture value before state reset
    if (currentContrast === 0 || isLoading) return;

    let prompt = '';
    if (currentContrast > 0) {
      prompt = `Increase contrast by ${currentContrast}%`;
    } else {
      prompt = `Decrease contrast by ${-currentContrast}%`;
    }
    onApplyAdjustment(prompt);
    // After triggering the adjustment, reset slider for the next operation
    setContrast(0);
  };

  const handleApply = () => {
    if (activePrompt) {
      onApplyAdjustment(activePrompt);
    }
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">Apply a Professional Adjustment</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset.prompt)}
            disabled={isLoading}
            className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${selectedPresetPrompt === preset.prompt ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
          >
            {preset.name}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col gap-2 pt-2">
          <div className="flex justify-between items-center">
              <label htmlFor="contrast-slider" className="font-medium text-gray-300">Contrast</label>
              <span className="text-sm font-mono bg-gray-900/50 text-gray-300 px-2 py-1 rounded-md w-16 text-center">{contrast > 0 ? '+' : ''}{contrast}%</span>
          </div>
          <input
              id="contrast-slider"
              type="range"
              min="-50"
              max="50"
              step="1"
              value={contrast}
              onChange={handleContrastChange}
              onMouseUp={handleContrastApply}
              onTouchEnd={handleContrastApply}
              disabled={isLoading}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Contrast adjustment slider"
          />
      </div>
      
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span>Or</span>
          <div className="flex-grow h-px bg-gray-700"></div>
      </div>


      <input
        type="text"
        value={customPrompt}
        onChange={handleCustomChange}
        placeholder="Describe a custom adjustment (e.g., 'change background to a forest')"
        className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
        disabled={isLoading}
      />

      {activePrompt && (
        <div className="animate-fade-in flex flex-col gap-4 pt-2">
            <button
                onClick={handleApply}
                className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading || !activePrompt.trim()}
            >
                Apply Adjustment
            </button>
        </div>
      )}
    </div>
  );
};

export default AdjustmentPanel;