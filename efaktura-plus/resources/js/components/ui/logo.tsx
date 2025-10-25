export default function Logo() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="260" height="90" viewBox="0 0 260 90">
            <defs>
                <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#2196F3" />
                    <stop offset="100%" stop-color="#0D47A1" />
                </linearGradient>


                <radialGradient id="glow" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stop-color="#2196F3" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="#0A0A0A" stop-opacity="0" />
                </radialGradient>
            </defs>

            <rect width="260" height="90" rx="14" fill="#0A0A0A" />


            <circle cx="55" cy="45" r="35" fill="url(#glow)" />

            <circle cx="55" cy="45" r="25" fill="url(#gradBlue)" />
            <path d="M43 45a12 12 0 1 1 12 12h-9"
                stroke="white" stroke-width="3" fill="none"
                stroke-linecap="round" stroke-linejoin="round" />


            <text x="95" y="50"
                font-family="Inter, Poppins, Segoe UI, sans-serif"
                font-size="28" font-weight="600"
                fill="#F5F5F5" letter-spacing="0.5">
                eFaktura
            </text>


            <text x="95" y="68"
                font-family="Inter, Poppins, Segoe UI, sans-serif"
                font-size="14" font-weight="400"
                fill="#9E9E9E" letter-spacing="0.3">
                Dušan Milekić
            </text>
        </svg>


    )

}
