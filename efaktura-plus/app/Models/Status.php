<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    /**
     * Naziv tabele u bazi
     */
    protected $table = 'status';

    /**
     * Polja koja se mogu masovno popunjavati
     */
    protected $fillable = [
        'FakturaFK',
        'status',
    ];

    /**
     * Odnos: Status pripada jednoj Fakturi (1:1)
     */
    public function faktura()
    {
        return $this->belongsTo(Faktura::class, 'FakturaFK');
    }

}
