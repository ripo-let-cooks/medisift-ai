import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

function getStageColor(stageName, index, total) {
  const s = (stageName || '').toLowerCase();

  // 1. Kritis / Ambang Keracunan / Toksisitas / Bahaya / Fatal -> MERAH (Critical Crimson #E11D48)
  if (
    s.includes('keracunan') ||
    s.includes('racun') ||
    s.includes('toksisitas') ||
    s.includes('toksik') ||
    s.includes('toxic') ||
    s.includes('bahaya') ||
    s.includes('kritis') ||
    s.includes('overdosis') ||
    s.includes('fatal') ||
    s.includes('lethal')
  ) {
    return '#E11D48';
  }

  // 2. Batas Maksimal / Limit Harian -> ORANGE (#F97316)
  if (
    s.includes('maksimal') ||
    s.includes('maksimum') ||
    s.includes('max') ||
    s.includes('harian') ||
    s.includes('tinggi') ||
    s.includes('limit') ||
    s.includes('plafon')
  ) {
    return '#F97316';
  }

  // 3. Anjuran Standar / Sedang / Normal -> KUNING / AMBER (#EAB308)
  if (
    s.includes('anjuran') ||
    s.includes('standar') ||
    s.includes('sedang') ||
    s.includes('rekomendasi') ||
    s.includes('normal')
  ) {
    return '#EAB308';
  }

  // 4. Dosis Sekali Minum / Dosis Minimal / Awal -> TEAL (#0D9488)
  if (
    s.includes('sekali') ||
    s.includes('minimal') ||
    s.includes('minimum') ||
    s.includes('awal') ||
    s.includes('terapeutik') ||
    s.includes('rendah') ||
    s.includes('aman')
  ) {
    return '#0D9488';
  }

  // 5. Fallback Posisi: Jika ada 3 atau lebih batang:
  if (total >= 3) {
    if (index === total - 1) return '#E11D48'; // Batang tertinggi/terakhir pasti ambang bahaya
    if (index === total - 2) return '#F97316'; // Batang sebelum terakhir batas maksimal
    if (index === 0) return '#0D9488'; // Batang pertama dosis awal/aman
    return '#EAB308'; // Batang tengah
  }

  return '#0D9488';
}

export default function DoseBarChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="border-t border-border/40 pt-4">
      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">Spektrum Dosis Toleransi</h4>
      <div className="h-[380px] w-full mt-4 pb-4 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 40, bottom: 90 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis 
              dataKey="stage" 
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={120}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontFamily: 'monospace', dy: 10 }}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
              contentStyle={{ borderRadius: '0px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', fontFamily: 'monospace', fontSize: '12px' }}
              labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '8px', fontWeight: 'bold' }}
              itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              formatter={(value, name, props) => {
                return [<span key="tooltip-val" style={{ color: 'hsl(var(--foreground))' }}>{`${value} ${props.payload.unit}`}</span>, 'VOLUME'];
              }}
            />
            <Bar dataKey="value">
              {data.map((entry, index) => {
                const color = getStageColor(entry.stage, index, data.length);
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Keterangan Warna Risiko */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground pt-3 border-t border-border/20">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" /> Dosis Aman
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Batas Maksimal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" /> Ambang Bahaya / Keracunan
        </span>
      </div>
    </div>
  );
}
