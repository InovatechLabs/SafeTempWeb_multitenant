import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';
import { useDashboard } from '../../../hooks/useDashboard';
import { useAuth } from '../../../contexts/auth/authContext';

const roles = ["estudantes.", "pesquisadores.", "gestores.", "professores.", "você."];

const CommunitySection = () => {

  const {activeGreenhouse} = useAuth();

  const [index, setIndex] = useState(0);
  const { data, isLoading } = useDashboard(activeGreenhouse?.id);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if(data?.lastRecord) {
      setTotal(data?.lastRecord.id)
    }
  }, [data?.lastRecord]);

  return (
    <section className="py-24 bg-white overflow-hidden min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 xl:gap-24">

          <div className="w-full lg:w-[55%] text-center lg:text-left flex flex-col items-center lg:items-start">
            
            <div className="inline-flex items-center gap-2 px-1 py-1 rounded-full mb-6">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-purple">
                Integração & Usabilidade
              </span>
            </div>

            <h3 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8 h-[120px] md:h-auto">
              Feito por estudantes, <br />
              <div className="flex items-baseline justify-center lg:justify-start gap-3">
                <span>para</span>
                <div className="relative inline-flex min-w-[200px] h-[1em]">
                  <span className="opacity-0 pointer-events-none">&nbsp;</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={roles[index]}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "circOut" }}
                      className="text-brand-purple absolute left-0"
                    >
                      {roles[index]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </h3>

            <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-xl mb-10 mx-auto lg:mx-0 font-medium">
              Não importa a sua posição no laboratório, o SafeTemp oferece as ferramentas certas para o seu monitoramento. Do controle de hardware à análise estatística avançada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <CheckCircle2 size={18} className="text-green-500" /> Multi-plataforma
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <CheckCircle2 size={18} className="text-green-500" /> Open-Source
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <CheckCircle2 size={18} className="text-green-500" /> Dados em Nuvem
              </div>
            </div>
          </div>
    <div className="w-full lg:w-[45%] relative flex justify-center items-center h-[420px] sm:h-[500px] lg:h-[600px]">
  <div className="absolute w-[280px] sm:w-[400px] lg:w-[500px] h-[280px] sm:h-[400px] lg:h-[500px] bg-brand-purple/5 rounded-full blur-[80px] lg:blur-[100px]" />

  <motion.div
  initial={{ x: -40, y: 60, opacity: 0 }}
  whileInView={{ x: 0, y: 0, opacity: 1 }}
  viewport={{ once: true }}
  className="relative z-10 mx-auto lg:mx-0 lg:-translate-x-16 lg:translate-y-10
             w-full max-w-[420px] bg-white rounded-2xl shadow-2xl 
             border border-gray-100 overflow-hidden"
>

    {/* header */}
    <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <div className="w-2 h-2 rounded-full bg-green-400" />
      </div>
    </div>

    {/* content */}
    <div className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50">

      <div className="flex justify-between items-start mb-6">

        <div>
          <p className="text-[9px] sm:text-[10px] font-black text-brand-purple uppercase tracking-[0.4em] sm:tracking-[0.5em] mb-1">
            Dashboard
          </p>

          <h4 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">
            {isLoading ? (
              "0"
            ) : (
              <span>{total}+</span>
            )}
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 ml-1">
              registros
            </span>
          </h4>
        </div>
      </div>
      <div className="space-y-2">

        <div className="flex items-end gap-1 h-10 sm:h-12">

          {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              className="flex-1 bg-brand-purple/20 rounded-t-sm"
            />
          ))}

        </div>

        <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase">
          Sincronização em tempo real ativa
        </p>

      </div>
    </div>
  </motion.div>

  <motion.div 
    initial={{ x: 60, y: -60, opacity: 0 }}
    whileInView={{ x: 20, y: -10, opacity: 1 }}
    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
    viewport={{ once: true }}
   className="absolute 
top-6 right-2 
scale-75 sm:scale-90 md:scale-100
z-20 w-[170px] h-[340px] 
bg-gray-900 rounded-[2.2rem] border-[6px] border-gray-800 
shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] 
overflow-hidden">

    <div className="w-full h-full bg-brand-purple p-4 sm:p-6 flex flex-col justify-between">

      <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
        <Zap size={14} className="text-white" />
      </div>

      <div className="text-left">
        <p className="text-[7px] sm:text-[8px] text-white/50 uppercase font-black tracking-widest mb-1">
          Temp. Estufa
        </p>

        <h4 className="text-2xl sm:text-3xl font-black text-white">
          25.3°C
        </h4>

        <div className="w-full h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '65%' }}
            className="h-full bg-brand-orange"
          />
        </div>
      </div>

      <div className="py-2 px-3 bg-white/10 rounded-xl text-[7px] sm:text-[8px] font-bold text-white text-center uppercase tracking-widest">
        Sistema Operacional
      </div>

    </div>
  </motion.div>

</div>
</div>
</div>
    </section>
  );
};

export default CommunitySection;