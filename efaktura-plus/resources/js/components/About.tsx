import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const subtitleRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLParagraphElement | null>(null);
    const cardsRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = sectionRef.current;
        const title = titleRef.current;
        const subtitle = subtitleRef.current;
        const text = textRef.current;
        const cards = cardsRef.current;

        if (!el || !title || !subtitle || !text || !cards) return;

        // Postavi početno stanje
        gsap.set([title, subtitle, text], {
            y: 60,
            opacity: 0
        });

        gsap.set(cards.children, {
            y: 80,
            opacity: 0,
            scale: 0.9
        });

        // Kreiraj animaciju
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: el,
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
            .to(text, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power3.out"
            }, "-=0.2")
            .to(cards.children, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: "back.out(1.2)"
            }, "-=0.3");

        return () => {
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === el) {
                    trigger.kill();
                }
            });
        };
    }, []);

    return (
        <section
            id="about"
            ref={sectionRef}
            className="relative min-h-screen flex items-center py-32 overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-900"
        >
            {/* Dekorativni elementi */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="relative max-w-6xl mx-auto px-6 w-full">
                {/* Naslov */}
                <div className="text-center mb-16">
                    <div
                        ref={subtitleRef}
                        className="inline-block mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                    >
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            Ko smo mi
                        </span>
                    </div>

                    <h2
                        ref={titleRef}
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-gray-100 dark:via-blue-400 dark:to-gray-100 bg-clip-text text-transparent"
                    >
                        O nama
                    </h2>

                    <p
                        ref={textRef}
                        className="text-xl md:text-2xl leading-relaxed text-gray-700 dark:text-gray-300 max-w-4xl mx-auto"
                    >
                        Mi smo tim posvećen pružanju{" "}
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                            modernih i efikasnih rešenja
                        </span>{" "}
                        za naše klijente. Naša misija je da tehnologiju učinimo dostupnom,
                        jednostavnom i korisnom svima.
                    </p>
                </div>

                {/* Kartice sa vrednostima */}
                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                    <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Inovacija</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Koristimo najnovije tehnologije i pristupe za kreiranje cutting-edge rešenja.
                            </p>
                        </div>
                    </div>

                    <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Dizajn</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Svaki projekat osmišljavamo sa pažnjom prema detaljima i korisničkom iskustvu.
                            </p>
                        </div>
                    </div>

                    <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative">
                            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Pouzdanost</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Gradimo dugoročna partnerstva zasnovana na poverenju i kvalitetu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
