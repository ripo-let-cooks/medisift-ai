# Design System & Specification: MediSift AI

**Versi:** 2.0 (Clinical Intelligence & Explainable AI)  
**Status:** Implemented & Production Ready  
**Pembaruan Terakhir:** 18 September 2026  

---

## 1. Konsep Visual & Filosofi Desain (Visual Theme & Atmosphere)
MediSift AI mengusung konsep **"Clinical Intelligence Terminal"**—sebuah antarmuka medis modern kelas laboratorium berteknologi tinggi yang memadukan estetika *Declassified Biotech Terminal* dengan kejelasan data farmasi yang mudah dipahami orang awam.

Prinsip Utama:
- **Trust-First & Explainable:** Menghindari jargon ilmiah yang rumit pada tingkat pembacaan pertama, mengedepankan visualisasi risiko yang tegas dan transparan.
- **Anti-Slop Aesthetics:** Menolak tampilan AI generik (tidak ada gradien ungu neon, tidak ada teks hiasan template, tidak ada bento box kosong).
- **Responsive Fluid Transition:** Hero section adaptif yang megah di tengah layar saat awal (idle), dan bertransisi secara halus (*spring physics*) menjadi panel atas yang ringkas saat hasil analisis muncul.

---

## 2. Palet Warna Klinis (Color Palette)

| Token Warna | Nilai Heksadesimal / Tailwind | Penggunaan & Peran |
| :--- | :--- | :--- |
| **Onyx Canvas** | `#050505` s.d. `#09090B` (Zinc-950) | Latar belakang dasar aplikasi gelap berwibawa, bebas dari silau layar. |
| **Charcoal Surface** | `#111111` s.d. `#18181B` (Zinc-900) | Kartu data elevated, input pencarian, kontainer hasil analisis. |
| **Clinical Teal (Aksen)**| `#0D9488` / `#00ff9d` | Aksen primer untuk tombol CTA, cincin fokus, status aman, dan brand header. |
| **Critical Crimson** | `#E11D48` / `#EF4444` | Indikator bahaya fatal, toksisitas, dan peringatan benturan obat kritis. |
| **Warning Amber** | `#F97316` / `#EAB308` | Tingkat risiko sedang hingga tinggi dan interaksi obat moderat. |
| **Clinical Blue** | `#3B82F6` | Kategori Obat Bebas Terbatas & petunjuk dosis standar. |
| **Titanium Text** | `#FAFAFA` (Foreground) | Judul obat, angka metrik utama, dan teks data klinis. |
| **Muted Steel** | `#A1A1AA` (Muted Foreground) | Subteks farmakologis, disclaimer hukum, dan metadata waktu. |
| **Whisper Border** | `rgba(255,255,255,0.1)` | Garis batas tipis 1px penegas grid tanpa mengganggu keterbacaan. |

---

## 3. Tipografi & Hirarki Teks
- **Display & Heading:** `Outfit` / `Geist Sans` — Bobot tebal (*bold*), *track-tight*, proporsional untuk nama obat dan judul utama.
- **Body Content:** `Geist Sans` / `Inter` — Keterbacaan tinggi dengan *line-height* longgar untuk penjelasan efek samping dan saran medis.
- **Data & Numeric Metrik:** `Geist Mono` / Monospace — Digunakan wajib pada nilai dosis (mg/ml), persentase akurasi, waktu riwayat, dan kode sistem.
- **Gaya Bahasa:** Mengutamakan istilah awam sehari-hari (misal: "Diminum" bukan "Oral", "Dioles" bukan "Topikal", "Obat Bebas" bukan "OTC").

---

## 4. Komponen Antarmuka yang Telah Dikerjakan

### A. Dynamic Adaptive Hero & InputForm
- **Mode Ganda:** Toggle instan antara mode **Tunggal** (Nama Obat atau Keluhan Gejala) dan mode **Multi-Obat** (Polifarmasi).
- **OCR Visual Scanner:** Pemindai kemasan obat langsung dari kamera atau berkas gambar dengan kompresi otomatis di sisi browser (JPEG 0.7 kualitas, maks 1024px) untuk efisiensi transfer data.
- **Transisi Layout Dinamis:** Saat belum ada hasil, form berada tepat di tengah halaman. Saat hasil dimuat, form menyusut rapi ke bagian atas tanpa reload halaman.

### B. Visualisasi Data Medis (Explainable AI Widgets)
1. **RiskGauge (Tingkat Risiko Klinis):**
   - Setengah lingkaran speedometer presisi (Recharts Pie) yang membagi level risiko menjadi 4 zona: *Rendah (Teal)*, *Sedang (Kuning)*, *Tinggi (Oranye)*, *Bahaya (Merah)*.
2. **DoseBarChart (Spektrum Dosis Toleransi):**
   - Diagram batang toleransi dosis bertingkat (Dosis Minimal, Anjuran Standar, Batas Maksimal, Ambang Toksisitas) dengan pewarnaan dinamis dan tooltip interaktif.
3. **CategoryBadge (Legalitas Medis):**
   - Badge visual sesuai regulasi BPOM: Obat Bebas (Hijau), Obat Bebas Terbatas (Biru), Obat Keras (Merah), Suplemen (Kuning).
4. **InteractionMatrix & MultiDrugMatrix (Uji Benturan Obat):**
   - Matriks pasangan antar bahan obat dengan kode tingkat keparahan (*[SAFE]*, *[MEDIUM]*, *[CRITICAL CLASH]*).
5. **ReasonBreakdown (Kotak Transparansi AI):**
   - Penjelasan rasionalitas medis di balik skor keyakinan (*confidence score*) algoritma.

### C. Navigasi & Latar Belakang
- **Floating Header:** Bilah navigasi melayang (*pill-shaped* kaca dengan efek *backdrop-blur*) yang menyediakan akses cepat ke Histori, Panduan Medis, dan Pengaturan Kunci Cadangan.
- **Floating Ambient Background:** Partikel ikon medis halus melayang di latar belakang dengan animasi float santai yang tidak membebani GPU/CPU.
- **ScannerLoading Effect:** Animasi pemindaian holografik saat AI sedang menganalisa data.
- **Print / PDF Export Ready:** Tombol cetak langsung mengekspor hasil analisa ke format PDF medis rapi, menyembunyikan header/input form saat dicetak (`@media print`).

---

## 5. Standar Responsivitas & Aksesibilitas
- **Mobile-First:** Seluruh komponen runtuh secara ergonomis menjadi 1 kolom vertikal di layar ponsel (< 768px).
- **Viewport Safe (`100dvh`):** Mencegah terpotongnya konten oleh *address bar* peramban seluler (Chrome Android & Safari iOS).
- **Kontras WCAG AA:** Rasio kontras teks berbanding latar belakang minimal 4.5 : 1 di semua komponen data.
