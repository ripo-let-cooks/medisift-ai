import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LegalModal({ type, onClose }) {
  if (!type) return null;
  
  const title = type === 'privacy' ? 'Kebijakan Privasi' : 'Ketentuan Layanan';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ x: '-100vw', opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-100vw', opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 22, stiffness: 250 }}
          className="bg-card border border-border/40 p-6 md:p-8 max-w-2xl w-full shadow-2xl flex flex-col max-h-[80vh]"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-mono text-sm text-muted-foreground leading-relaxed">
            {type === 'privacy' ? (
              <>
                <p>
                  <strong className="text-foreground">1. Pengumpulan Data</strong><br />
                  MediSift AI tidak menyimpan secara permanen gambar kemasan obat, kata kunci pencarian, atau hasil klasifikasi tanpa persetujuan eksplisit Anda. Log histori pencarian disimpan murni di perangkat Anda (local storage) demi privasi penuh.
                </p>
                <p>
                  <strong className="text-foreground">2. Penggunaan Pihak Ketiga</strong><br />
                  Kami menggunakan Google Gemini AI sebagai mesin analitik. Data teks dan gambar yang Anda masukkan akan diproses melalui peladen AI pihak ketiga. Harap pastikan untuk tidak mengunggah data medis pribadi atau resep dokter yang mengandung identitas pasien.
                </p>
                <p>
                  <strong className="text-foreground">3. Keamanan Data</strong><br />
                  Data API Key (kunci akses) Anda disimpan secara lokal di peramban web (browser) Anda dan tidak pernah dikirimkan ke server lain milik MediSift.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-foreground">1. Disclaimer Medis Mutlak</strong><br />
                  Platform ini hanya merupakan alat peraga *Explainable AI* yang menyajikan data farmasi secara prediktif. **Sistem ini BUKAN pengganti saran, diagnosis, atau penanganan medis dari dokter/apoteker profesional.** Segala risiko atas penggunaan data dari platform ini sepenuhnya menjadi tanggung jawab pengguna.
                </p>
                <p>
                  <strong className="text-foreground">2. Ketersediaan Layanan</strong><br />
                  MediSift.AI disediakan "sebagaimana adanya". Kami tidak menjamin ketersediaan akses tanpa batas atau keakuratan absolut dari model AI (mengingat sifat *generative AI* yang berpotensi menghasilkan halusinasi data).
                </p>
                <p>
                  <strong className="text-foreground">3. Pemutusan Akses</strong><br />
                  Jika Anda menggunakan kunci API Anda sendiri, batas kuota (Rate Limit) tunduk kepada aturan Google AI Studio, bukan MediSift.
                </p>
              </>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-border/40 flex justify-end">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onClose} className="rounded-none font-mono uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90">
                Saya Mengerti
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
