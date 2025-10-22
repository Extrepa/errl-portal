import React, { useState, useCallback } from 'react';
import { generateDrippyTextImage } from './services/geminiService';
import type { ColorTheme, CameraAngle } from './types';

import Header from './components/Header';
import BackgroundDecorations from './components/BackgroundDecorations';
import OptionSelector from './components/OptionSelector';
import ImageResult from './components/ImageResult';
import { SparklesIcon } from './components/Icons';


const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState<ColorTheme>('Cyberpunk Neon');
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('Front-On');

  const handleGenerateClick = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to generate.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateDrippyTextImage(inputText, colorTheme, cameraAngle);
      setGeneratedImage(imageUrl);
    } catch (err: unknown) {
        if (typeof err === 'string') {
            setError(err);
        } else if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unexpected error occurred.");
        }
    } finally {
      setIsLoading(false);
    }
  }, [inputText, colorTheme, cameraAngle]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-4 relative overflow-hidden">
        <BackgroundDecorations />

        <div className="w-full max-w-2xl mx-auto z-10">
            <Header />

            <main className="mt-8">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 shadow-lg backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter a few words..."
                            className="w-full flex-grow bg-slate-900 border border-slate-600 rounded-md px-4 py-3 text-lg text-cyan-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300"
                            disabled={isLoading}
                            aria-label="Text to generate"
                        />
                        <button
                            onClick={handleGenerateClick}
                            disabled={isLoading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-md shadow-lg hover:shadow-cyan-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            <span>Generate</span>
                        </button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <OptionSelector<ColorTheme>
                            label="Color Theme"
                            options={['Cyberpunk Neon', 'Sunset Flare', 'Toxic Slime', 'Golden Chrome']}
                            selectedOption={colorTheme}
                            onSelect={setColorTheme}
                        />
                        <OptionSelector<CameraAngle>
                            label="View Angle"
                            options={['Front-On', 'Tilted Left', 'From Above', 'Heroic Low']}
                            selectedOption={cameraAngle}
                            onSelect={setCameraAngle}
                        />
                    </div>
                </div>

                <ImageResult 
                  isLoading={isLoading}
                  error={error}
                  generatedImage={generatedImage}
                  inputText={inputText}
                />

            </main>
        </div>
        <style>
          {`
          @keyframes float {
            0% {
              transform: translateY(0px) rotate(-2deg);
            }
            50% {
              transform: translateY(-20px) rotate(2deg);
            }
            100% {
              transform: translateY(0px) rotate(-2deg);
            }
          }
          .animate-float {
            animation: float infinite ease-in-out;
          }
          `}
        </style>
    </div>
  );
};

export default App;