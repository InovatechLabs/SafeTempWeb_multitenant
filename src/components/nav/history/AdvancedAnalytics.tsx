import { motion } from 'framer-motion';
import { LuSigma, LuShieldCheck, LuDatabase, LuZap, LuTarget, LuChartBar } from 'react-icons/lu';
import { exportToCSV } from '../../../utils/functions/exportToCSV';
import type { TemperatureStatistics } from '../../../types/statistics/TemperatureStatistics';

interface AdvancedAnalyticsProps {
  stats: TemperatureStatistics | undefined;
  isLoading: boolean;
}

const AdvancedAnalytics = ({ stats, isLoading }: AdvancedAnalyticsProps) => {
  const format = (val: number | undefined, precision = 2) => 
    isLoading ? "---" : (val?.toFixed(precision) || "0.00");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex items-center gap-3 px-4">
        <div className="p-2 bg-brand-orange/10 text-brand-orange rounded-xl">
          <LuChartBar size={20} />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Análise Estatística</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Processamento de {stats?.totalRecords || 0} amostras em tempo real</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <motion.div variants={item} className="lg:col-span-4 bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-orange">
            <LuTarget size={120} />
          </div>
          
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
            <LuTarget className="text-brand-orange" size={14} /> Tendência Central
          </h3>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase">Média</p>
                <p className="text-3xl font-black text-gray-900">{format(stats?.media)}°</p>
                <div className="flex items-center gap-1 text-[9px] font-bold text-brand-purple/60">
                  <LuShieldCheck size={10} /> {format(stats?.mediaNoOutlier)} sem ruído
                </div>
              </div>
              <div className="space-y-1 border-l border-gray-50 pl-4">
                <p className="text-[10px] font-black text-gray-400 uppercase">Mediana</p>
                <p className="text-3xl font-black text-gray-900">{format(stats?.mediana)}°</p>
                <div className="flex items-center gap-1 text-[9px] font-bold text-brand-purple/60">
                  <LuShieldCheck size={10} /> {format(stats?.medianaNoOutlier)} filtrada
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
              * A proximidade entre média e mediana indica uma distribuição térmica equilibrada na estufa.
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-5 bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
            <LuSigma className="text-brand-orange" size={14} /> Variabilidade e Precisão
          </h3>

          <div className="grid grid-cols-2 gap-y-10 gap-x-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase">Desvio Padrão</p>
              <p className="text-2xl font-black text-gray-900">± {format(stats?.desvioPadrao, 3)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase">Variância</p>
              <p className="text-2xl font-black text-gray-900">{format(stats?.variancia, 3)}</p>
            </div>
            <div className="col-span-2 space-y-4 pt-4 border-t border-gray-50">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Coef. de Variação (CV)</p>
                  <p className="text-xs font-bold text-brand-orange">{format(stats?.CVNoOutlier)}%</p>
                </div>
                <LuZap className="text-brand-orange animate-pulse" size={20} />
              </div>
              <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stats?.CVNoOutlier || 0, 100)}%` }}
                  className="h-full bg-brand-orange"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-3 bg-brand-orange p-8 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-8 flex items-center gap-2">
            <LuDatabase size={14} /> Resumo Operacional
          </h3>

          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-[2rem] border border-white/5">
               <div className="text-center">
                  <p className="text-[9px] font-black text-white/70 uppercase">Mínima</p>
                  <p className="text-lg font-black">{format(stats?.min, 1)}°</p>
               </div>
               <div className="h-8 w-[1px] bg-white/10" />
               <div className="text-center">
                  <p className="text-[9px] font-black text-white/70 uppercase">Máxima</p>
                  <p className="text-lg font-black text-white">{format(stats?.max, 1)}°</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/50 uppercase">Anomalias (Outliers)</span>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-white ${
                    (stats?.totalOutliers ?? 0) > 0 
                    ? 'bg-red-500/20 text-white-900 font-bold' 
                    : 'bg-green-500/20 text-white-900'
                    }`}>
                    {stats?.totalOutliers ?? 0} detectados
                </span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/50 uppercase">Total de Amostras</span>
                  <span className="text-[10px] font-black text-white/80">{stats?.totalRecords || 0} un</span>
               </div>
            </div>
          </div>

         <button 
  onClick={() => stats && exportToCSV(stats, "safetemp-statistics")} 
  disabled={!stats || isLoading} 
  className={`w-full cursor-pointer mt-8 py-3 transition-all rounded-2xl text-[9px] font-black uppercase tracking-widest border 
    ${!stats || isLoading 
      ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' 
      : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
    }`}
>
  {isLoading ? "Processando..." : "Exportar Dataset"}
</button>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default AdvancedAnalytics;