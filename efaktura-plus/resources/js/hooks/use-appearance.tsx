export function initializeTheme() {
    // Uvek forsiraj dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
}
