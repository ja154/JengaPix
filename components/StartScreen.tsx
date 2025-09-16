/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { UploadIcon, MagicWandIcon, PaletteIcon, SunIcon, PaintBrushIcon } from './icons';

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
  onImageGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect, onImageGenerate, isLoading }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  const handleGenerateClick = () => {
    if (prompt.trim() && !isLoading) {
      onImageGenerate(prompt);
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleGenerateClick();
  };

  return (
    <div 
      className={`w-full max-w-5xl mx-auto text-center p-8 transition-all duration-300 rounded-2xl border-2 ${isDraggingOver ? 'bg-blue-500/10 border-dashed border-blue-400' : 'border-transparent'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        onFileSelect(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-100 sm:text-6xl md:text-7xl">
          AI-Powered Photo Editing & <span className="text-blue-400">Creation</span>.
        </h1>
        <p className="max-w-3xl text-lg text-gray-400 md:text-xl">
          Create entirely new images from text, retouch photos, apply creative filters, or make professional adjustments.
        </p>

        <div className="mt-6 w-full max-w-3xl bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center gap-6">

            <div className="w-full flex flex-col items-center gap-4">
                <label htmlFor="image-upload-start" className={`relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-blue-600 rounded-full transition-colors ${isLoading ? 'bg-blue-800 cursor-not-allowed' : 'cursor-pointer group hover:bg-blue-500'}`}>
                    <UploadIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:rotate-[360deg] group-hover:scale-110" />
                    Upload an Image to Edit
                </label>
                <input id="image-upload-start" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
                <p className="text-sm text-gray-500">or drag and drop a file</p>
            </div>
            
            <div className="flex items-center gap-4 text-gray-500 text-sm uppercase w-full">
              <div className="flex-grow h-px bg-gray-700"></div>
              <span>Or</span>
              <div className="flex-grow h-px bg-gray-700"></div>
            </div>

            <form onSubmit={handleFormSubmit} className="w-full flex flex-col items-center gap-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe an image to create (e.g., 'a majestic lion in a snowy forest, photorealistic')"
                    className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
                    disabled={isLoading}
                    rows={3}
                />
                <button 
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-br from-purple-600 to-indigo-500 rounded-full group hover:from-purple-500 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/40 disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <PaintBrushIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:scale-110" />
                  Generate Image
                </button>
            </form>
        </div>

        <div className="mt-16 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                       <MagicWandIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Precise Retouching</h3>
                    <p className="mt-2 text-gray-400">Click any point on your image to remove blemishes, change colors, or add elements with pinpoint accuracy.</p>
                </div>
                <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                       <PaletteIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Creative Filters</h3>
                    <p className="mt-2 text-gray-400">Transform photos with artistic styles. From vintage looks to futuristic glows, find or create the perfect filter.</p>
                </div>
                <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                       <SunIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Pro Adjustments</h3>
                    <p className="mt-2 text-gray-400">Enhance lighting, blur backgrounds, or change the mood. Get studio-quality results without complex tools.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;