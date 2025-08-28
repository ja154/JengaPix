/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface TextPanelProps {
  onApplyTextEdit: (oldText: string, newText: string) => void;
  isLoading: boolean;
}

const TextPanel: React.FC<TextPanelProps> = ({ onApplyTextEdit, isLoading }) => {
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');

  const canApply = oldText.trim() && newText.trim() && !isLoading;

  const handleApply = () => {
    if (canApply) {
      onApplyTextEdit(oldText, newText);
    }
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">Edit Text in Image</h3>
      <p className="text-sm text-center text-gray-400 -mt-2">
        Tell the AI what text to find and what to replace it with.
      </p>
      
      <div className="flex flex-col gap-3 pt-2">
        <input
          type="text"
          value={oldText}
          onChange={(e) => setOldText(e.target.value)}
          placeholder="Text to replace (e.g., 'Grand Opening')"
          className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
          disabled={isLoading}
          aria-label="Text to replace"
        />
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New text (e.g., 'Grand Re-Opening')"
          className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
          disabled={isLoading}
          aria-label="New text"
        />
      </div>

      <div className="flex flex-col gap-4 pt-2">
          <button
              onClick={handleApply}
              className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
              disabled={!canApply}
          >
              Apply Text Edit
          </button>
      </div>
    </div>
  );
};

export default TextPanel;
