import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(ScrollTrigger);

export default function DashboardMeni() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const [name, setName] = useState<string>(() => {
        try {
            const user = JSON.parse(localStorage.getItem('userData') || '{}');
            return user.ime && user.prezime ? `${user.ime} ${user.prezime}` : 'NISTE PRIJAVLJENI';
        } catch {
            return 'Korisnik';
        }
    });



    useEffect(() => {
        const container = containerRef.current;
        const cards = cardsRef.current;

        if (!container || !cards) return;

        gsap.set(cards.children, {
            y: 60,
            opacity: 0,
            scale: 0.9
        });

        const tl = gsap.timeline();

        tl.to(cards.children, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.5)"
        });

    }, []);

    const menuItems = [
        {
            title: "Izlazni dokumenti",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            ),
            count: null,
            action: "Kreiraj novi dokument",
            bgColor: "from-blue-600 to-cyan-600",
            link: "/IzlazniDokumenti"
        },
        {
            title: "Ulazni dokumenti",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
            ),
            count: 8,
            badge: "NOVO",
            action: "Učitaj datoteku",
            bgColor: "from-purple-600 to-pink-600",
            link: "/dokumenti/ulazni"
        },
        {
            title: "Evidencija PDV",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            count: null,
            action: "Učitaj datoteku",
            bgColor: "from-green-600 to-emerald-600",
            link: "/pdv/evidencija"
        },
        {
            title: "Pojedinačna evidencija PDV",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            count: null,
            action: null,
            bgColor: "from-orange-600 to-red-600",
            link: "/pdv/pojedinacna"
        },
        {
            title: "Nacriti izlazni dokumenta",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            count: 1,
            action: null,
            bgColor: "from-indigo-600 to-blue-600",
            link: "/dokumenti/nacrti"
        },
        {
            title: "Zbirna evidencija PDV",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            count: null,
            action: null,
            bgColor: "from-teal-600 to-cyan-600",
            link: "/pdv/zbirna"
        },
        {
            title: "Pojedinačna evidencija PDV do 1. septembra 2024",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            count: null,
            action: null,
            bgColor: "from-pink-600 to-rose-600",
            link: "/pdv/arhiva"
        },
        {
            title: "Zbirna evidencija PDV do 1. septembra 2024",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            ),
            count: null,
            action: null,
            bgColor: "from-violet-600 to-purple-600",
            link: "/pdv/zbirna-arhiva"
        }
    ];
    if (localStorage.getItem('userData') === null) {

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
                <div className="max-w-md text-center">
                    <h1 className="text-3xl font-bold mb-6">NISTE PRIJAVLJENI</h1>
                    <p className="mb-6">Molimo vas da se prijavite kako biste pristupili kontrolnoj tabli.</p>
                    <a
                        href="/prijava"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
                    >
                        Idi na stranicu za prijavu
                    </a>
                </div>
            </div>
        );
    }
    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent mb-4">
                        {name}
                    </h1>
                    <p className="text-gray-400 text-lg">Dobrodošli nazad! Izaberite opciju za nastavak.</p>
                </div>

                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.link}
                            className="group relative bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                            <div className="relative p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.bgColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <div className="text-white">
                                            {item.icon}
                                        </div>
                                    </div>

                                    {item.count !== null && (
                                        <div className="flex flex-col items-end gap-2">
                                            {item.badge && (
                                                <span className="px-2 py-1 bg-cyan-500 text-white text-xs font-bold rounded">
                                                    {item.badge}
                                                </span>
                                            )}
                                            <span className="text-4xl font-bold text-white">{item.count}</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors min-h-[3rem]">
                                    {item.title}
                                </h3>

                                {item.action && (
                                    <button className={`w-full bg-gradient-to-r ${item.bgColor} text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg group-hover:scale-105`}>
                                        {item.action}
                                    </button>
                                )}
                            </div>

                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div >
    );
}
