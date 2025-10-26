import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, InertiaPlugin, Observer, ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText, TextPlugin);

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<StrictMode><App {...props} /></StrictMode>);

        window.addEventListener('load', () => {
            if (!ScrollSmoother.get()) {
                ScrollSmoother.create({
                    wrapper: '#smooth-wrapper',
                    content: '#smooth-content',
                    smooth: 1.5,
                    effects: true,
                    normalizeScroll: true,
                    smoothTouch: 0.1,
                });
            }
            ScrollTrigger.refresh();
        });
    },
    progress: {
        color: '#3B82F6',
    },
});

initializeTheme();
