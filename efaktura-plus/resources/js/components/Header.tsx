import Logo from "./ui/logo";
import Burger from "./ui/Burger";
import Links from "./ui/Links";
import DropDown from "./ui/DropDown";
import { useRef, useState } from "react";
import { gsap } from "gsap";

export default function Header() {
    const refDropDown = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const DropDownAnimation = () => {
        const el = refDropDown.current;
        if (!el) return;

        // Ako je trenutno zatvoren → otvori ga animirano
        if (!isOpen) {
            el.classList.remove("hidden");
            gsap.fromTo(
                el,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
            setIsOpen(true);
        }
        // Ako je otvoren → zatvori ga animirano
        else {
            gsap.to(el, {
                opacity: 0,
                y: -20,
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
            <header className="flex items-center text-lg mx-10 py-6 justify-between">
                <Logo />
                <div className="hidden md:block">
                    <Links />
                </div>

                {/* Burger meni za mobilni prikaz */}
                <div className="md:hidden cursor-pointer" onClick={DropDownAnimation}>
                    <Burger />
                </div>

                {/* Dropdown meni */}
                <div
                    ref={refDropDown}
                    className="absolute w-full top-28 left-0 flex justify-center md:hidden hidden"
                >
                    <DropDown />
                </div>
            </header>
        </>
    );
}
