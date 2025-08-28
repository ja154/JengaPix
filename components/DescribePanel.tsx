/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

interface DescribePanelProps {
  onGetDescription: () => void;
  isLoading: boolean;
  description: string;
}

const DescribePanel: React.FC<DescribePanelProps> = ({ onGetDescription, isLoading, description }) => {
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const handleCopy = () => {
    if (!description) return;
    navigator.clipboard.writeText(description).then(() => {
      setCopySuccess('Copied!');
    }, () => {
      setCopySuccess('Failed');
    });
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">Get Image Prompt</h3>
      <p className="text-sm text-center text-gray-400 -mt-2">
        Generate a detailed text prompt from the current image.
      </p>
      
      {!description && !isLoading && (
        <button
            onClick={onGetDescription}
            className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
        >
            Generate Prompt
        </button>
      )}

      {description && (
        <div className="relative animate-fade-in">
          <textarea
            readOnly
            value={description}
            className="w-full bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg p-4 text-base resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={6}
            aria-label="Generated image prompt"
          />
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-1 px-3 rounded-md text-sm transition-colors"
            aria-label="Copy prompt to clipboard"
          >
            {copySuccess || 'Copy'}
          </button>
        </div>
      )}

      {description && !isLoading && (
         <button
            onClick={onGetDescription}
            className="w-full bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
        >
            Generate Again
        </button>
      )}
    </div>
  );
};

export default DescribePanel;
