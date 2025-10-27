<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PravnoLice;
use Illuminate\Support\Facades\Hash;

class PravnoLiceController extends Controller
{
    // Pravi nalog i hashuj lozinku
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:pravno_lice,username',
            'password' => 'required|string|min:8',
            'ime' => 'required|string|max:50',
            'prezime' => 'required|string|max:50',
            'jmbg' => 'required|string|size:13|unique:pravno_lice,jmbg',
            'datum_rodjenja' => 'required|date',
            'email' => 'required|email|max:100|unique:pravno_lice,email',
            'telefon' => 'required|string|max:20',
            'naziv_firme' => 'required|string',
            'pib' => 'required|string|size:9|unique:pravno_lice,pib',
            'postanski_broj' => 'required|string|max:10',
            'grad' => 'required|string|max:100',
            'adresa' => 'required|string',
        ]);

        $pravnoLice = PravnoLice::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'ime' => $validated['ime'],
            'prezime' => $validated['prezime'],
            'jmbg' => $validated['jmbg'],
            'datum_rodjenja' => $validated['datum_rodjenja'],
            'email' => $validated['email'],
            'telefon' => $validated['telefon'],
            'naziv_firme' => $validated['naziv_firme'],
            'pib' => $validated['pib'],
            'postanski_broj' => $validated['postanski_broj'],
            'grad' => $validated['grad'],
            'adresa' => $validated['adresa'],
        ]);

        return response()->json([
            'message' => 'Nalog uspešno kreiran',
            'data' => $pravnoLice
        ], 201);
    }

    // Verifikuj nalog/zahtev
    public function verify($id)
    {
        $pravnoLice = PravnoLice::findOrFail($id);
        $pravnoLice->update(['is_verified' => true]);

        return response()->json([
            'message' => 'Nalog uspešno verifikovan'
        ], 200);
    }

    // Odbaci to jest obriši zahtev
    public function destroy($id)
    {
        $pravnoLice = PravnoLice::findOrFail($id);
        $pravnoLice->delete();

        return response()->json([
            'message' => 'Nalog uspešno obrisan'
        ], 200);
    }
}
