import React from 'react';
import { Globe, MessageCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer({ onHomeClick, onHistoryClick, onApiSettingsClick, onPrivacyClick, onTermsClick }) {
  return (
    <footer className="w-full border-t border-primary/20 bg-[#050505]/40 backdrop-blur-md mt-auto relative z-10">
      <div className="container px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-none bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-mono font-bold">M</span>
              </div>
              <h2 className="font-mono text-lg font-bold tracking-tight uppercase text-foreground">
                MediSift<span className="text-primary">.AI</span>
              </h2>
            </div>
            <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-sm">
              Sistem Analisis Obat berbasis AI dengan standar klinis. Membantu identifikasi risiko, klasifikasi legal, dan pencegahan interaksi obat.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground mb-4">Navigasi</h3>
            <ul className="space-y-3">
              <li><motion.button whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} onClick={onHomeClick} className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">Beranda</motion.button></li>
              <li><motion.button whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} onClick={onHistoryClick} className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">Riwayat</motion.button></li>
              <li><motion.button whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} onClick={onApiSettingsClick} className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">Pengaturan API</motion.button></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground mb-4">Kontak</h3>
            <div className="flex items-center gap-4">
              <motion.a title="Situs Web" whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.9 }} href="#" className="p-2 border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                <Globe className="w-4 h-4" />
              </motion.a>
              <motion.a title="Dukungan Chat" whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.9 }} href="#" className="p-2 border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                <MessageCircle className="w-4 h-4" />
              </motion.a>
              <motion.a title="Kirim Email" whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.9 }} href="#" className="p-2 border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                <Mail className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-muted-foreground">
            &copy; {new Date().getFullYear()} MediSift.AI. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <motion.button onClick={onPrivacyClick} whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }} className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">Kebijakan Privasi</motion.button>
            <motion.button onClick={onTermsClick} whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }} className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">Ketentuan Layanan</motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
