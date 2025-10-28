<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - {{ $name ? Str::title(Str::replace('_', ' ', $name)) : 'Dashboard' }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="bg-gray-950">

    <!-- Navigation Sidebar -->
    <aside class="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-white/10 flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-white/10">
            <h1 class="text-xl font-bold text-white">Admin Panel</h1>
            <p class="text-xs text-gray-400 mt-1">Upravljanje bazom</p>
        </div>

        <!-- Tables List - Scrollable -->
        <div class="flex-1 overflow-y-auto p-4">
            <nav>
                <ul class="space-y-1">
                    @foreach ($tables as $table)
                        <li>
                            <a href="/admin/table/{{ $table->Tables_in_efaktura_plus }}"
                               class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {{ $name === $table->Tables_in_efaktura_plus ? 'bg-blue-500/20 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white' }}">
                                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span class="text-sm font-medium">{{ Str::replace('_', ' ', Str::title($table->Tables_in_efaktura_plus)) }}</span>
                            </a>
                        </li>
                    @endforeach
                </ul>
            </nav>
        </div>

        <!-- Logout Button - Fixed at Bottom -->
        <div class="p-4 border-t border-white/10">
            <a href="/admin"
               onclick="event.preventDefault(); if(confirm('Da li ste sigurni da želite da se odjavite?')) window.location.href='/admin';"
               class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="text-sm font-medium">Odjavi se</span>
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 p-6 min-h-screen">
        <div class="max-w-7xl mx-auto">

            <!-- Success Message -->
            @if(session('success'))
            <div class="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl flex items-center gap-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="font-medium">{{ session('success') }}</span>
            </div>
            @endif

            <!-- Error Message -->
            @if(session('error'))
            <div class="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span class="font-medium">{{ session('error') }}</span>
            </div>
            @endif

            @if($rows && $rows->count() > 0)
                <!-- Prikaz tabele -->
                <div class="bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-3xl font-bold text-white mb-2">{{ Str::title(Str::replace('_', ' ', $name)) }}</h2>
                            <p class="text-sm text-gray-400">Ukupno {{ $rows->count() }} {{ $rows->count() === 1 ? 'red' : 'redova' }}</p>
                        </div>
                        <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                            Dodaj novi
                        </button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-blue-500/20">
                                    @foreach($columns as $column)
                                        <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {{ Str::title(Str::replace('_', ' ', $column)) }}
                                        </th>
                                    @endforeach
                                    <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Akcije
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($rows as $row)
                                    <tr class="border-b border-white/5 hover:bg-blue-500/5 transition-colors">
                                        @foreach($columns as $column)
                                            <td class="px-4 py-3 text-gray-300">
                                                @if($column === 'password')
                                                    ••••••••
                                                @elseif($column === 'is_verified')
                                                    <span class="px-2 py-1 rounded-full text-xs {{ $row->$column ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400' }}">
                                                        {{ $row->$column ? 'Verifikovan' : 'Neverifikovan' }}
                                                    </span>
                                                @else
                                                    {{ is_bool($row->$column) ? ($row->$column ? 'Da' : 'Ne') : ($row->$column ?? '-') }}
                                                @endif
                                            </td>
                                        @endforeach
                                        <td class="px-4 py-3 text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                <!-- View -->
                                                <button onclick='viewRow(@json($row), @json($columns))' class="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-colors" title="Pregled">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>

                                                @if($name === 'pravno_lice')
                                                    @if($row->is_verified)
                                                        <form action="{{ route('admin.deaktiviraj', $row->jmbg) }}" method="POST" class="inline">
                                                            @csrf
                                                            <button type="submit" class="p-1.5 text-orange-400 hover:bg-orange-500/20 rounded transition-colors" title="Deaktiviraj">
                                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            </button>
                                                        </form>
                                                    @else
                                                        <form action="{{ route('admin.aktiviraj', $row->jmbg) }}" method="POST" class="inline">
                                                            @csrf
                                                            <button type="submit" class="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors" title="Aktiviraj">
                                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </button>
                                                        </form>
                                                    @endif
                                                @else
                                                    <button onclick="editRow({{ $row->id }})" class="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors" title="Izmeni">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                @endif

                                                <form action="{{ route('admin.delete', [$name, $row->id]) }}" method="POST" class="inline" onsubmit="return confirm('Da li ste sigurni da želite da obrišete ovaj red?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors" title="Obriši">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @else
                <div class="bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl p-12 rounded-2xl border border-white/10 shadow-2xl text-center">
                    <div class="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 class="text-3xl font-bold text-white mb-3">Pregled Baze Podataka</h2>
                    <p class="text-gray-400 text-lg">Izaberite tabelu iz menija za detaljniji pregled</p>
                </div>
            @endif
        </div>
    </main>

    <!-- Modal za pregled -->
    <div id="viewModal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div class="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 rounded-2xl border border-blue-500/20 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-blue-500/20 flex items-center justify-between">
                <h3 class="text-2xl font-bold text-white">Detaljan Pregled</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-white transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div id="modalContent" class="p-6 space-y-4">
                <!-- Dinamički sadržaj -->
            </div>
        </div>
    </div>

    <script>
        function viewRow(row, columns) {
            const modal = document.getElementById('viewModal');
            const content = document.getElementById('modalContent');

            let html = '';
            columns.forEach(column => {
                let value = row[column];
                let displayValue = value ?? '-';

                // Formatiranje vrednosti
                if (column === 'password') {
                    displayValue = '••••••••';
                } else if (column === 'is_verified') {
                    displayValue = value
                        ? '<span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">Verifikovan</span>'
                        : '<span class="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">Neverifikovan</span>';
                } else if (typeof value === 'boolean') {
                    displayValue = value ? 'Da' : 'Ne';
                }

                html += `
                    <div class="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            ${column.replace(/_/g, ' ')}
                        </div>
                        <div class="text-base text-white font-medium">
                            ${displayValue}
                        </div>
                    </div>
                `;
            });

            content.innerHTML = html;
            modal.classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('viewModal').classList.add('hidden');
        }

        // Zatvori modal klikom van njega
        document.getElementById('viewModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Zatvori modal sa ESC tasterom
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        function editRow(id) {
            alert('Izmena reda ID: ' + id);
        }
    </script>
</body>
</html>
