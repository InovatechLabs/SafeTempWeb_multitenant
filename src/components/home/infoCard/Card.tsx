import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, Activity, Waves, Clock, DoorClosed } from 'lucide-react';
import { useDashboard } from '../../../hooks/useDashboard';
import { useAuth } from '../../../contexts/auth/authContext';

const DashboardCard = () => {

  const {activeGreenhouse} = useAuth();

  const { data, isLoading } = useDashboard(activeGreenhouse?.id);
  const prevValueRef = useRef<number | null>(null);
  const [trend, setTrend] = useState({ icon: Minus, color: 'text-gray-400', text: 'Estável' });

  const getStability = (std: number | null | undefined) => {
    if (std === null || std === undefined) {
      return { label: 'Sem dados disponíveis', color: "text-gray-400", Icon: DoorClosed };
    }
    if (std < 1) return { label: "Alta Estabilidade", color: "text-green-500", Icon: Activity };
    if (std < 2.5) return { label: "Oscilação Normal", color: "text-yellow-500", Icon: Waves };
    return { label: "Alta Instabilidade", color: "text-red-500", Icon: Zap };
  };

  const getTimeDifference = (timestamp: string | undefined) => {
    if (!timestamp) return "Desconhecido";
    const now = new Date();
    const recordTime = new Date(timestamp);
    const diffMs = now.getTime() - recordTime.getTime(); 
    const diffMins = Math.floor(diffMs / 60000); 

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins === 1) return "Há 1 minuto";
    if (diffMins < 60) return `Há ${diffMins} minutos`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `Há ${diffHours} horas`;
  };

  useEffect(() => {
    if (data?.lastRecord) {
      const newVal = data.lastRecord.value;
      const prevVal = prevValueRef.current;

      if (prevVal !== null) {
        if (newVal > prevVal) {
          setTrend({ icon: TrendingUp, color: 'text-red-400', text: 'Subindo' });
        } else if (newVal < prevVal) {
          setTrend({ icon: TrendingDown, color: 'text-blue-400', text: 'Descendo' });
        } else {
          setTrend({ icon: Minus, color: 'text-gray-400', text: 'Estável' });
        }
      }
      prevValueRef.current = newVal;
    }
  }, [data?.lastRecord?.value]);

  // Flag para verificar se estamos aguardando os dados
  const isWaiting = isLoading || !data || !data.lastRecord;

  // Variáveis pré-calculadas apenas se os dados existirem para evitar erros
  const lastUpdateText = !isWaiting ? getTimeDifference(data!.lastRecord.timestamp) : "Sem registros";
  const stability = !isWaiting ? getStability(data!.statistics?.desvioPadrao) : getStability(null);
  const TrendIcon = trend.icon;
  const StabilityIcon = stability.Icon;

  return (
    <div className="bg-white rounded-[2.5rem] sm:rounded-[3.0rem] p-6 sm:p-10 shadow-[0_10px_40px_rgba(75,42,89,0.15)] w-full max-w-[450px] relative overflow-hidden border border-brand-purple/10 transition-all duration-300 min-h-[450px] flex flex-col justify-between">
      
      {isWaiting ? (
        /* =========================================
           ESTADO DE CARREGAMENTO (SKELETON MODERNO)
           ========================================= */
        <div className="flex-1 flex flex-col animate-in fade-in duration-500">
          
          {/* Topo: Simulando os badges de cabeçalho */}
          <div className="relative flex justify-between items-center mb-10 opacity-70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-purple/40 rounded-full animate-ping" />
              <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="h-5 w-5 bg-gray-100 rounded-full animate-pulse" />
          </div>

          {/* Centro: Loader criativo com a cor da marca */}
          <div className="relative flex flex-col items-center justify-center flex-1">
            <div className="relative flex items-center justify-center mb-6 mt-4">
              {/* Efeito de anel pulsante externo */}
              <div className="absolute inset-0 bg-brand-purple/5 rounded-full animate-ping scale-[1.5]" />
              
              {/* O seu spinner modernizado */}
              <div className="w-20 h-20 border-4 border-brand-purple/10 border-t-brand-purple rounded-full animate-spin shadow-[0_0_15px_rgba(150,47,214,0.2)]" />
              
              {/* Ícone central fixo pulsando levemente */}
              <Activity className="absolute text-brand-purple/40 animate-pulse" size={28} />
            </div>
            
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-purple/60 animate-pulse mt-4">
              Sincronizando...
            </p>
          </div>

          {/* Rodapé: Skeletons dos blocos de Mínima/Máxima */}
          <div className="mt-auto pt-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-50/50 p-4 rounded-2xl text-center border border-gray-100 h-[76px] flex flex-col justify-center items-center gap-2">
              <div className="h-2 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="bg-gray-50/50 p-4 rounded-2xl text-center border border-gray-100 h-[76px] flex flex-col justify-center items-center gap-2">
              <div className="h-2 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
          
        </div>
      ) : (
        /* =========================================
           ESTADO CARREGADO (DADOS REAIS DA ESTUFA)
           ========================================= */
        <div className="flex-1 flex flex-col animate-in fade-in duration-500">
          <div className="relative flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                Monitoramento Ativo
              </span>
            </div>
            <StabilityIcon className="text-gray-400" size={20} />
          </div>

          <div className="relative text-center flex-1 flex flex-col justify-center">
            <h2 className="text-6xl sm:text-7xl lg:text-[88px] font-black text-gray-900 leading-none tracking-tight">
              {data!.lastRecord.value.toFixed(1)}
              <span className="text-xl sm:text-2xl text-gray-400 align-top ml-1">°C</span>
            </h2>

            <p className="text-gray-500 font-semibold text-xs uppercase tracking-widest mt-3">
              Temperatura Atual
            </p>

            <div className={`mt-4 inline-flex items-center justify-center gap-1 font-semibold text-sm ${trend.color}`}>
              <TrendIcon size={16} />
              {trend.text}
            </div>
          </div>

          <div className="relative mt-4 flex justify-center">
            <div className='flex justify-center items-center gap-8'>
              <p className='text-[12px] font-bold uppercase tracking-tight text-gray-900'>Ambiente</p>
              <div className="bg-brand-purple/5 px-6 py-2 rounded-full flex items-center border border-brand-purple/10">
                <div className={`w-2 h-2 rounded-full mr-2 ${stability.color.replace('text', 'bg')}`} />
                <span className="text-[11px] font-bold uppercase tracking-tight text-brand-purple">
                  {stability.label}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100 transition-colors hover:bg-brand-purple/5 cursor-default">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">
                Mínima (1h)
              </span>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {data!.statistics ? data!.statistics.min.toFixed(2) : "--"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100 transition-colors hover:bg-brand-orange/5 cursor-default">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">
                Máxima (1h)
              </span>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {data!.statistics ? data!.statistics.max.toFixed(2) : "--"}
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex items-center justify-center gap-2 text-gray-400 text-[12px] font-semibold uppercase">
            <Clock size={12} />
            <span>Última leitura: {lastUpdateText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;