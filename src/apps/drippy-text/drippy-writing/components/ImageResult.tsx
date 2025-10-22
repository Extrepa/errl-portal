import React from 'react';
import Loader from './Loader';
import { DownloadIcon } from './Icons';

interface ImageResultProps {
    isLoading: boolean;
    error: string | null;
    generatedImage: string | null;
    inputText: string;
}

const ImageResult: React.FC<ImageResultProps> = ({ isLoading, error, generatedImage, inputText }) => {
    // Embedded SVG placeholder to guarantee it loads.
    const placeholderImage = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150' viewBox='0 0 300 150'%3e%3cstyle%3e.example %7b font-family: 'Brush Script MT', cursive; font-size: 48px; fill: %2394a3b8; %7d%3c/style%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' class='example'%3eExample%3c/text%3e%3c/svg%3e";

    return (
        <div className="mt-10 w-full aspect-square bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center p-4 transition-all duration-300">
            {isLoading ? (
                <Loader />
            ) : error ? (
                <div role="alert" className="text-center text-red-400">
                    <h3 className="text-xl font-bold">Oh no!</h3>
                    <p className="mt-2">{error}</p>
                </div>
            ) : generatedImage ? (
                <div className="relative group w-full h-full">
                    <img src={generatedImage} alt={`Generated drippy text for: ${inputText}`} className="w-full h-full object-contain rounded-lg" />
                     <a
                        href={generatedImage}
                        download={`drippy-${inputText.replace(/\s+/g, '-')}.png`}
                        className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-900/70 text-white py-2 px-4 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-slate-700 hover:bg-slate-800"
                        aria-label="Download generated image"
                    >
                        <DownloadIcon className="w-5 h-5"/>
                        Download
                    </a>
                </div>
            ) : (
                <div className="text-center text-slate-400 w-full h-full flex flex-col justify-center items-center p-2 opacity-75">
                    <img src={placeholderImage} alt="Example of drippy text" className="max-w-full max-h-[80%] object-contain" />
                    <p className="mt-4">The generated image will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default ImageResult;