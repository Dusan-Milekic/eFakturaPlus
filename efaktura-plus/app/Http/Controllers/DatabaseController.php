<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatabaseController extends Controller
{
    public function index()
    {
        $tables = collect(DB::select('SHOW TABLES'))
            ->map(fn($table) => (object) ['Tables_in_efaktura_plus' => $table->Tables_in_efaktura_plus]);

        $rows = null;
        $name = null;
        $columns = [];

        return view('admin', compact('tables', 'rows', 'name', 'columns'));
    }

    public function showTable($name)
    {
        // Uzmi sve tabele za sidebar
        $tables = collect(DB::select('SHOW TABLES'))
            ->map(fn($table) => (object) ['Tables_in_efaktura_plus' => $table->Tables_in_efaktura_plus]);

        // Uzmi sve redove iz odabrane tabele
        $rows = DB::table($name)->get();

        // Uzmi nazive kolona
        $columns = !$rows->isEmpty() ? array_keys((array) $rows->first()) : [];

        return view("admin", compact('tables', 'rows', 'name', 'columns'));
    }
    public function aktivirajNalog($JMBG)
    {
        DB::table('pravno_lice')->where('jmbg', $JMBG)->update(['is_verified' => true]);
        return redirect()->back();
    }

    public function deaktivirajNalog($JMBG)
    {
        DB::table('pravno_lice')->where('jmbg', $JMBG)->update(['is_verified' => false]);
        return redirect()->back();
    }

    public function obrisiNalog($id)
    {
        DB::table('pravno_lice')->where('id', $id)->delete();
        return redirect()->back();
    }

}
