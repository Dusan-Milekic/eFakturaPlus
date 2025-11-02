<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatabaseController extends Controller
{
    public function login(Request $request)
    {
        // Ako je GET zahtev, prikaži login formu
        if ($request->isMethod('get')) {
            return view('adminLogin');
        }

        // Ako je POST zahtev, obradi login
        if ($request->isMethod('post')) {
            $request->validate([
                'username' => 'required',
                'password' => 'required',
            ]);

            if ($request->input('username') === 'admin' && $request->input('password') === 'password') {
                // Uspešna prijava
                $tables = collect(DB::select('SHOW TABLES'))
                    ->map(fn($table) => (object) ['Tables_in_efaktura_plus' => $table->Tables_in_efaktura_plus]);

                $rows = null;
                $name = null;
                $columns = [];

                return view('admin', compact('tables', 'rows', 'name', 'columns'));
            } else {
                // Neuspešna prijava
                return redirect()->back()->with('error', 'Pogrešno korisničko ime ili lozinka.');
            }
        }
    }

    public function showTable($name)
    {
        // Uzmi sve tabele za sidebar
        $tables = collect(DB::select('SHOW TABLES'))
            ->map(fn($table) => (object) ['Tables_in_efaktura_plus' => $table->Tables_in_efaktura_plus]);

        // Uzmi podatke iz selektovane tabele
        $rows = collect(DB::select("SELECT * FROM `{$name}`"));

        // Uzmi nazive kolona
        $columns = [];
        if ($rows->count() > 0) {
            $columns = array_keys((array) $rows->first());
        }

        return view('admin', compact('tables', 'rows', 'name', 'columns'));
    }

    public function aktivirajNalog($jmbg)
    {
        DB::table('pravno_lice')
            ->where('jmbg', $jmbg)
            ->update(['is_verified' => true]);

        return redirect()->back()->with('success', 'Nalog je uspešno aktiviran.');
    }

    public function deaktivirajNalog($jmbg)
    {
        DB::table('pravno_lice')
            ->where('jmbg', $jmbg)
            ->update(['is_verified' => false]);

        return redirect()->back()->with('success', 'Nalog je uspešno deaktiviran.');
    }

    public function obrisiNalog($name, $id)  // ✅ Prvo $name, pa $id
    {
        // Validacija - dozvoli samo određene tabele (sigurnost!)
        $dozvoljeneTabe = [
            'pravno_lice',
            'faktura',
            'status',
            'kupac',
            'prodavac',
        ];

        if (!in_array($name, $dozvoljeneTabe)) {
            return redirect()->back()->with('error', 'Nevalidna tabela.');
        }

        try {
            $deleted = DB::table($name)
                ->where('id', $id)
                ->delete();

            if ($deleted) {
                return redirect()->back()->with('success', 'Red je uspešno obrisan.');
            } else {
                return redirect()->back()->with('error', 'Red sa tim ID-om ne postoji.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Greška pri brisanju: ' . $e->getMessage());
        }
    }

}
