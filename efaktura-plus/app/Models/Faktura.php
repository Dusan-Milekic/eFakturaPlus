<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faktura extends Model
{
    use HasFactory;

    /**
     * Naziv tabele
     */
    protected $table = 'faktura';

    /**
     * Polja koja mogu biti mass-assigned
     */
    protected $fillable = [
        'ListaValuta',
        'TipDokumenta',
        'BrojDokumenta',
        'BrojUgovora',
        'ProdavacFK',
        'KupacFK',
        'DatumPrometa',
        'DatumDospeca',
        'ObavezaPDV'
    ];

    /**
     * Tipovi podataka (casting)
     */
    protected $casts = [
        'DatumPrometa' => 'date',
        'DatumDospeca' => 'date',
        'ObavezaPDV' => 'boolean',
        'BrojDokumenta' => 'integer',
    ];

    /**
     * Relacija: Faktura pripada prodavcu (Pravno Lice)
     */
    public function prodavac()
    {
        return $this->belongsTo(PravnoLice::class, 'ProdavacFK');
    }

    /**
     * Relacija: Faktura pripada kupcu (Pravno Lice)
     */
    public function kupac()
    {
        return $this->belongsTo(PravnoLice::class, 'KupacFK');
    }

    /**
     * Relacija: Faktura ima više stavki
     */
    public function stavke()
    {
        return $this->hasMany(Stavka::class, 'FakturaFK');
    }

    /**
     * Accessor: Ukupan iznos bez PDV-a
     */
    public function getUkupnoBezPdvAttribute()
    {
        return $this->stavke->sum(function ($stavka) {
            return $stavka->iznos_bez_pdv;
        });
    }

    /**
     * Accessor: Ukupan iznos PDV-a
     */
    public function getUkupnoPdvAttribute()
    {
        return $this->stavke->sum(function ($stavka) {
            return $stavka->iznos_pdv;
        });
    }

    /**
     * Accessor: Ukupan iznos sa PDV-om
     */
    public function getUkupnoSaPdvAttribute()
    {
        return $this->stavke->sum(function ($stavka) {
            return $stavka->iznos_sa_pdv;
        });
    }

    /**
     * Accessor: Da li je faktura prosla rok?
     */
    public function getJeProsaoRokAttribute()
    {
        if (!$this->DatumDospeca) {
            return false;
        }
        return now()->greaterThan($this->DatumDospeca);
    }

    /**
     * Accessor: Broj dana do/od dospeca
     */
    public function getDanaDoDospecaAttribute()
    {
        if (!$this->DatumDospeca) {
            return null;
        }
        return now()->diffInDays($this->DatumDospeca, false);
    }

    /**
     * Scope: Filter fakture po prodavcu
     */
    public function scopeProdavac($query, $prodavacId)
    {
        return $query->where('ProdavacFK', $prodavacId);
    }

    /**
     * Scope: Filter fakture po kupcu
     */
    public function scopeKupac($query, $kupacId)
    {
        return $query->where('KupacFK', $kupacId);
    }

    /**
     * Scope: Filter po tipu dokumenta
     */
    public function scopeTip($query, $tip)
    {
        return $query->where('TipDokumenta', $tip);
    }

    /**
     * Scope: Filter po valuti
     */
    public function scopeValuta($query, $valuta)
    {
        return $query->where('ListaValuta', $valuta);
    }

    /**
     * Scope: Fakture sa PDV obavezom
     */
    public function scopeSaPdv($query)
    {
        return $query->where('ObavezaPDV', true);
    }

    /**
     * Scope: Fakture bez PDV obaveze
     */
    public function scopeBezPdv($query)
    {
        return $query->where('ObavezaPDV', false);
    }

    /**
     * Scope: Fakture koje su prosle rok
     */
    public function scopeProsliRok($query)
    {
        return $query->whereNotNull('DatumDospeca')
            ->where('DatumDospeca', '<', now());
    }

    /**
     * Scope: Fakture u periodu
     */
    public function scopeUPeriodu($query, $od, $do)
    {
        return $query->whereBetween('DatumPrometa', [$od, $do]);
    }
    public function status()
    {
        return $this->hasOne(Status::class, 'FakturaFK');
    }
    /**
     * Boot method - eventi
     */
    protected static function boot()
    {
        parent::boot();

        // Pre brisanja fakture, obriši sve stavke
        static::deleting(function ($faktura) {
            $faktura->stavke()->delete();
        });
    }
}
