import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuSettings, LuSquareTerminal, LuX, LuFileJson, LuDownload, LuImage, LuChevronUp, LuChevronDown, LuBrainCircuit } from 'react-icons/lu';
import type { TemperatureStatistics } from '../../types/statistics/TemperatureStatistics';
import { useGenerateInsight } from '../../hooks/useInsight';
import type { GreenhouseContext } from '../../types/insightContext';
import { useAuth } from '../../contexts/auth/authContext';
import type { AxiosError } from 'axios';
import type BackendErrorResponse from '../../types/axios';

interface DashboardSidebarProps {
  stats: TemperatureStatistics | undefined;
  isLoading: boolean;
  onExportBoxplot: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onInsightSuccess: (text: string) => void;
  isConsoleActive: boolean;
  onToggleConsole: () => void; 
}

export const DashboardSidebar = ({ stats, isLoading, onExportBoxplot, onExportCSV, onExportJSON, onInsightSuccess, isConsoleActive, onToggleConsole }: DashboardSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { isAuthenticated } = useAuth();

  const [contextText, setContextText] = useState('');
  const [culture, setCulture] = useState('');
  const [stage, setStage] = useState(''); 
  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [criticalTemp, setCriticalTemp] = useState('');
  const [equipmentText, setEquipmentText] = useState('');

  const mutation = useGenerateInsight();
 
  const handleGenerateInsight = () => {
    if (!contextText.trim()) {
      alert("Por favor, descreva o que está acontecendo na estufa.");
      return;
    }

    const payload: GreenhouseContext = showAdvanced 
      ? {
          mode: 'experiment',
          text: contextText,
          culture: culture || 'Não informada',
          stage: stage,
          thresholds: {
            min: Number(minTemp) || 0,
            max: Number(maxTemp) || 0,
            criticalMax: Number(criticalTemp) || 0,
          },
          equipment: equipmentText.split(',').map(item => item.trim()).filter(i => i !== ''),
        }
      : {
          mode: 'general',
          text: contextText,
        };

    mutation.mutate(payload, {
      onSuccess: (data) => {
        onInsightSuccess(data.insight);
        setIsOpen(false); 
      },
      onError: (err: unknown) => {
        const axiosError = err as AxiosError<BackendErrorResponse>;
        const msg = axiosError.response?.data?.message || "Erro ao conectar com o serviço de IA.";
        alert(msg);
      }
    });
  };
  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-4 z-40 p-4 bg-gray-900 shadow-xl border border-gray-100 rounded-2xl text-white hover:scale-110 transition-transform cursor-pointer"
        >
          <LuSettings size={24} className="animate-spin-slow" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-90 bg-white/90 backdrop-blur-2xl border-l border-gray-100 p-8 shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-orange/10 text-brand-orange rounded-xl">
                    <LuSettings size={20} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Ações</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-gray-400"
                >
                  <LuX size={20} />
                </button>
              </div>

               <div className="space-y-10">
    <div className="space-y-4">
      <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-2">Exportar Dados</p>
      <button onClick={onExportJSON} className="w-full cursor-pointer flex items-center justify-between p-4 bg-gray-50 hover:bg-brand-orange/5 rounded-2xl transition-all group">
        <div className="flex items-center gap-3">
          <LuFileJson className="text-gray-400 group-hover:text-brand-orange" />
          <span className="text-xs font-bold text-gray-600">Dados Brutos (JSON)</span>
        </div>
        <LuDownload size={14} className="text-gray-300" />
      </button>
      <button onClick={onExportCSV} className="w-full cursor-pointer flex items-center justify-between p-4 bg-gray-50 hover:bg-brand-orange/5 rounded-2xl transition-all group">
        <div className="flex items-center gap-3">
          <LuFileJson className="text-gray-400 group-hover:text-brand-orange" />
          <span className="text-xs font-bold text-gray-600">Dados Brutos (CSV)</span>
        </div>
        <LuDownload size={14} className="text-gray-300" />
      </button>
    </div>

    
              <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-2">Exportar Visualização</p>
                  <button 
                    onClick={onExportBoxplot}
                    disabled={isLoading || !stats}
                    className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-brand-orange/5 border border-transparent hover:border-brand-orange/20 rounded-[2rem] transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-brand-orange transition-colors">
                        <LuImage size={18} />
                      </div>
                      <div className="text-left cursor-pointer">
                        <p className="text-xs font-black text-black">Boxplot Analysis</p>
                        <p className="text-[10px] text-gray-500 font-medium">Salvar gráfico como PNG</p>
                      </div>
                    </div>
                    <LuDownload size={16} className="text-gray-300" />
                  </button>
                </div>
              </div>
<div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
     <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-2">Integração com IA</p>
    <div className="bg-brand-purple/5 p-6 rounded-[1.5rem] border border-brand-purple/10 transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <LuBrainCircuit className="text-brand-purple" size={18} />
        <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest">
          IA Quick Insight
        </p>
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
        Forneça o contexto para uma análise rápida e precisa do comportamento térmico.
      </p>
     <div className="space-y-3">
                    <textarea
                      value={contextText}
                      onChange={(e) => setContextText(e.target.value)}
                      placeholder="Ex: Monitorando germinação de mudas..."
                      className="w-full h-20 p-3 text-xs bg-white border border-brand-purple/10 rounded-2xl focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all resize-none placeholder:text-gray-300"
                    />

                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-[9px] font-black uppercase text-brand-purple/60 hover:text-brand-purple transition-colors ml-1 cursor-pointer"
                    >
                      {showAdvanced ? <LuChevronUp size={12} /> : <LuChevronDown size={12} />}
                      {showAdvanced ? 'Ocultar Detalhes' : 'Vincular Experimento (Opcional)'}
                    </button>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-3"
                        >
                          <div className="pt-2 space-y-3">
                            <input
                              type="text"
                              value={culture}
                              onChange={(e) => setCulture(e.target.value)}
                              placeholder="Cultura (ex: Alface)"
                              className="w-full p-2.5 text-[11px] bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-purple/30"
                            />
                            <input 
                                type="text" 
                                value={stage}
                                onChange={(e) => setStage(e.target.value)}
                                placeholder="Estágio (ex: Germinação)" 
                                className="w-full p-2.5 text-[11px] bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-purple/30" 
                              />
                            <div className="grid grid-cols-3 gap-2">
                              <input 
                                type="number" 
                                value={minTemp}
                                onChange={(e) => setMinTemp(e.target.value)}
                                placeholder="Min" 
                                className="p-2 text-center text-[10px] bg-white border border-gray-100 rounded-lg outline-none" 
                              />
                              <input 
                                type="number" 
                                value={maxTemp}
                                onChange={(e) => setMaxTemp(e.target.value)}
                                placeholder="Max" 
                                className="p-2 text-center text-[10px] bg-white border border-gray-100 rounded-lg outline-none" 
                              />
                              <input 
                                type="number" 
                                value={criticalTemp}
                                onChange={(e) => setCriticalTemp(e.target.value)}
                                placeholder="Crítico" 
                                className="p-2 text-center text-[10px] bg-white border border-gray-100 rounded-lg outline-none" 
                              />
                            </div>
                            <input
                              type="text"
                              value={equipmentText}
                              onChange={(e) => setEquipmentText(e.target.value)}
                              placeholder="Equipamentos (ex: Exaustor, Cooler)"
                              className="w-full p-2.5 text-[11px] bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-purple/30"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      onClick={handleGenerateInsight}
                      disabled={mutation.isPending || !isAuthenticated}
                      className="w-full cursor-pointer py-3.5 bg-brand-purple text-white rounded-2xl text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase tracking-widest shadow-lg shadow-brand-purple/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-[1]"
                    >
                      {mutation.isPending ? 'Analisando Dados...' : 'Gerar Insight'}
                    </button>
                  </div>
                </div>
                </div>
<div className="space-y-4 mb-10">
  <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-2">Avançado</p>
  
  <button 
    onClick={onToggleConsole}
    disabled={!isAuthenticated}
    className={`w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between p-5 rounded-[2rem] transition-all group border ${
      isConsoleActive 
        ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20' 
        : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-md transition-colors ${
        isConsoleActive ? 'bg-white/20' : 'bg-white shadow-sm group-hover:text-brand-purple'
      }`}>
        <LuSquareTerminal size={18} />
      </div>
      <div className="text-left">
        <p className={`text-xs font-black ${isConsoleActive ? 'text-white' : 'text-black'}`}>
          Cloud Console
        </p>
        <p className={`text-[10px] font-medium ${isConsoleActive ? 'text-purple-100' : 'text-gray-500'}`}>
          Abrir terminal para operações avançadas
        </p>
      </div>
    </div>
    
    {/* Indicador visual de status */}
    {isConsoleActive && (
      <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[8px] font-black uppercase">Live</span>
      </div>
    )}
  </button>
</div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;