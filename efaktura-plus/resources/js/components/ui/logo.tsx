import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Logo() {
    const logoRef = useRef<SVGSVGElement | null>(null);
    const circleRef = useRef<SVGCircleElement | null>(null);
    const pathRef = useRef<SVGPathElement | null>(null);
    const titleRef = useRef<SVGTextElement | null>(null);
    const subtitleRef = useRef<SVGTextElement | null>(null);

    useEffect(() => {
        const circle = circleRef.current;
        const path = pathRef.current;
        const title = titleRef.current;
        const subtitle = subtitleRef.current;

        if (!circle || !path || !title || !subtitle) return;

        // Početna animacija pri učitavanju
        const tl = gsap.timeline();

        tl.fromTo(
            circle,
            { scale: 0, transformOrigin: "center" },
            { scale: 1, duration: 0.6, ease: "back.out(1.7)" }
        )
            .fromTo(
                path,
                { strokeDasharray: 100, strokeDashoffset: 100 },
                { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" },
                "-=0.3"
            )
            .fromTo(
                title,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
                "-=0.5"
            )
            .fromTo(
                subtitle,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
                "-=0.3"
            );

    }, []);

    const handleHover = () => {
        gsap.to(circleRef.current, {
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out",
            transformOrigin: "center"
        });
        gsap.to(pathRef.current, {
            stroke: "#64B5F6",
            duration: 0.3
        });
    };

    const handleHoverEnd = () => {
        gsap.to(circleRef.current, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            transformOrigin: "center"
        });
        gsap.to(pathRef.current, {
            stroke: "white",
            duration: 0.3
        });
    };

    return (
        <svg
            ref={logoRef}
            xmlns="http://www.w3.org/2000/svg"
            width="260"
            height="90"
            viewBox="0 0 260 90"
            className="cursor-pointer"
            onMouseEnter={handleHover}
            onMouseLeave={handleHoverEnd}
        >
            <defs>
                <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>

                <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F5F5F5" />
                    <stop offset="50%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E0E0E0" />
                </linearGradient>

                <radialGradient id="glow" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
                </radialGradient>

                <filter id="shadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background */}
            <rect
                width="260"
                height="90"
                rx="16"
                fill="#0A0A0A"
                className="dark:fill-gray-900"
            />

            {/* Glow effect */}
            <circle cx="55" cy="45" r="35" fill="url(#glow)" />

            {/* Main circle with gradient */}
            <circle
                ref={circleRef}
                cx="55"
                cy="45"
                r="25"
                fill="url(#gradBlue)"
                filter="url(#shadow)"
            />

            {/* Icon path */}
            <path
                ref={pathRef}
                d="M43 45a12 12 0 1 1 12 12h-9"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Title text */}
            <text
                ref={titleRef}
                x="95"
                y="50"
                fontFamily="Inter, Poppins, Segoe UI, sans-serif"
                fontSize="28"
                fontWeight="700"
                fill="url(#textGrad)"
                letterSpacing="0.5"
            >
                eFaktura
            </text>

            {/* Subtitle text */}
            <text
                ref={subtitleRef}
                x="95"
                y="68"
                fontFamily="Inter, Poppins, Segoe UI, sans-serif"
                fontSize="13"
                fontWeight="500"
                fill="#9E9E9E"
                letterSpacing="0.8"
            >
                Dušan Milekić
            </text>

            {/* Decorative dot */}
            <circle cx="240" cy="45" r="3" fill="#3B82F6" opacity="0.6">
                <animate
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur="2s"
                    repeatCount="indefinite"
                />
            </circle>
        </svg>
    );
}
