import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, FileText, Settings, HelpCircle } from 'lucide-react';

export default function Header({ showHistory, setShowHistory, onOpenApiSettings, onOpenLegal, onHomeClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { name: 'Histori Analisis', icon: FileText, href: '#' },
    { name: 'Panduan Bantuan', icon: HelpCircle, href: '#' },
    { name: 'Pengaturan API', icon: Settings, href: '#' },
  ];

  const handleNavClick = (itemName) => {
    if (itemName === 'Histori Analisis') {
      if (setShowHistory) setShowHistory(!showHistory);
    } else if (itemName === 'Panduan Bantuan') {
      if (onOpenLegal) onOpenLegal();
    } else if (itemName === 'Pengaturan API') {
      if (onOpenApiSettings) onOpenApiSettings();
    }
  };

  return (
    <>
      <motion.header 
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-4 md:top-6 z-40 w-[95%] max-w-[1400px] mx-auto rounded-2xl md:rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMenu}
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                if (onHomeClick) {
                  onHomeClick();
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-8 w-8 rounded-none bg-primary flex items-center justify-center"
              >
                <span className="text-primary-foreground font-mono font-bold">M</span>
              </motion.div>
              <h1 className="font-mono text-lg font-bold tracking-tight uppercase text-foreground group-hover:text-primary transition-colors">
                MediSift<span className="text-primary">.AI</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name)}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* Side Navigation Overlay & Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm border-r border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-none bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-mono font-bold">M</span>
                  </div>
                  <h2 className="font-mono text-lg font-bold tracking-tight uppercase">Menu</h2>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMenu}
                  className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (i * 0.05) }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                    whileHover={{ x: 5 }}
                    onClick={() => {
                      handleNavClick(item.name);
                      if (typeof toggleMenu === 'function') toggleMenu();
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </motion.button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-border/40">
                <p className="text-xs font-mono text-muted-foreground">MediSift.AI v1.0.0</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">Clinical Intelligence</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
