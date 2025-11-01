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


// Admin login rute
Route::get('/admin', [DatabaseController::class, 'login'])->name('admin.login');
Route::post('/admin', [DatabaseController::class, 'login'])->name('admin.login.submit');

// Admin zaštićene rute
Route::get('/admin/table/{name}', [DatabaseController::class, 'showTable'])->name('admin.table');
Route::post('/admin/aktiviraj/{jmbg}', [DatabaseController::class, 'aktivirajNalog'])->name('admin.aktiviraj');
Route::post('/admin/deaktiviraj/{jmbg}', [DatabaseController::class, 'deaktivirajNalog'])->name('admin.deaktiviraj');
Route::delete('/admin/delete/pravno_lice/{id}', [DatabaseController::class, 'obrisiNalog'])->name('admin.delete');




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
