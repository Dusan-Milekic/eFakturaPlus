// Dodaj ovu funkciju u komponentu
const preuzmiPDF = async (fakturaId: number) => {
    try {
        const csrfTokenElement = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
        const csrfToken = csrfTokenElement?.getAttribute('content');

        const response = await fetch(`/generisiPDF/${fakturaId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Greška pri generisanju PDF-a');
        }

        // Preuzmi PDF kao blob
        const blob = await response.blob();

        // Kreiraj link za download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Faktura_${fakturaId}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Greška pri preuzimanju PDF-a:', error);
        alert('Greška pri preuzimanju PDF-a');
    }
};
export default preuzmiPDF;
