import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface Stavka {
    id: number;
    Sifra: number | null;
    Naziv: string;
    Kolicina: number;
    JedinicaMere: string;
    Cena: number;
    Umanjenje: number;
    PDV: number;
    Kategorija: string;
}

interface Faktura {
    id: number;
    ListaValuta: string;
    TipDokumenta: string;
    BrojDokumenta: number;
    BrojUgovora: string | null;
    DatumPrometa: string;
    DatumDospeca: string | null;
    ObavezaPDV: boolean;
    ProdavacFK: number;
    KupacFK: number;
    prodavac: {
        id: number;
        naziv_firme: string;
        pib: string;
        jmbg: string;
        grad: string;
        adresa: string;
        email: string;
        telefon: string;
    };
    stavke: Stavka[];
    status?: {
        id: number;
        status: string;
    };
    ukupno_bez_pdv: number;
    ukupan_pdv: number;
    ukupno_sa_pdv: number;
    created_at: string;
}

interface User {
    id: number;
    username: string;
    ime: string;
    prezime: string;
    email: string;
    naziv_firme: string;
    jmbg: string;
    pib: string;
}

interface Statistika {
    ukupno_faktura: number;
    ukupan_iznos_bez_pdv: number;
    ukupan_pdv: number;
    ukupan_iznos_sa_pdv: number;
    po_statusu: {
        placeno: number;
        na_cekanju: number;
        odbijeno: number;
        bez_statusa: number;
    };
}

export default function UlazniDokumenti() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [fakture, setFakture] = useState<Faktura[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [selectedFaktura, setSelectedFaktura] = useState<Faktura | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('sve');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statistika, setStatistika] = useState<Statistika>({
        ukupno_faktura: 0,
        ukupan_iznos_bez_pdv: 0,
        ukupan_pdv: 0,
        ukupan_iznos_sa_pdv: 0,
        po_statusu: {
            placeno: 0,
            na_cekanju: 0,
            odbijeno: 0,
            bez_statusa: 0
        }
    });

    // Load user data from localStorage
    useEffect(() => {
        const loadUserData = () => {
            try {
                const userData = localStorage.getItem('userData');
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        };

        loadUserData();
    }, []);

    // Fetch invoices when user, filter or search changes
    useEffect(() => {
        if (user?.id) {
            fetchUlazneFakture();
        }
    }, [user, filterStatus, searchTerm]);

    // GSAP animation
    useEffect(() => {
        const container = containerRef.current;
        if (!container || fakture.length === 0) return;

        gsap.set(container.children, { y: 40, opacity: 0 });
        const tl = gsap.timeline();
        tl.to(container.children, {
            y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out"
        });
    }, [fakture]);

    const fetchUlazneFakture = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                kupac_id: user.id.toString(),
                per_page: '50'
            });

            if (filterStatus && filterStatus !== 'sve') {
                params.append('status', filterStatus);
            }

            if (searchTerm && searchTerm.trim() !== '') {
                params.append('search', searchTerm.trim());
            }

            const response = await fetch(`/api/fakture/ulazne?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch invoices');
            }

            const data = await response.json();

            if (data.success) {
                setFakture(data.fakture || []);
                setStatistika(data.statistika || {
                    ukupno_faktura: 0,
                    ukupan_iznos_bez_pdv: 0,
                    ukupan_pdv: 0,
                    ukupan_iznos_sa_pdv: 0,
                    po_statusu: {
                        placeno: 0,
                        na_cekanju: 0,
                        odbijeno: 0,
                        bez_statusa: 0
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching ulazne fakture:', error);
            setFakture([]);
        } finally {
            setLoading(false);
        }
    };

    const izracunajUkupno = (stavke: Stavka[]) => {
        const ukupnoBezPDV = stavke.reduce((sum, stavka) => {
            return sum + ((stavka.Kolicina * stavka.Cena) - stavka.Umanjenje);
        }, 0);

        const ukupanPDV = stavke.reduce((sum, stavka) => {
            const iznosBezPDV = (stavka.Kolicina * stavka.Cena) - stavka.Umanjenje;
            return sum + (iznosBezPDV * stavka.PDV / 100);
        }, 0);

        return {
            ukupnoBezPDV: ukupnoBezPDV.toFixed(2),
            ukupanPDV: ukupanPDV.toFixed(2),
            ukupnoSaPDV: (ukupnoBezPDV + ukupanPDV).toFixed(2)
        };
    };

    const getStatusColor = (status?: string) => {
        if (!status) return 'bg-gray-500/20 text-gray-400';

        switch (status.toLowerCase()) {
            case 'plaćeno':
            case 'placeno':
                return 'bg-green-500/20 text-green-400';
            case 'na čekanju':
            case 'na cekanju':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'odbijeno':
                return 'bg-red-500/20 text-red-400';
            case 'primljen':
                return 'bg-blue-500/20 text-blue-400';
            default:
                return 'bg-purple-500/20 text-purple-400';
        }
    };

    const handleDownloadPDF = async (fakturaId: number) => {
        try {
            const response = await fetch(`/faktura/${fakturaId}/pdf`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Faktura_${fakturaId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Greška pri preuzimanju PDF-a');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-white text-xl mt-4">Učitavanje faktura...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8 px-4">
            <div className="max-w-7xl mx-auto" ref={containerRef}>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Ulazni Dokumenti
                    </h1>
                    <p className="text-gray-400">Pregled primljenih faktura</p>
                </div>

                {/* Filters */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Pretraga
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Pretraži po nazivu firme, PIB-u ili broju fakture..."
                                className="w-full px-4 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="sve">Sve fakture</option>
                                <option value="plaćeno">Plaćeno</option>
                                <option value="na čekanju">Na čekanju</option>
                                <option value="odbijeno">Odbijeno</option>
                                <option value="primljen">Primljeno</option>
                                <option value="bez_statusa">Bez statusa</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-gray-400 text-sm mb-1">Ukupno faktura</div>
                        <div className="text-white text-3xl font-bold">{statistika.ukupno_faktura}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-gray-400 text-sm mb-1">Plaćeno</div>
                        <div className="text-white text-3xl font-bold">
                            {statistika.po_statusu.placeno}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-gray-400 text-sm mb-1">Na čekanju</div>
                        <div className="text-white text-3xl font-bold">
                            {statistika.po_statusu.na_cekanju}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-gray-400 text-sm mb-1">Odbijeno</div>
                        <div className="text-white text-3xl font-bold">
                            {statistika.po_statusu.odbijeno}
                        </div>
                    </div>
                </div>

                {/* Invoices List */}
                <div className="space-y-4">
                    {fakture.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-400 text-lg">Nema faktura za prikaz</p>
                        </div>
                    ) : (
                        fakture.map((faktura) => {
                            const ukupno = faktura.ukupno_sa_pdv
                                ? {
                                    ukupnoBezPDV: faktura.ukupno_bez_pdv.toFixed(2),
                                    ukupanPDV: faktura.ukupan_pdv.toFixed(2),
                                    ukupnoSaPDV: faktura.ukupno_sa_pdv.toFixed(2)
                                }
                                : izracunajUkupno(faktura.stavke);

                            return (
                                <div
                                    key={faktura.id}
                                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all cursor-pointer"
                                    onClick={() => setSelectedFaktura(faktura)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left Side - Invoice Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-semibold text-white">
                                                    Faktura #{faktura.BrojDokumenta}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(faktura.status?.status)}`}>
                                                    {faktura.status?.status || 'Bez statusa'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-gray-400">Prodavac: </span>
                                                    <span className="text-white font-medium">{faktura.prodavac.naziv_firme}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">PIB: </span>
                                                    <span className="text-white font-medium">{faktura.prodavac.pib}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Datum prometa: </span>
                                                    <span className="text-white font-medium">
                                                        {new Date(faktura.DatumPrometa).toLocaleDateString('sr-RS')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Datum dospeća: </span>
                                                    <span className="text-white font-medium">
                                                        {faktura.DatumDospeca ? new Date(faktura.DatumDospeca).toLocaleDateString('sr-RS') : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side - Amount */}
                                        <div className="text-right">
                                            <div className="text-gray-400 text-sm mb-1">Iznos za plaćanje</div>
                                            <div className="text-3xl font-bold text-white">
                                                {ukupno.ukupnoSaPDV} {faktura.ListaValuta}
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1">
                                                ({ukupno.ukupnoBezPDV} + {ukupno.ukupanPDV} PDV)
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFaktura(faktura);
                                            }}
                                            className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors"
                                        >
                                            Pregled detalja
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadPDF(faktura.id);
                                            }}
                                            className="px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-600/30 transition-colors"
                                        >
                                            Preuzmi PDF
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Invoice Detail Modal */}
                {selectedFaktura && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl border border-white/10 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Faktura #{selectedFaktura.BrojDokumenta}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {selectedFaktura.TipDokumenta}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedFaktura(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Seller Info */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Podaci o prodavcu</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Naziv firme:</span>
                                            <div className="text-white font-medium mt-1">{selectedFaktura.prodavac.naziv_firme}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">PIB:</span>
                                            <div className="text-white font-medium mt-1">{selectedFaktura.prodavac.pib}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Adresa:</span>
                                            <div className="text-white font-medium mt-1">
                                                {selectedFaktura.prodavac.adresa}, {selectedFaktura.prodavac.grad}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Email:</span>
                                            <div className="text-white font-medium mt-1">{selectedFaktura.prodavac.email}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Telefon:</span>
                                            <div className="text-white font-medium mt-1">{selectedFaktura.prodavac.telefon || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Status:</span>
                                            <div className="mt-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFaktura.status?.status)}`}>
                                                    {selectedFaktura.status?.status || 'Bez statusa'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Invoice Details */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Detalji fakture</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Datum prometa:</span>
                                            <div className="text-white font-medium mt-1">
                                                {new Date(selectedFaktura.DatumPrometa).toLocaleDateString('sr-RS')}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Datum dospeća:</span>
                                            <div className="text-white font-medium mt-1">
                                                {selectedFaktura.DatumDospeca
                                                    ? new Date(selectedFaktura.DatumDospeca).toLocaleDateString('sr-RS')
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Valuta:</span>
                                            <div className="text-white font-medium mt-1">{selectedFaktura.ListaValuta}</div>
                                        </div>
                                        {selectedFaktura.BrojUgovora && (
                                            <div>
                                                <span className="text-gray-400">Broj ugovora:</span>
                                                <div className="text-white font-medium mt-1">{selectedFaktura.BrojUgovora}</div>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-gray-400">PDV obaveza:</span>
                                            <div className="text-white font-medium mt-1">
                                                {selectedFaktura.ObavezaPDV ? 'Da' : 'Ne'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Stavke</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="text-left py-3 px-3 text-gray-400 font-medium">Rb.</th>
                                                    <th className="text-left py-3 px-3 text-gray-400 font-medium">Naziv</th>
                                                    <th className="text-right py-3 px-3 text-gray-400 font-medium">Količina</th>
                                                    <th className="text-right py-3 px-3 text-gray-400 font-medium">J.M.</th>
                                                    <th className="text-right py-3 px-3 text-gray-400 font-medium">Cena</th>
                                                    <th className="text-right py-3 px-3 text-gray-400 font-medium">Umanjenje</th>
                                                    <th className="text-right py-3 px-3 text-gray-400 font-medium">PDV %</th>
                                                    <th className="text-right py-3 px-3 text-gray-400 font-medium">Ukupno</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedFaktura.stavke.map((stavka, index) => {
                                                    const iznosBezPDV = (stavka.Kolicina * stavka.Cena) - stavka.Umanjenje;
                                                    const pdvIznos = iznosBezPDV * stavka.PDV / 100;
                                                    const ukupno = iznosBezPDV + pdvIznos;

                                                    return (
                                                        <tr key={stavka.id} className="border-b border-white/5">
                                                            <td className="py-3 px-3 text-white">{index + 1}</td>
                                                            <td className="py-3 px-3 text-white">{stavka.Naziv}</td>
                                                            <td className="py-3 px-3 text-white text-right">{stavka.Kolicina}</td>
                                                            <td className="py-3 px-3 text-white text-right">{stavka.JedinicaMere}</td>
                                                            <td className="py-3 px-3 text-white text-right">{stavka.Cena.toFixed(2)}</td>
                                                            <td className="py-3 px-3 text-white text-right">{stavka.Umanjenje.toFixed(2)}</td>
                                                            <td className="py-3 px-3 text-white text-right">{stavka.PDV}%</td>
                                                            <td className="py-3 px-3 text-white text-right font-medium">{ukupno.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                                    <div className="space-y-3 text-right max-w-md ml-auto">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Ukupno bez PDV</span>
                                            <span className="text-white font-semibold">
                                                {izracunajUkupno(selectedFaktura.stavke).ukupnoBezPDV} {selectedFaktura.ListaValuta}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Ukupan PDV</span>
                                            <span className="text-white font-semibold">
                                                {izracunajUkupno(selectedFaktura.stavke).ukupanPDV} {selectedFaktura.ListaValuta}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xl border-t border-white/10 pt-3">
                                            <span className="text-gray-400">Iznos za plaćanje</span>
                                            <span className="text-white font-bold">
                                                {izracunajUkupno(selectedFaktura.stavke).ukupnoSaPDV} {selectedFaktura.ListaValuta}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-4 justify-end">
                                    <button
                                        onClick={() => setSelectedFaktura(null)}
                                        className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                                    >
                                        Zatvori
                                    </button>
                                    <button
                                        onClick={() => handleDownloadPDF(selectedFaktura.id)}
                                        className="px-6 py-3 bg-blue-600/20 text-blue-400 rounded-xl font-medium hover:bg-blue-600/30 transition-colors"
                                    >
                                        Preuzmi PDF
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="px-6 py-3 bg-purple-600/20 text-purple-400 rounded-xl font-medium hover:bg-purple-600/30 transition-colors"
                                    >
                                        Štampaj
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
