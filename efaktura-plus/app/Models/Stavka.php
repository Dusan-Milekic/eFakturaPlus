<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stavka extends Model
{
    use HasFactory;

    /**
     * Naziv tabele
     */
    protected $table = 'stavka';

    /**
     * Polja koja mogu biti mass-assigned
     */
    protected $fillable = [
        'FakturaFK',
        'Sifra',
        'Naziv',
        'Kolicina',
        'JedinicaMere',
        'Cena',
        'Umanjenje',
        'PDV',
        'Kategorija'
    ];

    /**
     * Tipovi podataka (casting)
     */
    protected $casts = [
        'Kolicina' => 'decimal:2',
        'Cena' => 'decimal:2',
        'Umanjenje' => 'decimal:2',
        'Sifra' => 'integer',
        'PDV' => 'integer',
    ];

    /**
     * Appends - dodaj computed properties u JSON/Array output
     */
    protected $appends = [
        'iznos_bez_pdv',
        'iznos_pdv',
        'iznos_sa_pdv',
        'procenat_umanjenja'
    ];

    /**
     * Relacija: Stavka pripada jednoj Fakturi
     */
    public function faktura()
    {
        return $this->belongsTo(Faktura::class, 'FakturaFK');
    }

    /**
     * Accessor: Iznos bez PDV-a
     * Formula: (Količina * Cena) - Umanjenje
     */
    public function getIznosBezPdvAttribute()
    {
        return round(($this->Kolicina * $this->Cena) - $this->Umanjenje, 2);
    }

    /**
     * Accessor: Iznos PDV-a
     * Formula: Iznos_bez_PDV * (PDV / 100)
     */
    public function getIznosPdvAttribute()
    {
        return round($this->iznos_bez_pdv * ($this->PDV / 100), 2);
    }

    /**
     * Accessor: Ukupan iznos sa PDV-om
     * Formula: Iznos_bez_PDV + Iznos_PDV
     */
    public function getIznosSaPdvAttribute()
    {
        return round($this->iznos_bez_pdv + $this->iznos_pdv, 2);
    }

    /**
     * Accessor: Jedinična cena nakon umanjenja
     */
    public function getJedinicnaCenaSaUmanjenjem()
    {
        if ($this->Kolicina == 0)
            return 0;
        return round(($this->Kolicina * $this->Cena - $this->Umanjenje) / $this->Kolicina, 2);
    }

    /**
     * Accessor: Procenat umanjenja od ukupne cene
     * Formula: (Umanjenje / (Količina * Cena)) * 100
     */
    public function getProcenatUmanjenjaAttribute()
    {
        $ukupnoBezUmanjenja = $this->Kolicina * $this->Cena;
        if ($ukupnoBezUmanjenja == 0)
            return 0;
        return round(($this->Umanjenje / $ukupnoBezUmanjenja) * 100, 2);
    }

    /**
     * Accessor: Da li ima umanjenje
     */
    public function getImaUmanjenjeAttribute()
    {
        return $this->Umanjenje > 0;
    }

    /**
     * Accessor: Ukupna cena bez umanjenja
     */
    public function getUkupnoBezUmanjenjaAttribute()
    {
        return round($this->Kolicina * $this->Cena, 2);
    }

    /**
     * Scope: Filter po fakturi
     */
    public function scopeZaFakturu($query, $fakturaId)
    {
        return $query->where('FakturaFK', $fakturaId);
    }

    /**
     * Scope: Filter po kategoriji PDV-a
     */
    public function scopePoKategoriji($query, $kategorija)
    {
        return $query->where('Kategorija', $kategorija);
    }

    /**
     * Scope: Filter po PDV stopi
     */
    public function scopePoPdv($query, $pdv)
    {
        return $query->where('PDV', $pdv);
    }

    /**
     * Scope: Stavke sa umanjenjima
     */
    public function scopeSaUmanjenjima($query)
    {
        return $query->where('Umanjenje', '>', 0);
    }

    /**
     * Scope: Stavke bez umanjenja
     */
    public function scopeBezUmanjenja($query)
    {
        return $query->where('Umanjenje', 0);
    }

    /**
     * Scope: Pretraga po nazivu
     */
    public function scopePretraziNaziv($query, $pojam)
    {
        return $query->where('Naziv', 'LIKE', "%{$pojam}%");
    }

    /**
     * Scope: Filter po šifri
     */
    public function scopePoSifri($query, $sifra)
    {
        return $query->where('Sifra', $sifra);
    }

    /**
     * Scope: Stavke sa cenom većom od
     */
    public function scopeCenaVecaOd($query, $cena)
    {
        return $query->where('Cena', '>', $cena);
    }

    /**
     * Scope: Stavke sa cenom manjom od
     */
    public function scopeCenaManjaOd($query, $cena)
    {
        return $query->where('Cena', '<', $cena);
    }

    /**
     * Scope: Sortiraj po ceni
     */
    public function scopeSortByCena($query, $direction = 'asc')
    {
        return $query->orderBy('Cena', $direction);
    }

    /**
     * Scope: Sortiraj po nazivu
     */
    public function scopeSortByNaziv($query, $direction = 'asc')
    {
        return $query->orderBy('Naziv', $direction);
    }

    /**
     * Boot method - eventi
     */
    protected static function boot()
    {
        parent::boot();

        // Validacija pre čuvanja
        static::creating(function ($stavka) {
            // Provera da li faktura postoji
            if (!Faktura::find($stavka->FakturaFK)) {
                throw new \Exception('Faktura sa ID ' . $stavka->FakturaFK . ' ne postoji!');
            }

            // Validacija količine
            if ($stavka->Kolicina <= 0) {
                throw new \Exception('Količina mora biti veća od 0!');
            }

            // Validacija cene
            if ($stavka->Cena < 0) {
                throw new \Exception('Cena ne može biti negativna!');
            }

            // Validacija umanjenja
            if ($stavka->Umanjenje < 0) {
                throw new \Exception('Umanjenje ne može biti negativno!');
            }

            // Provera da umanjenje nije veće od ukupne cene
            $ukupno = $stavka->Kolicina * $stavka->Cena;
            if ($stavka->Umanjenje > $ukupno) {
                throw new \Exception('Umanjenje ne može biti veće od ukupne cene!');
            }
        });

        // Pre update-a
        static::updating(function ($stavka) {
            // Iste validacije kao za creating
            if ($stavka->Kolicina <= 0) {
                throw new \Exception('Količina mora biti veća od 0!');
            }

            if ($stavka->Cena < 0) {
                throw new \Exception('Cena ne može biti negativna!');
            }

            if ($stavka->Umanjenje < 0) {
                throw new \Exception('Umanjenje ne može biti negativno!');
            }

            $ukupno = $stavka->Kolicina * $stavka->Cena;
            if ($stavka->Umanjenje > $ukupno) {
                throw new \Exception('Umanjenje ne može biti veće od ukupne cene!');
            }
        });
    }

    /**
     * Custom metoda: Primeni popust u procentima
     */
    public function primeniPopust($procenat)
    {
        if ($procenat < 0 || $procenat > 100) {
            throw new \Exception('Procenat popusta mora biti između 0 i 100!');
        }

        $ukupno = $this->Kolicina * $this->Cena;
        $this->Umanjenje = round($ukupno * ($procenat / 100), 2);
        $this->save();

        return $this;
    }

    /**
     * Custom metoda: Ukloni umanjenje
     */
    public function ukloniUmanjenje()
    {
        $this->Umanjenje = 0;
        $this->save();

        return $this;
    }

    /**
     * Custom metoda: Postavi fiksno umanjenje
     */
    public function postaviUmanjenje($iznos)
    {
        $ukupno = $this->Kolicina * $this->Cena;

        if ($iznos < 0) {
            throw new \Exception('Umanjenje ne može biti negativno!');
        }

        if ($iznos > $ukupno) {
            throw new \Exception('Umanjenje ne može biti veće od ukupne cene!');
        }

        $this->Umanjenje = $iznos;
        $this->save();

        return $this;
    }

    /**
     * Custom metoda: Dupliraj stavku
     */
    public function dupliraj($fakturaId = null)
    {
        return self::create([
            'FakturaFK' => $fakturaId ?? $this->FakturaFK,
            'Sifra' => $this->Sifra,
            'Naziv' => $this->Naziv,
            'Kolicina' => $this->Kolicina,
            'JedinicaMere' => $this->JedinicaMere,
            'Cena' => $this->Cena,
            'Umanjenje' => $this->Umanjenje,
            'PDV' => $this->PDV,
            'Kategorija' => $this->Kategorija
        ]);
    }
}
