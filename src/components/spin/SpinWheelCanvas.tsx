import { useRef, useEffect, useState } from "react";

interface SpinOffer {
  id: string;
  offer_text: string;
  color: string;
  text_color: string;
  probability: number;
  icon?: string;
}

interface SpinWheelCanvasProps {
  offers: SpinOffer[];
  winnerIndex: number;
  onSpinEnd: (winnerIndex: number) => void;
  isSpinning: boolean;
  setIsSpinning: (v: boolean) => void;
}

const DEFAULT_EMOJIS = ["🏷️", "💵", "💸", "📉", "🎁", "🔄", "⭐", "🎯"];

const SpinWheelCanvas = ({ offers, winnerIndex, onSpinEnd, isSpinning, setIsSpinning }: SpinWheelCanvasProps) => {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>();
  const spinningRef = useRef(false);

  const n = offers.length;
  const segDeg = n > 0 ? 360 / n : 60;

  // Spin animation
  useEffect(() => {
    if (!isSpinning || spinningRef.current || n === 0) return;
    spinningRef.current = true;

    const target = 360 - (winnerIndex * segDeg + segDeg / 2);
    const total = 360 * 6 + target;
    const dur = 5000;
    const t0 = Date.now();
    const r0 = rotation;

    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = r0 + total * e;
      setRotation(cur);
      if (p < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        setRotation(cur % 360);
        spinningRef.current = false;
        setIsSpinning(false);
        onSpinEnd(winnerIndex);
      }
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isSpinning]); // eslint-disable-line react-hooks/exhaustive-deps

  if (n === 0) return null;

  const conicStops = offers.map((o, i) => {
    const start = (i / n) * 100;
    const end = ((i + 1) / n) * 100;
    return `${o.color} ${start}% ${end}%`;
  }).join(", ");

  const lines = Array.from({ length: n }, (_, i) => (
    <div
      key={`line-${i}`}
      className="absolute w-[2px] h-1/2 left-1/2 top-0"
      style={{
        background: "rgba(201,160,80,0.4)",
        transformOrigin: "bottom center",
        transform: `translateX(-50%) rotate(${i * segDeg}deg)`,
      }}
    />
  ));

  const slices = offers.map((offer, i) => {
    const sliceRotation = i * segDeg + segDeg / 2;
    return (
      <div
        key={offer.id}
        className="absolute w-full h-full"
        style={{ transform: `rotate(${sliceRotation}deg)`, transformOrigin: "center" }}
      >
        <div className="absolute top-1/2 left-1/2" style={{ transform: "translate(-50%, -50%)" }}>
          <div
            className="flex flex-col items-center text-center"
            style={{ transform: "translateY(-78px) perspective(120px) rotateX(22deg)", width: "75px" }}
          >
            <div
              className="font-bold leading-tight break-words"
              style={{
                fontSize: "12px",
                maxWidth: "75px",
                color: offer.text_color || "#ffffff",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textShadow: "0 1px 3px rgba(0,0,0,0.7)",
              }}
            >
              {offer.offer_text}
            </div>
            <div className="text-base mt-0.5">{offer.icon || DEFAULT_EMOJIS[i % DEFAULT_EMOJIS.length]}</div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute z-10"
        style={{
          top: "-2px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderTop: "28px solid #c9a050",
        }}
      />
      <div
        className="relative w-[230px] h-[230px] sm:w-[260px] sm:h-[260px]"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: `conic-gradient(${conicStops})`,
            border: "6px solid #c9a050",
          }}
        >
          {lines}
          {slices}
        </div>
        <div
          className="absolute top-1/2 left-1/2 w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs"
          style={{
            transform: "translate(-50%, -50%)",
            background: "#c9a050",
            border: "3px solid #fff",
            color: "#fff",
          }}
        >
          SPIN
        </div>
      </div>
    </div>
  );
};

export default SpinWheelCanvas;
