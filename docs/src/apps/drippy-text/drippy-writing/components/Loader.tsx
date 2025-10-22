import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './Icons';

const loadingMessages = [
    "Summoning creative juices...",
    "Painting with pixels...",
    "Melting chrome letters...",
    "Consulting the digital muse...",
    "Giving it that drippy look...",
    "Warping reality (just a little)...",
    "Stirring the font cauldron...",
];

const Loader: React.FC = () => {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        // Pick a new random message every time the loader is shown
        setMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/50 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-2 border-purple-500/50 animate-ping delay-200"></div>
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-slate-800 shadow-lg shadow-cyan-500/20">
                <SparklesIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-cyan-300">{message}</p>
        </div>
    );
};

export default Loader;
