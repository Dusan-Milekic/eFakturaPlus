<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('status', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Foreign Unique Key (1:1 odnos)
            $table->foreignId('FakturaFK')
                ->constrained('faktura')
                ->onDelete('cascade')
                ->onUpdate('cascade')
                ->unique();  // ✅ Ovo je ispravno za 1:1

            // Status vrednost
            $table->string('status');

            // Timestamps
            $table->timestamps();

            // Index (nije potreban jer unique već kreira index)
            // $table->index('FakturaFK'); // Ovo možeš obrisati
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status');
    }
};
