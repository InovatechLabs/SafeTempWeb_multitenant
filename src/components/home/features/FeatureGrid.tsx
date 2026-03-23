import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import { features, featurePages } from './data/featuresData'; 
import React from 'react';

interface FeatureGridProps {
  currentPage: number;
  direction: number;
}

const FeatureGrid = ({ currentPage, direction }: FeatureGridProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
  if (selectedId !== null) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [selectedId]);

  return (
    <div className="relative w-full max-w-[450px]">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentPage}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d < 0 ? 100 : -100, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="grid grid-cols-2 gap-4 w-full"
        >
          {featurePages[currentPage].map((f) => {
            const globalIdx = features.findIndex(feat => feat.title === f.title);
            
            return (
              <motion.div
                key={f.title}
                layoutId={`card-${globalIdx}`}
                onClick={() => setSelectedId(globalIdx)}
                className={`${f.color} aspect-square rounded-[2.5rem] p-6 cursor-pointer flex flex-col justify-between shadow-xl transition-transform hover:scale-105 active:scale-95`}
              >
                <motion.div layoutId={`icon-${globalIdx}`}>
                  <f.icon className="text-white" size={32} />
                </motion.div>
                <motion.h4 layoutId={`title-${globalIdx}`} className="text-white font-black text-lg leading-tight">
                  {f.title}
                </motion.h4>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

<AnimatePresence>
  {selectedId !== null && features[selectedId] && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedId(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        layoutId={`card-${selectedId}`}
        className={`${features[selectedId].color} relative w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden`}
      >
        <div className="flex justify-between items-start mb-8">
          <motion.div layoutId={`icon-${selectedId}`} className="p-4 bg-white/20 rounded-2xl text-white">
            {React.createElement(features[selectedId].icon, { size: 40 })}
          </motion.div>
          <button onClick={() => setSelectedId(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>
        <motion.h3 layoutId={`title-${selectedId}`} className="text-white text-3xl md:text-5xl font-black mb-6">
          {features[selectedId].title}
        </motion.h3>
        <p className="text-white/90 text-lg md:text-xl leading-relaxed font-medium mb-8">
          {features[selectedId].longDesc}
        </p>
        <div className="pt-6 border-t border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
          SafeTemp Technical Analysis
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </div>
  );
};

export default FeatureGrid;