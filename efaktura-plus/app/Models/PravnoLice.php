<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use HasFactory, Notifiable;

class PravnoLice extends Model
{

    protected $table = 'pravno_lice';

    protected $fillable = [
        'username',
        'password',
        'ime',
        'prezime',
        'jmbg',
        'datum_rodjenja',
        'email',
        'telefon',
        'naziv_firme',
        'pib',
        'postanski_broj',
        'grad',
        'adresa',
        'is_verified',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'datum_rodjenja' => 'date',
    ];
}
