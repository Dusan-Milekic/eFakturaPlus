import Logo from "./ui/logo";
import Burger from "./ui/Burger";
import Links from "./ui/Links";
import DropDown from "./ui/DropDown";
import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";

export default function Header() {
    const refDropDown = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const DropDownAnimation = () => {
        const el = refDropDown.current;
        if (!el) return;

        if (!isOpen) {
            el.classList.remove("hidden");
            gsap.fromTo(el, { opacity: 0, y: -20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" });
            setIsOpen(true);
        } else {
            gsap.to(el, {
                opacity: 0,
                y: -20,
                scale: 0.95,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    el.classList.add("hidden");
                },
            });
            setIsOpen(false);
        }
    };

    return (
        <>
            <header ref={headerRef} className={`relative top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-blue-950/80 backdrop-blur-xl shadow-lg shadow-blue-500/20 border-b border-blue-400/30" : "bg-gradient-to-b from-blue-950/60 to-transparent backdrop-blur-sm"}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="flex items-center justify-between py-5">
                        <div className="flex-shrink-0 transform hover:scale-105 transition-transform duration-300">
                            <Logo />
                        </div>
                        <nav className="hidden md:block">
                            <Links />
                        </nav>
                        <button onClick={DropDownAnimation} className="md:hidden relative z-50 p-2 rounded-xl hover:bg-blue-500/20 transition-colors duration-300" aria-label="Toggle menu">
                            <Burger />
                        </button>
                    </div>
                </div>
                <div ref={refDropDown} className="absolute w-full top-full left-0 px-6 pt-4 pb-6 md:hidden hidden">
                    <DropDown />
                </div>
            </header>
            <div className="h-20"></div>
        </>
    );
}
