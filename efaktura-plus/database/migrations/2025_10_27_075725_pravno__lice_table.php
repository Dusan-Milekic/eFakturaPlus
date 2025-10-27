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
        Schema::create('pravno_lice', function (Blueprint $table) {
            $table->id();
            $table->string('username', 50)->unique();
            $table->string('password');
            $table->string('ime', 50);
            $table->string('prezime', 50);
            $table->char('jmbg', 13)->unique();
            $table->date('datum_rodjenja');
            $table->string('email', 100)->unique();
            $table->string('telefon', 20)->nullable();
            $table->string('naziv_firme')->nullable();
            $table->char('pib', 9)->unique()->nullable();
            $table->string('postanski_broj', 10)->nullable();
            $table->string('grad', 100)->nullable();
            $table->string('adresa')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pravno_lice');
    }
};
