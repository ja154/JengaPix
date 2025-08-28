/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import type { TextStyle } from '../services/geminiService';

interface TextPanelProps {
  onApplyTextEdit: (oldText: string, newText: string, style: TextStyle) => void;
  isLoading: boolean;
}

const TextPanel: React.FC<TextPanelProps> = ({ onApplyTextEdit, isLoading }) => {
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [font, setFont] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const canApply = oldText.trim() && newText.trim() && !isLoading;

  const handleApply = () => {
    if (canApply) {
      const style: TextStyle = {};
      if (font.trim()) style.font = font.trim();
      if (size.trim()) style.size = size.trim();
      if (color.trim()) style.color = color.trim();
      if (isBold) style.bold = true;
      if (isItalic) style.italic = true;
      onApplyTextEdit(oldText, newText, style);
    }
  };
  
  const commonInputClass = "flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base";
  
  const isValidHex = (colorStr: string) => /^#[0-9A-F]{6}$/i.test(colorStr);

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
          className={commonInputClass}
          disabled={isLoading}
          aria-label="Text to replace"
        />
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New text (e.g., 'Grand Re-Opening')"
          className={commonInputClass}
          disabled={isLoading}
          aria-label="New text"
        />
      </div>

      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span>Style Options (Optional)</span>
          <div className="flex-grow h-px bg-gray-700"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={font}
          onChange={(e) => setFont(e.target.value)}
          placeholder="Font (e.g., 'Cursive', 'Sans-serif')"
          className={commonInputClass}
          disabled={isLoading}
          aria-label="Font style"
        />
        <input
          type="text"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Size (e.g., 'Large', '18pt')"
          className={commonInputClass}
          disabled={isLoading}
          aria-label="Font size"
        />
        <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition w-full overflow-hidden">
          <div className="relative flex items-center justify-center p-2 h-full">
              <input
                  type="color"
                  value={isValidHex(color) ? color : '#ffffff'}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                  disabled={isLoading}
                  aria-label="Font color picker"
              />
          </div>
          <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Color (e.g., 'Golden')"
              className="flex-grow bg-transparent text-gray-200 p-4 focus:outline-none w-full disabled:cursor-not-allowed disabled:opacity-60 text-base border-l border-gray-700"
              disabled={isLoading}
              aria-label="Font color text input"
          />
        </div>
        <div className="flex items-center justify-start gap-6 sm:justify-center bg-gray-800/50 border border-gray-700/60 rounded-lg px-4">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition">
                <input
                    type="checkbox"
                    checked={isBold}
                    onChange={(e) => setIsBold(e.target.checked)}
                    disabled={isLoading}
                    className="w-5 h-5 accent-blue-500"
                />
                <span className="font-bold">Bold</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition">
                <input
                    type="checkbox"
                    checked={isItalic}
                    onChange={(e) => setIsItalic(e.target.checked)}
                    disabled={isLoading}
                    className="w-5 h-5 accent-blue-500"
                />
                <span className="italic">Italic</span>
            </label>
        </div>
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