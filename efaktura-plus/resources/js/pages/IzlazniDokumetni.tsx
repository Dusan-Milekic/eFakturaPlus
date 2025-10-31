import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const user = JSON.parse(localStorage.getItem('userData') || '{}');

interface PravnaLica {
    lica: Array<{ naziv_firme: string; jmbg: string }>;
}

interface Stavka {
    redniBroj: number;
    naziv: string;
    kolicina: number;
    jedinicaMere: string;
    cena: number;
    iznosUmanjenja: number;
    iznosBezPDV: number;
    pdvProcenat: number;
    pdvKategorija: string;
    identifikatorStavke: string;
    klasifikacija: string;
}

interface FormData {
    listaValuta: string;
    tipDokumenta: string;
    brojDokumenta: string;
    brojUgovora: string;
    brojNarudzbenice: string;
    brojOkvirnogSporazuma: string;
    sifraObjekta: string;
    interniBrojRutiranja: string;
    datumPrometa: string;
    datumDospeca: string;
    pdvObaveza: 'obracunava' | 'neObracunava';
    stavke: Stavka[];
}

const fetchPravnaLica = async (): Promise<PravnaLica | null> => {
    const fetchedData = await fetch("/pravna-lica/getAll");
    if (!fetchedData.ok) return null;
    return fetchedData.json();
}

export default function IzlazniDokumenti() {
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [lica, setLica] = useState<PravnaLica | null>(null);
    const [searchedText, setText] = useState<string>("");
    const [showOtpremnica, setShowOtpremnica] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        listaValuta: 'RSD',
        tipDokumenta: 'Faktura',
        brojDokumenta: '',
        brojUgovora: '',
        brojNarudzbenice: '',
        brojOkvirnogSporazuma: '',
        sifraObjekta: '',
        interniBrojRutiranja: '',
        datumPrometa: new Date().toISOString().split('T')[0],
        datumDospeca: new Date().toISOString().split('T')[0],
        pdvObaveza: 'obracunava',
        stavke: [{
            redniBroj: 1,
            naziv: '',
            kolicina: 0,
            jedinicaMere: 'kom',
            cena: 0,
            iznosUmanjenja: 0,
            iznosBezPDV: 0,
            pdvProcenat: 20,
            pdvKategorija: 'S20',
            identifikatorStavke: '',
            klasifikacija: ''
        }]
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchPravnaLica();
            setLica(data);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const form = formRef.current;
        if (!container || !form) return;

        gsap.set(form.children, { y: 40, opacity: 0 });
        const tl = gsap.timeline();
        tl.to(form.children, {
            y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out"
        });
    }, []);

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleStavkaChange = (index: number, field: keyof Stavka, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            stavke: prev.stavke.map((stavka, i) =>
                i === index ? { ...stavka, [field]: value } : stavka
            )
        }));
    };

    const dodajStavku = () => {
        setFormData(prev => ({
            ...prev,
            stavke: [...prev.stavke, {
                redniBroj: prev.stavke.length + 1,
                naziv: '',
                kolicina: 0,
                jedinicaMere: 'kom',
                cena: 0,
                iznosUmanjenja: 0,
                iznosBezPDV: 0,
                pdvProcenat: 20,
                pdvKategorija: 'S20',
                identifikatorStavke: '',
                klasifikacija: ''
            }]
        }));
    };

    const obrisiStavku = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stavke: prev.stavke.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form data:', formData);
        // API call here
    };

    const ChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    const filteredLica = lica?.lica.filter(l =>
        (l.naziv_firme + ' ' + l.jmbg).toLowerCase().includes(searchedText.toLowerCase())
    ) ?? [];

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-12 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="mb-8">
                    <nav className="text-sm text-gray-400 mb-4">
                        <a href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</a>
                        <span className="mx-2">/</span>
                        <span className="text-white">Izlazni dokumenti</span>
                    </nav>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">Nacrt</h1>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

                    {/* Osnovne informacije */}
                    <div className="bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Osnovne informacije</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Lista valuta</label>
                                <select
                                    value={formData.listaValuta}
                                    onChange={e => handleInputChange('listaValuta', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="RSD">RSD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Tip dokumenta</label>
                                <select
                                    value={formData.tipDokumenta}
                                    onChange={e => handleInputChange('tipDokumenta', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Faktura">Faktura</option>
                                    <option value="Avansna faktura">Avansna faktura</option>
                                    <option value="Predračun">Predračun</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Broj dokumenta</label>
                                <input
                                    type="text"
                                    value={formData.brojDokumenta}
                                    onChange={e => handleInputChange('brojDokumenta', e.target.value)}
                                    placeholder="63"
                                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Broj ugovora</label>
                                <input
                                    type="text"
                                    value={formData.brojUgovora}
                                    onChange={e => handleInputChange('brojUgovora', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowOtpremnica(!showOtpremnica)}
                            className="mt-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <svg className={`w-5 h-5 transition-transform ${showOtpremnica ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-medium">Otpremnica</span>
                        </button>

                        {showOtpremnica && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-500/5 rounded-xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Broj Narudžbenice/Broj Fakture/Broj Ponude</label>
                                    <input
                                        type="text"
                                        value={formData.brojNarudzbenice}
                                        onChange={e => handleInputChange('brojNarudzbenice', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Broj okvirnog sporazuma</label>
                                    <input
                                        type="text"
                                        value={formData.brojOkvirnogSporazuma}
                                        onChange={e => handleInputChange('brojOkvirnogSporazuma', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Prodavac i Kupac */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Prodavac */}
                        <div className="bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-white">PRODAVAC <span className="text-red-400">*</span></h2>
                                <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2 text-gray-300">
                                <p className="text-white font-semibold">{user.naziv_firme}</p>
                                <p className="text-sm">Matični broj: {user.pib}</p>
                            </div>
                        </div>

                        {/* Kupac */}
                        <div className="bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">KUPAC <span className="text-red-400">*</span></h2>
                            <div className="space-y-3">

                                <div className="relative w-full max-w-sm space-y-3">
                                    <input
                                        type="text"
                                        onChange={ChangeSearch}
                                        value={searchedText}
                                        placeholder="PRETRAGA PO PIBU ILI NAZIVU FIRME"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="relative">
                                        <select
                                            value={searchedText}
                                            onChange={e => setText(e.target.value)}
                                            className="w-full bg-white text-gray-700 text-sm border border-gray-300 rounded-md pl-3 pr-8 py-2
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          hover:border-gray-400 shadow-sm appearance-none cursor-pointer"
                                        >
                                            {filteredLica.map(l => (
                                                <option key={l.jmbg} value={l.jmbg}>
                                                    {l.naziv_firme} {l.jmbg}
                                                </option>
                                            ))}
                                        </select>
                                        <svg
                                            className="pointer-events-none absolute top-1/2 right-2 transform -translate-y-1/2 h-4 w-4 text-gray-700"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>






                    {/* PDV Osnov */}
                    <div className="bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-white">Osnov za oslobođenje/izuzeće od PDV-a</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Datum prometa <span className="text-red-400">*</span></label>
                                <input
                                    type="date"
                                    value={formData.datumPrometa}
                                    onChange={(e) => handleInputChange('datumPrometa', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Datum dospeca</label>
                                <input
                                    type="date"
                                    value={formData.datumDospeca}
                                    onChange={(e) => handleInputChange('datumDospeca', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-3">Nastanak PDV obaveze za izdavaoca</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="pdvObaveza"
                                            value="obracunava"
                                            checked={formData.pdvObaveza === 'obracunava'}
                                            onChange={(e) => handleInputChange('pdvObaveza', e.target.value)}
                                            className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-300">PDV se obračunava</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="pdvObaveza"
                                            value="neObracunava"
                                            checked={formData.pdvObaveza === 'neObracunava'}
                                            onChange={(e) => handleInputChange('pdvObaveza', e.target.value)}
                                            className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-300">Ne nastaje obaveza obračuna PDV</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stavke */}
                    <div className="bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Stavke</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-blue-500/20">
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">RB</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">Šifra</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">Naziv</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">Količina</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">J.M.</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">Cena</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">Umanjenje</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">Bez PDV</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">PDV %</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">Kategorija</th>
                                        <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase">Akcije</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.stavke.map((stavka, index) => (
                                        <tr key={index} className="border-b border-white/5">
                                            <td className="px-3 py-3 text-white">{stavka.redniBroj}</td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="text"
                                                    value={stavka.identifikatorStavke}
                                                    onChange={(e) => handleStavkaChange(index, 'identifikatorStavke', e.target.value)}
                                                    className="w-20 px-2 py-1 bg-gray-900/80 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="text"
                                                    value={stavka.naziv}
                                                    onChange={(e) => handleStavkaChange(index, 'naziv', e.target.value)}
                                                    className="w-full min-w-[200px] px-2 py-1 bg-gray-900/80 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="number"
                                                    value={stavka.kolicina}
                                                    onChange={(e) => handleStavkaChange(index, 'kolicina', Number(e.target.value))}
                                                    className="w-20 px-2 py-1 bg-gray-900/80 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <select
                                                    value={stavka.jedinicaMere}
                                                    onChange={(e) => handleStavkaChange(index, 'jedinicaMere', e.target.value)}
                                                    className="w-20 px-2 py-1 bg-gray-900/80 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="kom">kom</option>
                                                    <option value="kg">kg</option>
                                                    <option value="l">l</option>
                                                    <option value="m">m</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="number"
                                                    value={stavka.cena}
                                                    onChange={(e) => handleStavkaChange(index, 'cena', Number(e.target.value))}
                                                    className="w-24 px-2 py-1 bg-gray-900/80 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="number"
                                                    value={stavka.iznosUmanjenja}
                                                    onChange={(e) => handleStavkaChange(index, 'iznosUmanjenja', Number(e.target.value))}
                                                    className="w-24 px-2 py-1 bg-gray-900/80 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-3 text-white">0.00</td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="number"
                                                    value={stavka.pdvProcenat}
                                                    onChange={(e) => handleStavkaChange(index, 'pdvProcenat', Number(e.target.value))}
                                                    className="w-20 px-2 py-1 bg-gray-900/80 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <select
                                                    value={stavka.pdvKategorija}
                                                    onChange={(e) => handleStavkaChange(index, 'pdvKategorija', e.target.value)}
                                                    className="w-24 px-2 py-1 bg-gray-900/80 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="S20">S20</option>
                                                    <option value="S10">S10</option>
                                                    <option value="S0">S0</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => obrisiStavku(index)}
                                                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            type="button"
                            onClick={dodajStavku}
                            className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="font-medium">Dodaj novu stavku</span>
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <div className="space-y-3 text-right">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Iznos za zaokruživanje</span>
                                <span className="text-white font-semibold">0.00</span>
                            </div>
                            <div className="flex justify-between items-center text-xl">
                                <span className="text-gray-400">Iznos za plaćanje</span>
                                <span className="text-white font-bold">0.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4 justify-end">
                        <button
                            type="button"
                            className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                        >
                            Obriši
                        </button>
                        <button
                            type="button"
                            className="px-6 py-3 bg-blue-600/20 text-blue-400 rounded-xl font-medium hover:bg-blue-600/30 transition-colors"
                        >
                            Sačuvaj promene
                        </button>
                        <button
                            type="button"
                            className="px-6 py-3 bg-yellow-600/20 text-yellow-400 rounded-xl font-medium hover:bg-yellow-600/30 transition-colors"
                        >
                            Ažuriraj nacrt
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                        >
                            Pošalji dokument
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
