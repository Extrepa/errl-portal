import { useEffect, useRef, useState } from 'react';
import { pointerRippleAt } from '../bridge/legacyBridge';

type Props = {
  onEnter: () => void;
};

export default function ArrivalPhase({ onEnter }: Props) {
  const [errlVisible, setErrlVisible] = useState(false);
  const [enterVisible, setEnterVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setErrlVisible(true);
        setEnterVisible(true);
        return;
      }
    } catch (_) {}
    const t1 = window.setTimeout(() => setErrlVisible(true), 400);
    const t2 = window.setTimeout(() => setEnterVisible(true), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleEnter = () => {
    setExiting(true);
    window.setTimeout(onEnter, 400);
  };

  return (
    <div className={`errl-arrival${exiting ? ' errl-arrival--exiting' : ''}`} role="presentation">
      <img
        className={`errl-arrival__errl${errlVisible ? ' errl-arrival__errl--visible' : ''}`}
        src="./shared/assets/portal/L4_Central/errl-body-with-limbs.svg"
        alt=""
        aria-hidden
        draggable={false}
      />
      <button
        ref={enterRef}
        type="button"
        className={`errl-arrival__enter${enterVisible ? ' errl-arrival__enter--visible' : ''}`}
        onClick={handleEnter}
        onMouseMove={(e) => pointerRippleAt(e.clientX, e.clientY)}
        onFocus={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          pointerRippleAt(r.left + r.width / 2, r.top + r.height / 2);
        }}
      >
        Enter
      </button>
    </div>
  );
}
