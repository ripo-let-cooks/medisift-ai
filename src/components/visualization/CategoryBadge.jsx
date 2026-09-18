import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function CategoryBadge({ classification }) {
  let colorClass = '';
  let Icon = HelpCircle;
  let label = classification || 'Unknown';

  const normalized = label.toLowerCase();
  
  if (normalized.includes('bebas terbatas')) {
    colorClass = 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20';
    Icon = CheckCircle2;
  } else if (normalized.includes('bebas')) {
    colorClass = 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20';
    Icon = CheckCircle2;
  } else if (normalized.includes('keras')) {
    colorClass = 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20';
    Icon = AlertTriangle;
  } else if (normalized.includes('suplemen')) {
    colorClass = 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20';
    Icon = CheckCircle2;
  } else {
    colorClass = 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-slate-500/20';
    Icon = AlertCircle;
  }

  return (
    <Badge variant="outline" className={`px-3 py-1 text-sm font-medium flex items-center gap-1.5 ${colorClass}`}>
      <Icon className="h-4 w-4" />
      {label}
    </Badge>
  );
}
