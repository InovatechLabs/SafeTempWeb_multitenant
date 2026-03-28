import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuHistory, LuBarcode, LuTable,
  LuTrendingUp, LuActivity, LuSearch, LuLoader,
  LuTrendingDown
} from 'react-icons/lu';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import Navbar from '../../components/nav/Navbar';
import { useData } from '../../hooks/useDashboard'; 
import { formatTimeBRT } from '../../utils/formatters/formatTimeBRT';
import AdvancedAnalytics from '../../components/nav/history/AdvancedAnalytics';
import type { TemperatureRecord } from '../../types/records/TemperatureRecord';

interface HistoryHeroProps {
  formValues: {
    date: string;
    start: string;
    end: string;
    granularity: string;
  };
  setFormValues: React.Dispatch<React.SetStateAction<{
    date: string;
    start: string;
    end: string;
    granularity: string;
  }>>;
  onSearch: () => void;
  isLoading: boolean;
}

interface StatCardProps {
  unit: string;
  color: string;
  label: string;
  icon: React.ReactNode;
  value: string;
}


const HistoryHero = ({ formValues, setFormValues, onSearch, isLoading }: HistoryHeroProps) => {
  const [activeCard, setActiveCard] = useState(0);

  const cards = [
    {
      title: "Tendências",
      desc: "Visualização analítica de variações térmicas.",
      icon: <LuBarcode />,
      color: "from-brand-purple to-purple-600",
      content: (
        <svg viewBox="0 0 100 40" className="w-full h-16 mt-4 drop-shadow-lg">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 35 Q 20 10, 40 25 T 80 15 T 100 5 V 40 H 0 Z"
            fill="url(#grad)"
          />
          <motion.path
            d="M0 35 Q 20 10, 40 25 T 80 15 T 100 5"
            fill="none"
            stroke="white"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      )
    },
    {
      title: "Métricas",
      desc: "Cálculos estatísticos de precisão laboratorial.",
      icon: <LuActivity />,
      color: "from-blue-500 to-cyan-500",
      content: (
        <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-[11px] bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
          <p className="text-white/80">μ = 27.4°C</p>
          <p className="text-white/80">σ = 1.3°C</p>
          <p className="text-white/80">Δ = +0.6°C</p>
        </div>
      )
    },
    {
      title: "Exportação",
      desc: "Geração de logs tabulares em tempo real.",
      icon: <LuTable />,
      color: "from-brand-orange to-orange-500",
      content: (
        <div className="mt-4 space-y-1.5 font-mono text-[10px] bg-black/20 p-3 rounded-2xl border border-white/5">
          <div className="flex justify-between text-white/40 border-b border-white/10 pb-1">
            <span>TIMESTAMP</span><span>VALOR</span>
          </div>
          <div className="flex justify-between text-white/90"><span>12:01:45</span><span>26.4°C</span></div>
          <div className="flex justify-between text-white/70"><span>12:02:10</span><span>26.5°C</span></div>
          <div className="flex justify-between text-white/50"><span>12:02:35</span><span>26.7°C</span></div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setActiveCard(prev => (prev + 1) % cards.length), 5000);
    return () => clearInterval(timer);
  }, [cards.length]);

  return (
    <section className="w-full bg-white rounded-[2rem] sm:rounded-[3.5rem] border border-gray-100 shadow-2xl overflow-hidden p-5 sm:p-8 lg:p-12 relative">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 mb-8 lg:mb-14">
        {/* Texto hero */}
        <div className="flex-1 text-center lg:text-left z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full mb-4 sm:mb-6 text-[10px] font-black uppercase tracking-widest"
          >
            <LuHistory size={14} /> Data Intelligence
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] mb-4 sm:mb-8">
            Histórico <span className="text-brand-orange">Explorável</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-lg font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Consulte os registros de temperatura coletados ao longo do tempo em um ambiente construído 
            para análise e interpretação, permitindo uma visualização completa de dados e estatísticas do período
          </p>
        </div>

        {/* Card animado — oculto em telas muito pequenas, visível a partir de sm */}
        <div className="hidden sm:flex flex-1 relative w-full max-w-[420px] h-[260px] sm:h-[300px] lg:h-[320px] items-center justify-center">
          <AnimatePresence mode="popLayout">
            {cards.map((card, i) => i === activeCard && (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20, rotate: 5 }}
                whileHover={{ scale: 1.03, rotate: 0.5 }}
                className={`absolute p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] w-full h-full bg-gradient-to-br ${card.color} border border-white/20 backdrop-blur-xl flex flex-col justify-between cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 sm:p-4 bg-white/20 rounded-2xl backdrop-blur-lg shadow-inner">{card.icon}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">SafeTemp v3.0</div>
                </div>
                
                <div>
                   <h4 className="font-black text-xl sm:text-2xl mb-2 tracking-tight">{card.title}</h4>
                   <p className="text-white/70 text-xs font-medium leading-relaxed">{card.desc}</p>
                   {card.content}
                </div>

                <div className="flex gap-1.5 mt-4 sm:mt-6">
                  {cards.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1 rounded-full transition-all duration-500 ${idx === activeCard ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} 
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Formulário de busca */}
      <div className="bg-gray-50/50 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Data das Leituras</label>
            <input 
              type="date" 
              value={formValues.date}
              onChange={(e) => setFormValues({...formValues, date: e.target.value})}
              className="w-full p-3 sm:p-3.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-brand-purple/20 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Horário Início</label>
            <input 
              type="time" 
              value={formValues.start}
              onChange={(e) => setFormValues({...formValues, start: e.target.value})}
              className="w-full p-3 sm:p-3.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-brand-purple/20 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Horário Fim</label>
            <input 
              type="time" 
              value={formValues.end}
              onChange={(e) => setFormValues({...formValues, end: e.target.value})}
              className="w-full p-3 sm:p-3.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-brand-purple/20 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Granularidade</label>
            <select 
              value={formValues.granularity}
              onChange={(e) => setFormValues({...formValues, granularity: e.target.value})}
              className="w-full p-3 sm:p-3.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-brand-purple/20 transition-all"
            >
              <option value="1m">1 minuto</option>
              <option value="5m">5 minutos</option>
              <option value="15m">15 minutos</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={onSearch}
          disabled={isLoading}
          className="w-full px-10 py-4 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-purple/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? <LuLoader className="animate-spin" size={18} /> : <LuSearch size={18} />}
          <span>Resgatar Dados</span>
        </button>
      </div>
    </section>
  );
};

export default function HistoryPage() {
  const [formValues, setFormValues] = useState({
    date: new Date().toLocaleDateString('en-CA'),
    start: '',
    end: '',
    granularity: '1m'
  });

  const [queryParams, setQueryParams] = useState({
    date: new Date().toISOString().split('T')[0]
  });

  const { data, isLoading } = useData(queryParams);

  const handleSearch = () => {
    setQueryParams({ ...formValues });
  };

  const records = data?.records ?? [];
  const chartData = records.map((record: TemperatureRecord) => ({
    hour: record.timestamp ? formatTimeBRT(record.timestamp) : '',
    temp: record.value
  }));

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-3 sm:p-6 lg:p-8 max-w-[100vw] overflow-x-hidden">
      <Navbar />
      
      <div className="mt-24 sm:mt-20 space-y-6 sm:space-y-10 lg:space-y-12 max-w-full mx-auto">
        <HistoryHero 
          formValues={formValues} 
          setFormValues={setFormValues} 
          onSearch={handleSearch} 
          isLoading={isLoading} 
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard 
            label="Amostragem" 
            value={records.length.toString()} 
            unit="un" icon={<LuHistory />} color="green" 
          />
          <StatCard 
            label="Média Térmica" 
            value={data?.statistics?.media.toFixed(2) || "0.00"} 
            unit="°C" icon={<LuActivity />} color="orange" 
          />
          <StatCard 
            label="Pico (Máx)" 
            value={data?.statistics?.max.toFixed(2) || "0.00"} 
            unit="°C" icon={<LuTrendingUp />} color="orange" 
          />
          <StatCard 
            label="Vale (Mín)" 
            value={data?.statistics?.min.toFixed(3) || "0.000"} 
            unit="°C" icon={<LuTrendingDown />} color="orange" 
          />
        </div>

        {/* Chart */}
        <div className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[3.5rem] border border-gray-100 shadow-sm h-[300px] sm:h-[400px] lg:h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-4 sm:mb-8">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Telemetria Histórica</h3>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-brand-purple">
                <LuLoader className="animate-spin" size={14} />
                <span className="text-[10px] font-black uppercase hidden sm:inline">Sincronizando Banco...</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d57a25" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d57a25" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8f8" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 600}} 
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 600}} 
                  domain={['auto', 'auto']}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} 
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#d57a25" 
                  strokeWidth={1.3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <AdvancedAnalytics stats={data?.statistics} isLoading={isLoading} />
      </div>
    </div>
  );
}

const StatCard = ({ label, value, unit, icon, color }: StatCardProps) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between transition-all"
  >
    <div>
      <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-xl sm:text-2xl font-black text-brand-${color}`}>{value}</p>
        <span className="text-[10px] text-gray-400 font-bold">{unit}</span>
      </div>
    </div>
    <div className={`p-3 sm:p-4 bg-brand-${color}/10 text-brand-${color} rounded-2xl`}>{icon}</div>
  </motion.div>
);
