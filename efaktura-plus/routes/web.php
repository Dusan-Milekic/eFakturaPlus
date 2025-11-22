<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PravnoLiceController;
use App\Http\Controllers\DatabaseController;
use App\Http\Controllers\FakturaController;
use App\Models\Faktura;
use App\Models\PravnoLice;
use App\Models\Stavka;
use App\Http\Controllers\StatusController;

// Ruta za početnu stranicu
Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

// Ruta za prijavu
Route::get('/prijava', function () {
    return Inertia::render('login');
})->name('prijava');

Route::post('/prijavaLica', [App\Http\Controllers\NalogController::class, 'prijava'])
    ->name('prijavaLica');


Route::get('/dashboardMeni', function () {
    return Inertia::render('dashboardMeni');
})->name('dashboardMeni');

Route::get("/nacrti-prikaz", function () {
    return Inertia::render("NacrtiPrikaz");
});



Route::match(['get', 'post'], '/generisiPDF/{id}', [FakturaController::class, 'generisiPDF'])->name('generisiPDF');
Route::post('/sacuvajPDF/{id}', [FakturaController::class, 'sacuvajPDF'])->name('sacuvajPDF');
//Ruta za dobijanje svih korisnika na aplikaciji
Route::get('/pravna-lica/getAll', [PravnoLiceController::class, 'KorsiniciInfoAll']);

// Ruta za slanje dokumenta
Route::post('/posaljiDokument', [FakturaController::class, 'PosaljiFakturu']);

Route::post("/vratiFakture", [FakturaController::class, "VratiFakture"]);
Route::post('/vratiFakturu/{id}', [FakturaController::class, 'vratiFakturu']);


//Rutae za statusa
Route::get('/status/statistika', [StatusController::class, 'kolikoImaFaktura']);

// Dobij status za fakturu
Route::get('/faktura/{fakturaId}/status', [StatusController::class, 'dobijStatus']);

// Ažuriraj status fakture (kreira ako ne postoji)
Route::post('/faktura/{fakturaId}/status', [StatusController::class, 'azurirajStatus']);


// Ruta za registraciju kontakt osobe
Route::get('/registracija', function () {
    return Inertia::render('registerContact');
})->name('registracija');

//Ruta za uspesnu registraciju
Route::get('/uspesna-registracija', function () {
    return Inertia::render('UspesnaRegistracija');
})->name('uspesna.registracija');

// Ruta za registraciju pravnog lica
Route::post('/registruj-pravno-lice', [PravnoLiceController::class, 'store'])
    ->name('pravnoLice.store');


Route::get('/IzlazniDokumenti', function () {
    return Inertia::render('IzlazniDokumetni');
})->name('IzlazniDokumenti');

Route::get("/UlazniDokumenti", function () {
    return Inertia::render('UlazniDokumenti');
});
// GET /api/fakture/ulazne?kupac_id=1&status=plaćeno&search=test&per_page=20
Route::get('/api/fakture/ulazne', [FakturaController::class, 'ucitajFaktureZaKupca']);
Route::get('/api/ulazne-fakture/statistika', [StatusController::class, 'statistikaUlaznihFaktura']);
Route::post('/prihvatiFakturu/{fakturaId}', [StatusController::class, 'prihvatiFakturu']);

// Admin login rute
Route::get('/admin', [DatabaseController::class, 'login'])->name('admin.login');
Route::post('/admin', [DatabaseController::class, 'login'])->name('admin.login.submit');

// Admin zaštićene rute
Route::get('/admin/table/{name}', [DatabaseController::class, 'showTable'])->name('admin.table');
Route::post('/admin/aktiviraj/{jmbg}', [DatabaseController::class, 'aktivirajNalog'])->name('admin.aktiviraj');
Route::post('/admin/deaktiviraj/{jmbg}', [DatabaseController::class, 'deaktivirajNalog'])->name('admin.deaktiviraj');
// Dinamička ruta koja prima ime tabele i ID
Route::delete('/admin/delete/{name}/{id}', [DatabaseController::class, 'obrisiNalog'])
    ->name('admin.delete');




Route::get('/welcome', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
