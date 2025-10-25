export default function Burger() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <defs>
                <linearGradient id="gradMenu" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#2196F3" />
                    <stop offset="100%" stop-color="#0D47A1" />
                </linearGradient>
                <filter id="menuGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#2196F3" flood-opacity="0.6" />
                </filter>
            </defs>


            <rect width="48" height="48" rx="10" fill="#0A0A0A" />


            <g filter="url(#menuGlow)">
                <rect x="12" y="14" width="24" height="3" rx="1.5" fill="url(#gradMenu)" />
                <rect x="12" y="22" width="24" height="3" rx="1.5" fill="url(#gradMenu)" />
                <rect x="12" y="30" width="24" height="3" rx="1.5" fill="url(#gradMenu)" />
            </g>
        </svg>

    )
}
