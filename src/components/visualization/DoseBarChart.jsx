import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function DoseBarChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="border-t border-border/40 pt-4">
      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">Spektrum Dosis Toleransi</h4>
      <div className="h-[380px] w-full mt-4 pb-8 mb-4">
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
                let color = '#0D9488'; // Clinical Teal
                if (entry.stage.toLowerCase().includes('maksimal')) color = '#F97316'; // Orange
                if (entry.stage.toLowerCase().includes('toksisitas') || entry.stage.toLowerCase().includes('bahaya')) color = '#E11D48'; // Critical Crimson
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
