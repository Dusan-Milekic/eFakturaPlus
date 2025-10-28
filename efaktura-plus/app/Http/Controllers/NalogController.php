<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\PravnoLice;

class NalogController extends Controller
{
    public function prijava(Request $request)
    {
        // Validacija podataka
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Pronađi korisnika po username-u
        $korisnik = PravnoLice::where('username', $validated['username'])->first();

        // Proveri da li korisnik postoji
        if (!$korisnik) {
            return response()->json([
                'message' => 'Pogrešno korisničko ime ili lozinka'
            ], 401);
        }

        // Proveri da li je nalog verifikovan
        if (!$korisnik->is_verified) {
            return response()->json([
                'message' => 'Vaš nalog još uvek nije verifikovan. Molimo sačekajte potvrdu od administratora.'
            ], 403);
        }

        // Proveri lozinku
        if (!Hash::check($validated['password'], $korisnik->password)) {
            return response()->json([
                'message' => 'Pogrešno korisničko ime ili lozinka'
            ], 401);
        }


        // Vrati informacije (bez osetljivih podataka)
        return response()->json([
            'message' => 'Uspešna prijava',
            'user' => [
                'id' => $korisnik->id,
                'username' => $korisnik->username,
                'ime' => $korisnik->ime,
                'prezime' => $korisnik->prezime,
                'email' => $korisnik->email,
                'naziv_firme' => $korisnik->naziv_firme,
            ]
        ], 200);
    }

    public function odjava()
    {
        Auth::guard('pravno_lice')->logout();

        return response()->json([
            'message' => 'Uspešno ste se odjavili'
        ], 200);
    }

    public function proveriNalog()
    {
        if (Auth::guard('pravno_lice')->check()) {
            $korisnik = Auth::guard('pravno_lice')->user();

            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $korisnik->id,
                    'username' => $korisnik->username,
                    'ime' => $korisnik->ime,
                    'prezime' => $korisnik->prezime,
                    'email' => $korisnik->email,
                    'naziv_firme' => $korisnik->naziv_firme,
                ]
            ], 200);
        }

        return response()->json([
            'authenticated' => false
        ], 401);
    }
}
