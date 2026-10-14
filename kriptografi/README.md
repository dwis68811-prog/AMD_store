# Fondasi Kriptografi — Komponen Hash Kata Sandi

## Deskripsi produk

Komponen ini merupakan bagian fondasi kriptografi untuk produk digital bersama berupa toko top-up game. Pengguna nantinya dapat membuat akun, memilih produk top-up, mengirim data tujuan top-up (misalnya ID pemain dan server), lalu membayar dan memeriksa status pesanan. Folder `web` dan `security` dapat mengintegrasikan komponen ini tanpa menyimpan kata sandi asli. Saat ini implementasi dalam folder ini berfokus pada pembuatan dan verifikasi hash kata sandi; alur toko, pembayaran, dan pemrosesan pesanan belum diimplementasikan.

Hash kata sandi bukan enkripsi: nilai asli tidak dapat dipulihkan dari hash. Jangan gunakan komponen ini untuk mengenkripsi data yang perlu dibaca kembali.

## Kebutuhan kriptografi

| Data | Tujuan keamanan | Prioritas |
|---|---|---|
| Kata sandi akun | Menjaga kerahasiaan kredensial ketika basis data bocor; hanya memverifikasi kecocokan tanpa menyimpan kata sandi asli | Sangat tinggi |
| Data tujuan top-up (ID pemain dan server) | Menjaga kerahasiaan data akun game dan keutuhan data agar top-up tidak terkirim ke tujuan yang salah | Tinggi |
| Pesanan dan status pembayaran | Menjaga keutuhan dan keaslian status pesanan agar konfirmasi pembayaran tidak dapat dipalsukan atau diubah | Sangat tinggi |

Komponen yang tersedia saat ini hanya menangani kebutuhan kata sandi. Perlindungan data tujuan top-up dan validasi keaslian/keutuhan konfirmasi pembayaran dicatat sebagai kebutuhan produk, tetapi belum diklaim telah diimplementasikan. Informasi pembayaran sensitif seperti nomor kartu atau PIN tidak boleh disimpan oleh toko; proses pembayaran sebaiknya ditangani penyedia pembayaran.

## Rancangan komponen

| Bagian | Rancangan |
|---|---|
| Masukan | String kata sandi dalam UTF-8; kosong atau lebih dari 1024 byte ditolak saat membuat hash |
| Proses | `node:crypto.scryptSync` (N=2^14, r=8, p=1, keluaran 32 byte) dengan salt unik 16 byte; perbandingan verifikasi memakai `timingSafeEqual` |
| Sumber keacakan | `node:crypto.randomBytes`, yang menggunakan sumber acak kriptografis sistem operasi |
| Keluaran | String `scrypt$<salt-hex>$<digest-hex>`; hanya string ini yang disimpan, bukan kata sandi asli |
| Verifikasi | Mengurai format hash, menghitung ulang scrypt, lalu membandingkan hasil secara konstan terhadap nilai rahasia |

Algoritma yang digunakan berasal dari modul kriptografi bawaan Node.js yang dipelihara. Parameter scrypt dibuat tetap agar format penyimpanan dan verifikasi konsisten pada versi komponen ini.

## Menjalankan

Persyaratan: Node.js 18 atau lebih baru. Tidak ada dependensi pihak ketiga.

Dari folder `kriptografi`:

```powershell
node --test test_passwords.js
```

Contoh penggunaan:

```javascript
const { hashPassword, verifyPassword } = require("./passwords");

const storedHash = hashPassword("kata-sandi-sintetis");
console.log(verifyPassword("kata-sandi-sintetis", storedHash)); // true
```

Jangan menaruh kata sandi asli, token, kunci, atau data pribadi di source code, log, atau repository. Contoh di atas menggunakan data sintetis.

## Cakupan uji

`test_passwords.js` mencakup verifikasi hash yang benar, penolakan kata sandi yang salah, salt berbeda untuk kata sandi yang sama, penolakan kata sandi kosong dan melebihi batas, hash rusak/tidak sesuai panjang, dan kata sandi Unicode.

## Tag pengumpulan

Tag `v0.1` perlu dibuat pada commit yang akan dikumpulkan setelah perubahan ditinjau dan diuji. Jangan memindahkan tag setelah tenggat.
