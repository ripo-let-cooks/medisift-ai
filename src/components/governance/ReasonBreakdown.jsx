import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReasonBreakdown({ reasoning, confidence }) {
  if (!reasoning) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-2"
    >
      <div className="flex flex-row items-center justify-between mb-4">
        <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <BrainCircuit className="h-4 w-4" />
          Alasan Klasifikasi (XAI)
        </h4>
        {confidence && (
          <span className="text-xs font-mono text-muted-foreground border border-border/40 px-2 py-0.5 bg-muted/10">
            AKURASI: {Math.round(confidence * 100)}%
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-foreground font-sans pl-6 border-l-2 border-border/40">
        {reasoning}
      </p>
    </motion.div>
  );
}
