<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
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
            'firstName' => 'required|string|max:50',
            'lastName' => 'required|string|max:50',
            'jmbg' => 'required|string|size:13|unique:pravno_lice,jmbg',
            'dateOfBirth' => 'required|date',
            'email' => 'required|email|max:100|unique:pravno_lice,email',
            'phone' => 'required|string|max:20',
            'companyName' => 'required|string',
            'pib' => 'required|string|size:9|unique:pravno_lice,pib',
            'postalCode' => 'required|string|max:10',
            'city' => 'required|string|max:100',
            'address' => 'required|string',
        ]);
        $pravnoLice = PravnoLice::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'ime' => $validated['firstName'],
            'prezime' => $validated['lastName'],
            'jmbg' => $validated['jmbg'],
            'datum_rodjenja' => $validated['dateOfBirth'],
            'email' => $validated['email'],
            'telefon' => $validated['phone'],
            'naziv_firme' => $validated['companyName'],
            'pib' => $validated['pib'],
            'postanski_broj' => $validated['postalCode'],
            'grad' => $validated['city'],
            'adresa' => $validated['address'],
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


    public function KorsiniciInfoAll()
    {
        $Pravna_Lica = PravnoLice::all()->except("password");
        return response()->json([
            'lica' => $Pravna_Lica->toArray()
        ], 200);
    }
}
