import { useRef } from "react";
import { gsap } from "gsap";

export default function Burger() {
    const line1Ref = useRef<SVGRectElement | null>(null);
    const line2Ref = useRef<SVGRectElement | null>(null);
    const line3Ref = useRef<SVGRectElement | null>(null);

    const handleHover = () => {
        gsap.to(line1Ref.current, { x: -3, duration: 0.3, ease: "power2.out" });
        gsap.to(line2Ref.current, { x: 3, duration: 0.3, ease: "power2.out" });
        gsap.to(line3Ref.current, { x: -3, duration: 0.3, ease: "power2.out" });
    };

    const handleHoverEnd = () => {
        gsap.to([line1Ref.current, line2Ref.current, line3Ref.current], { x: 0, duration: 0.3, ease: "power2.out" });
    };

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" className="cursor-pointer" onMouseEnter={handleHover} onMouseLeave={handleHoverEnd}>
            <defs>
                <linearGradient id="gradMenu" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <filter id="menuGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.4" />
                </filter>
            </defs>
            <rect width="48" height="48" rx="12" fill="#0A0A0A" className="dark:fill-gray-900" />
            <g filter="url(#menuGlow)">
                <rect ref={line1Ref} x="12" y="14" width="24" height="3" rx="1.5" fill="url(#gradMenu)" />
                <rect ref={line2Ref} x="12" y="22" width="24" height="3" rx="1.5" fill="url(#gradMenu)" />
                <rect ref={line3Ref} x="12" y="30" width="24" height="3" rx="1.5" fill="url(#gradMenu)" />
            </g>
        </svg>
    );
}
