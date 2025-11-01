import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Search, Filter } from 'lucide-react';

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
    naziv: string; // naziv_firme ili ime + prezime
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
    ObavezaPDV: number; // 0 ili 1
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

    // Učitaj fakture sa servera
    useEffect(() => {
        ucitajFakture();
    }, []);

    const ucitajFakture = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            // Uzmi userData iz localStorage
            const userDataString = localStorage.getItem('userData');

            if (!userDataString) {
                setError('Korisnik nije prijavljen');
                setLoading(false);
                return;
            }

            const userData: UserData = JSON.parse(userDataString);

            // Proveri da li postoji PIB
            if (!userData.pib) {
                setError('PIB nije pronađen');
                setLoading(false);
                return;
            }

            // Uzmi CSRF token ako postoji
            const csrfTokenElement = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
            const csrfToken = csrfTokenElement?.getAttribute('content');

            // API poziv ka serveru - šalji PIB u query parametrima
            // POST request sa userData u body-u
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
                    body: JSON.stringify(userData) // Šalje ceo userData objekat
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP greška! Status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();

            if (result.success) {
                // Mapuj podatke sa servera u format za prikaz
                const mapovaniFakture: Dokument[] = result.data.map((faktura: FakturaApiResponse) => {
                    return {
                        id: faktura.id,
                        brojDokumenta: faktura.BrojDokumenta.toString(),
                        tipDokumenta: faktura.TipDokumenta,
                        status: 'Poslato', // Možeš dodati status kolonu u bazu kasnije
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

                // Postavi statistiku ako postoji
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
            {!loading && (
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
                                        onClick={() => toggleSelect(dokument.id)}
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
        </div>
    );
}
