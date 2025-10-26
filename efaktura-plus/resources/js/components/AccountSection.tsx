import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AccountSection() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const subtitleRef = useRef<HTMLParagraphElement | null>(null);
    const cardsRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const title = titleRef.current;
        const subtitle = subtitleRef.current;
        const cards = cardsRef.current;

        if (!section || !title || !subtitle || !cards) return;

        // Postavi početno stanje
        gsap.set([title, subtitle], {
            y: 60,
            opacity: 0
        });

        gsap.set(cards.children, {
            y: 80,
            opacity: 0,
            scale: 0.95
        });

        // Kreiraj animaciju
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 70%",
                end: "top 20%",
                scrub: 0.8,
                markers: false,
            }
        });

        tl.to(title, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power3.out"
        })
            .to(subtitle, {
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease: "power3.out"
            }, "-=0.2")
            .to(cards.children, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.2,
                ease: "back.out(1.2)"
            }, "-=0.2");

        return () => {
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === section) {
                    trigger.kill();
                }
            });
        };
    }, []);

    const RouteToLogin = () => {
        window.location.href = "/prijava";
    };

    const RouteToRegistration = () => {
        window.location.href = "/registracija";
    }
    return (
        <section
            ref={sectionRef}
            className="relative flex flex-col justify-center items-center min-h-screen px-6 py-20 overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20"
        >
            {/* Dekorativni elementi */}
            <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative max-w-6xl w-full space-y-16">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1
                        ref={titleRef}
                        className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
                    >
                        Vaš Nalog
                    </h1>
                    <p
                        ref={subtitleRef}
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        Prijavite se ili kontaktirajte naš tim za kreiranje novog naloga
                    </p>
                </div>

                {/* Kartice */}
                <div ref={cardsRef} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Prijava kartica */}
                    <div className="group relative bg-white dark:bg-gray-800/50 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-blue-600/90 dark:from-blue-600/90 dark:to-blue-700/90"></div>

                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                        </div>

                        {/* Content */}
                        <div className="relative p-10 md:p-12 space-y-8 text-center text-white">
                            <div className="space-y-4">
                                <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold">Imate nalog?</h2>

                                <p className="text-blue-100 text-base md:text-lg leading-relaxed max-w-md mx-auto">
                                    Ukoliko imate postojeći nalog, brzo se prijavite i nastavite tamo gdje ste stali.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button className="group/btn w-full sm:w-auto bg-white text-blue-600 font-semibold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                                    <span className="flex items-center justify-center gap-2 cursor-pointer" onClick={RouteToLogin}>
                                        Prijavi se
                                        <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </button>

                                <p className="text-sm text-blue-100/80">
                                    Zaboravili ste lozinku? <a href="#" className="underline hover:text-white transition-colors">Resetujte ovde</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Kontakt kartica */}
                    <div className="group relative bg-white dark:bg-gray-800/50 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-pink-600/90 dark:from-purple-600/90 dark:to-pink-700/90"></div>

                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="absolute bottom-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                        </div>

                        {/* Content */}
                        <div className="relative p-10 md:p-12 space-y-8 text-center text-white">
                            <div className="space-y-4">
                                <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold">Nemate nalog?</h2>

                                <p className="text-purple-100 text-base md:text-lg leading-relaxed max-w-md mx-auto">
                                    Kreiranje naloga zahteva verifikaciju. Kontaktirajte naš tim i postanite deo naše zajednice.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button className="group/btn w-full sm:w-auto bg-white text-purple-600 font-semibold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                                    <span className="flex items-center justify-center gap-2 cursor-pointer" onClick={RouteToRegistration} >
                                        Kontaktirajte nas
                                        <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </button>

                                <div className="flex items-center justify-center gap-2 text-sm text-purple-100/80">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Sigurna verifikacija identiteta</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info sekcija */}
                <div className="max-w-3xl mx-auto text-center space-y-4 pt-8">
                    <div className="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Sigurna prijava</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Brz pristup</span>
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
        </section>
    );
}
