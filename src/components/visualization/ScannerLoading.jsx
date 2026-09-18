import React from 'react';
import { motion } from 'framer-motion';

export default function ScannerLoading() {
  return (
    <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-6 border border-border/40 bg-muted/5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="text-foreground font-semibold tracking-[0.2em]">MEMPROSES</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-4 bg-primary"
            />
          ))}
        </div>
      </div>
      <p className="mt-8 text-[10px] text-muted-foreground/50 text-center max-w-xs leading-relaxed">
        SISTEM SEDANG MENGEKSTRAKSI DAN MENGKLASIFIKASIKAN DATA MEDIS...
      </p>
    </div>
  );
}
