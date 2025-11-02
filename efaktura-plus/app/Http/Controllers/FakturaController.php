<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Faktura;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class FakturaController extends Controller
{
    public function generisiPDF($id, Request $request)
    {
        try {
            // Uzmi fakturu sa svim relacionim podacima
            $faktura = Faktura::with(['prodavac', 'kupac'])->find($id);

            if (!$faktura) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faktura nije pronađena'
                ], 404);
            }

            // Učitaj stavke
            $stavke = DB::table('stavka')
                ->where('FakturaFK', $faktura->id)
                ->get();

            // Izračunaj ukupne iznose
            $ukupnoBezPDV = 0;
            $ukupanPDV = 0;
            $stavkeData = [];

            foreach ($stavke as $stavka) {
                $iznosBezPDV = ($stavka->Kolicina * $stavka->Cena) - ($stavka->Umanjenje ?? 0);
                $pdvIznos = $iznosBezPDV * ($stavka->PDV / 100);

                $ukupnoBezPDV += $iznosBezPDV;
                $ukupanPDV += $pdvIznos;

                $stavkeData[] = [
                    'sifra' => $stavka->Sifra ?? '-',
                    'naziv' => $stavka->Naziv,
                    'kolicina' => $stavka->Kolicina,
                    'jedinica_mere' => $stavka->JedinicaMere,
                    'cena' => number_format($stavka->Cena, 2, ',', '.'),
                    'umanjenje' => number_format($stavka->Umanjenje ?? 0, 2, ',', '.'),
                    'iznos_bez_pdv' => number_format($iznosBezPDV, 2, ',', '.'),
                    'pdv_procenat' => $stavka->PDV,
                    'pdv_iznos' => number_format($pdvIznos, 2, ',', '.'),
                    'ukupno' => number_format($iznosBezPDV + $pdvIznos, 2, ',', '.')
                ];
            }

            $ukupnoSaPDV = $ukupnoBezPDV + $ukupanPDV;

            // Pripremi naziv prodavca
            $prodavacNaziv = 'N/A';
            if ($faktura->prodavac) {
                if (!empty($faktura->prodavac->naziv_firme)) {
                    $prodavacNaziv = $faktura->prodavac->naziv_firme;
                } elseif (!empty($faktura->prodavac->ime) && !empty($faktura->prodavac->prezime)) {
                    $prodavacNaziv = trim($faktura->prodavac->ime . ' ' . $faktura->prodavac->prezime);
                }
            }

            // Pripremi naziv kupca
            $kupacNaziv = 'N/A';
            if ($faktura->kupac) {
                if (!empty($faktura->kupac->naziv_firme)) {
                    $kupacNaziv = $faktura->kupac->naziv_firme;
                } elseif (!empty($faktura->kupac->ime) && !empty($faktura->kupac->prezime)) {
                    $kupacNaziv = trim($faktura->kupac->ime . ' ' . $faktura->kupac->prezime);
                }
            }

            // Grupiši stavke po PDV stopi
            $pdvGrupe = [];
            foreach ($stavke as $stavka) {
                $iznosBezPDV = ($stavka->Kolicina * $stavka->Cena) - ($stavka->Umanjenje ?? 0);
                $pdvIznos = $iznosBezPDV * ($stavka->PDV / 100);
                $stopa = $stavka->PDV;

                if (!isset($pdvGrupe[$stopa])) {
                    $pdvGrupe[$stopa] = [
                        'stopa' => $stopa,
                        'osnovica' => 0,
                        'pdv' => 0
                    ];
                }

                $pdvGrupe[$stopa]['osnovica'] += $iznosBezPDV;
                $pdvGrupe[$stopa]['pdv'] += $pdvIznos;
            }

            // Konvertuj u niz i formatiraj brojeve
            $pdvGrupeFormatted = array_map(function ($grupa) {
                return [
                    'stopa' => $grupa['stopa'] . '%',
                    'osnovica' => number_format($grupa['osnovica'], 2, ',', '.'),
                    'pdv' => number_format($grupa['pdv'], 2, ',', '.')
                ];
            }, array_values($pdvGrupe));

            // Pripremi podatke za PDF
            $data = [
                'faktura' => [
                    'broj_dokumenta' => $faktura->BrojDokumenta,
                    'tip_dokumenta' => $faktura->TipDokumenta,
                    'broj_ugovora' => $faktura->BrojUgovora ?? '-',
                    'datum_prometa' => date('d.m.Y', strtotime($faktura->DatumPrometa)),
                    'datum_dospeca' => $faktura->DatumDospeca ? date('d.m.Y', strtotime($faktura->DatumDospeca)) : '-',
                    'datum_izdavanja' => date('d.m.Y', strtotime($faktura->created_at)),
                    'valuta' => $faktura->ListaValuta,
                    'obaveza_pdv' => $faktura->ObavezaPDV ? 'Da' : 'Ne',
                    'mesto_izdavanja' => 'Beograd'
                ],
                'prodavac' => [
                    'naziv' => $prodavacNaziv,
                    'pib' => $faktura->prodavac->pib ?? '-',
                    'jmbg' => $faktura->prodavac->jmbg ?? '-',
                    'adresa' => $faktura->prodavac->adresa ?? '-',
                    'grad' => $faktura->prodavac->grad ?? '-',
                    'telefon' => $faktura->prodavac->telefon ?? '-',
                    'email' => $faktura->prodavac->email ?? '-',
                ],
                'kupac' => [
                    'naziv' => $kupacNaziv,
                    'pib' => $faktura->kupac->pib ?? '-',
                    'jmbg' => $faktura->kupac->jmbg ?? '-',
                    'adresa' => $faktura->kupac->adresa ?? '-',
                    'grad' => $faktura->kupac->grad ?? '-',
                    'telefon' => $faktura->kupac->telefon ?? '-',
                    'email' => $faktura->kupac->email ?? '-',
                ],
                'stavke' => $stavkeData,
                'pdv_grupe' => $pdvGrupeFormatted,
                'ukupno' => [
                    'bez_pdv' => number_format($ukupnoBezPDV, 2, ',', '.'),
                    'pdv' => number_format($ukupanPDV, 2, ',', '.'),
                    'sa_pdv' => number_format($ukupnoSaPDV, 2, ',', '.'),
                ]
            ];

            // Generiši PDF
            $pdf = Pdf::loadView('pdf.faktura', $data)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true,
                    'defaultFont' => 'DejaVu Sans',
                ]);

            $fileName = 'Faktura_' . $faktura->BrojDokumenta . '_' . date('Y-m-d') . '.pdf';

            // Vrati PDF kao stream (otvori u browser-u)
            return $pdf->stream($fileName);

        } catch (\Exception $e) {
            Log::error('Greška pri generisanju PDF-a', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Došlo je do greške pri generisanju PDF-a',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sacuvajPDF($id, Request $request)
    {
        try {
            $faktura = Faktura::with(['prodavac', 'kupac'])->find($id);

            if (!$faktura) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faktura nije pronađena'
                ], 404);
            }

            // Učitaj stavke
            $stavke = DB::table('stavka')
                ->where('FakturaFK', $faktura->id)
                ->get();

            // Izračunaj ukupne iznose
            $ukupnoBezPDV = 0;
            $ukupanPDV = 0;
            $stavkeData = [];

            foreach ($stavke as $stavka) {
                $iznosBezPDV = ($stavka->Kolicina * $stavka->Cena) - ($stavka->Umanjenje ?? 0);
                $pdvIznos = $iznosBezPDV * ($stavka->PDV / 100);

                $ukupnoBezPDV += $iznosBezPDV;
                $ukupanPDV += $pdvIznos;

                $stavkeData[] = [
                    'sifra' => $stavka->Sifra ?? '-',
                    'naziv' => $stavka->Naziv,
                    'kolicina' => $stavka->Kolicina,
                    'jedinica_mere' => $stavka->JedinicaMere,
                    'cena' => number_format($stavka->Cena, 2, ',', '.'),
                    'umanjenje' => number_format($stavka->Umanjenje ?? 0, 2, ',', '.'),
                    'iznos_bez_pdv' => number_format($iznosBezPDV, 2, ',', '.'),
                    'pdv_procenat' => $stavka->PDV,
                    'pdv_iznos' => number_format($pdvIznos, 2, ',', '.'),
                    'ukupno' => number_format($iznosBezPDV + $pdvIznos, 2, ',', '.')
                ];
            }

            $ukupnoSaPDV = $ukupnoBezPDV + $ukupanPDV;

            // Pripremi naziv prodavca
            $prodavacNaziv = 'N/A';
            if ($faktura->prodavac) {
                if (!empty($faktura->prodavac->naziv_firme)) {
                    $prodavacNaziv = $faktura->prodavac->naziv_firme;
                } elseif (!empty($faktura->prodavac->ime) && !empty($faktura->prodavac->prezime)) {
                    $prodavacNaziv = trim($faktura->prodavac->ime . ' ' . $faktura->prodavac->prezime);
                }
            }

            // Pripremi naziv kupca
            $kupacNaziv = 'N/A';
            if ($faktura->kupac) {
                if (!empty($faktura->kupac->naziv_firme)) {
                    $kupacNaziv = $faktura->kupac->naziv_firme;
                } elseif (!empty($faktura->kupac->ime) && !empty($faktura->kupac->prezime)) {
                    $kupacNaziv = trim($faktura->kupac->ime . ' ' . $faktura->kupac->prezime);
                }
            }

            // Grupiši stavke po PDV stopi
            $pdvGrupe = [];
            foreach ($stavke as $stavka) {
                $iznosBezPDV = ($stavka->Kolicina * $stavka->Cena) - ($stavka->Umanjenje ?? 0);
                $pdvIznos = $iznosBezPDV * ($stavka->PDV / 100);
                $stopa = $stavka->PDV;

                if (!isset($pdvGrupe[$stopa])) {
                    $pdvGrupe[$stopa] = [
                        'stopa' => $stopa,
                        'osnovica' => 0,
                        'pdv' => 0
                    ];
                }

                $pdvGrupe[$stopa]['osnovica'] += $iznosBezPDV;
                $pdvGrupe[$stopa]['pdv'] += $pdvIznos;
            }

            // Konvertuj u niz i formatiraj brojeve
            $pdvGrupeFormatted = array_map(function ($grupa) {
                return [
                    'stopa' => $grupa['stopa'] . '%',
                    'osnovica' => number_format($grupa['osnovica'], 2, ',', '.'),
                    'pdv' => number_format($grupa['pdv'], 2, ',', '.')
                ];
            }, array_values($pdvGrupe));

            // Pripremi podatke za PDF
            $data = [
                'faktura' => [
                    'broj_dokumenta' => $faktura->BrojDokumenta,
                    'tip_dokumenta' => $faktura->TipDokumenta,
                    'broj_ugovora' => $faktura->BrojUgovora ?? '-',
                    'datum_prometa' => date('d.m.Y', strtotime($faktura->DatumPrometa)),
                    'datum_dospeca' => $faktura->DatumDospeca ? date('d.m.Y', strtotime($faktura->DatumDospeca)) : '-',
                    'datum_izdavanja' => date('d.m.Y', strtotime($faktura->created_at)),
                    'valuta' => $faktura->ListaValuta,
                    'obaveza_pdv' => $faktura->ObavezaPDV ? 'Da' : 'Ne',
                    'mesto_izdavanja' => 'Beograd'
                ],
                'prodavac' => [
                    'naziv' => $prodavacNaziv,
                    'pib' => $faktura->prodavac->pib ?? '-',
                    'jmbg' => $faktura->prodavac->jmbg ?? '-',
                    'adresa' => $faktura->prodavac->adresa ?? '-',
                    'grad' => $faktura->prodavac->grad ?? '-',
                    'telefon' => $faktura->prodavac->telefon ?? '-',
                    'email' => $faktura->prodavac->email ?? '-',
                ],
                'kupac' => [
                    'naziv' => $kupacNaziv,
                    'pib' => $faktura->kupac->pib ?? '-',
                    'jmbg' => $faktura->kupac->jmbg ?? '-',
                    'adresa' => $faktura->kupac->adresa ?? '-',
                    'grad' => $faktura->kupac->grad ?? '-',
                    'telefon' => $faktura->kupac->telefon ?? '-',
                    'email' => $faktura->kupac->email ?? '-',
                ],
                'stavke' => $stavkeData,
                'pdv_grupe' => $pdvGrupeFormatted,
                'ukupno' => [
                    'bez_pdv' => number_format($ukupnoBezPDV, 2, ',', '.'),
                    'pdv' => number_format($ukupanPDV, 2, ',', '.'),
                    'sa_pdv' => number_format($ukupnoSaPDV, 2, ',', '.'),
                ]
            ];

            // Generiši PDF
            $pdf = Pdf::loadView('pdf.faktura', $data)
                ->setPaper('a4', 'portrait');

            // Sačuvaj PDF u storage
            $fileName = 'faktura_' . $faktura->id . '_' . time() . '.pdf';
            $path = 'pdfs/' . $fileName;

            Storage::put('public/' . $path, $pdf->output());

            // Ažuriraj fakturu sa putanjom do PDF-a (opciono)
            // DB::table('faktura')
            //     ->where('id', $faktura->id)
            //     ->update([
            //         'pdf_path' => $path,
            //         'pdf_generated_at' => now()
            //     ]);

            $url = asset('storage/' . $path);

            return response()->json([
                'success' => true,
                'message' => 'PDF uspešno generisan',
                'data' => [
                    'url' => $url,
                    'filename' => $fileName,
                    'path' => $path
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Greška pri čuvanju PDF-a', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Došlo je do greške pri čuvanju PDF-a',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function vratiFakturu($id, Request $request)
    {
        $faktura = Faktura::with(['prodavac', 'kupac'])->find($id);

        if (!$faktura) {
            return response()->json([
                'success' => false,
                'message' => 'Faktura nije pronađena'
            ], 404);
        }

        // Transformiši podatke
        $data = $faktura->toArray();

        // Dodaj naziv za prodavca
        if ($faktura->prodavac) {
            $data['prodavac']['naziv'] = $faktura->prodavac->naziv_firme
                ?? ($faktura->prodavac->ime . ' ' . $faktura->prodavac->prezime)
                ?? 'N/A';
        }

        // Dodaj naziv za kupca
        if ($faktura->kupac) {
            $data['kupac']['naziv'] = $faktura->kupac->naziv_firme
                ?? ($faktura->kupac->ime . ' ' . $faktura->kupac->prezime)
                ?? 'N/A';
        }

        // Dodaj finansijske podatke
        $data['ukupno_bez_pdv'] = $faktura->UkupnoBezPDV ?? 0;
        $data['ukupan_pdv'] = $faktura->UkupanPDV ?? 0;
        $data['ukupno_sa_pdv'] = $faktura->UkupnoSaPDV ?? 0;

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function VratiFakture(Request $request)
    {
        try {
            $pib = $request->input("pib");

            if (!$pib) {
                return response()->json([
                    'success' => false,
                    'message' => 'PIB nije pronađen',
                    'debug' => $request->all()
                ], 400);
            }

            $pravnoLice = DB::table('pravno_lice')
                ->where('pib', $pib)
                ->first();

            if (!$pravnoLice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pravno lice sa PIB-om "' . $pib . '" nije pronađeno'
                ], 404);
            }

            Log::info('Pronađeno pravno lice', ['id' => $pravnoLice->id, 'pib' => $pib]);

            $validator = Validator::make($request->all(), [
                'datum_od' => 'nullable|date',
                'datum_do' => 'nullable|date|after_or_equal:datum_od',
                'kupac_id' => 'nullable|integer|exists:pravno_lice,id',
                'tip_dokumenta' => 'nullable|string',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validacija nije uspela',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = DB::table('faktura')
                ->select(
                    'faktura.id',
                    'faktura.BrojDokumenta',
                    'faktura.ListaValuta',
                    'faktura.TipDokumenta',
                    'faktura.BrojUgovora',
                    'faktura.DatumPrometa',
                    'faktura.DatumDospeca',
                    'faktura.ObavezaPDV',
                    'faktura.created_at',
                    'faktura.updated_at',
                    'prodavac.naziv_firme as prodavac_naziv',
                    'prodavac.ime as prodavac_ime',
                    'prodavac.prezime as prodavac_prezime',
                    'prodavac.pib as prodavac_pib',
                    'kupac.naziv_firme as kupac_naziv',
                    'kupac.ime as kupac_ime',
                    'kupac.prezime as kupac_prezime',
                    'kupac.pib as kupac_pib',
                    'kupac.jmbg as kupac_jmbg',
                    'status.id as status_id',        // ✅ Dodato
                    'status.status as status_naziv'  // ✅ Dodato
                )
                ->join('pravno_lice as prodavac', 'faktura.ProdavacFK', '=', 'prodavac.id')
                ->join('pravno_lice as kupac', 'faktura.KupacFK', '=', 'kupac.id')
                ->leftJoin('status', 'faktura.id', '=', 'status.FakturaFK') // ✅ JOIN sa status tabelom
                ->where('prodavac.id', $pravnoLice->id);

            if ($request->has('datum_od')) {
                $query->where('faktura.DatumPrometa', '>=', $request->input('datum_od'));
            }

            if ($request->has('datum_do')) {
                $query->where('faktura.DatumPrometa', '<=', $request->input('datum_do'));
            }

            if ($request->has('kupac_id')) {
                $query->where('faktura.KupacFK', $request->input('kupac_id'));
            }

            if ($request->has('tip_dokumenta')) {
                $query->where('faktura.TipDokumenta', $request->input('tip_dokumenta'));
            }

            $query->orderBy('faktura.created_at', 'desc');

            $perPage = $request->input('per_page', 15);
            $fakture = $query->paginate($perPage);

            Log::info('Pronađeno faktura', ['count' => $fakture->total()]);

            if ($fakture->total() === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Nema pronađenih faktura za ovog prodavca',
                    'data' => [],
                    'pagination' => [
                        'current_page' => 1,
                        'per_page' => $perPage,
                        'total' => 0,
                        'last_page' => 1
                    ],
                    'statistika' => [
                        'ukupno_faktura' => 0,
                        'ukupan_iznos_bez_pdv' => 0,
                        'ukupan_pdv' => 0,
                        'ukupan_iznos_sa_pdv' => 0
                    ]
                ], 200);
            }

            $faktureData = $fakture->map(function ($faktura) {
                $stavke = DB::table('stavka')
                    ->where('FakturaFK', $faktura->id)
                    ->get();

                $ukupnoBezPDV = 0;
                $ukupanPDV = 0;

                foreach ($stavke as $stavka) {
                    $iznosBezPDV = ($stavka->Kolicina * $stavka->Cena) - $stavka->Umanjenje;
                    $pdvIznos = $iznosBezPDV * ($stavka->PDV / 100);

                    $ukupnoBezPDV += $iznosBezPDV;
                    $ukupanPDV += $pdvIznos;
                }

                $prodavacNaziv = $faktura->prodavac_naziv ?:
                    trim($faktura->prodavac_ime . ' ' . $faktura->prodavac_prezime);

                $kupacNaziv = $faktura->kupac_naziv ?:
                    trim($faktura->kupac_ime . ' ' . $faktura->kupac_prezime);

                return [
                    'id' => $faktura->id,
                    'BrojDokumenta' => $faktura->BrojDokumenta,
                    'lista_valuta' => $faktura->ListaValuta,
                    'tip_dokumenta' => $faktura->TipDokumenta,
                    'broj_dokumenta' => $faktura->BrojDokumenta,
                    'broj_ugovora' => $faktura->BrojUgovora,
                    'prodavac' => [
                        'naziv' => $prodavacNaziv,
                        'pib' => $faktura->prodavac_pib
                    ],
                    'kupac' => [
                        'naziv' => $kupacNaziv,
                        'pib' => $faktura->kupac_pib,
                        'jmbg' => $faktura->kupac_jmbg
                    ],
                    'status' => $faktura->status_naziv ? [ // ✅ Dodato status objekat
                        'id' => $faktura->status_id,
                        'status' => $faktura->status_naziv,
                        'FakturaFK' => $faktura->id
                    ] : null,
                    'DatumPrometa' => $faktura->DatumPrometa,
                    'DatumDospeca' => $faktura->DatumDospeca,
                    'datum_prometa' => $faktura->DatumPrometa,
                    'datum_dospeca' => $faktura->DatumDospeca,
                    'ObavezaPDV' => $faktura->ObavezaPDV,
                    'pdv_obaveza' => $faktura->ObavezaPDV == 1 ? 'obracunava' : 'neObracunava',
                    'created_at' => $faktura->created_at,
                    'updated_at' => $faktura->updated_at,
                    'datum_kreiranja' => $faktura->created_at,
                    'datum_izmene' => $faktura->updated_at,
                    'ListaValuta' => $faktura->ListaValuta,
                    'TipDokumenta' => $faktura->TipDokumenta,
                    'stavke' => $stavke->map(function ($stavka) {
                        $iznosBezPDV = ($stavka->Kolicina * $stavka->Cena) - $stavka->Umanjenje;
                        $pdvIznos = $iznosBezPDV * ($stavka->PDV / 100);

                        return [
                            'sifra' => $stavka->Sifra,
                            'naziv' => $stavka->Naziv,
                            'kolicina' => $stavka->Kolicina,
                            'jedinica_mere' => $stavka->JedinicaMere,
                            'cena' => $stavka->Cena,
                            'umanjenje' => $stavka->Umanjenje,
                            'iznos_bez_pdv' => round($iznosBezPDV, 2),
                            'pdv_procenat' => $stavka->PDV,
                            'pdv_iznos' => round($pdvIznos, 2),
                            'pdv_kategorija' => $stavka->Kategorija,
                            'ukupno' => round($iznosBezPDV + $pdvIznos, 2)
                        ];
                    }),
                    'ukupno_bez_pdv' => round($ukupnoBezPDV, 2),
                    'ukupan_pdv' => round($ukupanPDV, 2),
                    'ukupno_sa_pdv' => round($ukupnoBezPDV + $ukupanPDV, 2)
                ];
            });

            $statistika = [
                'ukupno_faktura' => $fakture->total(),
                'ukupan_iznos_bez_pdv' => $faktureData->sum('ukupno_bez_pdv'),
                'ukupan_pdv' => $faktureData->sum('ukupan_pdv'),
                'ukupan_iznos_sa_pdv' => $faktureData->sum('ukupno_sa_pdv')
            ];

            return response()->json([
                'success' => true,
                'message' => 'Fakture uspešno učitane',
                'data' => $faktureData,
                'pagination' => [
                    'current_page' => $fakture->currentPage(),
                    'per_page' => $fakture->perPage(),
                    'total' => $fakture->total(),
                    'last_page' => $fakture->lastPage()
                ],
                'statistika' => $statistika
            ], 200);

        } catch (\Exception $e) {
            Log::error('Greška pri učitavanju faktura', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Došlo je do greške pri učitavanju faktura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function PosaljiFakturu(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'listaValuta' => 'required|string|in:RSD,EUR,USD',
                'tipDokumenta' => 'required|string',
                'brojDokumenta' => 'required|string',
                'datumPrometa' => 'required|date',
                'datumDospeca' => 'required|date',
                'pdvObaveza' => 'required|string|in:obracunava,neObracunava',
                'prodavacPib' => 'required|string',
                'kupacJmbg' => 'required|string',
                'stavke' => 'required|array|min:1',
                'stavke.*.redniBroj' => 'required|integer',
                'stavke.*.naziv' => 'required|string',
                'stavke.*.kolicina' => 'required|numeric|min:0',
                'stavke.*.jedinicaMere' => 'required|string',
                'stavke.*.cena' => 'required|numeric|min:0',
                'stavke.*.iznosUmanjenja' => 'nullable|numeric|min:0',
                'stavke.*.iznosBezPDV' => 'required|numeric',
                'stavke.*.pdvProcenat' => 'required|numeric',
                'stavke.*.pdvKategorija' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validacija nije uspela',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $prodavac = DB::table('pravno_lice')->where('pib', $request->prodavacPib)->first();
            $kupac = DB::table('pravno_lice')->where('jmbg', $request->kupacJmbg)->first();

            if (!$prodavac) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prodavac nije pronađen'
                ], 404);
            }

            if (!$kupac) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kupac nije pronađen'
                ], 404);
            }

            $ukupnoBezPDV = 0;
            $ukupanPDV = 0;

            foreach ($request->stavke as $stavka) {
                $iznosBezPDV = $stavka['iznosBezPDV'];
                $pdvIznos = $iznosBezPDV * ($stavka['pdvProcenat'] / 100);

                $ukupnoBezPDV += $iznosBezPDV;
                $ukupanPDV += $pdvIznos;
            }

            $ukupnoSaPDV = $ukupnoBezPDV + $ukupanPDV;

            $fakturaId = DB::table('faktura')->insertGetId([
                'ListaValuta' => $request->listaValuta,
                'TipDokumenta' => $request->tipDokumenta,
                'BrojDokumenta' => $request->brojDokumenta,
                'BrojUgovora' => $request->brojUgovora ?? null,
                'ProdavacFK' => $prodavac->id,
                'KupacFK' => $kupac->id,
                'DatumPrometa' => $request->datumPrometa,
                'DatumDospeca' => $request->datumDospeca,
                'ObavezaPDV' => $request->pdvObaveza === 'obracunava' ? 1 : 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($request->stavke as $stavka) {
                DB::table('stavka')->insert([
                    'FakturaFK' => $fakturaId,
                    'Sifra' => $stavka['identifikatorStavke'] ?? null,
                    'Naziv' => $stavka['naziv'],
                    'Kolicina' => $stavka['kolicina'],
                    'JedinicaMere' => $stavka['jedinicaMere'],
                    'Cena' => $stavka['cena'],
                    'Umanjenje' => $stavka['iznosUmanjenja'] ?? 0,
                    'PDV' => $stavka['pdvProcenat'],
                    'Kategorija' => $stavka['pdvKategorija'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ✅ DODAJ STATUS "primljen" za novu fakturu
            DB::table('status')->insert([
                'FakturaFK' => $fakturaId,
                'status' => 'primljen',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            Log::info('Faktura uspešno poslata', [
                'faktura_id' => $fakturaId,
                'broj_dokumenta' => $request->brojDokumenta
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Faktura uspešno poslata',
                'data' => [
                    'faktura_id' => $fakturaId,
                    'broj_dokumenta' => $request->brojDokumenta,
                    'ukupno_bez_pdv' => $ukupnoBezPDV,
                    'ukupan_pdv' => $ukupanPDV,
                    'ukupno_sa_pdv' => $ukupnoSaPDV,
                    'status' => 'primljen' // ✅ Dodato u response
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Greška pri slanju fakture', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Došlo je do greške pri slanju fakture',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
