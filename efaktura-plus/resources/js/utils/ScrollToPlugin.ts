import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export const scrollToSection = (target: string) => {
    gsap.to(window, {
        duration: 1,
        scrollTo: target,
        ease: "power2.out",
    });
};
