<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PravnoLiceController;
// Ruta za početnu stranicu
Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

// Ruta za prijavu
Route::get('/prijava', function () {
    return Inertia::render('login');
})->name('prijava');


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




// Ruta za admin panel
Route::get('/admin',function(){
    return view('admin');
})








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
