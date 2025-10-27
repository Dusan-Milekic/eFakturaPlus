import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function UspesnaRegistracija() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const checkmarkRef = useRef<SVGSVGElement | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const textRef = useRef<HTMLParagraphElement | null>(null);
    const buttonRef = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        const checkmark = checkmarkRef.current;
        const title = titleRef.current;
        const text = textRef.current;
        const button = buttonRef.current;

        if (!container || !checkmark || !title || !text || !button) return;

        const tl = gsap.timeline();

        // Početno stanje
        gsap.set([checkmark, title, text, button], {
            opacity: 0,
            scale: 0.5
        });

        // Animaciona sekvenca
        tl.to(checkmark, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(2)"
        })
            .to(checkmark, {
                rotation: 360,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.3")
            .to(title, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.7)"
            }, "-=0.4")
            .to(text, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "power2.out"
            }, "-=0.3")
            .to(button, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.7)"
            }, "-=0.2");

        // Konfeti efekat
        const createConfetti = () => {
            const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'absolute';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = '50%';
                confetti.style.top = '50%';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.pointerEvents = 'none';
                container.appendChild(confetti);

                gsap.to(confetti, {
                    x: (Math.random() - 0.5) * 800,
                    y: (Math.random() - 0.5) * 800,
                    opacity: 0,
                    duration: 2 + Math.random(),
                    ease: "power2.out",
                    onComplete: () => confetti.remove()
                });
            }
        };

        setTimeout(createConfetti, 400);

    }, []);

    return (
        <div ref={containerRef} className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 overflow-hidden">
            {/* Dekorativni elementi */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

            <div className="relative z-10 text-center space-y-8 px-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <svg ref={checkmarkRef} className="w-32 h-32" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="50%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="url(#successGradient)" opacity="0.2" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#successGradient)" strokeWidth="3" />
                        <path d="M30 50 L45 65 L70 35" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Text Content */}
                <div className="space-y-6">
                    <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Uspešno!
                    </h1>

                    <p ref={textRef} className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Vaš zahtev za kreiranje naloga je <span className="font-semibold text-blue-400">uspešno poslat</span>!
                        <br className="hidden md:block" />
                        Naš tim će proveriti vaše podatke i kontaktirati vas u roku od <span className="font-semibold text-purple-400">48 sati</span>.
                    </p>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 max-w-xl mx-auto">
                        <div className="flex items-start gap-4">
                            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-left">
                                <p className="text-blue-400 font-semibold mb-2">Šta dalje?</p>
                                <ul className="text-gray-400 text-sm space-y-1">
                                    <li>✓ Proverićemo validnost vaših podataka</li>
                                    <li>✓ Kontaktiraćemo vas putem emaila ili telefona</li>
                                    <li>✓ Dobićete pristupne podatke nakon verifikacije</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-8">
                    <a ref={buttonRef} href="/" className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-10 py-4 rounded-full shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50">
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Nazad na početnu</span>
                    </a>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-8 pt-12 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Sigurni podaci</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Brza verifikacija</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>24/7 Podrška</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
