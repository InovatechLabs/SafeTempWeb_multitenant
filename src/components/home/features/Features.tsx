import { useState } from "react";
import FeatureGrid from "./FeatureGrid";
import { ArrowRight, ChevronLeft, ChevronRight, CodeXml } from "lucide-react";

const Features = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentPage((prev) => (prev === 0 ? 1 : 0));
  };

  return (
<section id="features" className="py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden min-h-screen flex items-center">
  <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-16 xl:gap-24">

<div className="w-full lg:w-[55%] text-center lg:text-left flex flex-col items-center lg:items-start">
  
  <h2 className="text-brand-orange font-black text-xs uppercase tracking-[0.6em] mb-6">
    Ecossistema 
  </h2>
  
  <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8">
    Tudo o que você precisa para uma 
    <span className="text-brand-orange"> estufa confiável e funcional.</span>
  </h3>

  <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-xl mb-10 mx-auto lg:mx-0">
    Explore o ecossistema completo do SafeTemp. Unimos análise de dados de alta precisão com uma infraestrutura robusta.
  </p>

  <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-xl border border-gray-200 mb-8 mx-auto lg:mx-0">
    <CodeXml size={18} className="text-gray-700" />
    <span className="text-[12px] font-bold uppercase tracking-widest text-gray-600 font-mono">
      Infraestrutura para desenvolvedores
    </span>
  </div>

  <button  
  onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL?.replace('/api/', '')}/api/docs`, '_blank')} 
  className="group flex items-center gap-3 px-8 py-5 bg-brand-orange text-white font-black rounded-2xl shadow-2xl shadow-brand-orange/30 hover:scale-105 transition-all uppercase text-xs tracking-widest cursor-pointer mx-auto lg:mx-0">
    Ver Documentação
    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
  </button>
</div>

      <div className="w-full lg:w-[40%] flex flex-col items-center">
        <div className="relative z-10 w-full flex justify-center lg:justify-end">
          <FeatureGrid currentPage={currentPage} direction={direction} />
        </div>

        <div className="flex gap-6 mt-12">
          <button 
            onClick={() => paginate(-1)}
            className="p-5 rounded-full border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white cursor-pointer transition-all shadow-lg active:scale-90"
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            onClick={() => paginate(1)}
            className="p-5 rounded-full border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white cursor-pointer transition-all shadow-lg active:scale-90"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>

    </div>
  </div>
</section>
  );
};

export default Features;