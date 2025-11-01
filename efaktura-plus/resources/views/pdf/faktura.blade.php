<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faktura {{ $faktura['broj_dokumenta'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10pt;
            color: #333;
            line-height: 1.4;
        }

        .container {
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 15px;
        }

        .header h1 {
            color: #1e40af;
            font-size: 24pt;
            margin-bottom: 5px;
        }

        .header .document-info {
            font-size: 11pt;
            color: #666;
        }

        .info-section {
            margin-bottom: 20px;
        }

        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }

        .info-col {
            display: table-cell;
            width: 48%;
            vertical-align: top;
            padding: 15px;
            border: 1px solid #ddd;
            background-color: #f9fafb;
        }

        .info-col:first-child {
            margin-right: 4%;
        }

        .info-col h3 {
            color: #1e40af;
            font-size: 12pt;
            margin-bottom: 10px;
            border-bottom: 1px solid #1e40af;
            padding-bottom: 5px;
        }

        .info-row {
            margin-bottom: 5px;
        }

        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }

        .table-container {
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table thead {
            background-color: #1e40af;
            color: white;
        }

        table th {
            padding: 10px 5px;
            text-align: left;
            font-size: 9pt;
            font-weight: bold;
        }

        table td {
            padding: 8px 5px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 9pt;
        }

        table tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .summary-section {
            margin-top: 30px;
            page-break-inside: avoid;
        }

        .summary-table {
            width: 50%;
            margin-left: auto;
            border: 2px solid #1e40af;
        }

        .summary-table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }

        .summary-table tr:last-child td {
            border-bottom: none;
        }

        .summary-label {
            font-weight: bold;
            background-color: #f3f4f6;
        }

        .total-row {
            background-color: #1e40af !important;
            color: white !important;
            font-size: 12pt;
            font-weight: bold;
        }

        .pdv-breakdown {
            margin: 20px 0;
            width: 60%;
            margin-left: auto;
        }

        .pdv-breakdown h4 {
            color: #1e40af;
            margin-bottom: 10px;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 8pt;
            color: #666;
        }

        .signature-section {
            margin-top: 50px;
            display: table;
            width: 100%;
        }

        .signature-box {
            display: table-cell;
            width: 45%;
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #333;
            margin-top: 60px;
            padding-top: 5px;
        }

        @page {
            margin: 15mm;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>{{ $faktura['tip_dokumenta'] }}</h1>
            <div class="document-info">
                Broj: <strong>{{ $faktura['broj_dokumenta'] }}</strong> |
                Datum: <strong>{{ $faktura['datum_izdavanja'] }}</strong>
                @if($faktura['broj_ugovora'] != '-')
                    | Ugovor: <strong>{{ $faktura['broj_ugovora'] }}</strong>
                @endif
            </div>
        </div>

        <!-- Info Grid -->
        <div class="info-grid">
            <div class="info-col">
                <h3>Prodavac</h3>
                <div class="info-row">
                    <span class="info-label">Naziv:</span>
                    <span>{{ $prodavac['naziv'] }}</span>
                </div>
                @if($prodavac['pib'] != '-')
                <div class="info-row">
                    <span class="info-label">PIB:</span>
                    <span>{{ $prodavac['pib'] }}</span>
                </div>
                @endif
                @if($prodavac['jmbg'] != '-')
                <div class="info-row">
                    <span class="info-label">JMBG:</span>
                    <span>{{ $prodavac['jmbg'] }}</span>
                </div>
                @endif
                @if($prodavac['adresa'] != '-')
                <div class="info-row">
                    <span class="info-label">Adresa:</span>
                    <span>{{ $prodavac['adresa'] }}</span>
                </div>
                @endif
                @if($prodavac['grad'] != '-')
                <div class="info-row">
                    <span class="info-label">Grad:</span>
                    <span>{{ $prodavac['grad'] }}</span>
                </div>
                @endif
                @if($prodavac['telefon'] != '-')
                <div class="info-row">
                    <span class="info-label">Telefon:</span>
                    <span>{{ $prodavac['telefon'] }}</span>
                </div>
                @endif
                @if($prodavac['email'] != '-')
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span>{{ $prodavac['email'] }}</span>
                </div>
                @endif
            </div>

            <div class="info-col">
                <h3>Kupac</h3>
                <div class="info-row">
                    <span class="info-label">Naziv:</span>
                    <span>{{ $kupac['naziv'] }}</span>
                </div>
                @if($kupac['pib'] != '-')
                <div class="info-row">
                    <span class="info-label">PIB:</span>
                    <span>{{ $kupac['pib'] }}</span>
                </div>
                @endif
                @if($kupac['jmbg'] != '-')
                <div class="info-row">
                    <span class="info-label">JMBG:</span>
                    <span>{{ $kupac['jmbg'] }}</span>
                </div>
                @endif
                @if($kupac['adresa'] != '-')
                <div class="info-row">
                    <span class="info-label">Adresa:</span>
                    <span>{{ $kupac['adresa'] }}</span>
                </div>
                @endif
                @if($kupac['grad'] != '-')
                <div class="info-row">
                    <span class="info-label">Grad:</span>
                    <span>{{ $kupac['grad'] }}</span>
                </div>
                @endif
                @if($kupac['telefon'] != '-')
                <div class="info-row">
                    <span class="info-label">Telefon:</span>
                    <span>{{ $kupac['telefon'] }}</span>
                </div>
                @endif
                @if($kupac['email'] != '-')
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span>{{ $kupac['email'] }}</span>
                </div>
                @endif
            </div>
        </div>

        <!-- Document Details -->
        <div class="info-section">
            <table style="width: 100%; border: none; margin-bottom: 10px;">
                <tr style="border: none;">
                    <td style="border: none; padding: 5px;"><strong>Datum prometa:</strong> {{ $faktura['datum_prometa'] }}</td>
                    <td style="border: none; padding: 5px;"><strong>Datum dospeća:</strong> {{ $faktura['datum_dospeca'] }}</td>
                    <td style="border: none; padding: 5px;"><strong>Valuta:</strong> {{ $faktura['valuta'] }}</td>
                </tr>
            </table>
        </div>

        <!-- Items Table -->
        <div class="table-container">
            <h3 style="color: #1e40af; margin-bottom: 10px;">Stavke fakture</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">Rb.</th>
                        <th style="width: 10%;">Šifra</th>
                        <th style="width: 30%;">Naziv</th>
                        <th class="text-center" style="width: 8%;">Količina</th>
                        <th class="text-center" style="width: 8%;">J.M.</th>
                        <th class="text-right" style="width: 10%;">Cena</th>
                        <th class="text-right" style="width: 10%;">Umanjenje</th>
                        <th class="text-right" style="width: 10%;">Iznos</th>
                        <th class="text-center" style="width: 5%;">PDV%</th>
                        <th class="text-right" style="width: 10%;">Ukupno</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($stavke as $index => $stavka)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $stavka['sifra'] }}</td>
                        <td>{{ $stavka['naziv'] }}</td>
                        <td class="text-center">{{ $stavka['kolicina'] }}</td>
                        <td class="text-center">{{ $stavka['jedinica_mere'] }}</td>
                        <td class="text-right">{{ $stavka['cena'] }}</td>
                        <td class="text-right">{{ $stavka['umanjenje'] }}</td>
                        <td class="text-right">{{ $stavka['iznos_bez_pdv'] }}</td>
                        <td class="text-center">{{ $stavka['pdv_procenat'] }}%</td>
                        <td class="text-right"><strong>{{ $stavka['ukupno'] }}</strong></td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- PDV Breakdown -->
        @if(count($pdv_grupe) > 0)
        <div class="pdv-breakdown">
            <h4>Rekapitulacija PDV-a</h4>
            <table>
                <thead>
                    <tr>
                        <th>Stopa PDV</th>
                        <th class="text-right">Osnovica</th>
                        <th class="text-right">PDV</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($pdv_grupe as $grupa)
                    <tr>
                        <td>{{ $grupa['stopa'] }}</td>
                        <td class="text-right">{{ $grupa['osnovica'] }} {{ $faktura['valuta'] }}</td>
                        <td class="text-right">{{ $grupa['pdv'] }} {{ $faktura['valuta'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Summary -->
        <div class="summary-section">
            <table class="summary-table">
                <tr>
                    <td class="summary-label">Ukupno bez PDV:</td>
                    <td class="text-right">{{ $ukupno['bez_pdv'] }} {{ $faktura['valuta'] }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Ukupan PDV:</td>
                    <td class="text-right">{{ $ukupno['pdv'] }} {{ $faktura['valuta'] }}</td>
                </tr>
                <tr class="total-row">
                    <td>UKUPNO ZA UPLATU:</td>
                    <td class="text-right">{{ $ukupno['sa_pdv'] }} {{ $faktura['valuta'] }}</td>
                </tr>
            </table>
        </div>

        <!-- Signatures -->
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line">
                    Potpis izdavaoca
                </div>
            </div>
            <div class="signature-box" style="float: right;">
                <div class="signature-line">
                    Potpis primaoca
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Dokument je kreiran elektronski i važeći je bez pečata i potpisa.</p>
            <p>Faktura generisana: {{ date('d.m.Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
