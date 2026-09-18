import React from 'react';
import { AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InteractionMatrix({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  const getSeverityStyles = (severity) => {
    const s = (severity || '').toLowerCase();
    if (s === 'high' || s === 'critical') return { bg: 'bg-[#E11D48]/10', text: 'text-[#E11D48]', border: 'border-[#E11D48]/20', Icon: AlertOctagon };
    if (s === 'medium') return { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]', border: 'border-[#F97316]/20', Icon: AlertTriangle };
    return { bg: 'bg-[#0D9488]/10', text: 'text-[#0D9488]', border: 'border-[#0D9488]/20', Icon: Info };
  };

  return (
    <div className="pt-2">
      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Matriks Interaksi (XAI)</h4>
      <div className="grid gap-3">
        {warnings.map((warn, idx) => {
          const { bg, text, border, Icon } = getSeverityStyles(warn.severity);
          return (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`p-4 border ${bg} ${border} flex gap-4 items-start`}
            >
              <Icon className={`h-5 w-5 ${text} shrink-0 mt-0.5`} />
              <div>
                <h4 className={`text-sm font-mono uppercase tracking-wider ${text}`}>{warn.substance}</h4>
                <p className={`text-sm mt-1 text-muted-foreground leading-relaxed`}>{warn.effect}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
