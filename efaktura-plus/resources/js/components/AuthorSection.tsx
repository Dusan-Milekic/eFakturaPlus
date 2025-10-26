import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AuthorSection() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const imageRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const image = imageRef.current;
        const content = contentRef.current;

        if (!section || !image || !content) return;

        gsap.set([image, content.children], {
            y: 60,
            opacity: 0
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 70%",
                end: "top 20%",
                scrub: 0.8,
                markers: false,
            }
        });

        tl.to(image, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out"
        })
            .to(content.children, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: "power3.out"
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
        <section id="author" ref={sectionRef} className="relative min-h-screen flex items-center py-32 overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100 dark:from-gray-950 dark:via-orange-950/20 dark:to-gray-900">
            <div className="absolute top-20 right-10 w-72 h-72 bg-orange-400/10 dark:bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-400/10 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-6 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div ref={imageRef} className="relative">
                        <div className="relative w-full max-w-md mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-3xl blur-2xl"></div>
                            <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
                                <img src="/JaSlika.jpg" alt="Dušan Milekić - Autor" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl opacity-20 blur-xl"></div>
                            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-20 blur-xl"></div>
                        </div>
                    </div>

                    <div ref={contentRef} className="space-y-8">
                        <div className="inline-block px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">O autoru</span>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-orange-700 to-gray-900 dark:from-gray-100 dark:via-orange-400 dark:to-gray-100 bg-clip-text text-transparent">Dušan Milekić</h2>

                        <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            <p>Student na <span className="font-semibold text-orange-600 dark:text-orange-400">završnim godinama studija</span>, strastveno zainteresovan za razvoj modernih web aplikacija i digitalna rešenja.</p>

                            <p>Trenutno se aktivno bavim učenjem <span className="font-semibold text-orange-600 dark:text-orange-400">veštačke inteligencije (AI)</span> i <span className="font-semibold text-orange-600 dark:text-orange-400">Data Science-a</span>, sa vizijom da <span className="font-semibold text-orange-600 dark:text-orange-400">kombinujem web development i AI rešenja</span> u inovativne proizvode.</p>

                            <p>Moja želja je da kreiram <span className="font-semibold text-orange-600 dark:text-orange-400">inteligentne web aplikacije</span> koje koriste moć mašinskog učenja za rešavanje realnih problema. Kroz projekte poput <span className="font-semibold text-orange-600 dark:text-orange-400">eFakturaPlus</span>, težim da donesem inovaciju u tradicionalne sisteme i učinim tehnologiju dostupnijom svima.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
                            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">AI/ML</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">U procesu učenja</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">10+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Akademskih projekata</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">100%</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Posvećenost</div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Trenutni fokus:</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">React & TypeScript</span>
                                <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">Laravel</span>
                                <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">Machine Learning</span>
                                <span className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">Data Science</span>
                                <span className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-medium">Python</span>
                                <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">AI Integration</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-6">
                            <div className="flex gap-3">
                                <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    <p className="font-semibold text-orange-600 dark:text-orange-400 mb-1">Vizija:</p>
                                    <p>Kreiranje inteligentnih web aplikacija koje spajaju intuitivne korisničke interfejse sa moćnim AI algoritmima za rešavanje kompleksnih problema.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-6">
                            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium hover:scale-105 transition-transform duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <span>GitHub</span>
                            </a>
                            <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:scale-105 transition-transform duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                <span>LinkedIn</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
