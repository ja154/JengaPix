/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { MagicWandIcon } from './icons';

interface RemoveBgPanelProps {
  onRemoveBackground: () => void;
  isLoading: boolean;
}

const RemoveBgPanel: React.FC<RemoveBgPanelProps> = ({ onRemoveBackground, isLoading }) => {
  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-xl font-semibold text-center text-gray-200">Remove Background</h3>
      <p className="text-md text-center text-gray-400 max-w-md">
        Automatically detect and remove the background from your image, leaving a transparent canvas.
      </p>
      
      <div className="mt-4">
        <button
            onClick={onRemoveBackground}
            disabled={isLoading}
            className="relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-br from-purple-600 to-indigo-500 rounded-full group hover:from-purple-500 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/40 disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
        >
            <MagicWandIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:scale-110" />
            Remove Background
        </button>
      </div>
    </div>
  );
};

export default RemoveBgPanel;