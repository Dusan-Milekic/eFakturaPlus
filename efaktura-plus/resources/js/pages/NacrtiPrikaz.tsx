import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Search, Filter, X, Eye, ChevronLeft } from 'lucide-react';
import preuzmiPDF from './NacrtiPrikazPDF';

interface Dokument {
    id: number;
    brojDokumenta: string;
    tipDokumenta: string;
    status: string;
    iznos: string;
    datumPrometa: string;
    datumSlanja: string;
    kupacNaziv?: string;
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
    naziv: string;
    pib: string | null;
    jmbg: string;
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

export default function NacrtiPrikaz() {
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

            if (!userData.pib) {
                setError('PIB nije pronađen');
                setLoading(false);
                return;
            }

            const csrfTokenElement = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
            const csrfToken = csrfTokenElement?.getAttribute('content');

            const response = await fetch(
                "/vratiFakture",
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

            const result: ApiResponse = await response.json();

            if (result.success) {
                const mapovaniFakture: Dokument[] = result.data.map((faktura: FakturaApiResponse) => {
                    return {
                        id: faktura.id,
                        brojDokumenta: faktura.BrojDokumenta.toString(),
                        tipDokumenta: faktura.TipDokumenta,
                        status: 'Poslato',
                        iznos: `${formatBroj(faktura.ukupno_sa_pdv)} ${faktura.ListaValuta}`,
                        datumPrometa: formatDatum(faktura.DatumPrometa),
                        datumSlanja: formatDatum(faktura.created_at),
                        kupacNaziv: faktura.kupac.naziv,
                        ukupnoBezPDV: faktura.ukupno_bez_pdv,
                        ukupanPDV: faktura.ukupan_pdv,
                        ukupnoSaPDV: faktura.ukupno_sa_pdv
                    };
                });

                setDokumenti(mapovaniFakture);

                if (result.statistika) {
                    setStatistika({
                        ukupnoFaktura: result.statistika.ukupno_faktura || 0,
                        ukupanIznosBezPDV: result.statistika.ukupan_iznos_bez_pdv || 0,
                        ukupanPDV: result.statistika.ukupan_pdv || 0,
                        ukupanIznosSaPDV: result.statistika.ukupan_iznos_sa_pdv || 0
                    });
                }
            } else {
                setError(result.message || 'Greška pri učitavanju faktura');
            }

        } catch (err) {
            console.error('Greška pri učitavanju faktura:', err);
            setError(err instanceof Error ? err.message : 'Nepoznata greška');
        } finally {
            setLoading(false);
        }
    };

    // Učitaj detalje pojedinačne fakture
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

            // API poziv za detalje fakture - prilagodi URL-u tvog backend-a
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
                setError(result.message || 'Greška pri učitavanju detalja fakture');
            }

        } catch (err) {
            console.error('Greška pri učitavanju detalja:', err);
            setError(err instanceof Error ? err.message : 'Nepoznata greška');
        } finally {
            setUcitavanjeDetalja(false);
        }
    };

    // Pomoćne funkcije za formatiranje
    const formatBroj = (broj: number): string => {
        return new Intl.NumberFormat('sr-RS', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(broj);
    };

    const formatDatum = (datum: string): string => {
        const date = new Date(datum);
        return date.toLocaleDateString('sr-RS');
    };

    const toggleSelect = (id: number): void => {
        setSelectedDocs(prev =>
            prev.includes(id)
                ? prev.filter(docId => docId !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = (): void => {
        if (selectedDocs.length === dokumenti.length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(dokumenti.map(d => d.id));
        }
    };

    const handleRowClick = (dokument: Dokument, e: React.MouseEvent): void => {
        // Spreči otvaranje detalja kada se klikne checkbox
        if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
            return;
        }
        ucitajDetaljeFakture(dokument.id);
    };

    const zatvoriDetalje = (): void => {
        setPrikaziDetalje(false);
        setOdabranaFaktura(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#132744] to-[#0a1628] p-6">
            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-slate-400">Učitavanje faktura...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <FileText className="text-red-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-red-400 font-semibold">Greška</h3>
                            <p className="text-slate-300 text-sm">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={ucitajFakture}
                        className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                    >
                        Pokušaj ponovo
                    </button>
                </div>
            )}

            {/* Main Content - Show only when not loading */}
            {!loading && !prikaziDetalje && (
                <>
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Izlazni dokumenti</h1>
                        <p className="text-slate-400">Pregled i upravljanje nacrtima dokumenata</p>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-slate-700/50">
                        <div className="flex flex-wrap gap-3 items-center justify-between">
                            <div className="flex gap-3 flex-wrap">
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-cyan-500/20">
                                    <Upload size={18} />
                                    Izvezi u CSV
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20">
                                    <Download size={18} />
                                    Učitaj datoteku
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/20">
                                    <FileText size={18} />
                                    Kreiraj novi dokument
                                </button>
                            </div>

                            <div className="flex gap-3 items-center">
                                <button
                                    onClick={ucitajFakture}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 rounded-xl transition-colors border border-slate-600/50"
                                >
                                    <Filter size={18} />
                                    Osveži
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Stats Section */}
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Pretraga</label>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Pretraži..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Company Filter */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Kompanija</label>
                                <select className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                                    <option>Sve kompanije</option>
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="lg:col-span-2">
                                <label className="block text-sm text-slate-400 mb-2">Period</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        value={datumOd}
                                        onChange={(e) => setDatumOd(e.target.value)}
                                        className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                    <span className="text-slate-500">→</span>
                                    <input
                                        type="date"
                                        value={datumDo}
                                        onChange={(e) => setDatumDo(e.target.value)}
                                        className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <FileText className="text-blue-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Odabrani redovi</p>
                                    <p className="text-white font-semibold">{selectedDocs.length}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-500/20 rounded-xl">
                                    <FileText className="text-purple-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Ukupan iznos</p>
                                    <p className="text-white font-semibold">{formatBroj(statistika.ukupanIznosSaPDV)} RSD</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/20 rounded-xl">
                                    <FileText className="text-emerald-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Ukupno</p>
                                    <p className="text-white font-semibold">{statistika.ukupnoFaktura}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-5 border-b border-slate-700/50 text-sm font-medium text-slate-400">
                            <div className="col-span-1 flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedDocs.length === dokumenti.length && dokumenti.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                                />
                            </div>
                            <div className="col-span-2">Broj dokumenta</div>
                            <div className="col-span-2">Tip dokumenta</div>
                            <div className="col-span-2">Kupac</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2">Iznos</div>
                            <div className="col-span-1">Datum prometa</div>
                            <div className="col-span-1">Datum slanja</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-slate-700/50">
                            {dokumenti.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FileText className="mx-auto text-slate-600 mb-3" size={48} />
                                    <p className="text-slate-400">Nema pronađenih faktura</p>
                                </div>
                            ) : (
                                dokumenti.map((dokument) => (
                                    <div
                                        key={dokument.id}
                                        className={`grid grid-cols-12 gap-4 p-5 hover:bg-slate-700/20 transition-colors cursor-pointer ${selectedDocs.includes(dokument.id) ? 'bg-blue-500/10' : ''
                                            }`}
                                        onClick={(e) => handleRowClick(dokument, e)}
                                    >
                                        <div className="col-span-1 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocs.includes(dokument.id)}
                                                onChange={() => toggleSelect(dokument.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                                            />
                                        </div>
                                        <div className="col-span-2 text-white font-medium">{dokument.brojDokumenta}</div>
                                        <div className="col-span-2 text-slate-300">{dokument.tipDokumenta}</div>
                                        <div className="col-span-2 text-slate-300">{dokument.kupacNaziv || '-'}</div>
                                        <div className="col-span-1">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                                {dokument.status}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-white font-medium">{dokument.iznos}</div>
                                        <div className="col-span-1 text-slate-300">{dokument.datumPrometa}</div>
                                        <div className="col-span-1 text-slate-300">{dokument.datumSlanja}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {dokumenti.length > 0 && (
                            <div className="p-5 border-t border-slate-700/50 flex items-center justify-between">
                                <div className="text-slate-400 text-sm">
                                    1-{dokumenti.length} od {statistika.ukupnoFaktura}
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 rounded-lg transition-colors text-sm">
                                        1
                                    </button>
                                    <button className="px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 rounded-lg transition-colors text-sm">
                                        10
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Detaljni prikaz fakture */}
            {prikaziDetalje && odabranaFaktura && (
                <div className=" bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-6">
                    <div className="w-full max-w-7xl my-6">
                        {/* Header sa dugmetom za zatvaranje */}
                        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-t-2xl p-6 border border-slate-700/50 border-b-0 flex items-center justify-between sticky top-6 z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={zatvoriDetalje}
                                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="text-slate-300" size={24} />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Faktura #{odabranaFaktura.BrojDokumenta}
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {odabranaFaktura.TipDokumenta} • {formatDatum(odabranaFaktura.DatumPrometa)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={zatvoriDetalje}
                                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                                <X className="text-slate-300" size={24} />
                            </button>
                        </div>

                        {/* Glavni sadržaj - Grid layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-b-2xl p-6 border border-slate-700/50">

                            {/* Leva strana - Detalji fakture */}
                            <div className="space-y-6">
                                {/* Osnovne informacije */}
                                <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <FileText className="text-blue-400" size={20} />
                                        Osnovne informacije
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">Broj dokumenta</p>
                                            <p className="text-white font-medium">{odabranaFaktura.BrojDokumenta}</p>
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
                                            <p className="text-white font-medium">{odabranaFaktura.prodavac.naziv}</p>
                                        </div>
                                        {odabranaFaktura.prodavac.pib && (
                                            <div>
                                                <p className="text-slate-400 text-sm mb-1">PIB</p>
                                                <p className="text-white font-medium">{odabranaFaktura.prodavac.pib}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">JMBG</p>
                                            <p className="text-white font-medium">{odabranaFaktura.prodavac.jmbg}</p>
                                        </div>
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
                                            <p className="text-white font-medium">{odabranaFaktura.kupac.naziv}</p>
                                        </div>
                                        {odabranaFaktura.kupac.pib && (
                                            <div>
                                                <p className="text-slate-400 text-sm mb-1">PIB</p>
                                                <p className="text-white font-medium">{odabranaFaktura.kupac.pib}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1">JMBG</p>
                                            <p className="text-white font-medium">{odabranaFaktura.kupac.jmbg}</p>
                                        </div>
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
                                        onClick={() => preuzmiPDF(odabranaFaktura.id)}
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
                </div>
            )}

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
