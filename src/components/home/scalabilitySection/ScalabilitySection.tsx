import React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Cpu,
  Check,
  Thermometer,
  Activity,
} from "lucide-react";

const ScalabilitySection: React.FC = () => {

  const steps = [
    {
      icon: Plus,
      title: "Criar Ambiente",
      description: "Adicione um novo ambiente atrelado à sua conta",
    },
    {
      icon: Cpu,
      title: "Gerar uma Chave de Ativação",
      description: "Chave única para parear seu hardware com nossa infraestrutura automaticamente",
      
    },
    {
      icon: Check,
      title: "Começar a Monitorar",
      description: "Veja métricas em tempo real utilizando nossas ferramentas de visualização",
    },
  ];

  const chartBars = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 55, 90];

  return (
    <section className="relative w-full overflow-hidden bg-[#f8f9fc]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* LADO ESQUERDO — Copy & Fluxo Plug & Play */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8 items-center lg:items-start">
            <div className="inline-flex items-center self-center lg:self-start">
              <span className="text-[12px] uppercase tracking-[0.6em] font-black text-brand-purple rounded-full">
                ESCALABILIDADE
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-[1.1] text-center lg:text-left">
              Múltiplos ambientes.
              <br />
              Um único painel.
            </h2>

            <p className="text-gray-500 font-medium text-base lg:text-lg leading-relaxed text-center lg:text-left">
              Gerencie múltiplas instâncias de forma simples e eficiente. Com nossa solução, você pode adicionar quantas estufas quiser, cada uma com seu próprio conjunto de sensores e dados, tudo acessível em um único painel intuitivo.
            </p>

            {/* Steps Visuais */}
            <div className="flex flex-col gap-6 mt-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-[0_8px_40px_rgba(150,47,214,0.04)] flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-gray-900 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* LADO DIREITO — Bento Box Sobreposto (Layering) */}
          <div className="relative w-full lg:w-1/2 flex items-center justify-center min-h-[450px] lg:min-h-[550px] mt-10 lg:mt-0">
            
            {/* Efeito de borrão colorido no fundo */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-purple/10 blur-[100px] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full" />

            {/* Card 1 — Maior (Freezer) - Fundo esquerdo */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 sm:left-4 w-[85%] sm:w-[75%] bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(150,47,214,0.06)] p-6 lg:p-8 z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-purple/10 flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight">
                      Minha Estufa 01
                    </h3>
                     <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Sincronizado
                    </span>
                    
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-6xl lg:text-7xl font-black text-gray-900 tracking-tighter">
                  -2.5
                </span>
                <span className="text-2xl lg:text-3xl font-black text-gray-400 tracking-tighter">
                  °C
                </span>
              </div>
              
             <div className="flex items-end gap-1.5 h-14 w-full">
                {chartBars.map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    className="flex-1 rounded-t-sm bg-brand-purple/20 hover:bg-brand-purple/40 transition-colors cursor-pointer"
                    style={{ minHeight: "4px" }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Card 2 — Menor (Estufa) - Sobreposto na frente (bottom right) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-0 right-0 sm:right-4 w-[80%] sm:w-[65%] bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.12)] p-6 lg:p-8 z-20"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight">
                      Minha Estufa 02
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Sincronizado
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">
                  24.8
                </span>
                <span className="text-xl lg:text-2xl font-black text-gray-400 tracking-tighter">
                  °C
                </span>
              </div>

              {/* Mini-gráfico simulado */}
              <div className="flex items-end gap-1.5 h-14 w-full">
                {chartBars.map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    className="flex-1 rounded-t-sm bg-brand-orange/20 hover:bg-brand-orange/40 transition-colors cursor-pointer"
                    style={{ minHeight: "4px" }}
                  />
                ))}
              </div>
            </motion.div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScalabilitySection;