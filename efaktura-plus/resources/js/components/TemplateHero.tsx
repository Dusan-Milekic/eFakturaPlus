import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function TemplateHero() {
    const textRef = useRef<HTMLHeadingElement | null>(null);

    useEffect(() => {
        const text = "Nova verzija eFaktura";
        const el = textRef.current;
        if (!el) return;

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

        // --- Kucanje slovo po slovo ---
        const typeText = () => {
            const chars = text.split("");
            el.textContent = "";
            chars.forEach((char, i) => {
                tl.to(
                    {},
                    {
                        duration: 0.08,
                        onUpdate: () => {
                            el.textContent = text.substring(0, i + 1);
                        },
                    },
                    "+=0.05"
                );
            });
        };

        // --- Briše slovo po slovo ---
        const deleteText = () => {
            const chars = text.split("");
            chars.forEach((_, i) => {
                tl.to(
                    {},
                    {
                        duration: 0.05,
                        onUpdate: () => {
                            el.textContent = text.substring(0, text.length - i - 1);
                        },
                    },
                    "+=0.03"
                );
            });
        };

        // Sekvenca: kucanje → fade blink → brisanje
        typeText();
        tl.to({}, { duration: 2 }); // pravi pauzu od 2 sekunde

        deleteText();

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div>
            <h1
                ref={textRef}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
        font-bold text-white text-center
        bg-black/40 backdrop-blur-md px-12 py-8 rounded-2xl shadow-xl
        md:text-3xl lg:text-4xl xl:text-5xl text-2xl"
            ></h1>

            <video
                src="templatevideo.mp4"
                className="absolute w-full h-full object-cover -top-10 -z-10"
                autoPlay
                loop
                muted
            ></video>
        </div>
    );
}
