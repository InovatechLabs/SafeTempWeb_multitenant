import React from 'react';
import Navbar from '../../components/nav/Navbar';
import {
  LuActivity, LuShieldCheck, LuThermometer,
  LuSigma, LuDatabaseBackup, LuFileWarning, LuTarget, LuShieldAlert, 
} from 'react-icons/lu';
import {
  AreaChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, ReferenceLine,
} from 'recharts';
import { useHistory } from '../../hooks/useDashboard';
import createPlotlyComponent from 'react-plotly.js/factory';
import { formatTimeBRT } from '../../utils/formatters/formatTimeBRT';
import { LucideArrowDown, LucideArrowUp } from 'lucide-react';
import type { Layout } from 'plotly.js';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import Plotly from 'plotly.js-cartesian-dist';
import { exportToCSV } from '../../utils/functions/exportToCSV';
import { exportToJSON } from '../../utils/functions/exportToJSON';
import { AnimatePresence } from 'framer-motion';
import { AIInsightCard } from '../../components/dashboard/AIInsightCard';
import SystemLogConsole from '../../components/dashboard/SystemLogConsole';

import { useAuth } from '../../contexts/auth/authContext';

const Plot = createPlotlyComponent(Plotly);

const PIE_COLORS = ['#32c5ff', '#4b2a59', '#ff4343'];

const EmptyChartState = ({ title }: { title: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl p-10">
    <div className="p-4 bg-gray-50 rounded-full mb-4">
      <LuDatabaseBackup size={50} className="text-gray-200" />
    </div>
    <p className="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-1">{title}</p>
    <p className="text-xs font-medium text-gray-400 text-center">Aguardando dados recentes...</p>
  </div>
);

const ContextBar = () => {
  const { activeGreenhouse } = useAuth();
  
  return (
    <div className="bg-white px-8 py-3 flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
      <span>Ambiente Atual:</span>
      <span className="text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full">
        {activeGreenhouse?.name || 'Carregando...'}
      </span>
    </div>
  );
};

const Dashboard: React.FC = () => {

  const { activeGreenhouse } = useAuth();

  const { data, isLoading, isError } = useHistory(activeGreenhouse?.id);
  const [thresholds, setThresholds] = React.useState<{ cold: number | string; hot: number | string }>({
    cold: 20,
    hot: 25
  });
  const [currentInsight, setCurrentInsight] = React.useState<string | null>(null);
  const [showConsole, setShowConsole] = React.useState(false);

  if (isLoading) return <div className="p-10 text-center font-bold">Carregando...</div>;
  if (isError || !data?.records) return <div className="p-10 text-center text-red-500">Erro ao carregar dados.</div>;

  const records = data?.records ?? [];
  const total = records.length;
  const hasData = total > 0;

  const currentCold = Number(thresholds.cold);
  const currentHot = Number(thresholds.hot);


  const coldCount = records.filter(r => r.value < currentCold).length;
  const hotCount = records.filter(r => r.value > currentHot).length;
  const normalCount = records.filter(r => r.value >= currentCold && r.value <= currentHot).length;

  const pieData = hasData ? [
    { name: `Frio (<${thresholds.cold}°C)`, value: (coldCount / total) * 100 },
    { name: `Normal (${thresholds.cold}-${thresholds.hot}°C)`, value: (normalCount / total) * 100 },
    { name: `Quente (>${thresholds.hot}°C)`, value: (hotCount / total) * 100 },
  ] : [{ name: 'Sem Dados', value: 100 }];

  const values = records.map(r => r.value);
  
  const barData = records.map((record) => ({
    hour: formatTimeBRT(record.timestamp),
    temp: record.value,
    isOutlier: data?.statistics?.outliers?.includes(record.value) ?? false
  }));

  const boxPlotLayout: Partial<Layout> = {
    autosize: true,
    margin: { t: 0, b: 20, l: 40, r: 10 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    yaxis: { gridcolor: '#f5f5f5', zeroline: false, tickfont: { size: 10, color: '#A3A3A3' } },
    xaxis: { showticklabels: false }
  };

  const handleExportBoxplot = () => {
    const gd = document.getElementById('boxplot-id');
    if (gd) {
      Plotly.downloadImage(gd, {
        format: 'png', width: 1200, height: 800,
        filename: `SafeTemp_Boxplot_${new Date().getTime()}`
      });
    }
  };

  const handleColdChange = (val: string) => {
    setThresholds((prev) => ({ ...prev, cold: val }));
  };

  const handleHotChange = (val: string) => {
    setThresholds((prev) => ({ ...prev, hot: val }));
  };

  const handleBlurValidation = () => {
    let coldVal = Number(thresholds.cold);
    let hotVal = Number(thresholds.hot);

    if (isNaN(coldVal)) coldVal = 10; 
    if (isNaN(hotVal)) hotVal = 25;

    if (coldVal >= hotVal) {
      coldVal = hotVal - 1;
    }

    setThresholds({ cold: coldVal, hot: hotVal });
  };

  const isInvalidRange = Number(thresholds.cold) >= Number(thresholds.hot);

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] font-sans text-gray-900 selection:bg-brand-purple/20">
      <Navbar />
      <div className="flex flex-col lg:flex-row">
        <DashboardSidebar
          isConsoleActive={showConsole}
          onToggleConsole={() => setShowConsole(!showConsole)}
          stats={data?.statistics}
          isLoading={isLoading}
          onExportBoxplot={handleExportBoxplot}
          onExportCSV={() => data?.statistics && exportToCSV(data.statistics, "SafeTemp_Stats")}
          onExportJSON={() => data?.statistics && exportToJSON(data.statistics, "SafeTemp_Stats")}
          onInsightSuccess={(text) => setCurrentInsight(text)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
          
          <AnimatePresence>
            {currentInsight && (
              <AIInsightCard
                text={currentInsight}
                onClose={() => setCurrentInsight(null)}
              />
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12 lg:mt-20">
            {/* 1. GRÁFICO DE HISTÓRICO (HERO CARD) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white p-4 sm:p-6 lg:p-8 rounded-[20px] sm:rounded-[24px] shadow-[0_8px_40px_rgba(150,47,214,0.04)] border border-brand-purple/5 flex flex-col group relative overflow-hidden">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-6 sm:mb-8 gap-3 sm:gap-0">
                <div className="w-full sm:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-40"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-brand-orange"></span>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 tracking-tight">Histórico Térmico</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium ml-5 sm:ml-6">Análise detalhada da última hora</p>
                </div>
                <div className="w-full sm:w-auto flex justify-end">
                  <ContextBar />
                </div>
              </div>

              <div className="w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[380px] -ml-1 sm:-ml-2 md:-ml-4">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={barData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ce6e46" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ce6e46" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis
                        dataKey="hour" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#A3A3A3', fontWeight: 600 }}
                        minTickGap={20} 
                        dy={10}
                      />
                      <YAxis
                        unit="°C" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#A3A3A3', fontWeight: 600 }}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '16px', 
                          border: 'none',
                          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                          padding: '10px 14px'
                        }}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      {barData.map((entry, index) =>
                        entry.isOutlier ? (
                          <ReferenceLine
                            key={`outlier-${index}`} 
                            x={entry.hour}
                            stroke="#ef4444" 
                            strokeDasharray="4 4"
                            label={{ position: 'top', value: '⚠️', fill: '#ef4444', fontSize: 12 }}
                          />
                        ) : null
                      )}
                      <Area
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#ce6e46"
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorTemp)"
                        animationDuration={1500}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.isOutlier) {
                            return <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="white" strokeWidth={2} className="animate-pulse" />;
                          }
                          return <></>;
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyChartState title="Histórico Térmico" />}
              </div>

              {hasData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100/60">
                  {/* FALLBACK APLICADO AQUI: Uso seguro das chaves e de `?? '—'` para caso falhe o acesso ao objeto */}
                  {[
                    { label: 'Pico Registrado', val: data?.statistics?.max?.toFixed(1) ?? '—', badge: '↑ Máx', color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
                    { label: 'Média', val: data?.statistics?.media?.toFixed(1) ?? '—', badge: '≈ Méd', color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
                    { label: 'Ponto Mais Baixo', val: data?.statistics?.min?.toFixed(1) ?? '—', badge: '↓ Mín', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-row sm:flex-col items-center justify-between sm:justify-center p-3 rounded-2xl transition-colors hover:bg-gray-50/50 gap-2 sm:gap-0">
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-0 sm:mb-1">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">{item.val}°</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${item.color} ${item.bg}`}>
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. DISTRIBUIÇÃO */}
            <div className="col-span-1 bg-white p-6 lg:p-8 rounded-[24px] shadow-[0_8px_40px_rgba(150,47,214,0.04)] border border-brand-purple/5 flex flex-col relative overflow-hidden">
              
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Distribuição</h3>
                  {isInvalidRange && (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md animate-pulse">
                      Faixa Inválida
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-medium mt-1">Configuração de faixas térmicas</p>
              </div>

              <div className="flex gap-3 mb-6 relative z-10">
                <div className={`flex-1 bg-blue-50/50 p-3 rounded-2xl transition-all border focus-within:bg-blue-50 ${
                  isInvalidRange ? 'border-red-400' : 'border-blue-100/50 focus-within:border-blue-300'
                }`}>
                  <label className="block text-[9px] font-black uppercase text-blue-500 tracking-widest mb-1.5">Limite Frio</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      value={thresholds.cold}
                      onChange={(e) => handleColdChange(e.target.value)}
                      onBlur={handleBlurValidation}
                      className={`w-full bg-transparent text-lg font-black outline-none ${isInvalidRange ? 'text-red-500' : 'text-gray-900'}`}
                    />
                    <span className="text-sm font-bold text-blue-300">°C</span>
                  </div>
                </div>

                <div className={`flex-1 bg-red-50/50 p-3 rounded-2xl transition-all border focus-within:bg-red-50 ${
                  isInvalidRange ? 'border-red-400' : 'border-red-100/50 focus-within:border-red-300'
                }`}>
                  <label className="block text-[9px] font-black uppercase text-red-500 tracking-widest mb-1.5">Limite Quente</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      value={thresholds.hot}
                      onChange={(e) => handleHotChange(e.target.value)}
                      onBlur={handleBlurValidation}
                      className={`w-full bg-transparent text-lg font-black outline-none ${isInvalidRange ? 'text-red-500' : 'text-gray-900'}`}
                    />
                    <span className="text-sm font-bold text-red-300">°C</span>
                  </div>
                </div>
              </div>

              {hasData && !isInvalidRange ? (
                <div className="w-full h-[220px] md:h-[240px] relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] bg-gray-50/80 rounded-full -z-10" />
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={hasData ? PIE_COLORS[index] : '#f3f4f6'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(2)}%` : '0%'} 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-4 flex-1 flex items-center justify-center">
                  {isInvalidRange ? (
                    <div className="text-center">
                      <p className="text-sm font-bold text-red-400">Ajuste as faixas</p>
                      <p className="text-xs text-gray-400 mt-1">O limite frio deve ser menor que o quente.</p>
                    </div>
                  ) : (
                    <EmptyChartState title="Distribuição por Faixa" />
                  )}
                </div>
              )}
              {data?.statistics && (
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <div className="flex-1 bg-gray-50 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Média</span>
                    <span className="text-sm font-black text-[#4b2a59]">{data?.statistics?.media?.toFixed(1) ?? '—'}°C</span>
                  </div>
                  <div className="flex-1 bg-gray-50 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Variância</span>
                    <span className="text-sm font-black text-[#ce6e46]">{data?.statistics?.variancia?.toFixed(1) ?? '—'}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. BOXPLOT */}
            <div className="col-span-1 lg:col-span-1 bg-white p-6 lg:p-8 rounded-[24px] shadow-[0_8px_40px_rgba(150,47,214,0.04)] border border-brand-purple/5 flex flex-col group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Dispersão (Boxplot)</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Análise de Outliers</p>
                </div>
                {/* FALLBACK APLICADO AQUI: Protege o classname caso totalOutliers seja avaliado sem a validação do `hasData` */}
                <div className={`p-2.5 rounded-2xl transition-colors ${(data?.statistics?.totalOutliers ?? 0) > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                  <LuShieldAlert size={20} strokeWidth={2.5} />
                </div>
              </div>

              <div className="w-full h-[240px] md:h-[280px]">
                {hasData ? (
                  <Plot
                    divId='boxplot-id'
                    data={[{
                      y: values, type: 'box', name: 'Temperatura',
                      boxpoints: 'outliers', jitter: 0.5, pointpos: -1.8,
                      marker: { color: '#ce6e46', size: 6 },
                      line: { width: 2, color: '#ce6e46' },
                      fillcolor: 'rgba(150, 47, 214, 0.05)'
                    }]}
                    layout={boxPlotLayout}
                    className="w-full h-full"
                    useResizeHandler
                  />
                ) : <EmptyChartState title="Análise de Dispersão" />}
              </div>

              {hasData && (
                <div className="mt-auto pt-6 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl group-hover:bg-brand-purple/5 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-orange">
                        <LuTarget size={16} strokeWidth={3} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Outliers detectados</span>
                    </div>
                    {/* FALLBACK APLICADO AQUI: Resolvendo problema do totalOutliers nulo */}
                    <span className={`text-xl font-black ${(data?.statistics?.totalOutliers ?? 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {data?.statistics?.totalOutliers ?? 0}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl">
                      <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Mediana</span>
                      {/* FALLBACK APLICADO AQUI */}
                      <span className="text-sm font-black text-gray-900">{data?.statistics?.mediana?.toFixed(2) ?? '—'}°C</span>
                    </div>
                    <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl">
                      <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Q3 (Topo)</span>
                      {/* FALLBACK APLICADO AQUI */}
                      <span className="text-sm font-black text-gray-900">
                        {((data?.statistics?.mediaNoOutlier ?? 0) + (data?.statistics?.desvioPadrao ?? 0)).toFixed(2)}°
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. ANÁLISE ESTATÍSTICA */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-transparent flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Indicadores de Estabilidade</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">Métricas aprofundadas da estufa</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Registros', val: data?.statistics?.totalRecords ?? 0, unit: '', icon: <LuSigma /> },
                  { label: 'Mínima', val: data?.statistics?.min ?? 0, unit: '°', icon: <LucideArrowDown /> },
                  { label: 'Máxima', val: data?.statistics?.max ?? 0, unit: '°', icon: <LucideArrowUp /> },
                  { label: 'Média (S/ Outlier)', val: data?.statistics?.mediaNoOutlier ?? 0, unit: '°C', icon: <LuThermometer /> },
                  { label: 'Desvio Padrão', val: data?.statistics?.desvioPadrao ?? 0, unit: '%', icon: <LuActivity /> },
                  { label: 'CV (S/ Outliers)', val: data?.statistics?.CVNoOutlier ?? 0, unit: '%', icon: <LuShieldCheck /> },
                  { label: 'CV (C/ Outliers)', val: data?.statistics?.CVOutlier ?? 0, unit: '%', icon: <LuFileWarning /> },
                ].map((stat, i) => (
                  <div key={i} className={`flex flex-col p-5 rounded-3xl transition-all ${hasData ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgba(150,47,214,0.06)] hover:-translate-y-1' : 'bg-white/50 border-dashed border-gray-200 opacity-60'}`}>
                    <div className="text-brand-purple mb-3 opacity-80">{stat.icon}</div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{stat.label}</span>
                    <span className="text-xl font-black text-gray-900">
                      {hasData ? stat.val.toFixed(2) : '—'}<span className="text-sm ml-0.5 text-gray-400">{stat.unit}</span>
                    </span>
                  </div>
                ))}
              </div>        
            </div>
          </div>

          {showConsole && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-x-hidden w-full">
              <SystemLogConsole />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;