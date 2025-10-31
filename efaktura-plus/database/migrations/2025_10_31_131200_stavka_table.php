<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stavka', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Foreign Key
            $table->foreignId('FakturaFK')
                ->constrained('faktura')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            // Podaci o proizvodu/usluzi
            $table->integer('Sifra')->nullable();
            $table->text('Naziv');
            $table->decimal('Kolicina', 10, 2)->default(0);
            $table->string('JedinicaMere', 20)->default('kom');

            // Finansijski podaci
            $table->decimal('Cena', 10, 2)->default(0);
            $table->decimal('Umanjenje', 10, 2)->default(0);

            // PDV podaci
            $table->bigInteger('PDV')->default(20);
            $table->string('Kategorija', 10)->default('S20');

            // Timestamps
            $table->timestamps();

            // Indexes za performanse
            $table->index('FakturaFK');
            $table->index('Sifra');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stavka');
    }
};
