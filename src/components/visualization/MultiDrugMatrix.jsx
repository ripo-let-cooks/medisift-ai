import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MultiDrugMatrix({ data }) {
  if (!data || !data.interactions) return null;

  const { drugs_detected, interactions } = data;

  const getSeverityColor = (severity) => {
    const s = severity.toUpperCase();
    if (s.includes('CRITICAL') || s.includes('HIGH')) return 'bg-destructive/10 border-destructive text-destructive';
    if (s.includes('MEDIUM')) return 'bg-yellow-500/10 border-yellow-500 text-yellow-500';
    if (s.includes('LOW')) return 'bg-blue-500/10 border-blue-500 text-blue-500';
    return 'bg-primary/10 border-primary text-primary'; // Safe
  };

  const getSeverityIcon = (severity) => {
    const s = severity.toUpperCase();
    if (s.includes('CRITICAL') || s.includes('HIGH') || s.includes('MEDIUM') || s.includes('LOW')) {
      return <AlertTriangle className="w-5 h-5 shrink-0" />;
    }
    return <CheckCircle2 className="w-5 h-5 shrink-0" />;
  };

  return (
    <div className="w-full space-y-8">
      <div className="border-b border-border/40 pb-4">
        <h3 className="text-xl md:text-3xl font-bold tracking-tighter uppercase mb-2">Analisis Polypharmacy</h3>
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
          OBAT TERDETEKSI: {drugs_detected.join(' • ')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {interactions.map((interaction, idx) => {
          const isDanger = interaction.severity.toUpperCase().includes('CRITICAL') || interaction.severity.toUpperCase().includes('HIGH');
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`border p-5 flex flex-col md:flex-row md:items-start gap-4 ${getSeverityColor(interaction.severity)}`}
            >
              <div className="flex items-center gap-3 md:pt-1">
                {getSeverityIcon(interaction.severity)}
                <span className="font-mono font-bold uppercase tracking-widest text-sm whitespace-nowrap">
                  {isDanger ? '[CRITICAL CLASH]' : `[${interaction.severity.toUpperCase()}]`}
                </span>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2 font-bold text-foreground">
                  <span className="uppercase tracking-tight">{interaction.drug_a}</span>
                  <span className="text-muted-foreground">✕</span>
                  <span className="uppercase tracking-tight">{interaction.drug_b}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed font-sans max-w-[65ch]">
                  {interaction.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
