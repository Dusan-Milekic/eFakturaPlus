import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import React from "react";

gsap.registerPlugin(ScrollToPlugin);

export default function Links() {
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
        e.preventDefault();
        gsap.to(window, {
            duration: 1.2,
            scrollTo: target,
            ease: "power3.inOut",
        });
    };

    return (
        <ul className="flex items-center gap-2">
            <li>
                <a href="#account" onClick={(e) => handleScroll(e, "#account")} className="group relative px-5 py-2.5 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <span className="relative z-10">Nalog</span>
                    <span className="absolute inset-0 bg-blue-50 dark:bg-blue-950/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </a>
            </li>
            <li>
                <a href="#about" onClick={(e) => handleScroll(e, "#about")} className="group relative px-5 py-2.5 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-300 hover:text-purple-600 dark:hover:text-purple-400">
                    <span className="relative z-10">O nama</span>
                    <span className="absolute inset-0 bg-purple-50 dark:bg-purple-950/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </a>
            </li>
            <li>
                <a href="#contact" onClick={(e) => handleScroll(e, "#contact")} className="group relative px-5 py-2.5 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-300 hover:text-green-600 dark:hover:text-green-400">
                    <span className="relative z-10">Kontakt</span>
                    <span className="absolute inset-0 bg-green-50 dark:bg-green-950/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </a>
            </li>
        </ul>
    );
}
