import React from 'react';
import { Activity, Shield, Hexagon, Layers, Plus, Database, Cpu, HeartPulse } from 'lucide-react';

export default function FloatingBackground() {


  const icons = [
    { Icon: Activity, top: '15%', left: '10%', size: 48, delay: '0s', slow: true },
    { Icon: Shield, top: '25%', left: '80%', size: 32, delay: '2s', slow: false },
    { Icon: Hexagon, top: '65%', left: '15%', size: 56, delay: '1s', slow: true },
    { Icon: Plus, top: '45%', left: '85%', size: 24, delay: '3s', slow: false },
    { Icon: Database, top: '75%', left: '70%', size: 40, delay: '0.5s', slow: true },
    { Icon: Cpu, top: '10%', left: '60%', size: 36, delay: '1.5s', slow: false },
    { Icon: Layers, top: '85%', left: '30%', size: 28, delay: '4s', slow: true },
    { Icon: HeartPulse, top: '40%', left: '5%', size: 42, delay: '2.5s', slow: false },
    { Icon: Hexagon, top: '50%', left: '92%', size: 20, delay: '0.2s', slow: true },
    { Icon: Plus, top: '80%', left: '90%', size: 16, delay: '1.2s', slow: false },
    { Icon: Activity, top: '20%', left: '35%', size: 24, delay: '3.5s', slow: true },
    { Icon: Shield, top: '90%', left: '10%', size: 20, delay: '2.2s', slow: false },
  ];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center bg-[#050505]">
      {/* Abstract Gradient Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/25 blur-[140px] mix-blend-screen animate-float-slow opacity-90" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-white/5 blur-[160px] mix-blend-screen animate-float-slower opacity-50" />
      <div className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-float-slow opacity-70" />
      
      {/* Radial fade so icons near the center are less visible or fade out */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_80%)] opacity-60" />
      
      {icons.map((item, i) => {
        const { Icon, top, left, size, delay, slow } = item;
        return (
          <div
            key={i}
            className={`absolute text-muted-foreground/30 ${slow ? 'animate-float-slower' : 'animate-float-slow'}`}
            style={{ 
              top, 
              left, 
              animationDelay: delay 
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </div>
        );
      })}
    </div>
  );
}
