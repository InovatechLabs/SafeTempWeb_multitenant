import { ArrowRight } from 'lucide-react';
import Navbar from '../../nav/Navbar';
import { motion } from 'framer-motion';
import DashboardCard from '../infoCard/Card';

const Hero = () => {

  const handleExploreClick = () => {
  const featuresSection = document.getElementById('features');
  featuresSection?.scrollIntoView({ behavior: 'smooth' });
};


  return (
    <>
      <Navbar />
      <section className="relative w-full min-h-[100vh] flex items-center justify-center bg-gradient-to-b from-white to-gray-50 overflow-hidden pt-28 md:pt-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center mb-8">

          <motion.div
            className="w-full text-center lg:text-left"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-5xl font-black text-gray-900 tracking-tighter leading-[1.1] mb-6 font-sans"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              Sua estufa{" "}
              <span className="text-brand-purple inline-block">
                inteligente
              </span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium mb-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            >
              O <span className="text-brand-purple">SafeTemp</span> é um sistema de
              monitoramento inteligente desenvolvido para acompanhar, em tempo
              real, a temperatura de estufas laboratoriais. A plataforma permite
              a consulta do histórico completo de dados, possibilitando que você
              visualize medições passadas, identifique padrões e acompanhe
              variações ao longo do tempo.
            </motion.p>

            <div className="mt-8 flex justify-center lg:justify-start flex-wrap gap-4">
              <button onClick={handleExploreClick} className="group flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-brand-purple text-white font-bold rounded-2xl shadow-xl shadow-brand-purple/20 hover:scale-105 cursor-pointer transition-all">
                Explorar
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          <div className="relative flex justify-center items-center mt-10 lg:mt-0">
            <div className="relative flex items-center justify-center z-10 w-full max-w-[420px] sm:max-w-[500px] lg:max-w-none transform hover:scale-[1.02] transition-transform duration-500">
              <DashboardCard />
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Hero;