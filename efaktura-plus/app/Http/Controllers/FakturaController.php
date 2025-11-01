<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FakturaController extends Controller
{
    public function VratiFakture(Request $request)
    {
        try {
            // Uzmi PIB iz request body-a
            $pib = $request->input("pib");

            if (!$pib) {
                return response()->json([
                    'success' => false,
                    'message' => 'PIB nije pronađen',
                    'debug' => $request->all()
                ], 400);
            }

            // Pronađi pravno lice po PIB-u
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

            // Validacija opcionalnih filtera
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

            // Početni query - fakture gde je firma prodavac
            // BITNO: Eksplicitno navedi BrojDokumenta u SELECT!
            $query = DB::table('faktura')
                ->select(
                    'faktura.id',
                    'faktura.BrojDokumenta',  // EKSPLICITNO!
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
                    'kupac.jmbg as kupac_jmbg'
                )
                ->join('pravno_lice as prodavac', 'faktura.ProdavacFK', '=', 'prodavac.id')
                ->join('pravno_lice as kupac', 'faktura.KupacFK', '=', 'kupac.id')
                ->where('prodavac.id', $pravnoLice->id);

            // Primeni filtere ako postoje
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

            // Sortiraj po datumu kreiranja (najnovije prvo)
            $query->orderBy('faktura.created_at', 'desc');

            // Paginacija
            $perPage = $request->input('per_page', 15);
            $fakture = $query->paginate($perPage);

            Log::info('Pronađeno faktura', ['count' => $fakture->total()]);

            // Ako nema faktura, vrati prazan odgovor
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

            // Za svaku fakturu učitaj stavke
            $faktureData = $fakture->map(function ($faktura) {
                // DEBUG: Loguj šta vraća baza
                Log::info('Faktura iz baze', [
                    'id' => $faktura->id,
                    'BrojDokumenta' => $faktura->BrojDokumenta,
                    'BrojDokumenta_type' => gettype($faktura->BrojDokumenta)
                ]);

                $stavke = DB::table('stavka')
                    ->where('FakturaFK', $faktura->id)
                    ->get();

                // Izračunaj ukupne iznose
                $ukupnoBezPDV = 0;
                $ukupanPDV = 0;

                foreach ($stavke as $stavka) {
                    $iznosBezPDV = ($stavka->Kolicina * $stavka->Cena) - $stavka->Umanjenje;
                    $pdvIznos = $iznosBezPDV * ($stavka->PDV / 100);

                    $ukupnoBezPDV += $iznosBezPDV;
                    $ukupanPDV += $pdvIznos;
                }

                // Pripremi naziv prodavca i kupca
                $prodavacNaziv = $faktura->prodavac_naziv ?:
                    trim($faktura->prodavac_ime . ' ' . $faktura->prodavac_prezime);

                $kupacNaziv = $faktura->kupac_naziv ?:
                    trim($faktura->kupac_ime . ' ' . $faktura->kupac_prezime);

                return [
                    'id' => $faktura->id,
                    'BrojDokumenta' => $faktura->BrojDokumenta, // EKSPLICITNO VRATI!
                    'lista_valuta' => $faktura->ListaValuta,
                    'tip_dokumenta' => $faktura->TipDokumenta,
                    'broj_dokumenta' => $faktura->BrojDokumenta, // I u snake_case za kompatibilnost
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
                    'DatumPrometa' => $faktura->DatumPrometa,
                    'DatumDospeca' => $faktura->DatumDospeca,
                    'datum_prometa' => $faktura->DatumPrometa, // I snake_case
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

            // Izračunaj statistike
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
            // Validacija ulaznih podataka
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

            // Započni transakciju
            DB::beginTransaction();

            // Pronađi prodavca i kupca po PIB/JMBG
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

            // Izračunaj ukupne iznose
            $ukupnoBezPDV = 0;
            $ukupanPDV = 0;

            foreach ($request->stavke as $stavka) {
                $iznosBezPDV = $stavka['iznosBezPDV'];
                $pdvIznos = $iznosBezPDV * ($stavka['pdvProcenat'] / 100);

                $ukupnoBezPDV += $iznosBezPDV;
                $ukupanPDV += $pdvIznos;
            }

            $ukupnoSaPDV = $ukupnoBezPDV + $ukupanPDV;

            // Snimi fakturu u bazu (prilagođeno tvojoj strukturi)
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

            // Snimi stavke fakture (prilagođeno tvojoj strukturi)
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

            // Potvrdi transakciju
            DB::commit();

            // Loguj uspešnu operaciju
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
                    'ukupno_sa_pdv' => $ukupnoSaPDV
                ]
            ], 201);

        } catch (\Exception $e) {
            // Rollback transakcije u slučaju greške
            DB::rollBack();

            // Loguj grešku
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
