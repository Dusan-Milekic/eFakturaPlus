export function initializeTheme() {
    // Uvek forsiraj dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
}

export type Appearance = 'light' | 'dark' | 'system';
export function useAppearance() {
    // Uvek vrati dark mode
    const appearance: Appearance = 'dark';

    function updateAppearance(newAppearance: Appearance) {
        // Nista ne radi jer je dark mode forsiran
    }
    return { appearance, updateAppearance };
}
