import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LuBrainCircuit, LuSparkles } from 'react-icons/lu';

interface AIInsightCardProps {
  text: string;
  onClose: () => void;
}

export const AIInsightCard = ({ text }: AIInsightCardProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayText(''); 
    setIsFinished(false);

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        setIsFinished(true);
      }
    }, 15); 

    return () => clearInterval(timer);
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mt-25 bg-gradient-to-br from-brand-purple to-purple-700 p-[1px] rounded-[2rem] shadow-2xl shadow-brand-purple/20"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-[1.95rem] p-6 relative overflow-hidden">
        <LuSparkles className="absolute -right-4 -top-4 text-brand-purple/5 w-24 h-24 rotate-12" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl">
              <LuBrainCircuit size={20} className={!isFinished ? "animate-pulse" : ""} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-tighter text-brand-purple">
                Análise de IA SafeTemp
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">Llama 3 Intelligent Processor</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            {displayText}
            {!isFinished && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-1.5 h-4 ml-1 bg-brand-purple align-middle"
              />
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};