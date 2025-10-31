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
        Schema::create('faktura', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Podaci o fakturi
            $table->string('ListaValuta', 10)->default('RSD');
            $table->string('TipDokumenta', 50);
            $table->bigInteger('BrojDokumenta');
            $table->string('BrojUgovora', 50)->nullable();

            // Foreign Keys
            $table->foreignId('ProdavacFK')
                ->constrained('pravno_lice')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            $table->foreignId('KupacFK')
                ->constrained('pravno_lice')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            // Datumi
            $table->date('DatumPrometa');
            $table->date('DatumDospeca')->nullable();

            // PDV obaveza
            $table->boolean('ObavezaPDV')->default(true);

            // Timestamps
            $table->timestamps();

            // Indexes za performanse
            $table->index('ProdavacFK');
            $table->index('KupacFK');
            $table->index('BrojDokumenta');
            $table->index('DatumPrometa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faktura');
    }
};
