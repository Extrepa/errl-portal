import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export default function GalleryLazyImage({ src, alt, className }: Props) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '280px 0px' },
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={hostRef} className={className ? `gallery-lazy ${className}` : 'gallery-lazy'}>
      {visible ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} />
      ) : (
        <span className="gallery-lazy__placeholder" aria-hidden="true" />
      )}
    </span>
  );
}
