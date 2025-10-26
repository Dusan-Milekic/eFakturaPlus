import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const subtitleRef = useRef<HTMLParagraphElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);
    const infoCardsRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const title = titleRef.current;
        const subtitle = subtitleRef.current;
        const form = formRef.current;
        const infoCards = infoCardsRef.current;

        if (!section || !title || !subtitle || !form || !infoCards) return;

        // Postavi početno stanje
        gsap.set([title, subtitle], {
            y: 60,
            opacity: 0
        });

        gsap.set(form.children, {
            y: 40,
            opacity: 0
        });

        gsap.set(infoCards.children, {
            x: -50,
            opacity: 0
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
            .to(infoCards.children, {
                x: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.2")
            .to(form.children, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.4");

        return () => {
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === section) {
                    trigger.kill();
                }
            });
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-950 text-white min-h-screen px-6 py-20 overflow-hidden"
        >
            {/* Dekorativni elementi */}
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

            <div className="relative max-w-6xl w-full space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h2
                        ref={titleRef}
                        className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent"
                    >
                        Kontaktirajte nas
                    </h2>
                    <p
                        ref={subtitleRef}
                        className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        Imate pitanja ili vam je potrebna pomoć? Naš tim je tu da vam pomogne u najkraćem roku.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Info kartice */}
                    <div ref={infoCardsRef} className="lg:col-span-1 space-y-4">
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-white mb-2">Email</h3>
                            <p className="text-gray-400 text-sm">info@example.com</p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-white mb-2">Telefon</h3>
                            <p className="text-gray-400 text-sm">+381 60 123 4567</p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-white mb-2">Lokacija</h3>
                            <p className="text-gray-400 text-sm">Pančevo, Vojvodina</p>
                        </div>
                    </div>

                    {/* Forma */}
                    <form
                        ref={formRef}
                        className="lg:col-span-2 space-y-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-sm border border-gray-700/50"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="text-left">
                                <label className="block mb-2 text-gray-300 font-medium text-sm">Ime i prezime</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Vaše ime"
                                />
                            </div>

                            <div className="text-left">
                                <label className="block mb-2 text-gray-300 font-medium text-sm">Email adresa</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="vas@email.com"
                                />
                            </div>
                        </div>

                        <div className="text-left">
                            <label className="block mb-2 text-gray-300 font-medium text-sm">Tema</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="O čemu želite da razgovarate?"
                            />
                        </div>

                        <div className="text-left">
                            <label className="block mb-2 text-gray-300 font-medium text-sm">Poruka</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                rows={6}
                                placeholder="Detaljno opišite vaše pitanje ili zahtev..."
                            ></textarea>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-blue-500/50"
                            >
                                Pošaljite poruku
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
