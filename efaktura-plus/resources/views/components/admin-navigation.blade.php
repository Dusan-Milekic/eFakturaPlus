<nav class="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 backdrop-blur-xl border-r border-blue-500/20 shadow-2xl shadow-blue-500/10 overflow-y-auto">
    <div class="p-6">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-10 pb-6 border-b border-blue-500/20">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </div>
            <div>
                <h1 class="text-lg font-bold text-white">Admin Panel</h1>
                <p class="text-xs text-gray-400">eFaktura Plus</p>
            </div>
        </div>

        <!-- Section Title -->
        <div class="mb-3">
            <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Tabele u Bazi</h2>
        </div>

        <!-- Navigation Links -->
        <div class="space-y-1">
            {{ $slot }}
        </div>
    </div>
</nav>

<!-- Spacer -->
<div class="ml-64"></div>

<style>
    nav ul {
        @apply space-y-1;
    }

    nav li {
        @apply list-none;
    }

    nav a {
        @apply relative flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 font-medium transition-all duration-200 rounded-lg hover:text-white hover:bg-blue-500/10 group;
    }

    nav a::before {
        content: '';
        @apply absolute left-0 top-1/2 -translate-y-1/2 h-0 w-0.5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full transition-all duration-200;
    }

    nav a:hover::before {
        @apply h-8;
    }

    nav a svg {
        @apply w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-200;
    }

    nav a span {
        @apply truncate;
    }

    /* Custom Scrollbar */
    nav::-webkit-scrollbar {
        width: 6px;
    }

    nav::-webkit-scrollbar-track {
        background: transparent;
    }

    nav::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.3);
        border-radius: 3px;
    }

    nav::-webkit-scrollbar-thumb:hover {
        background: rgba(59, 130, 246, 0.5);
    }
</style>
