import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function TemplateHero() {
    const textRef = useRef<HTMLHeadingElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const cursorRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        const text = "Nova verzija eFaktura";
        const el = textRef.current;
        const cursor = cursorRef.current;
        if (!el || !cursor) return;

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

        gsap.to(cursor, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "power1.inOut" });

        const typeText = () => {
            const chars = text.split("");
            el.textContent = "";
            chars.forEach((char, i) => {
                tl.to({}, {
                    duration: 0.1,
                    onUpdate: () => {
                        el.textContent = text.substring(0, i + 1);
                    },
                }, "+=0.08");
            });
        };

        const deleteText = () => {
            const chars = text.split("");
            chars.forEach((_, i) => {
                tl.to({}, {
                    duration: 0.06,
                    onUpdate: () => {
                        el.textContent = text.substring(0, text.length - i - 1);
                    },
                }, "+=0.04");
            });
        };

        typeText();
        tl.to({}, { duration: 2.5 });
        deleteText();

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 z-10"></div>

            <div className="relative z-20 text-center space-y-6 px-6">
                <div className="inline-block">
                    <div className="bg-gradient-to-br from-white/10 via-blue-500/10 to-purple-500/10 backdrop-blur-2xl px-8 md:px-16 py-6 md:py-10 rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-50"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                        <div className="relative flex items-center justify-center gap-1">
                            <h1 ref={textRef} className="font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent text-2xl md:text-4xl lg:text-5xl xl:text-6xl min-h-[1.2em] inline-block"></h1>
                            <span ref={cursorRef} className="inline-block w-1 h-8 md:h-12 lg:h-14 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full ml-1"></span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-300 text-lg md:text-xl font-light tracking-wide drop-shadow-lg">Moderna platforma za digitalne fakture</p>

                <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden">
                    <span className="relative z-10">Saznaj više</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
            </div>

            <video src="videohero1.mp4" className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline></video>

            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </div>
    );
}
