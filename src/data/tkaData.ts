export type QuestionShape = 'PG' | 'PGK' | 'PGK_KATEGORI';

export type QuestionTopic = 'Bilangan' | 'Geometri' | 'Pengukuran' | 'Data';

export interface WidgetMeta {
  id: number;
  namaPanggung: string;
  kataKerjaUtama: string;
  momenWow: string;
  tahapTersedia: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
  feedbackSalah?: string;
}

export interface CategoryStatement {
  id: string;
  teks: string;
  kunci: boolean; // true = Benar, false = Salah
  feedbackSalah: string;
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface PictogramData {
  keterangan: string;
  simbol: string;
  nilaiPerSimbol: number;
  rows: { nama: string; jumlahSimbol: number }[];
}

export interface TeacherCard {
  pemantik: string;
  salahKonsep: string[];
  kapanBerhenti: string;
  mariSalah: {
    klaimMimo: string;
    kesalahan: string;
    perbaikan: string;
  };
  kegiatanKelas: string;
}

export interface ContohGuruData {
  teksSoal: string;
  tabel?: TableData;
  piktogram?: PictogramData;
  opsi?: QuestionOption[];
  pernyataanKategori?: CategoryStatement[];
  kunciJawaban: string | string[] | Record<string, boolean>;
  langkahPengerjaan: {
    judul: string;
    penjelasan: string;
    highlightBagian: string;
  }[];
  pembahasanSingkat: string;
}

export interface TkaQuestion {
  id: number;
  modelResmi: string;
  bentuk: QuestionShape;
  elemen: QuestionTopic;
  widget: WidgetMeta;
  ceritaMimo: string;
  pertanyaanTemukan: string;
  teksSoal: string;
  tabel?: TableData;
  piktogram?: PictogramData;
  opsi?: QuestionOption[];
  pernyataanKategori?: CategoryStatement[];
  kunciJawaban: string | string[] | Record<string, boolean>;
  langkahPengerjaan: {
    judul: string;
    penjelasan: string;
    highlightBagian: string;
  }[];
  pembahasanSingkat: string;
  petunjukBertingkat: [string, string, string];
  contohGuru: ContohGuruData;
  kartuGuru?: TeacherCard;
  lokasiKota: string;
  stikerNama: string;
}

export interface MaterialSection {
  id: string;
  judul: string;
  subjudul: string;
  poin: { judul: string; isi: string }[];
  tabelRumus?: { bangun: string; keliling: string; luas: string }[];
}

export const KOTA_LABEL = 'Soal Latihan Bermodel TKA';

export const BUKU_SAKU_MATERI: MaterialSection[] = [
  {
    id: 'bilangan',
    judul: '1. Bilangan',
    subjudul: 'Pecahan, desimal, persen, operasi hitung, KPK, FPB, dan diskon',
    poin: [
      { judul: 'Pecahan senilai', isi: 'Kalikan atau bagi pembilang dan penyebut dengan bilangan yang sama. Contoh: 1/2 = 2/4 = 3/6.' },
      { judul: 'Membandingkan pecahan', isi: 'Samakan penyebut (pakai KPK penyebut), lalu bandingkan pembilang. Atau ubah semuanya ke desimal.' },
      { judul: 'Pecahan, desimal, persen', isi: '3/4 = 0,75 = 75%. Untuk mengubah pecahan ke persen, kalikan 100%.' },
      { judul: 'Penjumlahan dan pengurangan pecahan', isi: 'Samakan penyebut dulu. Contoh: 1/3 + 1/4 = 4/12 + 3/12 = 7/12.' },
      { judul: 'Perkalian dan pembagian pecahan dengan bilangan asli', isi: 'Perkalian: kalikan pembilang saja (3 × 2/5 = 6/5). Pembagian: kalikan penyebut (2/5 ÷ 3 = 2/15).' },
      { judul: 'Urutan operasi hitung', isi: 'Kurung, lalu kali/bagi, lalu tambah/kurang (dari kiri ke kanan).' },
      { judul: 'Faktor, kelipatan, KPK, dan FPB', isi: 'KPK dipakai untuk soal "bertemu lagi setelah berapa hari". FPB dipakai untuk soal "dibagi sama rata sebanyak mungkin".' },
      { judul: 'Cara cepat KPK/FPB (faktorisasi prima)', isi: '12 = 2² × 3 dan 18 = 2 × 3². KPK = 2² × 3² = 36 (pangkat terbesar). FPB = 2 × 3 = 6 (pangkat terkecil dari yang sama).' },
      { judul: 'Soal diskon', isi: 'Potongan = persen diskon × harga awal; bayar = harga awal − potongan, atau langsung (100% − diskon) × harga awal.' }
    ]
  },
  {
    id: 'geometri',
    judul: '2. Geometri',
    subjudul: 'Bangun datar, sifat-sifat, besar sudut, dan bangun ruang',
    poin: [
      { judul: 'Sifat bangun datar', isi: 'Persegi (4 sisi sama, 4 sudut siku-siku); persegi panjang (sisi berhadapan sama panjang, 4 sudut siku-siku); belah ketupat (4 sisi sama, diagonal tegak lurus); jajargenjang (sisi berhadapan sejajar & sama); trapesium (sepasang sisi sejajar).' },
      { judul: 'Besar sudut', isi: 'Jumlah sudut segitiga 180°; segiempat 360°; sudut lurus 180°; sudut siku-siku 90°.' },
      { judul: 'Bangun ruang', isi: 'Volume kubus = s × s × s; volume balok = p × l × t. Bangun gabungan: hitung volume tiap bagian lalu jumlahkan.' },
      { judul: 'Visualisasi spasial', isi: 'Bayangkan bangun dilihat dari depan, atas, dan samping. Pada dadu, jumlah dua sisi yang berhadapan selalu sama.' }
    ],
    tabelRumus: [
      { bangun: 'Persegi (sisi s)', keliling: '4 × s', luas: 's × s' },
      { bangun: 'Persegi panjang', keliling: '2 × (p + l)', luas: 'p × l' },
      { bangun: 'Segitiga', keliling: 'jumlah ketiga sisi', luas: '½ × alas × tinggi' },
      { bangun: 'Jajargenjang', keliling: 'jumlah semua sisi', luas: 'alas × tinggi' },
      { bangun: 'Trapesium', keliling: 'jumlah semua sisi', luas: '½ × (a + b) × tinggi' },
      { bangun: 'Belah ketupat / layang-layang', keliling: 'jumlah semua sisi', luas: '½ × d₁ × d₂' }
    ]
  },
  {
    id: 'pengukuran',
    judul: '3. Pengukuran',
    subjudul: 'Tangga satuan baku, waktu, kecepatan, dan penaksiran',
    poin: [
      { judul: 'Tangga satuan (turun × 10, naik ÷ 10)', isi: 'Panjang: km–hm–dam–m–dm–cm–mm. Berat: kg–hg–dag–g–dg–cg–mg. Volume: kl–hl–dal–l–dl–cl–ml. Contoh: 5 hg = 500 g; 0,8 hl = 80 l.' },
      { judul: 'Waktu', isi: '1 jam = 60 menit; 1 menit = 60 detik; 1 pekan = 7 hari; 1 tahun = 12 bulan. Untuk soal jam, ubah semuanya ke menit lalu jumlahkan.' },
      { judul: 'Kecepatan', isi: 'Kecepatan = jarak ÷ waktu; waktu = jarak ÷ kecepatan; jarak = kecepatan × waktu. Hati-hati: 2,5 jam = 2 jam 30 menit, bukan 2 jam 50 menit.' },
      { judul: 'Penaksiran', isi: 'Bulatkan angka ke nilai yang mudah dihitung, lalu cek apakah hasilnya masuk akal.' }
    ]
  },
  {
    id: 'data',
    judul: '4. Data',
    subjudul: 'Piktogram, diagram batang, tabel frekuensi, dan rata-rata',
    poin: [
      { judul: 'Membaca penyajian data', isi: 'Piktogram: baca keterangan satu gambar mewakili berapa. Diagram batang: baca tinggi batang pada sumbu. Tabel frekuensi: jumlah kemunculan tiap nilai.' },
      { judul: 'Rata-rata dan selisih', isi: 'Rata-rata = jumlah seluruh data ÷ banyak data. Selisih = nilai terbesar − nilai yang dibandingkan.' }
    ]
  },
  {
    id: 'strategi',
    judul: '5. Strategi Mengerjakan Soal Cerita',
    subjudul: 'Tiga langkah tenang sebelum berhitung',
    poin: [
      { judul: 'Langkah 1', isi: 'Tulis apa yang diketahui dan apa yang ditanya.' },
      { judul: 'Langkah 2', isi: 'Samakan satuan sebelum menghitung.' },
      { judul: 'Langkah 3', isi: 'Untuk soal PGK dan Benar/Salah, hitung tiap pernyataan satu per satu; jangan menebak dari pernyataan lain.' }
    ]
  }
];

export const TKA_QUESTIONS: TkaQuestion[] = [
  {
    id: 1,
    modelResmi: 'model: soal resmi no. 1, operasi hitung campuran pecahan, desimal, persen',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 1, namaPanggung: 'Mesin Tiga Bentuk', kataKerjaUtama: 'menerjemahkan', momenWow: 'angka-angka melebur ke satu bentuk lalu jatuh pas di garis bilangan', tahapTersedia: true },
    ceritaMimo: 'Mimo punya kartu persen, desimal, dan pecahan yang harus disamakan seragamnya dulu.',
    pertanyaanTemukan: 'Mengapa mengubah semuanya ke desimal atau pecahan yang sama membuat operasi jauh lebih mudah?',
    teksSoal: '150% − 2 + 3 × 0,25 + 1/2 = …',
    opsi: [
      { id: 'A', label: '1/4', feedbackSalah: 'Cek lagi urutan operasi: 3 × 0,25 dikerjakan sebelum penjumlahan dan pengurangan.' },
      { id: 'B', label: '1/2', feedbackSalah: 'Hampir! Periksa kembali hasil 1,5 − 2 + 0,75 + 0,5.' },
      { id: 'C', label: '3/4' },
      { id: 'D', label: '5/4', feedbackSalah: 'Perhatikan tanda kurang pada − 2; nilainya sempat turun menjadi −0,5 sebelum ditambah lagi.' }
    ],
    kunciJawaban: 'C',
    langkahPengerjaan: [
      { judul: 'Ubah ke desimal', penjelasan: '150% = 1,5 dan 1/2 = 0,5.', highlightBagian: 'konversi' },
      { judul: 'Kerjakan perkalian dulu', penjelasan: '3 × 0,25 = 0,75.', highlightBagian: 'kali' },
      { judul: 'Hitung dari kiri ke kanan', penjelasan: '1,5 − 2 + 0,75 + 0,5 = 0,75 = 3/4.', highlightBagian: 'garis' }
    ],
    pembahasanSingkat: '1,5 − 2 + 0,75 + 0,5 = 0,75 = 3/4',
    petunjukBertingkat: ['Ingat urutan operasi: perkalian dikerjakan lebih dulu daripada tambah dan kurang.', 'Ubah 150% menjadi 1,5 dan 1/2 menjadi 0,5.', 'Hitung 1,5 − 2 + (3 × 0,25) + 0,5 = 0,75.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: 100% − 1 + 2 × 0,5 + 1/2 = …',
      opsi: [
        { id: 'A', label: '1/2' },
        { id: 'B', label: '1' },
        { id: 'C', label: '3/2 (1,5)' },
        { id: 'D', label: '2' }
      ],
      kunciJawaban: 'C',
      langkahPengerjaan: [
        { judul: 'Ubah ke desimal', penjelasan: '100% = 1 dan 1/2 = 0,5.', highlightBagian: 'konversi' },
        { judul: 'Kerjakan perkalian dulu', penjelasan: '2 × 0,5 = 1.', highlightBagian: 'kali' },
        { judul: 'Hitung berurutan', penjelasan: '1 − 1 + 1 + 0,5 = 1,5 = 3/2.', highlightBagian: 'garis' }
      ],
      pembahasanSingkat: '1 − 1 + 1 + 0,5 = 1,5 = 3/2'
    },
    lokasiKota: 'Stasiun Angka',
    stikerNama: 'Penerjemah Bilangan'
  },
  {
    id: 2,
    modelResmi: 'model: no. 2, diskon dan perbandingan harga',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 2, namaPanggung: 'Toko Mentari', kataKerjaUtama: 'menggunting', momenWow: 'gunting memotong label harga, potongan jatuh, harga menyusut', tahapTersedia: true },
    ceritaMimo: 'Hari ini Toko Alat Tulis Mentari memasang pita diskon di semua rak!',
    pertanyaanTemukan: 'Jika diskon 20%, berapa persen bagian harga yang benar-benar kita bayar?',
    teksSoal: 'Toko Alat Tulis Mentari memberi diskon 20% untuk semua barang. Harga buku gambar adalah 1/2 dari harga buku komik, dan harga buku tulis adalah 0,75 kali harga buku komik. Harga buku komik Rp20.000,00. Berapa yang harus dibayar untuk satu buku gambar dan satu buku tulis setelah diskon?',
    opsi: [
      { id: 'A', label: 'Rp15.000,00', feedbackSalah: 'Itu hanya harga satu barang atau belum menjumlahkan buku gambar dan buku tulis.' },
      { id: 'B', label: 'Rp20.000,00' },
      { id: 'C', label: 'Rp22.500,00', feedbackSalah: 'Diskonnya 20%, bukan 10%. Cek potongan harga totalnya lagi ya.' },
      { id: 'D', label: 'Rp25.000,00', feedbackSalah: 'Rp25.000,00 adalah harga sebelum diskon 20% dipotong!' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Harga buku gambar', penjelasan: '1/2 × Rp20.000,00 = Rp10.000,00.', highlightBagian: 'gambar' },
      { judul: 'Harga buku tulis', penjelasan: '0,75 × Rp20.000,00 = Rp15.000,00.', highlightBagian: 'tulis' },
      { judul: 'Jumlah lalu diskon 20%', penjelasan: 'Total awal Rp25.000,00. Setelah diskon 20%: 0,8 × Rp25.000,00 = Rp20.000,00.', highlightBagian: 'diskon' }
    ],
    pembahasanSingkat: 'Gambar = 10.000; tulis = 15.000; jumlah 25.000; setelah diskon 20%: 0,8 × 25.000 = 20.000',
    petunjukBertingkat: ['Cari harga buku gambar dan buku tulis dari harga komik Rp20.000,00 terlebih dahulu.', 'Jumlahkan keduanya sebelum menghitung diskon.', 'Diskon 20% berarti membayar 80% dari Rp25.000,00.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Toko memberi diskon 10% untuk semua barang. Harga penggaris 1/2 harga komik, dan harga pensil sama dengan harga komik. Harga komik Rp10.000,00. Berapa yang harus dibayar untuk 1 penggaris dan 1 pensil setelah diskon?',
      opsi: [
        { id: 'A', label: 'Rp12.000,00' },
        { id: 'B', label: 'Rp13.500,00' },
        { id: 'C', label: 'Rp15.000,00' },
        { id: 'D', label: 'Rp18.000,00' }
      ],
      kunciJawaban: 'B',
      langkahPengerjaan: [
        { judul: 'Harga penggaris & pensil', penjelasan: 'Penggaris = 1/2 × 10.000 = Rp5.000,00; Pensil = Rp10.000,00.', highlightBagian: 'gambar' },
        { judul: 'Jumlahkan sebelum diskon', penjelasan: 'Rp5.000,00 + Rp10.000,00 = Rp15.000,00.', highlightBagian: 'tulis' },
        { judul: 'Potong diskon 10%', penjelasan: 'Potongan 10% × 15.000 = Rp1.500,00 → Bayar Rp13.500,00.', highlightBagian: 'diskon' }
      ],
      pembahasanSingkat: '5.000 + 10.000 = 15.000; diskon 10% (1.500) → Rp13.500,00'
    },
    lokasiKota: 'Toko Mentari',
    stikerNama: 'Gunting Diskon'
  },
  {
    id: 3,
    modelResmi: 'model: no. 3, PGK kategori, pecahan dan pembagian rata',
    bentuk: 'PGK_KATEGORI',
    elemen: 'Bilangan',
    widget: { id: 3, namaPanggung: 'Dapur Jus', kataKerjaUtama: 'menuang', momenWow: 'botol terisi bergantian, botol kecil terisi setengah, tetes terakhir memantul', tahapTersedia: true },
    ceritaMimo: 'Bu Sari menyiapkan banyak jus segar untuk dibagikan ke botol besar dan kecil.',
    pertanyaanTemukan: 'Jika satu botol kecil berisi setengah botol besar, berapa botol besar yang setara dengan sejumlah botol kecil?',
    teksSoal: 'Bu Sari membuat jus buah sebanyak 6 wadah, masing-masing berisi 2 1/2 liter. Seluruh jus dituang ke 25 botol besar dengan isi sama banyak dan ke 10 botol kecil. Isi setiap botol kecil adalah setengah isi botol besar. Tentukan Benar atau Salah untuk tiap pernyataan.',
    pernyataanKategori: [
      { id: 'A', teks: 'Jus yang dibuat Bu Sari seluruhnya 15 liter.', kunci: true, feedbackSalah: '6 × 2 1/2 = 6 × 2,5 = 15 liter.' },
      { id: 'B', teks: 'Setiap botol besar berisi 1/2 liter.', kunci: true, feedbackSalah: '10 botol kecil setara 5 botol besar, jadi total setara 30 botol besar. 15 ÷ 30 = 1/2 liter.' },
      { id: 'C', teks: 'Jus yang dikemas dalam botol kecil seluruhnya 5 liter.', kunci: false, feedbackSalah: 'Setiap botol kecil berisi setengah dari 1/2 liter, yaitu 1/4 liter. Jadi 10 × 1/4 = 2,5 liter, bukan 5 liter.' }
    ],
    kunciJawaban: { A: true, B: true, C: false },
    langkahPengerjaan: [
      { judul: 'Hitung total jus', penjelasan: 'Total = 6 × 2,5 = 15 liter.', highlightBagian: 'wadah' },
      { judul: 'Setarakan botol kecil ke botol besar', penjelasan: 'Botol besar x: 25x + 10 × x/2 = 30x = 15, jadi x = 1/2 liter.', highlightBagian: 'besar' },
      { judul: 'Hitung total botol kecil', penjelasan: 'Botol kecil = 1/4 liter × 10 = 2,5 liter (bukan 5 liter).', highlightBagian: 'kecil' }
    ],
    pembahasanSingkat: 'Total 6 × 2,5 = 15 liter. Botol besar x: 25x + 10 × x/2 = 30x = 15, jadi x = 1/2 liter. Botol kecil 1/4 liter × 10 = 2,5 liter (bukan 5)',
    petunjukBertingkat: ['Kalikan 6 wadah dengan 2 1/2 liter untuk total jus.', 'Ubah 10 botol kecil menjadi setara 5 botol besar.', 'Total 30 satuan botol besar menampung 15 liter.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Ibu membuat 4 wadah jus, masing-masing 2 liter. Jus dituang ke 12 botol besar dan 8 botol kecil (isi botol kecil = setengah botol besar). Tentukan Benar atau Salah.',
      pernyataanKategori: [
        { id: 'A', teks: 'Jus seluruhnya 8 liter.', kunci: true, feedbackSalah: '4 × 2 = 8 liter.' },
        { id: 'B', teks: 'Setiap botol besar berisi 1/2 liter.', kunci: true, feedbackSalah: '8 botol kecil = 4 botol besar, total = 16 botol besar → 8 ÷ 16 = 1/2 liter.' },
        { id: 'C', teks: 'Jus dalam botol kecil seluruhnya 4 liter.', kunci: false, feedbackSalah: 'Botol kecil = 1/4 liter × 8 = 2 liter (bukan 4 liter).' }
      ],
      kunciJawaban: { A: true, B: true, C: false },
      langkahPengerjaan: [
        { judul: 'Total jus', penjelasan: '4 × 2 liter = 8 liter.', highlightBagian: 'wadah' },
        { judul: 'Setarakan ke botol besar', penjelasan: '12 + 4 = 16 satuan botol besar → 8 ÷ 16 = 1/2 liter.', highlightBagian: 'besar' },
        { judul: 'Total botol kecil', penjelasan: '8 × 1/4 = 2 liter (bukan 4 liter).', highlightBagian: 'kecil' }
      ],
      pembahasanSingkat: 'Total 8 liter; botol besar 1/2 liter; botol kecil total 2 liter.'
    },
    lokasiKota: 'Dapur Jus',
    stikerNama: 'Takaran Pas'
  },
  {
    id: 4,
    modelResmi: 'model: no. 8, pecahan dari luas lahan',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 4, namaPanggung: 'Petak Kebun', kataKerjaUtama: 'menanam', momenWow: 'tiap bagian lahan tumbuh tanaman berbeda', tahapTersedia: true },
    ceritaMimo: 'Pak Darto membagi kebunnya untuk jagung, kedelai, dan sisanya singkong.',
    pertanyaanTemukan: 'Mengapa mencari luas jagung dulu lalu menguranginya dari total langsung memberi luas kedelai + singkong?',
    teksSoal: 'Pak Darto memiliki lahan seluas 4,8 hektar. Sebanyak 1/4 bagian ditanami jagung, 1/3 bagian ditanami kedelai, dan sisanya ditanami singkong. Berapa luas lahan yang ditanami kedelai dan singkong?',
    opsi: [
      { id: 'A', label: '2,0 hektar', feedbackSalah: '2,0 hektar adalah luas singkong saja, belum ditambah kedelai.' },
      { id: 'B', label: '2,8 hektar', feedbackSalah: '2,8 hektar adalah luas jagung + kedelai, bukan kedelai + singkong.' },
      { id: 'C', label: '3,6 hektar' },
      { id: 'D', label: '4,0 hektar', feedbackSalah: 'Periksa lagi: bagian jagung adalah 1/4 × 4,8 = 1,2 hektar.' }
    ],
    kunciJawaban: 'C',
    langkahPengerjaan: [
      { judul: 'Luas jagung', penjelasan: '1/4 × 4,8 = 1,2 ha.', highlightBagian: 'jagung' },
      { judul: 'Luas kedelai', penjelasan: '1/3 × 4,8 = 1,6 ha.', highlightBagian: 'kedelai' },
      { judul: 'Luas singkong dan gabungannya', penjelasan: 'Singkong = 4,8 − 1,2 − 1,6 = 2,0 ha; kedelai + singkong = 3,6 ha.', highlightBagian: 'gabung' }
    ],
    pembahasanSingkat: 'Kedelai 1,6 ha; jagung 1,2 ha; singkong 4,8 − 1,2 − 1,6 = 2,0 ha; kedelai + singkong = 3,6 ha',
    petunjukBertingkat: ['Yang ditanya adalah gabungan kedelai dan singkong (semua selain jagung).', 'Hitung 1/4 dari 4,8 hektar untuk bagian jagung.', '4,8 − 1,2 = 3,6 hektar.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Lahan seluas 6 hektar ditanami jagung 1/2 bagian, kedelai 1/3 bagian, dan sisanya singkong. Berapa luas kedelai dan singkong?',
      opsi: [
        { id: 'A', label: '1,0 hektar' },
        { id: 'B', label: '2,0 hektar' },
        { id: 'C', label: '3,0 hektar' },
        { id: 'D', label: '5,0 hektar' }
      ],
      kunciJawaban: 'C',
      langkahPengerjaan: [
        { judul: 'Luas jagung', penjelasan: '1/2 × 6 = 3 hektar.', highlightBagian: 'jagung' },
        { judul: 'Luas kedelai', penjelasan: '1/3 × 6 = 2 hektar.', highlightBagian: 'kedelai' },
        { judul: 'Luas singkong & gabungannya', penjelasan: 'Singkong = 1 ha → Kedelai + singkong = 2 + 1 = 3,0 hektar.', highlightBagian: 'gabung' }
      ],
      pembahasanSingkat: 'Jagung 3 ha, kedelai 2 ha, singkong 1 ha → kedelai + singkong = 3,0 ha'
    },
    lokasiKota: 'Kebun Darto',
    stikerNama: 'Penjaga Lahan'
  },
  {
    id: 5,
    modelResmi: 'model: no. 17, KPK',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 5, namaPanggung: 'Kalender Renang', kataKerjaUtama: 'menyala', momenWow: 'pada hari ke-24 tiga kolam memercik bersamaan', tahapTersedia: true },
    ceritaMimo: 'Ardi, Bayu, dan Candra berenang dengan jadwal berbeda. Kapan tiga pelampung mereka menyala bersamaan?',
    pertanyaanTemukan: 'Mengapa kita mencari kelipatan persekutuan terkecil (KPK) dan bukan FPB?',
    teksSoal: 'Tiga sahabat berlatih renang di kolam yang sama. Ardi berlatih setiap 4 hari sekali, Bayu setiap 6 hari sekali, dan Candra setiap 8 hari sekali. Hari ini mereka berlatih bersama. Setiap berapa hari mereka akan berlatih bersama lagi?',
    opsi: [
      { id: 'A', label: '12 hari', feedbackSalah: 'Pada hari ke-12, Ardi dan Bayu bertemu, tetapi Candra (kelipatan 8) belum jadwalnya.' },
      { id: 'B', label: '18 hari', feedbackSalah: '18 bukan kelipatan 4 dan bukan kelipatan 8.' },
      { id: 'C', label: '24 hari' },
      { id: 'D', label: '48 hari', feedbackSalah: 'Di hari ke-48 mereka memang bertemu, tetapi ada hari pertemuan lebih awal yaitu KPK.' }
    ],
    kunciJawaban: 'C',
    langkahPengerjaan: [
      { judul: 'Daftar kelipatan atau faktor prima', penjelasan: '4 = 2², 6 = 2 × 3, 8 = 2³.', highlightBagian: 'jadwal' },
      { judul: 'Ambil pangkat terbesar', penjelasan: 'KPK = 2³ × 3 = 8 × 3 = 24.', highlightBagian: 'hari24' }
    ],
    pembahasanSingkat: 'KPK 4, 6, 8 = 24',
    petunjukBertingkat: ['Cari bilangan yang habis dibagi 4, 6, dan 8 sekaligus.', 'Coba cek kelipatan 8: 8, 16, 24…', 'Apakah 24 habis dibagi 4 dan 6? Ya!'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Tiga anak berlatih renang setiap 2 hari, 3 hari, dan 4 hari sekali. Setiap berapa hari mereka berlatih bersama lagi?',
      opsi: [
        { id: 'A', label: '6 hari' },
        { id: 'B', label: '8 hari' },
        { id: 'C', label: '12 hari' },
        { id: 'D', label: '24 hari' }
      ],
      kunciJawaban: 'C',
      langkahPengerjaan: [
        { judul: 'Faktor prima', penjelasan: '2 = 2, 3 = 3, 4 = 2².', highlightBagian: 'jadwal' },
        { judul: 'KPK', penjelasan: 'KPK(2, 3, 4) = 2² × 3 = 12 hari.', highlightBagian: 'hari24' }
      ],
      pembahasanSingkat: 'KPK(2, 3, 4) = 12 hari'
    },
    lokasiKota: 'Kolam Kota',
    stikerNama: 'Penjaga Jadwal'
  },
  {
    id: 6,
    modelResmi: 'model: no. 16, pembagian dengan sisa',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 6, namaPanggung: 'Gunting Kawat', kataKerjaUtama: 'memotong', momenWow: 'sisa 16 cm berkedip lalu berubah jadi gantungan mini', tahapTersedia: true },
    ceritaMimo: 'Ibu memotong kawat menjadi potongan sama panjang untuk gantungan tanaman.',
    pertanyaanTemukan: 'Mengapa sisa potongan harus lebih kecil dari panjang tiap potongan?',
    teksSoal: 'Ibu mempunyai kawat sepanjang 250 cm. Kawat itu dipotong-potong untuk gantungan tanaman, masing-masing 18 cm, sebanyak mungkin. Berapa cm sisa kawat yang tidak terpakai?',
    opsi: [
      { id: 'A', label: '14 cm', feedbackSalah: 'Cek ulang hasil kali 13 × 18.' },
      { id: 'B', label: '15 cm', feedbackSalah: '250 − 234 bukan 15 cm.' },
      { id: 'C', label: '16 cm' },
      { id: 'D', label: '17 cm', feedbackSalah: 'Hampir tepat, selisih 250 dan 234 adalah 16.' }
    ],
    kunciJawaban: 'C',
    langkahPengerjaan: [
      { judul: 'Bagi 250 dengan 18', penjelasan: '250 ÷ 18 = 13 bagian penuh.', highlightBagian: 'potong' },
      { judul: 'Hitung panjang terpakai dan sisa', penjelasan: '13 × 18 = 234 cm, sisa = 250 − 234 = 16 cm.', highlightBagian: 'sisa' }
    ],
    pembahasanSingkat: '250 ÷ 18 = 13 sisa 16 (13 × 18 = 234)',
    petunjukBertingkat: ['Cari kelipatan 18 yang paling dekat tetapi tidak melebihi 250.', '10 × 18 = 180, tambah lagi 3 × 18 = 54 menjadi 234.', 'Kurangkan 250 dengan 234.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Kawat sepanjang 100 cm dipotong menjadi bagian 15 cm sebanyak mungkin. Berapa cm sisa kawatnya?',
      opsi: [
        { id: 'A', label: '5 cm' },
        { id: 'B', label: '10 cm' },
        { id: 'C', label: '12 cm' },
        { id: 'D', label: '15 cm' }
      ],
      kunciJawaban: 'B',
      langkahPengerjaan: [
        { judul: 'Potong per 15 cm', penjelasan: '6 × 15 cm = 90 cm.', highlightBagian: 'potong' },
        { judul: 'Cari sisa', penjelasan: '100 − 90 = 10 cm.', highlightBagian: 'sisa' }
      ],
      pembahasanSingkat: '100 ÷ 15 = 6 sisa 10 cm'
    },
    lokasiKota: 'Bengkel Kawat',
    stikerNama: 'Pemotong Tepat'
  },
  {
    id: 7,
    modelResmi: 'model: no. 21, perkalian dan pembagian untuk kebutuhan barang',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 7, namaPanggung: 'Gudang Buku', kataKerjaUtama: 'memasukkan', momenWow: 'dus penuh meluncur ke truk saat isinya pas penuh', tahapTersedia: true },
    ceritaMimo: 'Lomba membaca siap dimulai! Ayo hitung berapa dus buku yang harus dimuat ke truk.',
    pertanyaanTemukan: 'Mengapa menjumlahkan jumlah siswa dulu lebih ringkas daripada menghitung dus per kelas?',
    teksSoal: 'Perpustakaan SD Cahaya mengadakan lomba membaca. Pesertanya 26 siswa dari Kelas A, 34 siswa dari Kelas B, dan 40 siswa dari Kelas C. Setiap siswa mendapat 3 buku bacaan. Jika 1 dus berisi 25 buku, berapa dus yang dibutuhkan?',
    opsi: [
      { id: 'A', label: '10 dus', feedbackSalah: '10 dus hanya memuat 250 buku, sedangkan total peserta ada 100 siswa.' },
      { id: 'B', label: '12 dus' },
      { id: 'C', label: '13 dus', feedbackSalah: '300 habis dibagi 25 tepat 12 dus, tidak perlu sisa dus.' },
      { id: 'D', label: '15 dus', feedbackSalah: '15 dus memuat 375 buku, terlalu banyak untuk 300 buku.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Total siswa', penjelasan: '26 + 34 + 40 = 100 siswa.', highlightBagian: 'siswa' },
      { judul: 'Total buku', penjelasan: '100 × 3 = 300 buku.', highlightBagian: 'buku' },
      { judul: 'Banyak dus', penjelasan: '300 ÷ 25 = 12 dus.', highlightBagian: 'dus' }
    ],
    pembahasanSingkat: '26 + 34 + 40 = 100 siswa; 100 × 3 = 300 buku; 300 ÷ 25 = 12 dus',
    petunjukBertingkat: ['Jumlahkan seluruh peserta dari Kelas A, B, dan C.', 'Kalikan total peserta dengan 3 buku per siswa.', 'Bagilah 300 buku dengan isi 1 dus (25 buku).'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Peserta lomba ada 15 siswa Kelas A, 25 siswa Kelas B. Setiap siswa mendapat 2 buku. Jika 1 dus berisi 20 buku, berapa dus yang dibutuhkan?',
      opsi: [
        { id: 'A', label: '2 dus' },
        { id: 'B', label: '3 dus' },
        { id: 'C', label: '4 dus' },
        { id: 'D', label: '5 dus' }
      ],
      kunciJawaban: 'C',
      langkahPengerjaan: [
        { judul: 'Total siswa', penjelasan: '15 + 25 = 40 siswa.', highlightBagian: 'siswa' },
        { judul: 'Total buku', penjelasan: '40 × 2 = 80 buku.', highlightBagian: 'buku' },
        { judul: 'Banyak dus', penjelasan: '80 ÷ 20 = 4 dus.', highlightBagian: 'dus' }
      ],
      pembahasanSingkat: '40 siswa × 2 = 80 buku; 80 ÷ 20 = 4 dus'
    },
    lokasiKota: 'Gudang Cahaya',
    stikerNama: 'Manajer Logistik'
  },
  {
    id: 8,
    modelResmi: 'model: no. 5, PGK, satuan berat',
    bentuk: 'PGK',
    elemen: 'Pengukuran',
    widget: { id: 8, namaPanggung: 'Timbangan Sembako', kataKerjaUtama: 'menimbang', momenWow: 'timbangan seimbang berbunyi "ting", paket terbuka', tahapTersedia: true },
    ceritaMimo: 'Paket sembako baru tiba di Toko Timbang! Tapi label beratnya campur-aduk antara kg, hg, dan g.',
    pertanyaanTemukan: 'Mengapa 480 gram tidak bisa dibilang lebih dari 0,5 kg?',
    teksSoal: 'Sebuah paket sembako berisi 2 kg beras, 3 bungkus gula pasir dengan berat masing-masing 4 hg, dan 6 bungkus mi instan dengan berat masing-masing 80 g. Pilih semua pernyataan yang benar (jawaban benar lebih dari satu).',
    opsi: [
      { id: 'a', label: 'Berat seluruh isi paket adalah 3.680 gram.' },
      { id: 'b', label: 'Berat seluruh mi instan lebih dari 0,5 kilogram.', feedbackSalah: 'Hati-hati! 6 × 80 g = 480 g = 0,48 kg. Bandingkan 0,48 kg dengan 0,5 kg (= 500 g).' },
      { id: 'c', label: 'Berat seluruh gula pasir lebih besar daripada berat seluruh mi instan.' }
    ],
    kunciJawaban: ['a', 'c'],
    langkahPengerjaan: [
      { judul: 'Ubah semua ke gram', penjelasan: 'Beras 2 kg = 2.000 g. Gula 1 bungkus = 4 hg = 400 g (3 bungkus = 1.200 g). Mi instan 6 × 80 g = 480 g.', highlightBagian: 'tangga' },
      { judul: 'Cek pernyataan a', penjelasan: 'Total = 2.000 g + 1.200 g + 480 g = 3.680 gram. Jadi pernyataan a benar.', highlightBagian: 'total' },
      { judul: 'Cek pernyataan b', penjelasan: 'Mi instan 480 g = 0,48 kg, kurang dari 0,5 kg (500 g). Jadi pernyataan b salah.', highlightBagian: 'mi' },
      { judul: 'Cek pernyataan c', penjelasan: 'Gula pasir 1.200 g lebih besar daripada mi instan 480 g. Jadi pernyataan c benar.', highlightBagian: 'gula' }
    ],
    pembahasanSingkat: 'Beras 2.000 g + gula 3 × 400 = 1.200 g + mi 6 × 80 = 480 g = 3.680 g (1 benar). Mi 480 g = 0,48 kg, kurang dari 0,5 kg (2 salah). Gula 1.200 g > mi 480 g (3 benar)',
    petunjukBertingkat: ['Samakan semua satuan ke gram dulu menggunakan tangga kg – hg – dag – g.', 'Ingat: 1 hg = 100 g, jadi 4 hg = 400 g, dan 0,5 kg = 500 g.', 'Hitung satu per satu: beras (2.000 g), gula (3 × 400 g), mi (6 × 80 g), lalu cek a, b, c.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Sebuah paket contoh berisi 1 kg beras, 2 bungkus gula @ 5 hg, dan 5 bungkus mi instan @ 100 g. Pilih semua pernyataan yang benar.',
      opsi: [
        { id: 'a', label: 'Berat seluruh isi paket adalah 2.500 gram.' },
        { id: 'b', label: 'Berat seluruh mi instan lebih dari 0,5 kilogram.', feedbackSalah: '5 × 100 g = 500 g = tepat 0,5 kg, jadi tidak lebih dari 0,5 kg.' },
        { id: 'c', label: 'Berat seluruh gula pasir lebih besar daripada berat seluruh mi instan.' }
      ],
      kunciJawaban: ['a', 'c'],
      langkahPengerjaan: [
        { judul: 'Ubah ke gram', penjelasan: 'Beras 1 kg = 1.000 g, Gula 2 × 5 hg = 1.000 g, Mi 5 × 100 g = 500 g.', highlightBagian: 'tangga' },
        { judul: 'Total berat paket', penjelasan: '1.000 + 1.000 + 500 = 2.500 gram (a benar).', highlightBagian: 'total' },
        { judul: 'Bandingkan mi & gula', penjelasan: 'Mi 500 g = 0,5 kg (tidak lebih, b salah); Gula 1.000 g > 500 g (c benar).', highlightBagian: 'gula' }
      ],
      pembahasanSingkat: 'Beras 1.000 g + Gula 1.000 g + Mi 500 g = 2.500 g (a dan c benar)'
    },
    kartuGuru: {
      pemantik: 'Mengapa 480 g tidak bisa dibilang lebih dari 0,5 kg? Bagaimana kalau kita bandingkan 0,48 kg dengan 0,50 kg?',
      salahKonsep: ['Lupa mengubah satuan hg menjadi g (mengira 4 hg = 40 g atau 4 g).', 'Lupa mengalikan banyak bungkus.', 'Mengira 0,5 kg lebih kecil dari 480 g karena angka 5 lebih kecil daripada 480.'],
      kapanBerhenti: 'Hentikan sebentar setelah anak menaikkan 3 bungkus gula ke piring kiri, dan minta kelas memprediksi berat penyeimbang di kanan.',
      mariSalah: {
        klaimMimo: 'Kata Mimo: "Wah, 2 + 3×4 + 6×80 = 494! Berarti mi instan 480 itu jauh lebih berat dari 0,5!"',
        kesalahan: 'Mimo menjumlahkan angka yang satuannya berbeda (kg, hg, g) tanpa menyamakan ke gram dulu.',
        perbaikan: 'Samakan satuan ke gram: 2 kg = 2.000 g, 3 × 4 hg = 1.200 g, dan 0,5 kg = 500 g.'
      },
      kegiatanKelas: 'Minta 2 siswa mengangkat benda nyata di kelas untuk menaksir beratnya sebelum menimbang.'
    },
    lokasiKota: 'Pasar Timbang',
    stikerNama: 'Penimbang Ulung'
  },
  {
    id: 9,
    modelResmi: 'model: no. 10, kecepatan, jarak, waktu',
    bentuk: 'PG',
    elemen: 'Pengukuran',
    widget: { id: 9, namaPanggung: 'Peta Perjalanan', kataKerjaUtama: 'menyetir', momenWow: 'mobil melaju, berhenti istirahat, jam di pojok ikut bergeser', tahapTersedia: true },
    ceritaMimo: 'Bu Rina mau mengunjungi nenek. Jangan lupa berhenti istirahat 30 menit di rest area!',
    pertanyaanTemukan: 'Mengapa 2,5 jam berarti 2 jam 30 menit, bukan 2 jam 50 menit?',
    teksSoal: 'Bu Rina berkendara dari rumah ke rumah neneknya yang berjarak 150 km dengan kecepatan rata-rata 60 km/jam. Ia berangkat pukul 07.30 dan berhenti 30 menit di tengah jalan untuk beristirahat. Pukul berapa Bu Rina tiba?',
    opsi: [
      { id: 'A', label: '10.00', feedbackSalah: 'Itu waktu tiba jika Bu Rina tidak berhenti istirahat 30 menit.' },
      { id: 'B', label: '10.30' },
      { id: 'C', label: '11.00', feedbackSalah: 'Cek lagi: 150 ÷ 60 = 2,5 jam = 2 jam 30 menit, bukan 3 jam.' },
      { id: 'D', label: '11.30', feedbackSalah: 'Periksa kembali pembagian 150 ÷ 60.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Hitung lama berkendara', penjelasan: '150 ÷ 60 = 2,5 jam = 2 jam 30 menit.', highlightBagian: 'jalan' },
      { judul: 'Tambahkan waktu istirahat', penjelasan: '2 jam 30 menit + 30 menit = 3 jam.', highlightBagian: 'istirahat' },
      { judul: 'Tambahkan ke jam berangkat', penjelasan: '07.30 + 3 jam = 10.30.', highlightBagian: 'jam' }
    ],
    pembahasanSingkat: '150 ÷ 60 = 2,5 jam = 2 jam 30 menit; ditambah istirahat 30 menit = 3 jam; 07.30 + 3 jam = 10.30',
    petunjukBertingkat: ['Gunakan rumus waktu = jarak ÷ kecepatan.', '0,5 jam sama dengan 30 menit.', '07.30 + 2 jam 30 menit + 30 menit = 10.30.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Jarak perjalanan 100 km ditempuh dengan kecepatan 50 km/jam. Berangkat pukul 08.00 dan istirahat 30 menit. Pukul berapa tiba?',
      opsi: [
        { id: 'A', label: '10.00' },
        { id: 'B', label: '10.30' },
        { id: 'C', label: '11.00' },
        { id: 'D', label: '11.30' }
      ],
      kunciJawaban: 'B',
      langkahPengerjaan: [
        { judul: 'Waktu tempuh', penjelasan: '100 ÷ 50 = 2 jam.', highlightBagian: 'jalan' },
        { judul: 'Tambah istirahat', penjelasan: '2 jam + 30 menit = 2 jam 30 menit.', highlightBagian: 'istirahat' },
        { judul: 'Jam tiba', penjelasan: '08.00 + 2 jam 30 menit = 10.30.', highlightBagian: 'jam' }
      ],
      pembahasanSingkat: '100 ÷ 50 = 2 jam + 30 menit = 10.30'
    },
    lokasiKota: 'Jalan Nenek',
    stikerNama: 'Navigasi Tepat'
  },
  {
    id: 10,
    modelResmi: 'model: no. 24, hitungan waktu',
    bentuk: 'PG',
    elemen: 'Pengukuran',
    widget: { id: 10, namaPanggung: 'Jam Dimas', kataKerjaUtama: 'memutar', momenWow: 'jarum berputar cepat mengikuti garis waktu kegiatan', tahapTersedia: true },
    ceritaMimo: 'Jadwal latihan sepak bola Dimas padat sekali pagi ini!',
    pertanyaanTemukan: 'Bagaimana aturan mengubah kelebihan 60 menit saat menjumlahkan jam dan menit?',
    teksSoal: 'Dimas berangkat dari rumah pukul 06.50. Perjalanan ke lapangan memerlukan 40 menit. Latihan sepak bola berlangsung 1 jam 45 menit. Setelah itu Dimas beristirahat 25 menit sebelum pulang. Pukul berapa Dimas meninggalkan lapangan?',
    opsi: [
      { id: 'A', label: '09.30', feedbackSalah: 'Hampir! Cek lagi penjumlahan 45 menit + 25 menit.' },
      { id: 'B', label: '09.40' },
      { id: 'C', label: '09.50', feedbackSalah: 'Cek ulang: 09.15 + 25 menit = 09.40, bukan 09.50.' },
      { id: 'D', label: '10.00', feedbackSalah: 'Total durasi adalah 2 jam 50 menit.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Tiba di lapangan', penjelasan: '06.50 + 40 menit = 07.30.', highlightBagian: 'berangkat' },
      { judul: 'Selesai latihan', penjelasan: '07.30 + 1 jam 45 menit = 09.15.', highlightBagian: 'latihan' },
      { judul: 'Selesai istirahat', penjelasan: '09.15 + 25 menit = 09.40.', highlightBagian: 'pulang' }
    ],
    pembahasanSingkat: '06.50 + 40 menit = 07.30; + 1 jam 45 menit = 09.15; + 25 menit = 09.40',
    petunjukBertingkat: ['Tambahkan satu kegiatan demi satu kegiatan pada jam.', '06.50 + 40 menit melewati pukul 07.00 menjadi 07.30.', 'Dari 07.30, tambah 1 jam 45 menit lalu tambah 25 menit.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Berangkat pukul 07.00. Jalan 20 menit, latihan 1 jam, istirahat 10 menit. Pukul berapa selesai?',
      opsi: [
        { id: 'A', label: '08.10' },
        { id: 'B', label: '08.20' },
        { id: 'C', label: '08.30' },
        { id: 'D', label: '09.00' }
      ],
      kunciJawaban: 'C',
      langkahPengerjaan: [
        { judul: 'Tiba', penjelasan: '07.00 + 20 menit = 07.20.', highlightBagian: 'berangkat' },
        { judul: 'Selesai latihan', penjelasan: '07.20 + 1 jam = 08.20.', highlightBagian: 'latihan' },
        { judul: 'Selesai istirahat', penjelasan: '08.20 + 10 menit = 08.30.', highlightBagian: 'pulang' }
      ],
      pembahasanSingkat: '07.00 + 20m + 1j + 10m = 08.30'
    },
    lokasiKota: 'Stadion Dimas',
    stikerNama: 'Penjaga Waktu'
  },
  {
    id: 11,
    modelResmi: 'model: no. 14, PGK, volume balok',
    bentuk: 'PGK',
    elemen: 'Geometri',
    widget: { id: 11, namaPanggung: 'Kotak Kubus Satuan', kataKerjaUtama: 'menyusun', momenWow: 'kubus terkunci "klik" saat kotak pas penuh, yang kelebihan meluap', tahapTersedia: true },
    ceritaMimo: 'Sinta harus memilih kotak yang bisa menampung TEPAT sejumlah kubus satuan tanpa sisa atau meluap.',
    pertanyaanTemukan: 'Bagaimana dua kotak dengan ukuran panjang-lebar-tinggi berbeda bisa memiliki volume yang sama?',
    teksSoal: 'Ibu guru meminta Sinta membawa sebuah kotak yang dapat menampung tepat 72 kubus satuan (rusuk kubus satuan 1 cm). Kotak mana saja yang harus dibawa Sinta? (jawaban benar lebih dari satu)',
    opsi: [
      { id: 'a', label: 'Kotak berukuran 6 cm × 4 cm × 3 cm' },
      { id: 'b', label: 'Kotak berukuran 8 cm × 3 cm × 3 cm' },
      { id: 'c', label: 'Kotak berukuran 6 cm × 4 cm × 4 cm', feedbackSalah: 'Hitung lagi: 6 × 4 × 4 = 96 kubus satuan, lebih dari 72.' }
    ],
    kunciJawaban: ['a', 'b'],
    langkahPengerjaan: [
      { judul: 'Hitung kotak a', penjelasan: '6 × 4 × 3 = 72 cm³ (benar).', highlightBagian: 'kotakA' },
      { judul: 'Hitung kotak b', penjelasan: '8 × 3 × 3 = 72 cm³ (benar).', highlightBagian: 'kotakB' },
      { judul: 'Hitung kotak c', penjelasan: '6 × 4 × 4 = 96 cm³ (salah).', highlightBagian: 'kotakC' }
    ],
    pembahasanSingkat: '6 × 4 × 3 = 72 (benar); 8 × 3 × 3 = 72 (benar); 6 × 4 × 4 = 96 (salah)',
    petunjukBertingkat: ['Volume balok = panjang × lebar × tinggi.', 'Setiap kubus 1 cm³ bernilai 1.', 'Kalikan ketiga ukuran di setiap pilihan.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Pilih kotak yang dapat menampung TEPAT 24 kubus satuan (1 cm³)!',
      opsi: [
        { id: 'a', label: 'Kotak 4 cm × 3 cm × 2 cm' },
        { id: 'b', label: 'Kotak 6 cm × 2 cm × 2 cm' },
        { id: 'c', label: 'Kotak 4 cm × 3 cm × 3 cm', feedbackSalah: '4 × 3 × 3 = 36 kubus satuan!' }
      ],
      kunciJawaban: ['a', 'b'],
      langkahPengerjaan: [
        { judul: 'Cek kotak a', penjelasan: '4 × 3 × 2 = 24 kubus (benar).', highlightBagian: 'kotakA' },
        { judul: 'Cek kotak b', penjelasan: '6 × 2 × 2 = 24 kubus (benar).', highlightBagian: 'kotakB' },
        { judul: 'Cek kotak c', penjelasan: '4 × 3 × 3 = 36 kubus (salah).', highlightBagian: 'kotakC' }
      ],
      pembahasanSingkat: '4×3×2 = 24 dan 6×2×2 = 24'
    },
    lokasiKota: 'Gudang Balok',
    stikerNama: 'Arsitek Kubus'
  },
  {
    id: 12,
    modelResmi: 'model: no. 9, volume kubus berubah menjadi balok',
    bentuk: 'PG',
    elemen: 'Geometri',
    widget: { id: 12, namaPanggung: 'Bongkar Pasang Bak', kataKerjaUtama: 'membongkar', momenWow: 'kubus besar terlepas per lapisan lalu menyusun balok baru', tahapTersedia: true },
    ceritaMimo: 'Bak kubus mau dirombak menjadi balok dengan ukuran panjang & lebar yang baru!',
    pertanyaanTemukan: 'Jika panjang dijadikan 2 kali lipat dan lebar dijadikan 1/3 kali semula, mengapa volumenya berkurang?',
    teksSoal: 'Sebuah bak berbentuk kubus memiliki volume 27 m³. Bak itu diubah menjadi balok dengan panjang 2 kali rusuk bak semula, lebar 1/3 rusuk bak semula, dan tinggi sama dengan rusuk bak semula. Berapa volume bak yang baru?',
    opsi: [
      { id: 'A', label: '9 m³', feedbackSalah: 'Itu baru satu sisi; panjangnya sudah dikali 2.' },
      { id: 'B', label: '18 m³' },
      { id: 'C', label: '27 m³', feedbackSalah: '27 m³ adalah volume kubus semula sebelum diubah ukurannya.' },
      { id: 'D', label: '36 m³', feedbackSalah: 'Lebar menjadi 1/3 rusuk (1 m), bukan 2/3.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Cari rusuk kubus semula', penjelasan: '3 × 3 × 3 = 27, jadi rusuk = 3 m.', highlightBagian: 'kubus' },
      { judul: 'Hitung ukuran balok baru', penjelasan: 'Panjang = 2 × 3 = 6 m, lebar = 1/3 × 3 = 1 m, tinggi = 3 m.', highlightBagian: 'ukuran' },
      { judul: 'Hitung volume baru', penjelasan: '6 × 1 × 3 = 18 m³.', highlightBagian: 'balok' }
    ],
    pembahasanSingkat: 'Rusuk = 3 m (3 × 3 × 3 = 27). Balok 6 × 1 × 3 = 18 m³',
    petunjukBertingkat: ['Cari bilangan yang jika dipangkatkan tiga menghasilkan 27.', 'Rusuk = 3 m. Ubah menjadi p = 6 m, l = 1 m, t = 3 m.', 'Kalikan p × l × t.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Kubus bervolume 8 m³ diubah menjadi balok dengan panjang 3× rusuk semula, lebar 1/2 rusuk semula, dan tinggi tetap. Berapa volume barunya?',
      opsi: [
        { id: 'A', label: '8 m³' },
        { id: 'B', label: '12 m³' },
        { id: 'C', label: '16 m³' },
        { id: 'D', label: '24 m³' }
      ],
      kunciJawaban: 'B',
      langkahPengerjaan: [
        { judul: 'Rusuk kubus 8 m³', penjelasan: '2 × 2 × 2 = 8, jadi rusuk = 2 m.', highlightBagian: 'kubus' },
        { judul: 'Ukuran balok baru', penjelasan: 'p = 3×2 = 6 m, l = 1/2×2 = 1 m, t = 2 m.', highlightBagian: 'ukuran' },
        { judul: 'Volume baru', penjelasan: '6 × 1 × 2 = 12 m³.', highlightBagian: 'balok' }
      ],
      pembahasanSingkat: 'Rusuk = 2 m → Balok 6 × 1 × 2 = 12 m³'
    },
    lokasiKota: 'Menara Air',
    stikerNama: 'Pembentuk Ruang'
  },
  {
    id: 13,
    modelResmi: 'model: no. 23, sifat bangun datar',
    bentuk: 'PG',
    elemen: 'Geometri',
    widget: { id: 13, namaPanggung: 'Detektif Bangun', kataKerjaUtama: 'mencoret', momenWow: 'bangun yang gugur memudar, bangun jawaban bersinar', tahapTersedia: true },
    ceritaMimo: 'Mimo mencari tersangka bangun datar dari 3 petunjuk rahasia!',
    pertanyaanTemukan: 'Mengapa persegi gugur pada petunjuk nomor (2)?',
    teksSoal: 'Sebuah bangun datar memiliki sifat: (1) mempunyai dua pasang sisi sejajar; (2) sisi-sisi yang berhadapan sama panjang, tetapi sisi yang berdekatan tidak sama panjang; (3) keempat sudutnya siku-siku. Apa nama bangun datar tersebut?',
    opsi: [
      { id: 'A', label: 'Persegi', feedbackSalah: 'Pada persegi, sisi yang berdekatan sama panjang.' },
      { id: 'B', label: 'Persegi panjang' },
      { id: 'C', label: 'Jajargenjang', feedbackSalah: 'Jajargenjang pada umumnya tidak memiliki empat sudut siku-siku.' },
      { id: 'D', label: 'Trapesium', feedbackSalah: 'Trapesium hanya punya sepasang sisi sejajar.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Saring syarat (1)', penjelasan: 'Dua pasang sisi sejajar: trapesium gugur.', highlightBagian: 's1' },
      { judul: 'Saring syarat (2)', penjelasan: 'Sisi berdekatan tidak sama panjang: persegi gugur.', highlightBagian: 's2' },
      { judul: 'Saring syarat (3)', penjelasan: 'Keempat sudut siku-siku: jajargenjang gugur, tersisa persegi panjang.', highlightBagian: 's3' }
    ],
    pembahasanSingkat: 'Dua pasang sisi sejajar, sisi berhadapan sama, sisi berdekatan beda, empat sudut siku-siku: persegi panjang',
    petunjukBertingkat: ['Cek satu syarat demi satu syarat untuk mencoret bangun yang tidak cocok.', 'Dua pasang sejajar berarti bukan trapesium; sisi berdekatan beda berarti bukan persegi.', 'Sudut siku-siku memastikan bangun itu persegi panjang.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Bangun datar yang memiliki (1) empat sisi sama panjang dan (2) keempat sudutnya siku-siku adalah …',
      opsi: [
        { id: 'A', label: 'Persegi' },
        { id: 'B', label: 'Persegi panjang' },
        { id: 'C', label: 'Belah ketupat' },
        { id: 'D', label: 'Trapesium' }
      ],
      kunciJawaban: 'A',
      langkahPengerjaan: [
        { judul: 'Empat sisi sama', penjelasan: 'Persegi panjang & trapesium gugur.', highlightBagian: 's1' },
        { judul: 'Empat sudut siku-siku', penjelasan: 'Belah ketupat umum gugur → tersisa Persegi!', highlightBagian: 's2' }
      ],
      pembahasanSingkat: 'Empat sisi sama dan empat sudut siku-siku: Persegi'
    },
    lokasiKota: 'Kantor Detektif',
    stikerNama: 'Detektif Sifat'
  },
  {
    id: 14,
    modelResmi: 'model: no. 6, PGK kategori, data dalam tabel frekuensi',
    bentuk: 'PGK_KATEGORI',
    elemen: 'Data',
    widget: { id: 14, namaPanggung: 'Kantor Berita', kataKerjaUtama: 'meratakan', momenWow: 'batang-batang meratakan diri seperti air mencari level, tersisa tinggi 36', tahapTersedia: true },
    ceritaMimo: 'Perpustakaan kota merilis tabel pengunjung selama 5 hari. Ayo cek berita ini benar atau keliru!',
    pertanyaanTemukan: 'Mengapa rata-rata itu seperti meratakan tinggi semua batang menjadi sama rata?',
    teksSoal: 'Tabel berikut menunjukkan banyak siswa yang berkunjung ke perpustakaan selama lima hari.',
    tabel: { headers: ['Hari', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'], rows: [['Banyak pengunjung', 30, 45, 25, 45, 35]] },
    pernyataanKategori: [
      { id: 'A', teks: 'Pengunjung terbanyak terjadi pada hari Selasa dan Kamis.', kunci: true, feedbackSalah: 'Nilai tertinggi di tabel adalah 45, muncul di hari Selasa dan Kamis.' },
      { id: 'B', teks: 'Selisih pengunjung hari Selasa dan Rabu adalah 15 orang.', kunci: false, feedbackSalah: 'Selasa = 45, Rabu = 25. Selisihnya 45 − 25 = 20 orang, bukan 15.' },
      { id: 'C', teks: 'Rata-rata pengunjung per hari adalah 36 orang.', kunci: true, feedbackSalah: 'Total = 180. Rata-rata = 180 ÷ 5 = 36 orang.' }
    ],
    kunciJawaban: { A: true, B: false, C: true },
    langkahPengerjaan: [
      { judul: 'Cek nilai terbanyak', penjelasan: 'Terbanyak 45 (Selasa, Kamis).', highlightBagian: 'max' },
      { judul: 'Hitung selisih Selasa dan Rabu', penjelasan: 'Selisih Selasa–Rabu = 45 − 25 = 20, bukan 15.', highlightBagian: 'selisih' },
      { judul: 'Hitung rata-rata', penjelasan: 'Total 180 ÷ 5 = 36.', highlightBagian: 'rata' }
    ],
    pembahasanSingkat: 'Terbanyak 45 (Selasa, Kamis). Selisih Selasa–Rabu = 45 − 25 = 20, bukan 15. Total 180 ÷ 5 = 36',
    petunjukBertingkat: ['Periksa setiap pernyataan satu per satu langsung dari tabel.', 'Kurangkan angka Selasa (45) dengan Rabu (25).', 'Jumlahkan kelima angka lalu bagi 5.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Tabel pengunjung 5 hari: Senin 10, Selasa 20, Rabu 15, Kamis 20, Jumat 15. Tentukan Benar atau Salah.',
      tabel: { headers: ['Hari', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'], rows: [['Banyak pengunjung', 10, 20, 15, 20, 15]] },
      pernyataanKategori: [
        { id: 'A', teks: 'Terbanyak terjadi pada hari Selasa dan Kamis.', kunci: true, feedbackSalah: '20 paling tinggi.' },
        { id: 'B', teks: 'Selisih Selasa dan Rabu adalah 10 orang.', kunci: false, feedbackSalah: '20 − 15 = 5 orang.' },
        { id: 'C', teks: 'Rata-rata pengunjung per hari adalah 16 orang.', kunci: true, feedbackSalah: '80 ÷ 5 = 16 orang.' }
      ],
      kunciJawaban: { A: true, B: false, C: true },
      langkahPengerjaan: [
        { judul: 'Nilai tertinggi', penjelasan: '20 pada Selasa & Kamis.', highlightBagian: 'max' },
        { judul: 'Selisih', penjelasan: '20 − 15 = 5 (bukan 10).', highlightBagian: 'selisih' },
        { judul: 'Rata-rata', penjelasan: '(10+20+15+20+15) ÷ 5 = 80 ÷ 5 = 16.', highlightBagian: 'rata' }
      ],
      pembahasanSingkat: 'Max 20; selisih 5; rata-rata 80 ÷ 5 = 16'
    },
    lokasiKota: 'Redaksi Data',
    stikerNama: 'Editor Fakta'
  },
  {
    id: 15,
    modelResmi: 'model: no. 12, pecahan desimal dan berat',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 15, namaPanggung: 'Keranjang Buah', kataKerjaUtama: 'menyingkap', momenWow: 'kain penutup jeruk ditarik, berat tiap jeruk terungkap', tahapTersedia: true },
    ceritaMimo: 'Ayah membawa kantong berisi apel dan beberapa jeruk yang bersembunyi di balik kain!',
    pertanyaanTemukan: 'Mengapa berat apel langsung menjadi pengurang tanpa perlu dibagi banyak buah apel?',
    teksSoal: 'Ayah membeli 4 kg buah. Di dalam kantong terdapat 3 buah apel dengan berat seluruhnya 1,3 kg, dan sisanya adalah 9 buah jeruk. Berat satu buah jeruk adalah …',
    opsi: [
      { id: 'A', label: '0,25 kg', feedbackSalah: '9 × 0,25 = 2,25 kg, masih kurang.' },
      { id: 'B', label: '0,3 kg' },
      { id: 'C', label: '0,35 kg', feedbackSalah: '9 × 0,35 = 3,15 kg, melebihi sisa 2,7 kg.' },
      { id: 'D', label: '0,4 kg', feedbackSalah: '9 × 0,4 = 3,6 kg, terlalu berat.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Cari berat total jeruk', penjelasan: 'Jeruk = 4 − 1,3 = 2,7 kg.', highlightBagian: 'totalJeruk' },
      { judul: 'Bagi rata untuk 9 jeruk', penjelasan: '2,7 ÷ 9 = 0,3 kg.', highlightBagian: 'satuJeruk' }
    ],
    pembahasanSingkat: 'Jeruk = 4 − 1,3 = 2,7 kg; 2,7 ÷ 9 = 0,3 kg',
    petunjukBertingkat: ['Perhatikan kalimat: "berat seluruhnya 1,3 kg".', 'Kurangkan total 4 kg dengan 1,3 kg.', 'Bagilah sisa 2,7 kg dengan 9 buah jeruk.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Total belanja buah 2 kg. Terdapat 2 apel dengan berat seluruhnya 1 kg, dan sisanya 4 jeruk. Berat 1 jeruk adalah …',
      opsi: [
        { id: 'A', label: '0,2 kg' },
        { id: 'B', label: '0,25 kg' },
        { id: 'C', label: '0,5 kg' },
        { id: 'D', label: '1,0 kg' }
      ],
      kunciJawaban: 'B',
      langkahPengerjaan: [
        { judul: 'Berat 4 jeruk', penjelasan: '2 kg − 1 kg = 1 kg.', highlightBagian: 'totalJeruk' },
        { judul: 'Berat 1 jeruk', penjelasan: '1 kg ÷ 4 = 0,25 kg.', highlightBagian: 'satuJeruk' }
      ],
      pembahasanSingkat: '(2 − 1) ÷ 4 = 0,25 kg'
    },
    lokasiKota: 'Kebun Buah',
    stikerNama: 'Pembagi Rata'
  },
  {
    id: 16,
    modelResmi: 'model: no. 22, membandingkan pecahan, desimal, persen',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 16, namaPanggung: 'Lintasan Sepeda', kataKerjaUtama: 'berlomba', momenWow: 'sepeda yang tepat 5/8 melewati garis tengah dan bersinar', tahapTersedia: true },
    ceritaMimo: 'Empat sahabat mengayuh sepeda menuju garis finis. Siapa yang pas di titik target pecahan?',
    pertanyaanTemukan: 'Mengapa 5/8 × 12 km bisa dibandingkan langsung dengan jarak km milik Dedi?',
    teksSoal: 'Empat teman bersepeda dengan target 12 km. Ani telah menempuh 0,75 bagian dari target, Budi 50%, Cici 2/3 bagian, dan Dedi 7,5 km. Siapa yang telah menempuh 5/8 dari target?',
    opsi: [
      { id: 'A', label: 'Ani', feedbackSalah: 'Ani = 0,75 × 12 = 9 km.' },
      { id: 'B', label: 'Budi', feedbackSalah: 'Budi = 50% × 12 = 6 km.' },
      { id: 'C', label: 'Cici', feedbackSalah: 'Cici = 2/3 × 12 = 8 km.' },
      { id: 'D', label: 'Dedi' }
    ],
    kunciJawaban: 'D',
    langkahPengerjaan: [
      { judul: 'Hitung target 5/8', penjelasan: '5/8 = 0,625; 0,625 × 12 = 7,5 km.', highlightBagian: 'target58' },
      { judul: 'Bandingkan semua teman', penjelasan: 'Ani 9 km, Budi 6 km, Cici 8 km, dan Dedi 7,5 km.', highlightBagian: 'dedi' }
    ],
    pembahasanSingkat: '5/8 = 0,625; 0,625 × 12 = 7,5 km (Dedi). Ani 9 km, Budi 6 km, Cici 8 km',
    petunjukBertingkat: ['Hitung dulu jarak km untuk 5/8 dari 12 km.', '(5 × 12) ÷ 8 = 60 ÷ 8 = 7,5 km.', 'Cocokkan jarak 7,5 km dengan keempat nama.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Target bersepeda 10 km. Ani menempuh 0,8 bagian, Budi 30%, Cici 2/5 bagian, Dedi 5 km. Siapa yang menempuh 1/2 dari target?',
      opsi: [
        { id: 'A', label: 'Ani (8 km)' },
        { id: 'B', label: 'Budi (3 km)' },
        { id: 'C', label: 'Cici (4 km)' },
        { id: 'D', label: 'Dedi (5 km)' }
      ],
      kunciJawaban: 'D',
      langkahPengerjaan: [
        { judul: 'Target 1/2 dari 10 km', penjelasan: '1/2 × 10 km = 5 km.', highlightBagian: 'target58' },
        { judul: 'Cocokkan posisi', penjelasan: 'Dedi tepat berada di 5 km!', highlightBagian: 'dedi' }
      ],
      pembahasanSingkat: '1/2 × 10 = 5 km (Dedi)'
    },
    lokasiKota: 'Taman Sepeda',
    stikerNama: 'Pengayuh Pecahan'
  },
  {
    id: 17,
    modelResmi: 'model: no. 13, PGK kategori, satuan volume',
    bentuk: 'PGK_KATEGORI',
    elemen: 'Pengukuran',
    widget: { id: 17, namaPanggung: 'Tangki dan Ember', kataKerjaUtama: 'mengangkut', momenWow: 'air tumpah ke ember berulang dan hitungan ember muncul sebagai deretan', tahapTersedia: true },
    ceritaMimo: 'Tangki air petani berisi hektoliter air dan akan dipindah memakai ember.',
    pertanyaanTemukan: 'Berapa langkah tangga volume dari hektoliter (hl) turun ke liter (l)?',
    teksSoal: 'Seorang petani memiliki tangki berisi air 1,2 hektoliter. Air itu akan dipindahkan memakai ember berkapasitas 15 liter. Tentukan Benar atau Salah untuk tiap pernyataan.',
    pernyataanKategori: [
      { id: 'A', teks: 'Air di dalam tangki sebanyak 120 liter.', kunci: true, feedbackSalah: '1,2 × 100 = 120 liter.' },
      { id: 'B', teks: 'Air tersebut dapat mengisi 9 ember sampai penuh.', kunci: false, feedbackSalah: '120 ÷ 15 = 8 ember penuh, tidak cukup untuk 9 ember.' },
      { id: 'C', teks: 'Setelah 5 ember penuh dipakai, sisa air 45 liter.', kunci: true, feedbackSalah: '120 − (5 × 15) = 120 − 75 = 45 liter.' }
    ],
    kunciJawaban: { A: true, B: false, C: true },
    langkahPengerjaan: [
      { judul: 'Ubah hl ke liter', penjelasan: '1,2 hl = 120 liter.', highlightBagian: 'tangki' },
      { judul: 'Hitung jumlah ember penuh', penjelasan: '120 ÷ 15 = 8 ember (bukan 9).', highlightBagian: 'ember' },
      { judul: 'Hitung sisa setelah 5 ember', penjelasan: '120 − 5 × 15 = 45 liter.', highlightBagian: 'sisa' }
    ],
    pembahasanSingkat: '1,2 hl = 120 liter; 120 ÷ 15 = 8 ember (bukan 9); 120 − 5 × 15 = 45 liter',
    petunjukBertingkat: ['Ingat tangga volume: kl – hl – dal – l (1 hl = 100 liter).', '1,2 × 100 = 120 liter.', 'Bagi 120 dengan 15 untuk banyak ember.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Tangki berisi 0,6 hektoliter air dipindah memakai ember 10 liter. Tentukan Benar atau Salah.',
      pernyataanKategori: [
        { id: 'A', teks: 'Air di dalam tangki sebanyak 60 liter.', kunci: true, feedbackSalah: '0,6 × 100 = 60 liter.' },
        { id: 'B', teks: 'Air tersebut dapat mengisi 7 ember penuh.', kunci: false, feedbackSalah: '60 ÷ 10 = 6 ember penuh.' },
        { id: 'C', teks: 'Setelah 2 ember dipakai, sisa air 40 liter.', kunci: true, feedbackSalah: '60 − 20 = 40 liter.' }
      ],
      kunciJawaban: { A: true, B: false, C: true },
      langkahPengerjaan: [
        { judul: 'Ubah ke liter', penjelasan: '0,6 hl = 60 liter.', highlightBagian: 'tangki' },
        { judul: 'Jumlah ember', penjelasan: '60 ÷ 10 = 6 ember (bukan 7).', highlightBagian: 'ember' },
        { judul: 'Sisa setelah 2 ember', penjelasan: '60 − 20 = 40 liter.', highlightBagian: 'sisa' }
      ],
      pembahasanSingkat: '0,6 hl = 60 l; 6 ember; sisa 40 l'
    },
    lokasiKota: 'Ladang Air',
    stikerNama: 'Pengukur Volume'
  },
  {
    id: 18,
    modelResmi: 'model: no. 4, visualisasi dadu',
    bentuk: 'PG',
    elemen: 'Geometri',
    widget: { id: 18, namaPanggung: 'Dadu Putar', kataKerjaUtama: 'melempar', momenWow: 'dadu dilempar, diputar, titik sisi bawah muncul dengan bunyi', tahapTersedia: true },
    ceritaMimo: 'Rani melempar dadu ajaib yang jumlah titik sisi berlawanannya selalu sama!',
    pertanyaanTemukan: 'Mengapa jumlah dua sisi dadu yang berlawanan pasti 7?',
    teksSoal: 'Sebuah dadu memiliki sisi dengan 1 sampai 6 titik, dan jumlah titik pada dua sisi yang berlawanan selalu sama. Pada dadu yang dilempar Rani, sisi atas memiliki 5 titik. Banyak titik pada sisi bawah adalah …',
    opsi: [
      { id: 'A', label: '1', feedbackSalah: '1 berpasangan dengan 6.' },
      { id: 'B', label: '2' },
      { id: 'C', label: '3', feedbackSalah: '3 berpasangan dengan 4.' },
      { id: 'D', label: '4', feedbackSalah: 'Jika atas 5 dan bawah 4, jumlahnya 9.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Jumlahkan seluruh titik dadu', penjelasan: '1 + 2 + 3 + 4 + 5 + 6 = 21 titik.', highlightBagian: 'semua' },
      { judul: 'Bagi untuk 3 pasang sisi', penjelasan: 'Tiap pasang berjumlah 21 ÷ 3 = 7.', highlightBagian: 'pasangan' },
      { judul: 'Cari pasangan 5', penjelasan: 'Bawah = 7 − 5 = 2.', highlightBagian: 'bawah' }
    ],
    pembahasanSingkat: 'Jumlah semua titik 21; tiga pasang sisi berlawanan, jadi tiap pasang berjumlah 7. Bawah = 7 − 5 = 2',
    petunjukBertingkat: ['Dadu punya 3 pasang sisi berlawanan.', 'Jumlahkan angka 1 sampai 6 lalu bagi 3.', '7 − 5 = 2.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Jika sisi atas dadu menunjukkan 6 titik, berapa titik pada sisi bawah?',
      opsi: [
        { id: 'A', label: '1' },
        { id: 'B', label: '2' },
        { id: 'C', label: '3' },
        { id: 'D', label: '4' }
      ],
      kunciJawaban: 'A',
      langkahPengerjaan: [
        { judul: 'Jumlah pasangan', penjelasan: 'Tiap pasangan berlawanan berjumlah 7.', highlightBagian: 'pasangan' },
        { judul: 'Cari sisi bawah', penjelasan: '7 − 6 = 1 titik.', highlightBagian: 'bawah' }
      ],
      pembahasanSingkat: '7 − 6 = 1'
    },
    lokasiKota: 'Alun-Alun Dadu',
    stikerNama: 'Pengamat Ruang'
  },
  {
    id: 19,
    modelResmi: 'model: no. 19, bagian dari keseluruhan / pecahan senilai',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 19, namaPanggung: 'Loyang Kue', kataKerjaUtama: 'mewarnai', momenWow: 'potongan merapat saat 10/16 disederhanakan menjadi 5/8', tahapTersedia: true },
    ceritaMimo: 'Satu loyang kue manis dibagi rata menjadi potongan sama besar dengan tiga warna rasa.',
    pertanyaanTemukan: 'Mengapa 10/16 dan 5/8 menunjukkan jumlah kue yang persis sama?',
    teksSoal: 'Sebuah loyang kue dipotong menjadi 16 bagian sama besar. Sebanyak 6 potong berwarna cokelat, 4 potong berwarna kuning, dan sisanya berwarna stroberi. Berapa bagian kue yang berwarna cokelat atau kuning? (tulis dalam bentuk paling sederhana)',
    opsi: [
      { id: 'A', label: '1/2', feedbackSalah: '8/16 baru 1/2, sedangkan cokelat + kuning ada 10 potong.' },
      { id: 'B', label: '5/8' },
      { id: 'C', label: '3/4', feedbackSalah: '3/4 dari 16 adalah 12 potong.' },
      { id: 'D', label: '7/8', feedbackSalah: '7/8 adalah 14 potong.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Gabungkan cokelat dan kuning', penjelasan: '6 + 4 = 10 potong dari 16 potong = 10/16.', highlightBagian: 'gabung' },
      { judul: 'Sederhanakan pecahan', penjelasan: 'Bagi pembilang dan penyebut dengan 2: 10/16 = 5/8.', highlightBagian: 'sederhana' }
    ],
    pembahasanSingkat: '(6 + 4)/16 = 10/16 = 5/8',
    petunjukBertingkat: ['Jumlahkan potongan cokelat dan kuning.', 'Tuliskan sebagai pecahan per 16.', 'Sederhanakan dengan membagi 2.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Loyang kue dipotong menjadi 8 bagian sama besar. 2 potong cokelat, 2 potong kuning, sisanya stroberi. Berapa bagian cokelat atau kuning (paling sederhana)?',
      opsi: [
        { id: 'A', label: '1/4' },
        { id: 'B', label: '1/2' },
        { id: 'C', label: '3/4' },
        { id: 'D', label: '5/8' }
      ],
      kunciJawaban: 'B',
      langkahPengerjaan: [
        { judul: 'Gabung', penjelasan: '2 + 2 = 4 potong dari 8 = 4/8.', highlightBagian: 'gabung' },
        { judul: 'Sederhanakan', penjelasan: '4/8 dibagi 4 menjadi 1/2.', highlightBagian: 'sederhana' }
      ],
      pembahasanSingkat: '(2+2)/8 = 4/8 = 1/2'
    },
    lokasiKota: 'Toko Kue',
    stikerNama: 'Penyederhana Pecahan'
  },
  {
    id: 20,
    modelResmi: 'model: no. 20, keliling bangun datar gabungan',
    bentuk: 'PG',
    elemen: 'Geometri',
    widget: { id: 20, namaPanggung: 'Tanah Pak Boni', kataKerjaUtama: 'menggeser', momenWow: 'persegi kolam digeser tetapi garis keliling menyala dan tetap sama panjang', tahapTersedia: true },
    ceritaMimo: 'Pak Boni membuat kolam di pojok lahannya! Apakah pagar keliling tanahnya ikut berkurang?',
    pertanyaanTemukan: 'Mengapa mengambil persegi dari sudut tidak mengubah panjang keliling tanah?',
    teksSoal: 'Pak Boni memiliki tanah berbentuk persegi panjang berukuran 20 m × 12 m. Pada salah satu sudutnya, sebuah bagian berbentuk persegi 5 m × 5 m diambil untuk kolam sehingga tanah itu kini berbentuk huruf L. Berapa keliling tanah Pak Boni sekarang?',
    opsi: [
      { id: 'A', label: '54 m', feedbackSalah: 'Sisi dalam lekukan L ikut dihitung sebagai keliling!' },
      { id: 'B', label: '64 m' },
      { id: 'C', label: '74 m', feedbackSalah: 'Dua sisi luar yang hilang panjangnya sama dengan dua sisi lekukan dalam.' },
      { id: 'D', label: '84 m', feedbackSalah: 'Tidak perlu menambah keliling penuh kolam.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Amati sisi mendatar', penjelasan: '15 m + 5 m = 20 m (sama dengan sisi bawah).', highlightBagian: 'mendatar' },
      { judul: 'Amati sisi tegak', penjelasan: '7 m + 5 m = 12 m (sama dengan sisi kiri).', highlightBagian: 'tegak' },
      { judul: 'Hitung total keliling', penjelasan: 'Keliling tetap 2 × (20 + 12) = 64 m.', highlightBagian: 'keliling' }
    ],
    pembahasanSingkat: 'Mengambil persegi dari sudut tidak mengubah keliling: tetap 2 × (20 + 12) = 64 m',
    petunjukBertingkat: ['Keliling adalah jumlah semua sisi luar huruf L.', 'Geser dua sisi lekukan ke garis putus-putus tepi persegi panjang semula.', 'Kelilingnya sama dengan 2 × (20 + 12).'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Tanah 10 m × 6 m diambil sudutnya 2 m × 2 m untuk kolam kecil. Berapa keliling tanah berbentuk L sekarang?',
      opsi: [
        { id: 'A', label: '24 m' },
        { id: 'B', label: '32 m' },
        { id: 'C', label: '36 m' },
        { id: 'D', label: '40 m' }
      ],
      kunciJawaban: 'B',
      langkahPengerjaan: [
        { judul: 'Sisi mendatar', penjelasan: '8 m + 2 m = 10 m.', highlightBagian: 'mendatar' },
        { judul: 'Sisi tegak', penjelasan: '4 m + 2 m = 6 m.', highlightBagian: 'tegak' },
        { judul: 'Keliling total', penjelasan: '2 × (10 + 6) = 32 m.', highlightBagian: 'keliling' }
      ],
      pembahasanSingkat: 'Tetap 2 × (10 + 6) = 32 m'
    },
    kartuGuru: {
      pemantik: 'Luasnya jelas berkurang karena ada kolam. Tapi mengapa keliling pagarnya tidak ikut berkurang?',
      salahKonsep: ['Mengira luas berkurang berarti keliling juga pasti berkurang.', 'Menambah keliling penuh kolam (64 + 20 = 84 m).', 'Lupa menghitung dua sisi lekukan dalam.'],
      kapanBerhenti: 'Minta siswa menggeser dua dinding kolam ke garis putus-putus, lalu hentikan kelas dan tanya: "Ke mana perginya sisi yang hilang itu?"',
      mariSalah: {
        klaimMimo: 'Kata Mimo: "Kolamnya dipotong 5×5, keliling kolamnya kan 20 m. Jadi 64 − 20 = 44 m!"',
        kesalahan: 'Mimo menyamakan pengurangan luas dengan pengurangan keliling.',
        perbaikan: 'Dua sisi luar yang hilang (5+5=10 m) diganti persis oleh dua sisi lekukan dalam (5+5=10 m), sehingga keliling tetap 64 m.'
      },
      kegiatanKelas: 'Minta 4 siswa memegang tali membentuk persegi panjang di depan kelas, lalu tekuk satu sudut ke dalam—panjang tali tetap sama!'
    },
    lokasiKota: 'Taman Pak Boni',
    stikerNama: 'Penjaga Keliling'
  },
  {
    id: 21,
    modelResmi: 'model: no. 26, PGK kategori, luas dan kapasitas',
    bentuk: 'PGK_KATEGORI',
    elemen: 'Geometri',
    widget: { id: 21, namaPanggung: 'Lahan Parkir', kataKerjaUtama: 'memarkir', momenWow: 'motor masuk dengan klakson kecil, sisa ruang berkedip', tahapTersedia: true },
    ceritaMimo: 'Parkiran baru siap menampung motor-motor dengan rapi.',
    pertanyaanTemukan: 'Mengapa membagi 36 dengan 1,5 sama dengan membagi 72 dengan 3?',
    teksSoal: 'Lahan parkir motor berbentuk persegi panjang berukuran 9 m × 4 m. Satu motor memerlukan lahan seluas 1,5 m². Tentukan Benar atau Salah untuk tiap pernyataan.',
    pernyataanKategori: [
      { id: 'A', teks: 'Luas lahan parkir adalah 32 m².', kunci: false, feedbackSalah: 'Luas = 9 × 4 = 36 m², bukan 32 m².' },
      { id: 'B', teks: 'Lahan itu dapat menampung 24 motor.', kunci: true, feedbackSalah: '36 ÷ 1,5 = 24 motor.' },
      { id: 'C', teks: 'Jika 15 motor sudah parkir, lahan masih cukup untuk 9 motor lagi.', kunci: true, feedbackSalah: '24 − 15 = 9 motor.' }
    ],
    kunciJawaban: { A: false, B: true, C: true },
    langkahPengerjaan: [
      { judul: 'Hitung luas lahan', penjelasan: 'Luas = 9 × 4 = 36 m² (bukan 32).', highlightBagian: 'luas' },
      { judul: 'Hitung kapasitas motor', penjelasan: '36 ÷ 1,5 = 24 motor.', highlightBagian: 'kapasitas' },
      { judul: 'Hitung sisa ruang', penjelasan: '24 − 15 = 9 motor.', highlightBagian: 'sisa' }
    ],
    pembahasanSingkat: 'Luas 9 × 4 = 36 m² (bukan 32). 36 ÷ 1,5 = 24 motor. 24 − 15 = 9',
    petunjukBertingkat: ['Hitung luas dengan panjang × lebar.', 'Bagi luas lahan dengan luas tiap motor.', 'Kurangkan kapasitas total dengan motor yang sudah parkir.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Lahan parkir berukuran 5 m × 4 m, dan 1 motor memerlukan 2 m². Tentukan Benar atau Salah.',
      pernyataanKategori: [
        { id: 'A', teks: 'Luas lahan parkir adalah 18 m².', kunci: false, feedbackSalah: '5 × 4 = 20 m².' },
        { id: 'B', teks: 'Lahan itu dapat menampung 10 motor.', kunci: true, feedbackSalah: '20 ÷ 2 = 10 motor.' },
        { id: 'C', teks: 'Jika 6 motor sudah parkir, masih cukup untuk 4 motor lagi.', kunci: true, feedbackSalah: '10 − 6 = 4 motor.' }
      ],
      kunciJawaban: { A: false, B: true, C: true },
      langkahPengerjaan: [
        { judul: 'Luas lahan', penjelasan: '5 × 4 = 20 m² (bukan 18).', highlightBagian: 'luas' },
        { judul: 'Kapasitas', penjelasan: '20 ÷ 2 = 10 motor.', highlightBagian: 'kapasitas' },
        { judul: 'Sisa tempat', penjelasan: '10 − 6 = 4 motor.', highlightBagian: 'sisa' }
      ],
      pembahasanSingkat: 'Luas 20 m², kapasitas 10 motor, sisa 4 motor'
    },
    lokasiKota: 'Parkiran Kota',
    stikerNama: 'Penata Parkir'
  },
  {
    id: 22,
    modelResmi: 'model: no. 7, PGK kategori, piktogram',
    bentuk: 'PGK_KATEGORI',
    elemen: 'Data',
    widget: { id: 22, namaPanggung: 'Pekan Literasi', kataKerjaUtama: 'menghitung', momenWow: 'buku terbang satu per satu ke rak', tahapTersedia: true },
    ceritaMimo: 'Lihat piktogram pekan literasi! Ingat, satu kotak mewakili beberapa buku.',
    pertanyaanTemukan: 'Mengapa kita harus membaca keterangan simbol sebelum menghitung jumlah buku?',
    teksSoal: 'Piktogram berikut menunjukkan banyak buku yang dibaca tiga anak selama pekan literasi. Satu ■ mewakili 4 buku. Tentukan Benar atau Salah untuk tiap pernyataan.',
    piktogram: { keterangan: 'Satu ■ mewakili 4 buku.', simbol: '■', nilaiPerSimbol: 4, rows: [{ nama: 'Rina', jumlahSimbol: 5 }, { nama: 'Dika', jumlahSimbol: 3 }, { nama: 'Siti', jumlahSimbol: 6 }] },
    pernyataanKategori: [
      { id: 'A', teks: 'Rina membaca 20 buku.', kunci: true, feedbackSalah: '5 × 4 = 20 buku.' },
      { id: 'B', teks: 'Jumlah buku yang dibaca ketiga anak adalah 52 buku.', kunci: false, feedbackSalah: '20 + 12 + 24 = 56 buku, bukan 52.' },
      { id: 'C', teks: 'Siti membaca dua kali lebih banyak buku daripada Dika.', kunci: true, feedbackSalah: '24 = 2 × 12.' }
    ],
    kunciJawaban: { A: true, B: false, C: true },
    langkahPengerjaan: [
      { judul: 'Ubah tiap baris ke jumlah buku', penjelasan: 'Rina 5 × 4 = 20; Dika 3 × 4 = 12; Siti 6 × 4 = 24.', highlightBagian: 'baris' },
      { judul: 'Hitung jumlah total', penjelasan: 'Total = 20 + 12 + 24 = 56 buku (bukan 52).', highlightBagian: 'total' },
      { judul: 'Bandingkan Siti dan Dika', penjelasan: '24 = 2 × 12 (Benar).', highlightBagian: 'banding' }
    ],
    pembahasanSingkat: 'Rina 5 × 4 = 20; Dika 12; Siti 24; total 56 (bukan 52); 24 = 2 × 12',
    petunjukBertingkat: ['Kalikan banyak simbol ■ dengan 4 buku.', 'Jumlah simbol = 5 + 3 + 6 = 14 simbol.', '14 × 4 = 56 buku.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Piktogram buku dengan keterangan 1 ■ = 2 buku. Ani 3 ■, Budi 2 ■, Cici 4 ■. Tentukan Benar atau Salah.',
      piktogram: { keterangan: 'Satu ■ mewakili 2 buku.', simbol: '■', nilaiPerSimbol: 2, rows: [{ nama: 'Ani', jumlahSimbol: 3 }, { nama: 'Budi', jumlahSimbol: 2 }, { nama: 'Cici', jumlahSimbol: 4 }] },
      pernyataanKategori: [
        { id: 'A', teks: 'Ani membaca 6 buku.', kunci: true, feedbackSalah: '3 × 2 = 6 buku.' },
        { id: 'B', teks: 'Jumlah buku ketiga anak adalah 20 buku.', kunci: false, feedbackSalah: '6 + 4 + 8 = 18 buku.' },
        { id: 'C', teks: 'Cici membaca dua kali lebih banyak daripada Budi.', kunci: true, feedbackSalah: '8 = 2 × 4.' }
      ],
      kunciJawaban: { A: true, B: false, C: true },
      langkahPengerjaan: [
        { judul: 'Hitung per anak', penjelasan: 'Ani 6, Budi 4, Cici 8 buku.', highlightBagian: 'baris' },
        { judul: 'Total', penjelasan: '6 + 4 + 8 = 18 buku (bukan 20).', highlightBagian: 'total' },
        { judul: 'Bandingkan', penjelasan: 'Cici 8 = 2 × 4 (Budi).', highlightBagian: 'banding' }
      ],
      pembahasanSingkat: 'Ani 6, Budi 4, Cici 8; total 18 buku'
    },
    lokasiKota: 'Perpustakaan Kota',
    stikerNama: 'Pembaca Piktogram'
  },
  {
    id: 23,
    modelResmi: 'model: no. 27, persen dari keseluruhan',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 23, namaPanggung: 'Buku Cerita', kataKerjaUtama: 'membuka halaman', momenWow: 'halaman membuka dan batang persen terisi bergelombang', tahapTersedia: true },
    ceritaMimo: 'Nia membaca buku cerita selama Senin dan Selasa. Berapa persen yang sudah selesai?',
    pertanyaanTemukan: 'Mengapa "1/3 dari sisa halaman" berarti dikalikan 150, bukan 200?',
    teksSoal: 'Sebuah buku cerita memiliki 200 halaman. Hari Senin Nia membaca 50 halaman. Hari Selasa ia membaca 1/3 dari sisa halaman. Berapa persen halaman buku yang sudah dibaca Nia?',
    opsi: [
      { id: 'A', label: '25%', feedbackSalah: '25% baru halaman hari Senin.' },
      { id: 'B', label: '33%', feedbackSalah: 'Itu hanya bagian hari Selasa dari sisa.' },
      { id: 'C', label: '50%' },
      { id: 'D', label: '75%', feedbackSalah: 'Total yang dibaca = 50 + 50 = 100 dari 200 halaman.' }
    ],
    kunciJawaban: 'C',
    langkahPengerjaan: [
      { judul: 'Cari sisa halaman', penjelasan: 'Sisa setelah Senin = 200 − 50 = 150 halaman.', highlightBagian: 'sisa' },
      { judul: 'Halaman hari Selasa', penjelasan: '1/3 × 150 = 50 halaman.', highlightBagian: 'selasa' },
      { judul: 'Ubah ke persen seluruh buku', penjelasan: 'Total dibaca 50 + 50 = 100 halaman → 100/200 = 50%.', highlightBagian: 'persen' }
    ],
    pembahasanSingkat: 'Sisa 150 halaman; 1/3 × 150 = 50; total dibaca 100; 100/200 = 50%',
    petunjukBertingkat: ['Kurangkan 200 dengan 50 untuk mencari sisa halaman.', 'Hitung 1/3 dari 150 halaman.', 'Jumlahkan Senin dan Selasa lalu ubah ke persen dari 200.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Buku memiliki 100 halaman. Senin dibaca 20 halaman. Selasa dibaca 1/4 dari sisa halaman. Berapa persen halaman yang sudah dibaca?',
      opsi: [
        { id: 'A', label: '20%' },
        { id: 'B', label: '25%' },
        { id: 'C', label: '40%' },
        { id: 'D', label: '50%' }
      ],
      kunciJawaban: 'C',
      langkahPengerjaan: [
        { judul: 'Sisa halaman', penjelasan: '100 − 20 = 80 halaman.', highlightBagian: 'sisa' },
        { judul: 'Bacaan Selasa', penjelasan: '1/4 × 80 = 20 halaman.', highlightBagian: 'selasa' },
        { judul: 'Persen total', penjelasan: '(20 + 20) / 100 = 40%.', highlightBagian: 'persen' }
      ],
      pembahasanSingkat: 'Sisa 80; 1/4×80 = 20; total 40/100 = 40%'
    },
    lokasiKota: 'Toko Buku Nia',
    stikerNama: 'Pembaca Persen'
  },
  {
    id: 24,
    modelResmi: 'model: no. 17, KPK dan FPB',
    bentuk: 'PG',
    elemen: 'Bilangan',
    widget: { id: 24, namaPanggung: 'Packing Parsel', kataKerjaUtama: 'membungkus', momenWow: 'kantong ditutup pita, jumlah kantong maksimum bersinar', tahapTersedia: true },
    ceritaMimo: 'Bu Dewi ingin membuat kantong parsel sebanyak mungkin dengan isi permen dan cokelat sama rata.',
    pertanyaanTemukan: 'Mengapa soal "dibagi sama rata sebanyak mungkin" diselesaikan dengan FPB?',
    teksSoal: 'Bu Dewi memiliki 48 permen dan 36 cokelat. Semuanya dibagi ke dalam beberapa kantong dengan isi permen dan cokelat yang sama di tiap kantong, tanpa sisa. Bu Dewi ingin membuat kantong sebanyak mungkin. Berapa kantong yang dapat dibuat?',
    opsi: [
      { id: 'A', label: '6', feedbackSalah: 'Masih bisa dibagi menjadi kantong yang lebih banyak.' },
      { id: 'B', label: '9', feedbackSalah: '48 tidak habis dibagi 9.' },
      { id: 'C', label: '12' },
      { id: 'D', label: '18', feedbackSalah: '48 tidak habis dibagi 18 tanpa sisa.' }
    ],
    kunciJawaban: 'C',
    langkahPengerjaan: [
      { judul: 'Faktorisasi prima', penjelasan: '48 = 2⁴ × 3 dan 36 = 2² × 3².', highlightBagian: 'faktor' },
      { judul: 'Hitung FPB', penjelasan: 'FPB(48, 36) = 2² × 3 = 12 kantong (tiap kantong 4 permen dan 3 cokelat).', highlightBagian: 'kantong' }
    ],
    pembahasanSingkat: 'FPB(48, 36) = 12 kantong (tiap kantong 4 permen dan 3 cokelat)',
    petunjukBertingkat: ['Cari bilangan terbesar yang dapat membagi habis 48 dan 36.', '48 = 12 × 4 dan 36 = 12 × 3.', 'FPB = 12.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Ada 12 permen dan 18 cokelat dibagi ke kantong sama rata tanpa sisa sebanyak mungkin. Berapa kantong yang dibuat?',
      opsi: [
        { id: 'A', label: '3' },
        { id: 'B', label: '4' },
        { id: 'C', label: '6' },
        { id: 'D', label: '12' }
      ],
      kunciJawaban: 'C',
      langkahPengerjaan: [
        { judul: 'Cari pembagi bersama', penjelasan: '12 dan 18 sama-sama habis dibagi 2, 3, dan 6.', highlightBagian: 'faktor' },
        { judul: 'FPB terbesar', penjelasan: 'FPB(12, 18) = 6 kantong (2 permen + 3 cokelat).', highlightBagian: 'kantong' }
      ],
      pembahasanSingkat: 'FPB(12, 18) = 6 kantong'
    },
    lokasiKota: 'Pabrik Parsel',
    stikerNama: 'Master FPB'
  },
  {
    id: 25,
    modelResmi: 'model: kisi-kisi sub-elemen "besar sudut"',
    bentuk: 'PG',
    elemen: 'Geometri',
    widget: { id: 25, namaPanggung: 'Sobek Sudut', kataKerjaUtama: 'menyobek', momenWow: 'tiga sudut disobek, disusun jadi garis lurus, 180° menyala', tahapTersedia: true },
    ceritaMimo: 'Segitiga kertas ini punya rahasia! Ayo sobek ketiga sudutnya dan jajarkan di penggaris lurus!',
    pertanyaanTemukan: 'Mengapa ketiga sudut segitiga mana pun selalu pas membentuk garis lurus 180°?',
    teksSoal: 'Pada segitiga ABC, besar sudut A = 50° dan besar sudut B dua kali besar sudut A. Berapa besar sudut C?',
    opsi: [
      { id: 'A', label: '20°', feedbackSalah: 'Cek pengurangan: 180° − 150° = 30°, bukan 20°.' },
      { id: 'B', label: '30°' },
      { id: 'C', label: '40°', feedbackSalah: 'Sudut B = 2 × 50° = 100°, bukan 90°.' },
      { id: 'D', label: '80°', feedbackSalah: 'Sudut B dua kali sudut A (100°), bukan 50°.' }
    ],
    kunciJawaban: 'B',
    langkahPengerjaan: [
      { judul: 'Hitung besar sudut B', penjelasan: 'Sudut B = 2 × sudut A = 2 × 50° = 100°.', highlightBagian: 'sudutB' },
      { judul: 'Ingat jumlah sudut segitiga', penjelasan: 'Jika ketiga sudut disobek dan dijajarkan, membentuk sudut lurus = 180°.', highlightBagian: 'garis180' },
      { judul: 'Cari besar sudut C', penjelasan: 'Sudut C = 180° − 50° − 100° = 30°.', highlightBagian: 'sudutC' }
    ],
    pembahasanSingkat: 'Sudut B = 100°; sudut C = 180° − 50° − 100° = 30°',
    petunjukBertingkat: ['Cari besar sudut B = 2 × sudut A.', 'Jumlah ketiga sudut segitiga selalu 180°.', 'Hitung 180° − 50° − 100°.'],
    contohGuru: {
      teksSoal: 'Contoh Guru: Pada segitiga ABC, sudut A = 40° dan sudut B dua kali sudut A. Berapa besar sudut C?',
      opsi: [
        { id: 'A', label: '40°' },
        { id: 'B', label: '60°' },
        { id: 'C', label: '80°' },
        { id: 'D', label: '100°' }
      ],
      kunciJawaban: 'B',
      langkahPengerjaan: [
        { judul: 'Sudut B', penjelasan: '2 × 40° = 80°.', highlightBagian: 'sudutB' },
        { judul: 'Garis lurus 180°', penjelasan: 'Ketiga sudut membentuk 180°.', highlightBagian: 'garis180' },
        { judul: 'Sudut C', penjelasan: '180° − 40° − 80° = 60°.', highlightBagian: 'sudutC' }
      ],
      pembahasanSingkat: 'B = 80°; C = 180° − 40° − 80° = 60°'
    },
    kartuGuru: {
      pemantik: 'Kalau segitiga ini kita ganti bentuknya jadi runcing sekali atau lebar sekali, apakah sobekan tiga sudutnya tetap pas 180°?',
      salahKonsep: ['Lupa mengalikan 2 untuk sudut B.', 'Mengira jumlah sudut segitiga adalah 360°.', 'Salah mengurangi 180° − 150°.'],
      kapanBerhenti: 'Setelah anak menyobek sudut A dan B lalu merapatkannya di penggaris lurus, berhenti dan tanya: "Berapa sisa ruang kosong untuk sudut C?"',
      mariSalah: {
        klaimMimo: 'Kata Mimo: "Segitiga itu punya tiga sudut, berarti jumlahnya 360° dong! Jadi 360° − 50° − 100° = 210°!"',
        kesalahan: 'Mimo tertukar antara jumlah sudut segiempat (360°) dan jumlah sudut segitiga (180°).',
        perbaikan: 'Tiga sudut segitiga membentuk garis lurus setengah lingkaran = 180°.'
      },
      kegiatanKelas: 'Bagikan segitiga kertas ke tiap kelompok, sobek 3 sudutnya dan tempelkan bersebelahan di garis lurus.'
    },
    lokasiKota: 'Menara Sudut',
    stikerNama: 'Penjelajah 180°'
  }
];
