import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Search, Filter, X, Eye, ChevronLeft } from 'lucide-react';

interface Dokument {
    id: number;
    brojDokumenta: string;
    tipDokumenta: string;
    status: string;
    iznos: string;
    datumPrometa: string;
    datumSlanja: string;
    prodavacNaziv?: string;
    ukupnoBezPDV: number;
    ukupanPDV: number;
    ukupnoSaPDV: number;
}

interface Statistika {
    ukupnoFaktura: number;
    ukupanIznosBezPDV: number;
    ukupanPDV: number;
    ukupanIznosSaPDV: number;
}

interface UserData {
    id: number;
    pib: string;
    email: string;
    jmbg: string;
    naziv_firme?: string;
}

// API Response tipovi
interface PravnoLice {
    naziv?: string;
    naziv_firme?: string;
    pib: string | null;
    jmbg: string;
    adresa?: string;
    grad?: string;
    telefon?: string;
    email?: string;
}

interface FakturaApiResponse {
    id: number;
    BrojDokumenta: number;
    TipDokumenta: string;
    ListaValuta: 'RSD' | 'EUR' | 'USD';
    BrojUgovora: string | null;
    DatumPrometa: string;
    DatumDospeca: string | null;
    ObavezaPDV: number;
    created_at: string;
    updated_at: string;
    prodavac: PravnoLice;
    kupac: PravnoLice;
    ukupno_bez_pdv: number;
    ukupan_pdv: number;
    ukupno_sa_pdv: number;
    status?: {
        id: number;
        status: string;
        FakturaFK: number;
    };
}

interface StatistikaApiResponse {
    ukupno_faktura: number;
    ukupan_iznos_bez_pdv: number;
    ukupan_pdv: number;
    ukupan_iznos_sa_pdv: number;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: FakturaApiResponse[];
    statistika?: StatistikaApiResponse;
}

// Tip za detaljnu fakturu
interface DetaljiFakture extends FakturaApiResponse {
    napomena?: string;
    napomena_interna?: string;
    mesto_izdavanja?: string;
    rok_placanja_dani?: number;
    popust_procenat?: number;
    popust_iznos?: number;
}

export default function UlazniDokumenti() {
    const [dokumenti, setDokumenti] = useState<Dokument[]>([]);
    const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [statistika, setStatistika] = useState<Statistika>({
        ukupnoFaktura: 0,
        ukupanIznosBezPDV: 0,
        ukupanPDV: 0,
        ukupanIznosSaPDV: 0
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [datumOd, setDatumOd] = useState<string>('2022-01-01');
    const [datumDo, setDatumDo] = useState<string>('2025-11-01');

    // Detaljni prikaz fakture
    const [odabranaFaktura, setOdabranaFaktura] = useState<DetaljiFakture | null>(null);
    const [prikaziDetalje, setPrikaziDetalje] = useState<boolean>(false);
    const [ucitavanjeDetalja, setUcitavanjeDetalja] = useState<boolean>(false);

    // Učitaj fakture sa servera
    useEffect(() => {
        ucitajFakture();
    }, []);

    const ucitajFakture = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const userDataString = localStorage.getItem('userData');

            if (!userDataString) {
                setError('Korisnik nije prijavljen');
                setLoading(false);
                return;
            }

            const userData: UserData = JSON.parse(userDataString);

            if (!userData.id) {
                setError('ID korisnika nije pronađen');
                setLoading(false);
                return;
            }

            // ✅ JEDINA RAZLIKA - ovde menjamo fetch link
            const params = new URLSearchParams({
                kupac_id: userData.id.toString(),
                per_page: '50'
            });

            const response = await fetch(
                `/api/fakture/ulazne?${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP greška! Status: ${response.status}`);
            }

            const result: any = await response.json();

            console.log('🔥 CELA STRUKTURA:', result);
            console.log('🔥 result.data:', result.data);
            console.log('🔥 result.fakture:', result.fakture);
            console.log('🔥 result keys:', Object.keys(result));

            // Proveri gde su fakture - može biti result.data ili result.fakture
            const fakture = result.data || result.fakture || [];
            console.log('✅ Našao fakture:', fakture);

            if (result.success && fakture.length > 0) {
                const mapovaniFakture: Dokument[] = fakture.map((faktura: FakturaApiResponse) => {
                    console.log('📄 Cela faktura:', faktura);
                    console.log('👤 Prodavac:', faktura.prodavac);
                    console.log('👤 Type of prodavac:', typeof faktura.prodavac);
                    console.log('👤 Prodavac keys:', faktura.prodavac ? Object.keys(faktura.prodavac) : 'nema');

                    // Pokušaj sve moguće varijante
                    let prodavacNaziv = 'N/A';
                    if (faktura.prodavac) {
                        if (typeof faktura.prodavac === 'object') {
                            prodavacNaziv = faktura.prodavac.naziv ||
                                faktura.prodavac.naziv_firme ||
                                faktura.prodavac.name ||
                                'N/A';
                        } else {
                            prodavacNaziv = String(faktura.prodavac);
                        }
                    }

                    console.log('✅ Odabran naziv:', prodavacNaziv);

                    return {
                        id: faktura.id,
                        brojDokumenta: faktura.BrojDokumenta.toString(),
                        tipDokumenta: faktura.TipDokumenta,
                        status: faktura.status?.status || 'Nepoznat',
                        iznos: `${formatBroj(faktura.ukupno_sa_pdv)} ${faktura.ListaValuta}`,
                        datumPrometa: formatDatum(faktura.DatumPrometa),
                        datumSlanja: formatDatum(faktura.created_at),
                        prodavacNaziv: prodavacNaziv,
                        ukupnoBezPDV: faktura.ukupno_bez_pdv,
                        ukupanPDV: faktura.ukupan_pdv,
                        ukupnoSaPDV: faktura.ukupno_sa_pdv
                    };
                });

                setDokumenti(mapovaniFakture);

                if (result.statistika) {
                    setStatistika({
                        ukupnoFaktura: result.statistika.ukupno_faktura,
                        ukupanIznosBezPDV: result.statistika.ukupan_iznos_bez_pdv,
                        ukupanPDV: result.statistika.ukupan_pdv,
                        ukupanIznosSaPDV: result.statistika.ukupan_iznos_sa_pdv
                    });
                }
            } else {
                throw new Error(result.message || 'Greška pri učitavanju faktura');
            }
        } catch (error) {
            console.error('Greška pri učitavanju faktura:', error);
            setError(error instanceof Error ? error.message : 'Nepoznata greška');
        } finally {
            setLoading(false);
        }
    };

    const ucitajDetaljeFakture = async (fakturaId: number): Promise<void> => {
        try {
            setUcitavanjeDetalja(true);
            setError(null);

            const userDataString = localStorage.getItem('userData');
            if (!userDataString) {
                setError('Korisnik nije prijavljen');
                return;
            }

            const userData: UserData = JSON.parse(userDataString);
            const csrfTokenElement = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
            const csrfToken = csrfTokenElement?.getAttribute('content');

            // API poziv za detalje fakture - isti kao NacrtiPrikaz
            const response = await fetch(
                `/vratiFakturu/${fakturaId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
                    },
                    credentials: 'include',
                    body: JSON.stringify(userData)
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP greška! Status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setOdabranaFaktura(result.data);
                setPrikaziDetalje(true);
            } else {
                throw new Error(result.message || 'Greška pri učitavanju detalja fakture');
            }
        } catch (error) {
            console.error('Greška pri učitavanju detalja fakture:', error);
            setError(error instanceof Error ? error.message : 'Nepoznata greška');
        } finally {
            setUcitavanjeDetalja(false);
        }
    };

    const zatvoriDetalje = (): void => {
        setPrikaziDetalje(false);
        setOdabranaFaktura(null);
    };

    const toggleSelectDoc = (id: number): void => {
        setSelectedDocs(prev =>
            prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = (): void => {
        if (selectedDocs.length === filtriraneDokumente().length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(filtriraneDokumente().map(doc => doc.id));
        }
    };

    const filtriraneDokumente = (): Dokument[] => {
        return dokumenti.filter(doc => {
            const matchesSearch = searchTerm === '' ||
                doc.brojDokumenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.prodavacNaziv?.toLowerCase().includes(searchTerm.toLowerCase());

            const docDate = new Date(doc.datumPrometa);
            const matchesDateRange = docDate >= new Date(datumOd) && docDate <= new Date(datumDo);

            return matchesSearch && matchesDateRange;
        });
    };

    const formatDatum = (datum: string): string => {
        return new Date(datum).toLocaleDateString('sr-RS', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatBroj = (broj: number): string => {
        return broj.toLocaleString('sr-RS', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const getStatusColor = (status: string): string => {
        switch (status?.toLowerCase()) {
            case 'poslato':
                return 'bg-blue-500/20 text-blue-400';
            case 'odobreno':
                return 'bg-green-500/20 text-green-400';
            case 'odbijeno':
                return 'bg-red-500/20 text-red-400';
            case 'nacrt':
            default:
                return 'bg-yellow-500/20 text-yellow-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-white text-lg">Učitavanje dokumenata...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 max-w-md">
                    <h3 className="text-red-400 text-xl font-semibold mb-2">Greška</h3>
                    <p className="text-white">{error}</p>
                    <button
                        onClick={ucitajFakture}
                        className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                        Pokušaj ponovo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            {!prikaziDetalje && (
                <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">Ulazni dokumenti</h1>
                                <p className="text-slate-400">Pregledajte i upravljajte ulaznim fakturama</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <p className="text-slate-400 text-xs mb-1">Ukupno faktura</p>
                                    <p className="text-white text-xl font-bold">{statistika.ukupnoFaktura}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <p className="text-slate-400 text-xs mb-1">Bez PDV</p>
                                    <p className="text-white text-xl font-bold">{formatBroj(statistika.ukupanIznosBezPDV)}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <p className="text-slate-400 text-xs mb-1">PDV</p>
                                    <p className="text-white text-xl font-bold">{formatBroj(statistika.ukupanPDV)}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <p className="text-slate-400 text-xs mb-1">Sa PDV</p>
                                    <p className="text-emerald-400 text-xl font-bold">{formatBroj(statistika.ukupanIznosSaPDV)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!prikaziDetalje ? (
                <div className="container mx-auto px-6 py-8">
                    {/* Filters */}
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Pretraži po broju ili prodavcu..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            {/* Date filters */}
                            <div className="flex gap-3">
                                <input
                                    type="date"
                                    value={datumOd}
                                    onChange={(e) => setDatumOd(e.target.value)}
                                    className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                                <input
                                    type="date"
                                    value={datumDo}
                                    onChange={(e) => setDatumDo(e.target.value)}
                                    className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            {/* Refresh button */}
                            <button
                                onClick={ucitajFakture}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
                            >
                                Osveži
                            </button>
                        </div>
                    </div>

                    {/* Documents Table */}
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/50 border-b border-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocs.length === filtriraneDokumente().length && filtriraneDokumente().length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Broj dokumenta</th>
                                        <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Prodavac</th>
                                        <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Tip</th>
                                        <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Status</th>
                                        <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Datum prometa</th>
                                        <th className="px-6 py-4 text-right text-slate-300 font-semibold text-sm">Iznos</th>
                                        <th className="px-6 py-4 text-center text-slate-300 font-semibold text-sm">Akcije</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtriraneDokumente().length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                                <FileText className="mx-auto mb-3 text-slate-600" size={48} />
                                                <p className="text-lg">Nema dokumenata za prikaz</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtriraneDokumente().map((doc) => (
                                            <tr
                                                key={doc.id}
                                                onClick={() => ucitajDetaljeFakture(doc.id)}
                                                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDocs.includes(doc.id)}
                                                        onChange={() => toggleSelectDoc(doc.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-white font-medium">{doc.brojDokumenta}</td>
                                                <td className="px-6 py-4 text-white">{doc.prodavacNaziv || '-'}</td>
                                                <td className="px-6 py-4 text-slate-300">{doc.tipDokumenta}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{doc.datumPrometa}</td>
                                                <td className="px-6 py-4 text-right text-white font-semibold">
                                                    {doc.iznos}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                ucitajDetaljeFakture(doc.id);
                                                            }}
                                                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                                                            title="Pregledaj detalje"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(`/generisiPDF/${doc.id}`, '_blank');
                                                            }}
                                                            className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
                                                            title="Preuzmi PDF"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : odabranaFaktura ? (
                // Detail View
                <div className="container mx-auto px-6 py-8">
                    <div className="mb-6">
                        <button
                            onClick={zatvoriDetalje}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl transition-colors border border-slate-700/50"
                        >
                            <ChevronLeft size={20} />
                            Nazad na listu
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Leva strana - Informacije */}
                        <div className="space-y-6">
                            {/* Osnovne informacije */}
                            <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText className="text-blue-400" size={20} />
                                    Osnovne informacije
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Broj dokumenta</p>
                                        <p className="text-white font-medium">{odabranaFaktura.BrojDokumenta}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(odabranaFaktura.status?.status || 'Nacrt')}`}>
                                            {odabranaFaktura.status?.status || 'Nacrt'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Tip dokumenta</p>
                                        <p className="text-white font-medium">{odabranaFaktura.TipDokumenta}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Valuta</p>
                                        <p className="text-white font-medium">{odabranaFaktura.ListaValuta}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Broj ugovora</p>
                                        <p className="text-white font-medium">{odabranaFaktura.BrojUgovora || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Datum prometa</p>
                                        <p className="text-white font-medium">{formatDatum(odabranaFaktura.DatumPrometa)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Datum dospeća</p>
                                        <p className="text-white font-medium">
                                            {odabranaFaktura.DatumDospeca ? formatDatum(odabranaFaktura.DatumDospeca) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Obaveza PDV</p>
                                        <p className="text-white font-medium">
                                            {odabranaFaktura.ObavezaPDV ? 'Da' : 'Ne'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Kreirano</p>
                                        <p className="text-white font-medium">{formatDatum(odabranaFaktura.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Prodavac */}
                            <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText className="text-emerald-400" size={20} />
                                    Prodavac
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Naziv</p>
                                        <p className="text-white font-medium">
                                            {odabranaFaktura.prodavac?.naziv || odabranaFaktura.prodavac?.naziv_firme || 'N/A'}
                                        </p>
                                    </div>
                                    {odabranaFaktura.prodavac?.pib && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">PIB</p>
                                            <p className="text-white font-medium">{odabranaFaktura.prodavac.pib}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.prodavac?.jmbg && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">JMBG</p>
                                            <p className="text-white font-medium">{odabranaFaktura.prodavac.jmbg}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.prodavac?.adresa && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Adresa</p>
                                            <p className="text-white font-medium">{odabranaFaktura.prodavac.adresa}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.prodavac?.grad && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Grad</p>
                                            <p className="text-white font-medium">{odabranaFaktura.prodavac.grad}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.prodavac?.telefon && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Telefon</p>
                                            <p className="text-white font-medium">{odabranaFaktura.prodavac.telefon}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.prodavac?.email && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Email</p>
                                            <p className="text-white font-medium">{odabranaFaktura.prodavac.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Kupac */}
                            <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText className="text-purple-400" size={20} />
                                    Kupac
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Naziv</p>
                                        <p className="text-white font-medium">
                                            {odabranaFaktura.kupac?.naziv || odabranaFaktura.kupac?.naziv_firme || 'N/A'}
                                        </p>
                                    </div>
                                    {odabranaFaktura.kupac?.pib && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">PIB</p>
                                            <p className="text-white font-medium">{odabranaFaktura.kupac.pib}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.kupac?.jmbg && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">JMBG</p>
                                            <p className="text-white font-medium">{odabranaFaktura.kupac.jmbg}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.kupac?.adresa && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Adresa</p>
                                            <p className="text-white font-medium">{odabranaFaktura.kupac.adresa}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.kupac?.grad && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Grad</p>
                                            <p className="text-white font-medium">{odabranaFaktura.kupac.grad}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.kupac?.telefon && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Telefon</p>
                                            <p className="text-white font-medium">{odabranaFaktura.kupac.telefon}</p>
                                        </div>
                                    )}
                                    {odabranaFaktura.kupac?.email && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Email</p>
                                            <p className="text-white font-medium">{odabranaFaktura.kupac.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Finansijski podaci */}
                            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-blue-500/30">
                                <h3 className="text-lg font-semibold text-white mb-4">Finansijski pregled</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                                        <span className="text-slate-300">Iznos bez PDV</span>
                                        <span className="text-white font-semibold text-lg">
                                            {formatBroj(odabranaFaktura.ukupno_bez_pdv)} {odabranaFaktura.ListaValuta}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                                        <span className="text-slate-300">PDV</span>
                                        <span className="text-white font-semibold text-lg">
                                            {formatBroj(odabranaFaktura.ukupan_pdv)} {odabranaFaktura.ListaValuta}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-white font-semibold text-lg">Ukupno sa PDV</span>
                                        <span className="text-blue-400 font-bold text-2xl">
                                            {formatBroj(odabranaFaktura.ukupno_sa_pdv)} {odabranaFaktura.ListaValuta}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Akcije */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.open(`/generisiPDF/${odabranaFaktura.id}`, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                                >
                                    <Download size={18} />
                                    Preuzmi PDF
                                </button>
                                <button
                                    onClick={() => window.open(`/generisiPDF/${odabranaFaktura.id}`, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/20"
                                >
                                    <Eye size={18} />
                                    Pregledaj PDF
                                </button>
                            </div>
                        </div>

                        {/* Desna strana - PDF Viewer */}
                        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden lg:sticky lg:top-24 lg:self-start">
                            <div className="bg-slate-800/50 p-4 border-b border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Eye className="text-cyan-400" size={20} />
                                    PDF pregled
                                </h3>
                            </div>
                            <div className="p-0 h-[600px] bg-slate-900">
                                <iframe
                                    src={`/generisiPDF/${odabranaFaktura.id}`}
                                    className="w-full h-full border-0"
                                    title="PDF Preview"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Loading overlay za detalje */}
            {ucitavanjeDetalja && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-white text-lg">Učitavanje detalja fakture...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
