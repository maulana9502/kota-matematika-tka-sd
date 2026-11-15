export interface GuidedStepSlot {
  judul: string;
  arahan: string; // Petunjuk pemandu (TIDAK membocorkan jawaban)
  jawabanBenar: string; // Balok jawaban yang harus digeser siswa
  penjelasan: string; // Penjelasan yang baru terbuka setelah siswa berhasil menempatkan balok
}

export interface QuestionStepChallenge {
  steps: GuidedStepSlot[];
  pengecoh: string[]; // Balok pengecoh agar total pilihan lebih banyak dari jumlah step
}

export const STEP_CHALLENGES: Record<number, { latihan: QuestionStepChallenge; contoh: QuestionStepChallenge }> = {
  1: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Ubah 150% dan 1/2 menjadi bentuk desimal!', jawabanBenar: '1,5 dan 0,5', penjelasan: '150% = 150/100 = 1,5 dan 1/2 = 0,5.' },
        { judul: 'Langkah 2', arahan: 'Kerjakan bagian perkalian 3 × 0,25 lebih dulu!', jawabanBenar: '0,75', penjelasan: 'Perkalian didahulukan sebelum tambah & kurang: 3 × 0,25 = 0,75.' },
        { judul: 'Langkah 3', arahan: 'Hitung hasil akhir 1,5 − 2 + 0,75 + 0,5!', jawabanBenar: '0,75 = 3/4', penjelasan: '1,5 − 2 = −0,5; lalu −0,5 + 0,75 + 0,5 = 0,75 atau 3/4.' }
      ],
      pengecoh: ['15 dan 0,2', '0,50', '1,25 = 5/4', '0,25 = 1/4']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Ubah 100% dan 1/2 menjadi bentuk desimal!', jawabanBenar: '1 dan 0,5', penjelasan: '100% = 1 dan 1/2 = 0,5.' },
        { judul: 'Langkah 2', arahan: 'Kerjakan perkalian 2 × 0,5 lebih dulu!', jawabanBenar: '1', penjelasan: '2 × 0,5 = 1.' },
        { judul: 'Langkah 3', arahan: 'Hitung hasil akhir 1 − 1 + 1 + 0,5!', jawabanBenar: '1,5 = 3/2', penjelasan: '1 − 1 + 1 + 0,5 = 1,5 = 3/2.' }
      ],
      pengecoh: ['10 dan 0,2', '2,5', '0,5 = 1/2', '2']
    }
  },
  2: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung harga 1 buku gambar (1/2 × Rp20.000,00)!', jawabanBenar: 'Rp10.000,00', penjelasan: 'Setengah dari Rp20.000,00 adalah Rp10.000,00.' },
        { judul: 'Langkah 2', arahan: 'Hitung harga 1 buku tulis (0,75 × Rp20.000,00)!', jawabanBenar: 'Rp15.000,00', penjelasan: '0,75 (3/4) × Rp20.000,00 = Rp15.000,00.' },
        { judul: 'Langkah 3', arahan: 'Jumlahkan harga kedua buku sebelum diskon!', jawabanBenar: 'Rp25.000,00', penjelasan: 'Total awal = Rp10.000,00 + Rp15.000,00 = Rp25.000,00.' },
        { judul: 'Langkah 4', arahan: 'Potong diskon 20% (bayar 80% × Rp25.000,00)!', jawabanBenar: 'Rp20.000,00', penjelasan: 'Diskon 20% = Rp5.000,00, sehingga bayar Rp20.000,00.' }
      ],
      pengecoh: ['Rp5.000,00', 'Rp22.500,00', 'Rp30.000,00', 'Rp12.500,00']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung harga 1 penggaris (1/2 × Rp10.000,00)!', jawabanBenar: 'Rp5.000,00', penjelasan: '1/2 × Rp10.000,00 = Rp5.000,00.' },
        { judul: 'Langkah 2', arahan: 'Jumlahkan harga penggaris + pensil (Rp10.000,00)!', jawabanBenar: 'Rp15.000,00', penjelasan: 'Rp5.000,00 + Rp10.000,00 = Rp15.000,00.' },
        { judul: 'Langkah 3', arahan: 'Potong diskon 10% untuk harga bayar!', jawabanBenar: 'Rp13.500,00', penjelasan: 'Potongan 10% = Rp1.500,00 → Bayar Rp13.500,00.' }
      ],
      pengecoh: ['Rp2.500,00', 'Rp12.000,00', 'Rp18.000,00']
    }
  },
  3: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung total seluruh jus (6 wadah × 2 1/2 liter)!', jawabanBenar: '15 liter', penjelasan: '6 × 2,5 liter = 15 liter.' },
        { judul: 'Langkah 2', arahan: '10 botol kecil setara berapa botol besar?', jawabanBenar: '5 botol besar', penjelasan: 'Karena 1 botol kecil = 1/2 botol besar, maka 10 botol kecil = 5 botol besar.' },
        { judul: 'Langkah 3', arahan: 'Bagi 15 liter untuk total 30 satuan botol besar!', jawabanBenar: '1/2 liter per botol besar', penjelasan: '25 + 5 = 30 satuan botol besar → 15 ÷ 30 = 1/2 liter.' },
        { judul: 'Langkah 4', arahan: 'Hitung total jus dalam 10 botol kecil (@ 1/4 L)!', jawabanBenar: '2,5 liter (pernyataan C salah)', penjelasan: '10 × 1/4 = 2,5 liter, bukan 5 liter.' }
      ],
      pengecoh: ['12 liter', '10 botol besar', '5 liter', '1/4 liter per botol besar']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung total jus (4 wadah × 2 liter)!', jawabanBenar: '8 liter', penjelasan: '4 × 2 liter = 8 liter.' },
        { judul: 'Langkah 2', arahan: 'Setarakan 12 botol besar + 8 botol kecil ke botol besar!', jawabanBenar: '16 satuan botol besar', penjelasan: '8 botol kecil = 4 botol besar → 12 + 4 = 16.' },
        { judul: 'Langkah 3', arahan: 'Hitung isi 1 botol besar dan total 8 botol kecil!', jawabanBenar: '1/2 L besar · 2 L total kecil', penjelasan: '8 ÷ 16 = 1/2 L; botol kecil = 8 × 1/4 = 2 L.' }
      ],
      pengecoh: ['6 liter', '20 satuan botol besar', '4 L total kecil']
    }
  },
  4: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung luas bagian jagung (1/4 × 4,8 ha)!', jawabanBenar: '1,2 ha', penjelasan: '1/4 × 4,8 ha = 1,2 ha.' },
        { judul: 'Langkah 2', arahan: 'Hitung luas bagian kedelai (1/3 × 4,8 ha)!', jawabanBenar: '1,6 ha', penjelasan: '1/3 × 4,8 ha = 1,6 ha.' },
        { judul: 'Langkah 3', arahan: 'Hitung sisa luas lahan singkong!', jawabanBenar: '2,0 ha', penjelasan: '4,8 − 1,2 − 1,6 = 2,0 ha.' },
        { judul: 'Langkah 4', arahan: 'Jumlahkan luas kedelai + singkong!', jawabanBenar: '3,6 ha', penjelasan: '1,6 + 2,0 = 3,6 ha (atau langsung 4,8 − 1,2).' }
      ],
      pengecoh: ['0,8 ha', '2,4 ha', '2,8 ha', '4,0 ha']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung luas bagian jagung (1/2 × 6 ha)!', jawabanBenar: '3 ha', penjelasan: '1/2 × 6 ha = 3 ha.' },
        { judul: 'Langkah 2', arahan: 'Hitung luas bagian kedelai (1/3 × 6 ha)!', jawabanBenar: '2 ha', penjelasan: '1/3 × 6 ha = 2 ha.' },
        { judul: 'Langkah 3', arahan: 'Cari sisa singkong lalu jumlahkan kedelai + singkong!', jawabanBenar: '1 ha singkong → total 3,0 ha', penjelasan: 'Singkong = 6 − 3 − 2 = 1 ha → Kedelai + Singkong = 2 + 1 = 3,0 ha.' }
      ],
      pengecoh: ['1,5 ha', '4 ha', '5,0 ha']
    }
  },
  5: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Tentukan jenis hitungan untuk jadwal bertemu lagi (4, 6, 8)!', jawabanBenar: 'Cari KPK(4, 6, 8)', penjelasan: 'Jadwal berulang bertemu lagi menggunakan Kelipatan Persekutuan Terkecil (KPK).' },
        { judul: 'Langkah 2', arahan: 'Ubah 4, 6, 8 ke faktorisasi prima!', jawabanBenar: '2², 2×3, dan 2³', penjelasan: '4 = 2², 6 = 2 × 3, 8 = 2³.' },
        { judul: 'Langkah 3', arahan: 'Ambil pangkat terbesar semua faktor (2³ × 3)!', jawabanBenar: '24 hari', penjelasan: '8 × 3 = 24 hari.' }
      ],
      pengecoh: ['Cari FPB(4, 6, 8)', '12 hari', '48 hari', '18 hari']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Tuliskan faktor prima dari 2, 3, dan 4!', jawabanBenar: '2, 3, dan 2²', penjelasan: '2 = 2, 3 = 3, 4 = 2².' },
        { judul: 'Langkah 2', arahan: 'Hitung KPK(2, 3, 4) = 2² × 3!', jawabanBenar: '12 hari', penjelasan: '4 × 3 = 12 hari.' }
      ],
      pengecoh: ['6 hari', '8 hari', '24 hari']
    }
  },
  6: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Cari banyak potongan penuh 18 cm dari 250 cm (250 ÷ 18)!', jawabanBenar: '13 potong', penjelasan: '13 × 18 = 234 cm (jika 14 × 18 = 252 cm, melebihi kawat).' },
        { judul: 'Langkah 2', arahan: 'Hitung total panjang kawat yang terpakai (13 × 18 cm)!', jawabanBenar: '234 cm', penjelasan: '13 × 18 cm = 234 cm.' },
        { judul: 'Langkah 3', arahan: 'Hitung sisa kawat yang tidak terpakai (250 − 234)!', jawabanBenar: '16 cm', penjelasan: '250 cm − 234 cm = 16 cm.' }
      ],
      pengecoh: ['14 potong', '216 cm', '14 cm', '18 cm']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Cari banyak potongan penuh 15 cm dari 100 cm!', jawabanBenar: '6 potong', penjelasan: '6 × 15 = 90 cm.' },
        { judul: 'Langkah 2', arahan: 'Hitung sisa kawat (100 − 90)!', jawabanBenar: '10 cm', penjelasan: 'Sisa = 100 − 90 = 10 cm.' }
      ],
      pengecoh: ['7 potong', '5 cm', '15 cm']
    }
  },
  7: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Jumlahkan seluruh peserta (26 + 34 + 40)!', jawabanBenar: '100 siswa', penjelasan: '26 + 34 + 40 = 100 siswa.' },
        { judul: 'Langkah 2', arahan: 'Kalikan jumlah siswa dengan 3 buku per siswa!', jawabanBenar: '300 buku', penjelasan: '100 × 3 = 300 buku.' },
        { judul: 'Langkah 3', arahan: 'Bagi total buku dengan isi 1 dus (25 buku)!', jawabanBenar: '12 dus', penjelasan: '300 ÷ 25 = 12 dus.' }
      ],
      pengecoh: ['90 siswa', '250 buku', '10 dus', '15 dus']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Jumlahkan peserta Kelas A dan B (15 + 25)!', jawabanBenar: '40 siswa', penjelasan: '15 + 25 = 40 siswa.' },
        { judul: 'Langkah 2', arahan: 'Kalikan dengan 2 buku per siswa!', jawabanBenar: '80 buku', penjelasan: '40 × 2 = 80 buku.' },
        { judul: 'Langkah 3', arahan: 'Bagi dengan isi 1 dus (20 buku)!', jawabanBenar: '4 dus', penjelasan: '80 ÷ 20 = 4 dus.' }
      ],
      pengecoh: ['30 siswa', '60 buku', '3 dus', '5 dus']
    }
  },
  8: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Ubah 2 kg beras ke gram!', jawabanBenar: '2.000 gram', penjelasan: 'Turun 3 tangga (×1.000): 2 kg = 2.000 gram.' },
        { judul: 'Langkah 2', arahan: 'Hitung total berat 3 gula @ 4 hg dalam gram!', jawabanBenar: '1.200 gram', penjelasan: '4 hg = 400 g → 3 × 400 g = 1.200 gram.' },
        { judul: 'Langkah 3', arahan: 'Hitung total berat 6 mi instan @ 80 g!', jawabanBenar: '480 gram', penjelasan: '6 × 80 g = 480 gram (kurang dari 0,5 kg = 500 g).' },
        { judul: 'Langkah 4', arahan: 'Jumlahkan semua isi paket dalam gram!', jawabanBenar: '3.680 gram', penjelasan: '2.000 + 1.200 + 480 = 3.680 gram.' }
      ],
      pengecoh: ['200 gram', '120 gram', '520 gram', '2.560 gram']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Ubah 1 kg beras dan 2 gula @ 5 hg ke gram!', jawabanBenar: '1.000 g + 1.000 g', penjelasan: '1 kg = 1.000 g; 2 × 5 hg = 10 hg = 1.000 g.' },
        { judul: 'Langkah 2', arahan: 'Hitung berat 5 mi instan @ 100 g!', jawabanBenar: '500 gram', penjelasan: '5 × 100 g = 500 gram (tepat 0,5 kg).' },
        { judul: 'Langkah 3', arahan: 'Jumlahkan total berat seluruh paket!', jawabanBenar: '2.500 gram', penjelasan: '1.000 + 1.000 + 500 = 2.500 gram.' }
      ],
      pengecoh: ['100 gram', '2.000 gram', '3.000 gram']
    }
  },
  9: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung waktu berkendara (Jarak 150 km ÷ Kecepatan 60 km/jam)!', jawabanBenar: '2 jam 30 menit', penjelasan: '150 ÷ 60 = 2,5 jam = 2 jam 30 menit.' },
        { judul: 'Langkah 2', arahan: 'Tambahkan waktu istirahat 30 menit!', jawabanBenar: '3 jam total', penjelasan: '2 jam 30 menit + 30 menit = 3 jam.' },
        { judul: 'Langkah 3', arahan: 'Tambahkan ke jam berangkat 07.30!', jawabanBenar: 'Pukul 10.30', penjelasan: '07.30 + 3 jam = 10.30.' }
      ],
      pengecoh: ['2 jam 50 menit', '2 jam', 'Pukul 10.00', 'Pukul 11.00']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung waktu berkendara (100 km ÷ 50 km/jam)!', jawabanBenar: '2 jam', penjelasan: '100 ÷ 50 = 2 jam.' },
        { judul: 'Langkah 2', arahan: 'Tambahkan istirahat 30 menit ke jam berangkat 08.00!', jawabanBenar: 'Pukul 10.30', penjelasan: '08.00 + 2 jam 30 menit = 10.30.' }
      ],
      pengecoh: ['1 jam 30 menit', 'Pukul 10.00', 'Pukul 11.00']
    }
  },
  10: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Berangkat pukul 06.50 + perjalanan 40 menit menjadi pukul…', jawabanBenar: '07.30', penjelasan: '06.50 + 10 menit = 07.00, sisa 30 menit → 07.30.' },
        { judul: 'Langkah 2', arahan: 'Dari 07.30 + latihan 1 jam 45 menit menjadi pukul…', jawabanBenar: '09.15', penjelasan: '07.30 + 1 jam = 08.30; + 45 menit = 09.15.' },
        { judul: 'Langkah 3', arahan: 'Dari 09.15 + istirahat 25 menit menjadi pukul…', jawabanBenar: '09.40', penjelasan: '09.15 + 25 menit = 09.40.' }
      ],
      pengecoh: ['07.20', '09.05', '09.30', '09.50']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Berangkat 07.00 + perjalanan 20 menit menjadi…', jawabanBenar: '07.20', penjelasan: '07.00 + 20 menit = 07.20.' },
        { judul: 'Langkah 2', arahan: 'Tambah latihan 1 jam + istirahat 10 menit!', jawabanBenar: '08.30', penjelasan: '07.20 + 1 jam 10 menit = 08.30.' }
      ],
      pengecoh: ['07.30', '08.20', '08.40']
    }
  },
  11: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung volume kotak a (6 × 4 × 3)!', jawabanBenar: 'Kotak A: 72 cm³ (Pas)', penjelasan: '6 × 4 × 3 = 72 kubus satuan.' },
        { judul: 'Langkah 2', arahan: 'Hitung volume kotak b (8 × 3 × 3)!', jawabanBenar: 'Kotak B: 72 cm³ (Pas)', penjelasan: '8 × 3 × 3 = 72 kubus satuan.' },
        { judul: 'Langkah 3', arahan: 'Hitung volume kotak c (6 × 4 × 4)!', jawabanBenar: 'Kotak C: 96 cm³ (Kelebihan)', penjelasan: '6 × 4 × 4 = 96 kubus satuan (bukan 72).' }
      ],
      pengecoh: ['Kotak A: 64 cm³ (Kurang)', 'Kotak B: 48 cm³ (Kurang)', 'Kotak B: 84 cm³ (Kelebihan)', 'Kotak C: 108 cm³ (Kelebihan)']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung volume kotak a (4×3×2) dan b (6×2×2)!', jawabanBenar: 'Keduanya 24 kubus (Pas)', penjelasan: '4×3×2 = 24 dan 6×2×2 = 24.' },
        { judul: 'Langkah 2', arahan: 'Hitung volume kotak c (4×3×3)!', jawabanBenar: '36 kubus (Kelebihan)', penjelasan: '4×3×3 = 36, melebihi target 24.' }
      ],
      pengecoh: ['18 kubus', '28 kubus', '48 kubus']
    }
  },
  12: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Cari panjang rusuk kubus yang volumenya 27 m³!', jawabanBenar: '3 m', penjelasan: '3 × 3 × 3 = 27 m³, jadi rusuk = 3 m.' },
        { judul: 'Langkah 2', arahan: 'Tentukan p (2× rusuk), l (1/3× rusuk), t (tetap) balok baru!', jawabanBenar: 'p = 6 m, l = 1 m, t = 3 m', penjelasan: 'p = 2×3 = 6 m; l = 1/3×3 = 1 m; t = 3 m.' },
        { judul: 'Langkah 3', arahan: 'Hitung volume balok baru (p × l × t)!', jawabanBenar: '18 m³', penjelasan: '6 × 1 × 3 = 18 m³.' }
      ],
      pengecoh: ['9 m', 'p = 6 m, l = 2 m, t = 3 m', '9 m³', '36 m³']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Cari panjang rusuk kubus bervolume 8 m³!', jawabanBenar: '2 m', penjelasan: '2 × 2 × 2 = 8 m³.' },
        { judul: 'Langkah 2', arahan: 'Hitung ukuran balok baru (p=3×2, l=1/2×2, t=2)!', jawabanBenar: 'p = 6 m, l = 1 m, t = 2 m', penjelasan: 'p = 6 m, l = 1 m, t = 2 m.' },
        { judul: 'Langkah 3', arahan: 'Hitung volume balok baru!', jawabanBenar: '12 m³', penjelasan: '6 × 1 × 2 = 12 m³.' }
      ],
      pengecoh: ['4 m', '16 m³', '24 m³']
    }
  },
  13: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Saring syarat (1): Punya 2 pasang sisi sejajar. Bangun mana yang gugur?', jawabanBenar: 'Trapesium gugur', penjelasan: 'Trapesium hanya punya sepasang sisi sejajar.' },
        { judul: 'Langkah 2', arahan: 'Saring syarat (2): Sisi berdekatan TIDAK sama panjang. Siapa yang gugur?', jawabanBenar: 'Persegi gugur', penjelasan: 'Pada persegi, semua sisi yang berdekatan sama panjang.' },
        { judul: 'Langkah 3', arahan: 'Saring syarat (3): Keempat sudut siku-siku (90°). Bangun apa tersisa?', jawabanBenar: 'Persegi panjang', penjelasan: 'Jajargenjang umum tidak siku-siku, sehingga tersisa Persegi panjang!' }
      ],
      pengecoh: ['Persegi panjang gugur', 'Jajargenjang lolos', 'Belah ketupat', 'Trapesium lolos']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Saring syarat (1): Keempat sisi sama panjang!', jawabanBenar: 'Persegi panjang & Trapesium gugur', penjelasan: 'Hanya persegi dan belah ketupat yang keempat sisinya sama panjang.' },
        { judul: 'Langkah 2', arahan: 'Saring syarat (2): Keempat sudut siku-siku!', jawabanBenar: 'Persegi', penjelasan: 'Belah ketupat umum tidak siku-siku → tersisa Persegi!' }
      ],
      pengecoh: ['Belah ketupat', 'Trapesium', 'Jajargenjang']
    }
  },
  14: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Cek nilai terbanyak pada tabel (30, 45, 25, 45, 35)!', jawabanBenar: '45 (Selasa & Kamis)', penjelasan: 'Pernyataan A benar.' },
        { judul: 'Langkah 2', arahan: 'Hitung selisih pengunjung Selasa dan Rabu (45 − 25)!', jawabanBenar: '20 orang (B salah)', penjelasan: 'Selisihnya 20 orang, bukan 15 orang.' },
        { judul: 'Langkah 3', arahan: 'Jumlahkan seluruh data (30+45+25+45+35)!', jawabanBenar: '180 orang', penjelasan: 'Total selama 5 hari adalah 180 orang.' },
        { judul: 'Langkah 4', arahan: 'Hitung rata-rata per hari (180 ÷ 5)!', jawabanBenar: '36 orang (C benar)', penjelasan: 'Rata-rata = 180 ÷ 5 = 36 orang.' }
      ],
      pengecoh: ['15 orang', '160 orang', '35 orang', '40 orang']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Cek nilai terbanyak & selisih Selasa–Rabu (20 − 15)!', jawabanBenar: 'Max 20 · Selisih 5', penjelasan: 'Terbanyak 20 (Selasa/Kamis); selisih 20−15 = 5.' },
        { judul: 'Langkah 2', arahan: 'Jumlahkan semua data (10+20+15+20+15) lalu bagi 5!', jawabanBenar: '80 ÷ 5 = 16 orang', penjelasan: 'Total 80 ÷ 5 = 16 orang.' }
      ],
      pengecoh: ['Selisih 10', '80 ÷ 5 = 18 orang', 'Max 25']
    }
  },
  15: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Kurangkan total berat 4 kg dengan berat seluruh apel 1,3 kg!', jawabanBenar: '2,7 kg', penjelasan: 'Berat 9 jeruk = 4 − 1,3 = 2,7 kg.' },
        { judul: 'Langkah 2', arahan: 'Bagi berat jeruk 2,7 kg secara rata ke 9 buah jeruk!', jawabanBenar: '0,3 kg', penjelasan: '2,7 ÷ 9 = 0,3 kg tiap jeruk.' }
      ],
      pengecoh: ['3,7 kg', '1,7 kg', '0,25 kg', '0,4 kg']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Kurangkan total 2 kg dengan berat seluruh apel 1 kg!', jawabanBenar: '1 kg', penjelasan: 'Berat 4 jeruk = 2 − 1 = 1 kg.' },
        { judul: 'Langkah 2', arahan: 'Bagi sisa 1 kg dengan 4 jeruk!', jawabanBenar: '0,25 kg', penjelasan: '1 ÷ 4 = 0,25 kg.' }
      ],
      pengecoh: ['0,5 kg', '0,2 kg', '1,5 kg']
    }
  },
  16: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung jarak target 5/8 dari 12 km!', jawabanBenar: '7,5 km', penjelasan: '(5 × 12) ÷ 8 = 60 ÷ 8 = 7,5 km.' },
        { judul: 'Langkah 2', arahan: 'Hitung jarak Ani (0,75×12), Budi (50%×12), Cici (2/3×12)!', jawabanBenar: 'Ani 9 km, Budi 6 km, Cici 8 km', penjelasan: 'Ketiganya belum pas 7,5 km.' },
        { judul: 'Langkah 3', arahan: 'Siapa yang tepat menempuh 7,5 km?', jawabanBenar: 'Dedi', penjelasan: 'Dedi menempuh 7,5 km = 5/8 target!' }
      ],
      pengecoh: ['6,5 km', '8,5 km', 'Ani 8 km, Budi 5 km, Cici 9 km', 'Cici']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung jarak target 1/2 dari 10 km!', jawabanBenar: '5 km', penjelasan: '1/2 × 10 = 5 km.' },
        { judul: 'Langkah 2', arahan: 'Siapa yang jaraknya tepat 5 km?', jawabanBenar: 'Dedi (5 km)', penjelasan: 'Ani 8 km, Budi 3 km, Cici 4 km, Dedi 5 km.' }
      ],
      pengecoh: ['4 km', 'Ani (8 km)', 'Cici (4 km)']
    }
  },
  17: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Ubah volume tangki 1,2 hl ke liter (turun 2 tangga = ×100)!', jawabanBenar: '120 liter', penjelasan: '1,2 × 100 = 120 liter.' },
        { judul: 'Langkah 2', arahan: 'Hitung berapa ember 15 liter yang dapat diisi penuh (120 ÷ 15)!', jawabanBenar: '8 ember penuh', penjelasan: '120 ÷ 15 = 8 ember (tidak cukup untuk 9 ember).' },
        { judul: 'Langkah 3', arahan: 'Hitung sisa air setelah 5 ember dipakai (120 − 5×15)!', jawabanBenar: '45 liter', penjelasan: '120 − 75 = 45 liter.' }
      ],
      pengecoh: ['12 liter', '9 ember penuh', '35 liter', '55 liter']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Ubah 0,6 hl ke liter (×100)!', jawabanBenar: '60 liter', penjelasan: '0,6 × 100 = 60 liter.' },
        { judul: 'Langkah 2', arahan: 'Hitung banyak ember 10 L dan sisa setelah 2 ember dipakai!', jawabanBenar: '6 ember · sisa 40 liter', penjelasan: '60 ÷ 10 = 6 ember; 60 − 20 = 40 liter.' }
      ],
      pengecoh: ['6 liter', '7 ember · sisa 30 liter', '5 ember · sisa 50 liter']
    }
  },
  18: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Jumlahkan semua angka pada 6 sisi dadu (1+2+3+4+5+6)!', jawabanBenar: '21 titik', penjelasan: '1 + 2 + 3 + 4 + 5 + 6 = 21 titik.' },
        { judul: 'Langkah 2', arahan: 'Bagi 21 titik untuk 3 pasang sisi yang berlawanan!', jawabanBenar: '7 titik per pasang', penjelasan: '21 ÷ 3 = 7 titik.' },
        { judul: 'Langkah 3', arahan: 'Jika sisi atas = 5, berapa angka pada sisi bawah (7 − 5)?', jawabanBenar: '2 titik', penjelasan: '7 − 5 = 2 titik.' }
      ],
      pengecoh: ['18 titik', '6 titik per pasang', '1 titik', '3 titik']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Berapa jumlah setiap 2 sisi dadu yang berlawanan?', jawabanBenar: '7 titik', penjelasan: '21 ÷ 3 pasang = 7.' },
        { judul: 'Langkah 2', arahan: 'Jika sisi atas = 6, berapa sisi bawah (7 − 6)?', jawabanBenar: '1 titik', penjelasan: '7 − 6 = 1 titik.' }
      ],
      pengecoh: ['6 titik', '2 titik', '3 titik']
    }
  },
  19: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Jumlahkan potong cokelat (6) + potong kuning (4) dari 16 potong!', jawabanBenar: '10/16', penjelasan: '6 + 4 = 10 dari 16 bagian = 10/16.' },
        { judul: 'Langkah 2', arahan: 'Sederhanakan pecahan 10/16 (bagi pembilang & penyebut dengan 2)!', jawabanBenar: '5/8', penjelasan: '(10 ÷ 2) / (16 ÷ 2) = 5/8.' }
      ],
      pengecoh: ['8/16', '1/2', '3/4', '7/8']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Jumlahkan potong cokelat (2) + kuning (2) dari 8 potong!', jawabanBenar: '4/8', penjelasan: '2 + 2 = 4 dari 8 bagian = 4/8.' },
        { judul: 'Langkah 2', arahan: 'Sederhanakan 4/8 menjadi bentuk paling sederhana!', jawabanBenar: '1/2', penjelasan: '4/8 dibagi 4 menjadi 1/2.' }
      ],
      pengecoh: ['1/4', '3/8', '3/4']
    }
  },
  20: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Geser lekukan mendatar kolam 5 m ke atas: hitung panjang sisi mendatar atas total (15 m + 5 m)!', jawabanBenar: '20 m', penjelasan: '15 m + 5 m = 20 m (sama panjang dengan sisi bawah).' },
        { judul: 'Langkah 2', arahan: 'Geser lekukan tegak kolam 5 m ke kanan: hitung panjang sisi tegak kanan total (7 m + 5 m)!', jawabanBenar: '12 m', penjelasan: '7 m + 5 m = 12 m (sama panjang dengan sisi kiri).' },
        { judul: 'Langkah 3', arahan: 'Hitung total keliling tanah berbentuk L = 2 × (p + l)!', jawabanBenar: '64 m', penjelasan: 'Keliling tetap 2 × (20 + 12) = 64 m!' }
      ],
      pengecoh: ['15 m', '10 m', '54 m', '74 m', '84 m']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung sisi mendatar atas setelah digeser (8 m + 2 m)!', jawabanBenar: '10 m', penjelasan: '8 m + 2 m = 10 m.' },
        { judul: 'Langkah 2', arahan: 'Hitung sisi tegak kanan setelah digeser (4 m + 2 m)!', jawabanBenar: '6 m', penjelasan: '4 m + 2 m = 6 m.' },
        { judul: 'Langkah 3', arahan: 'Hitung total keliling tanah = 2 × (10 + 6)!', jawabanBenar: '32 m', penjelasan: '2 × 16 = 32 m.' }
      ],
      pengecoh: ['8 m', '24 m', '36 m', '40 m']
    }
  },
  21: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung luas lahan parkir berbentuk persegi panjang (9 m × 4 m)!', jawabanBenar: '36 m²', penjelasan: '9 × 4 = 36 m² (jadi pernyataan A 32 m² salah).' },
        { judul: 'Langkah 2', arahan: 'Bagi luas lahan dengan luas 1 motor (36 ÷ 1,5)!', jawabanBenar: '24 motor', penjelasan: '36 ÷ 1,5 = 72 ÷ 3 = 24 motor.' },
        { judul: 'Langkah 3', arahan: 'Kurangkan kapasitas total dengan 15 motor yang sudah parkir!', jawabanBenar: '9 motor lagi', penjelasan: '24 − 15 = 9 motor lagi.' }
      ],
      pengecoh: ['32 m²', '20 motor', '12 motor lagi', '6 motor lagi']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung luas lahan parkir (5 m × 4 m)!', jawabanBenar: '20 m²', penjelasan: '5 × 4 = 20 m² (pernyataan A 18 m² salah).' },
        { judul: 'Langkah 2', arahan: 'Hitung kapasitas total (÷ 2 m²) lalu kurangi 6 motor!', jawabanBenar: '10 motor · sisa 4 motor', penjelasan: '20 ÷ 2 = 10 motor; 10 − 6 = 4 motor.' }
      ],
      pengecoh: ['18 m²', '8 motor · sisa 2 motor', '12 motor · sisa 6 motor']
    }
  },
  22: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung buku yang dibaca Rina (5 ■ × 4 buku)!', jawabanBenar: '20 buku', penjelasan: '5 × 4 = 20 buku.' },
        { judul: 'Langkah 2', arahan: 'Hitung buku Dika (3 ■ × 4) dan Siti (6 ■ × 4)!', jawabanBenar: 'Dika 12 · Siti 24', penjelasan: 'Dika 12 buku; Siti 24 buku (2× lipat Dika).' },
        { judul: 'Langkah 3', arahan: 'Jumlahkan buku ketiga anak (20 + 12 + 24)!', jawabanBenar: '56 buku', penjelasan: '20 + 12 + 24 = 56 buku (pernyataan B 52 salah).' }
      ],
      pengecoh: ['16 buku', 'Dika 8 · Siti 20', '52 buku', '48 buku']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung buku tiap anak jika 1 ■ = 2 buku (Ani 3, Budi 2, Cici 4)!', jawabanBenar: 'Ani 6, Budi 4, Cici 8', penjelasan: '3×2 = 6; 2×2 = 4; 4×2 = 8.' },
        { judul: 'Langkah 2', arahan: 'Jumlahkan semua buku ketiga anak!', jawabanBenar: '18 buku', penjelasan: '6 + 4 + 8 = 18 buku (bukan 20).' }
      ],
      pengecoh: ['Ani 3, Budi 2, Cici 4', '20 buku', '16 buku']
    }
  },
  23: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung sisa halaman setelah Senin (200 − 50)!', jawabanBenar: '150 halaman', penjelasan: '200 − 50 = 150 halaman.' },
        { judul: 'Langkah 2', arahan: 'Hitung halaman Selasa = 1/3 dari sisa halaman (1/3 × 150)!', jawabanBenar: '50 halaman', penjelasan: '1/3 × 150 = 50 halaman.' },
        { judul: 'Langkah 3', arahan: 'Jumlahkan Senin + Selasa (50+50) lalu ubah ke persen dari 200!', jawabanBenar: '50%', penjelasan: '100 dari 200 halaman = 100/200 = 50%.' }
      ],
      pengecoh: ['100 halaman sisa', '66 halaman', '25%', '75%']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung sisa halaman setelah Senin (100 − 20)!', jawabanBenar: '80 halaman', penjelasan: '100 − 20 = 80 halaman.' },
        { judul: 'Langkah 2', arahan: 'Hitung bacaan Selasa (1/4 × 80) lalu cari % total dari 100!', jawabanBenar: '20 hal → Total 40%', penjelasan: '(20 + 20) / 100 = 40%.' }
      ],
      pengecoh: ['60 halaman', '25 hal → Total 45%', '20%']
    }
  },
  24: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Tulis faktorisasi prima dari 48 dan 36!', jawabanBenar: '48 = 2⁴×3 dan 36 = 2²×3²', penjelasan: '48 = 16 × 3 = 2⁴ × 3; 36 = 4 × 9 = 2² × 3².' },
        { judul: 'Langkah 2', arahan: 'Hitung FPB(48, 36) dengan pangkat terkecil dari faktor yang sama!', jawabanBenar: '12 kantong', penjelasan: '2² × 3 = 4 × 3 = 12 kantong (isi 4 permen & 3 cokelat).' }
      ],
      pengecoh: ['48 = 2³×6 dan 36 = 2×18', '6 kantong', '18 kantong', '9 kantong']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Cari semua bilangan pembagi bersama dari 12 dan 18!', jawabanBenar: '1, 2, 3, dan 6', penjelasan: '12 dan 18 sama-sama habis dibagi 1, 2, 3, dan 6.' },
        { judul: 'Langkah 2', arahan: 'Pilih pembagi terbesar (FPB) untuk banyak kantong!', jawabanBenar: '6 kantong', penjelasan: 'FPB(12, 18) = 6 kantong.' }
      ],
      pengecoh: ['1, 2, 4, dan 8', '4 kantong', '12 kantong']
    }
  },
  25: {
    latihan: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung besar sudut B (2 × sudut A = 2 × 50°)!', jawabanBenar: '100°', penjelasan: 'Sudut B = 2 × 50° = 100°.' },
        { judul: 'Langkah 2', arahan: 'Berapa jumlah ketiga sudut pada setiap segitiga?', jawabanBenar: '180°', penjelasan: 'Tiga sudut segitiga selalu membentuk garis lurus 180°.' },
        { judul: 'Langkah 3', arahan: 'Hitung besar sudut C = 180° − (50° + 100°)!', jawabanBenar: '30°', penjelasan: '180° − 150° = 30°.' }
      ],
      pengecoh: ['75°', '360°', '20°', '40°', '80°']
    },
    contoh: {
      steps: [
        { judul: 'Langkah 1', arahan: 'Hitung besar sudut B (2 × 40°)!', jawabanBenar: '80°', penjelasan: '2 × 40° = 80°.' },
        { judul: 'Langkah 2', arahan: 'Hitung besar sudut C = 180° − (40° + 80°)!', jawabanBenar: '60°', penjelasan: '180° − 120° = 60°.' }
      ],
      pengecoh: ['60° dan 80°', '40°', '100°']
    }
  }
};
