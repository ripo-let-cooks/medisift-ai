import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function RiskGauge({ riskLevel }) {
  // Low | Moderate | High | Critical
  const levels = [
    { name: 'Low', value: 1, color: '#0D9488' }, // Clinical Teal
    { name: 'Moderate', value: 1, color: '#EAB308' }, // Yellow 500
    { name: 'High', value: 1, color: '#F97316' }, // Orange 500
    { name: 'Critical', value: 1, color: '#E11D48' }, // Critical Crimson
  ];

  let activeIndex = 0;
  let label = 'RENDAH';
  const normalized = (riskLevel || '').toLowerCase();
  
  if (normalized.includes('moderate')) { activeIndex = 1; label = 'SEDANG'; }
  else if (normalized.includes('high')) { activeIndex = 2; label = 'TINGGI'; }
  else if (normalized.includes('critical')) { activeIndex = 3; label = 'BAHAYA'; }

  return (
    <div className="border-t border-border/40 pt-4 relative">
      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">Tingkat Risiko Klinis</h4>
      <div className="h-[140px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={levels}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={2}
            >
              {levels.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  opacity={index === activeIndex ? 1 : 0.15}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-2">
          <span className="text-3xl font-mono font-bold tracking-tight" style={{ color: levels[activeIndex].color }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
