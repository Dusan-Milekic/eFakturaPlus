import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import React from "react";

gsap.registerPlugin(ScrollToPlugin);

export default function DropDown() {
    const handleScroll = (e: React.MouseEvent<HTMLLIElement>, target: string) => {
        e.preventDefault();
        gsap.to(window, {
            duration: 1.2,
            scrollTo: target,
            ease: "power3.inOut",
        });
    };

    return (
        <div className="w-11/12 max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <ul className="py-2">
                <li onClick={(e) => handleScroll(e, "#account")} className="group flex items-center gap-4 px-6 py-4 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <span className="text-lg font-medium">Nalog</span>
                </li>

                <li onClick={(e) => handleScroll(e, "#about")} className="group flex items-center gap-4 px-6 py-4 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-300 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-lg font-medium">O nama</span>
                </li>

                <li onClick={(e) => handleScroll(e, "#contact")} className="group flex items-center gap-4 px-6 py-4 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all duration-300 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-lg font-medium">Kontakt</span>
                </li>
            </ul>
        </div>
    );
}
