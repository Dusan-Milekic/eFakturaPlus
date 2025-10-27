import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

export default function RegisterContact() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        jmbg: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        companyName: "",
        pib: "",
        address: "",
        city: "",
        postalCode: "",
        message: ""
    });

    useEffect(() => {
        const container = containerRef.current;
        const form = formRef.current;
        const title = titleRef.current;

        if (!container || !form || !title) return;

        const tl = gsap.timeline();

        gsap.set([title, form.children], {
            y: 60,
            opacity: 0
        });

        tl.to(title, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out"
        })
            .to(form.children, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out"
            }, "-=0.4");

    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const registrujPravnoLice = async () => {
        try {
            const TOKEN = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            const response = await fetch('/registruj-pravno-lice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': TOKEN || ''
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    jmbg: formData.jmbg,
                    dateOfBirth: formData.dateOfBirth,
                    email: formData.email,
                    phone: formData.phone,
                    companyName: formData.companyName,
                    pib: formData.pib,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    message: formData.message,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Error:', result);
                alert('Greška: ' + (result.message || 'Nepoznata greška'));
                return;
            }

            window.location.href = '/uspesna-registracija';

            // Reset forme
            setFormData({
                username: "",
                password: "",
                firstName: "",
                lastName: "",
                jmbg: "",
                dateOfBirth: "",
                email: "",
                phone: "",
                companyName: "",
                pib: "",
                address: "",
                city: "",
                postalCode: "",
                message: ""
            });

        } catch (error) {
            console.error('Fetch error:', error);
            alert('Greška pri slanju');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        registrujPravnoLice();


    };

    return (
        <div ref={containerRef} className="relative flex items-center justify-center min-h-screen py-20 bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 overflow-hidden">
            <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

            <div className="relative z-10 w-full max-w-4xl px-6">
                <div className="text-center mb-12">
                    <div className="inline-block mb-4 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
                        <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Registracija naloga</span>
                    </div>
                    <h1 ref={titleRef} className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent mb-4">Kreirajte Nalog</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">Popunite sledeće podatke za kreiranje naloga. Naš tim će verifikovati vaše informacije i kontaktirati vas u najkraćem roku.</p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-2xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-50 rounded-3xl"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>

                    <div className="relative">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            Pristupni podaci
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300">Korisničko ime *</label>
                                <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} maxLength={50} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Izaberite korisničko ime" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Lozinka *</label>
                                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} minLength={8} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Minimum 8 karaktera" required />
                            </div>
                        </div>
                    </div>

                    <div className="relative border-t border-gray-700/50 pt-8">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            Lični podaci
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">Ime *</label>
                                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} maxLength={50} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Unesite ime" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">Prezime *</label>
                                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} maxLength={50} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Unesite prezime" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="jmbg" className="block text-sm font-medium text-gray-300">JMBG *</label>
                                <input type="text" id="jmbg" name="jmbg" value={formData.jmbg} onChange={handleChange} maxLength={13} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="13 cifara" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300">Datum rođenja *</label>
                                <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                            </div>
                        </div>
                    </div>

                    <div className="relative border-t border-gray-700/50 pt-8">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            Kontakt informacije
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email *</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} maxLength={100} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="primer@email.com" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Telefon *</label>
                                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} maxLength={20} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="+381 60 123 4567" required />
                            </div>
                        </div>
                    </div>

                    <div className="relative border-t border-gray-700/50 pt-8">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            Podaci o firmi
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">Naziv firme *</label>
                                <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Unesite naziv firme" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="pib" className="block text-sm font-medium text-gray-300">PIB *</label>
                                <input type="text" id="pib" name="pib" value={formData.pib} onChange={handleChange} maxLength={9} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="9 cifara" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300">Poštanski broj *</label>
                                <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} maxLength={10} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="11000" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-300">Grad *</label>
                                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} maxLength={100} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Beograd" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-300">Adresa *</label>
                                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Ulica i broj" required />
                            </div>
                        </div>
                    </div>

                    <div className="relative border-t border-gray-700/50 pt-8">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            Dodatne napomene
                        </h3>
                        <div className="space-y-2">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Poruka (opciono)</label>
                            <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="Unesite dodatne informacije ili pitanja..."></textarea>
                        </div>
                    </div>

                    <div className="relative pt-4 space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <div className="flex gap-3">
                                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-gray-300">
                                    <p className="font-semibold text-blue-400 mb-1">Napomena:</p>
                                    <p>Svi podaci će biti verifikovani od strane našeg tima. Proces verifikacije može trajati do 48 sati. Nakon uspešne verifikacije, kontaktiraćemo vas putem email-a ili telefona sa pristupnim podacima za vaš nalog.</p>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/50 overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Pošalji zahtev
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>

                    <div className="relative text-center pt-4">
                        <p className="text-gray-400 text-sm">
                            Već imate nalog?{" "}
                            <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                Prijavite se
                            </a>
                        </p>
                    </div>
                </form>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Šifrovani podaci</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>GDPR usaglašeno</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Brza verifikacija</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
