import React from 'react';
import deco1 from '../assets/deco-1.png';
import deco2 from '../assets/deco-2.png';
import deco3 from '../assets/deco-3.png';
import deco4 from '../assets/deco-4.png';
import deco5 from '../assets/deco-5.png';
import deco6 from '../assets/deco-6.png';
import deco7 from '../assets/deco-7.png';

const BackgroundDecorations: React.FC = () => {
    const decorations = [
        { src: deco1, className: 'absolute top-[5%] left-[5%] w-24 opacity-50', duration: '15s', delay: '0s' },
        { src: deco2, className: 'absolute top-[20%] right-[8%] w-32 opacity-60', duration: '20s', delay: '2s' },
        { src: deco3, className: 'absolute bottom-[8%] left-[10%] w-28 opacity-40', duration: '18s', delay: '4s' },
        { src: deco4, className: 'absolute bottom-[12%] right-[12%] w-40 opacity-50', duration: '22s', delay: '1s' },
        { src: deco5, className: 'absolute top-[45%] left-[48%] w-20 opacity-60', duration: '12s', delay: '3s' },
        { src: deco6, className: 'absolute top-[65%] left-[20%] w-16 opacity-40', duration: '17s', delay: '5s' },
        { src: deco7, className: 'absolute top-[70%] right-[25%] w-20 opacity-50', duration: '19s', delay: '0.5s' },
    ];

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            {decorations.map((deco, i) => (
                <img
                    key={i}
                    src={deco.src}
                    alt=""
                    className={`${deco.className} animate-float`}
                    style={{
                        animationDuration: deco.duration,
                        animationDelay: deco.delay,
                    }}
                />
            ))}
        </div>
    );
};

export default BackgroundDecorations;
