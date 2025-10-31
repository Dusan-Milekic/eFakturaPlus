<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FakturaController extends Controller
{
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
