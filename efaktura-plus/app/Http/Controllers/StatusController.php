<?php

namespace App\Http\Controllers;

use App\Models\Status;
use App\Models\Faktura;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatusController extends Controller
{
    /**
     * Dobij status za traženu fakturu
     * GET /api/faktura/{fakturaId}/status
     */
    public function dobijStatus($fakturaId): JsonResponse
    {
        try {
            // Proveri da li faktura postoji
            $faktura = Faktura::findOrFail($fakturaId);

            // Dobij status fakture
            $status = $faktura->status;

            // Ako status ne postoji
            if (!$status) {
                return response()->json([
                    'success' => false,
                    'message' => 'Status za ovu fakturu ne postoji'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $status
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Faktura sa ID ' . $fakturaId . ' ne postoji'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Greška pri dobijanju statusa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Koliko ima faktura po statusu
     * GET /api/status/statistika
     */
    public function statistikaUlaznihFaktura(Request $request): JsonResponse
    {
        try {
            $kupacId = $request->input('kupac_id');

            if (!$kupacId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kupac ID je obavezan'
                ], 400);
            }

            // Ukupan broj ulaznih faktura
            $ukupnoFaktura = Faktura::where('KupacFK', $kupacId)->count();

            // Broj nepročitanih/novih faktura (status = 'primljen')
            $noveFakture = Faktura::where('KupacFK', $kupacId)
                ->whereHas('status', fn($q) => $q->where('status', 'primljen'))
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'ukupno' => $ukupnoFaktura,
                    'nove' => $noveFakture
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Greška pri dobijanju statistike: ' . $e->getMessage()
            ], 500);
        }
    }
    public function kolikoImaFaktura(Request $request): JsonResponse
    {
        try {
            // Uzmi ID iz requesta
            $korisnikId = $request->input('korisnik_id'); // ili $request->korisnik_id

            // Validacija
            if (!$korisnikId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Korisnik ID je obavezan'
                ], 400);
            }

            // Ukupan broj NJEGOVIH izlaznih faktura
            $ukupnoFaktura = Faktura::where('ProdavacFK', $korisnikId)->count();

            // Njegove fakture grupisane po statusu
            $fakturePoStatusu = DB::table('faktura')
                ->leftJoin('status', 'faktura.id', '=', 'status.FakturaFK')
                ->where('faktura.ProdavacFK', $korisnikId) // ✅ Samo njegove
                ->select('status.status', DB::raw('COUNT(faktura.id) as broj_faktura'))
                ->groupBy('status.status')
                ->get();

            // Njegove fakture bez statusa
            $faktureBezStatusa = Faktura::where('ProdavacFK', $korisnikId)
                ->whereDoesntHave('status')
                ->count();

            // Formatiraj rezultat
            $statistika = [];
            foreach ($fakturePoStatusu as $item) {
                $statistika[$item->status ?? 'Bez statusa'] = $item->broj_faktura;
            }

            if ($faktureBezStatusa > 0 && !isset($statistika['Bez statusa'])) {
                $statistika['Bez statusa'] = $faktureBezStatusa;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'ukupno_faktura' => $ukupnoFaktura,
                    'po_statusu' => $statistika
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Greška pri dobijanju statistike: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ažuriraj status date fakture
     * PUT /api/faktura/{fakturaId}/status
     */
    public function azurirajStatus(Request $request, $fakturaId): JsonResponse
    {
        try {
            // Validacija
            $validated = $request->validate([
                'status' => 'required|string|max:255'
            ]);

            // Proveri da li faktura postoji
            $faktura = Faktura::findOrFail($fakturaId);

            // Dobij status fakture
            $status = $faktura->status;

            // Ako status ne postoji, kreiraj novi
            if (!$status) {
                $status = Status::create([
                    'FakturaFK' => $fakturaId,
                    'status' => $validated['status']
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Status uspešno kreiran',
                    'data' => $status
                ], 201);
            }

            // Ažuriraj postojeći status
            $status->update([
                'status' => $validated['status']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status uspešno ažuriran',
                'data' => $status
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Greška u validaciji',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Faktura sa ID ' . $fakturaId . ' ne postoji'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Greška pri ažuriranju statusa: ' . $e->getMessage()
            ], 500);
        }
    }
}
