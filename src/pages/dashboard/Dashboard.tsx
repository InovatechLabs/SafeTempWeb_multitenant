import React from 'react';
import Navbar from '../../components/nav/Navbar';
import {
  LuLightbulb, LuActivity, LuShieldCheck, LuThermometer,
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

const Plot = createPlotlyComponent(Plotly);

const PIE_COLORS = ['#32c5ff', '#4b2a59', '#ff4343'];

const EmptyChartState = ({ title }: { title: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl p-10">
    <div className="p-4 bg-gray-50 rounded-full mb-4">
      <LuDatabaseBackup size={50} className="text-gray-200" />
    </div>
    <p className="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-1">{title}</p>
    <p className="text-xs font-medium text-gray-400 text-center">Aguardando sincronização com a nuvem...</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { data, isLoading, isError } = useHistory();
  const [thresholds, setThresholds] = React.useState({ cold: 20, hot: 25 });
  const [currentInsight, setCurrentInsight] = React.useState<string | null>(null);
  const [showConsole, setShowConsole] = React.useState(false);

  if (isLoading) return <div className="p-10 text-center font-bold">Carregando...</div>;
  if (isError || !data?.records) return <div className="p-10 text-center text-red-500">Erro.</div>;

  const records = data?.records ?? [];
  const total = records.length;
  const hasData = total > 0;

  const coldCount = records.filter(r => r.value < thresholds.cold).length;
  const hotCount = records.filter(r => r.value > thresholds.hot).length;
  const normalCount = records.filter(r => r.value >= thresholds.cold && r.value <= thresholds.hot).length;

  const pieData = hasData ? [
    { name: `Frio (<${thresholds.cold}°C)`, value: (coldCount / total) * 100 },
    { name: `Normal (${thresholds.cold}-${thresholds.hot}°C)`, value: (normalCount / total) * 100 },
    { name: `Quente (>${thresholds.hot}°C)`, value: (hotCount / total) * 100 },
  ] : [{ name: 'Sem Dados', value: 100 }];

  const values = records.map(r => r.value);
  const barData = records.map((record) => ({
    hour: formatTimeBRT(record.timestamp),
    temp: record.value,
    isOutlier: data?.statistics?.outliers.includes(record.value)
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

  return (
    <div className="min-h-screen w-full bg-[#f7f8fc] font-sans">
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

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence>
            {currentInsight && (
              <AIInsightCard
                text={currentInsight}
                onClose={() => setCurrentInsight(null)}
              />
            )}
          </AnimatePresence>

          {/* Grid principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-20">

            {/* Gráfico de histórico — largura total em todas as telas */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white p-4 md:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-50 flex flex-col group">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                    <h3 className="text-lg md:text-xl font-black text-[#333333] tracking-wide">Histórico</h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 font-medium">Análise térmica detalhada da última hora</p>
                </div>
                <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-full border border-gray-100 uppercase tracking-widest hidden sm:inline">
                  SafeTemp Cloud
                </span>
              </div>

              <div className="w-full h-[280px] md:h-[340px] lg:h-[400px] -ml-2 md:-ml-4">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ce6e46" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ce6e46" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis
                        dataKey="hour" axisLine={false} tickLine={false}
                        tick={{ fontSize: 11, fill: '#A3A3A3', fontWeight: 600 }}
                        minTickGap={40} dy={10}
                      />
                      <YAxis
                        unit="°C" axisLine={false} tickLine={false}
                        tick={{ fontSize: 11, fill: '#A3A3A3', fontWeight: 600 }}
                        width={45}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '20px', border: 'none',
                          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                          padding: '12px 16px'
                        }}
                      />
                      {barData.map((entry, index) =>
                        entry.isOutlier ? (
                          <ReferenceLine
                            key={`outlier-${index}`} x={entry.hour}
                            stroke="#ef4444" strokeDasharray="4 4"
                            label={{ position: 'top', value: '⚠️', fill: '#ef4444', fontSize: 14 }}
                          />
                        ) : null
                      )}
                      <Area
                        type="monotone" dataKey="temp" stroke="#ce6e46"
                        strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)"
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
                <div className="grid grid-cols-3 gap-2 mt-4 md:mt-6 pt-6 md:pt-8 border-t border-gray-200">
                  {[
                    { label: 'Pico Registrado', val: data?.statistics.max.toFixed(1), badge: '↑ Máx', color: 'text-red-400' },
                    { label: 'Ponto Mais Baixo', val: data?.statistics.min.toFixed(1), badge: '↓ Mín', color: 'text-blue-400' },
                    { label: 'Média', val: data?.statistics.media.toFixed(1), badge: '↓ Média', color: 'text-blue-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-[0.1em] md:tracking-[0.15em] mb-1 text-center">{item.label}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg md:text-2xl font-black text-[#333333]">{item.val}°</span>
                        <span className={`text-[10px] md:text-xs font-bold ${item.color} hidden sm:inline`}>{item.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card de distribuição de temperatura com inputs */}
            <div className="col-span-1 bg-white p-4 md:p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col">
              <div className="flex justify-between items-start mb-4 md:mb-5">
                <div>
                  <h3 className="text-base md:text-[1.1rem] font-semibold text-[#333333]">Distribuição de Temperatura</h3>
                  <p className="text-xs text-[#8a8a8a] mt-1">Faixas personalizadas</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Limite Frio</label>
                  <input
                    type="number" value={thresholds.cold}
                    onChange={(e) => setThresholds({ ...thresholds, cold: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-red-500 tracking-wider">Limite Quente</label>
                  <input
                    type="number" value={thresholds.hot}
                    onChange={(e) => setThresholds({ ...thresholds, hot: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold outline-none focus:border-red-400"
                  />
                </div>
              </div>

              {hasData ? (
                <div className="w-full h-[200px] md:h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={hasData ? PIE_COLORS[index] : '#f3f4f6'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(2)}%` : '0%'} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="mt-4 flex-1"><EmptyChartState title="Distribuição por Faixa" /></div>}

              {data?.statistics && (
                <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                  <div className="flex-1 bg-gray-50 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Média</span>
                    <span className="text-sm font-black text-[#4b2a59]">{data.statistics.media.toFixed(1)}°C</span>
                  </div>
                  <div className="flex-1 bg-gray-50 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Variação</span>
                    <span className="text-sm font-black text-[#ce6e46]">{data.statistics.variancia.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Boxplot */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-white p-4 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-50 flex flex-col group">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#333333] tracking-tight">Distribuição e Outliers</h3>
                  <p className="text-xs text-gray-400 font-medium">Análise de dispersão (Boxplot)</p>
                </div>
                <div className={`p-2 rounded-xl ${data?.statistics.totalOutliers > 0 ? 'bg-red-50 text-red-400' : 'bg-green-50 text-green-400'}`}>
                  <LuShieldAlert size={20} />
                </div>
              </div>

              <div className="w-full h-[280px] md:h-[360px] lg:h-[400px]">
                {hasData ? (
                  <Plot
                    divId='boxplot-id'
                    data={[{
                      y: values, type: 'box', name: 'Temperatura',
                      boxpoints: 'outliers', jitter: 0.5, pointpos: -1.8,
                      marker: { color: '#ce6e46', size: 6 },
                      line: { width: 2 },
                      fillcolor: 'rgba(206, 110, 70, 0.1)'
                    }]}
                    layout={boxPlotLayout}
                    className="w-full h-full"
                    useResizeHandler
                  />
                ) : <EmptyChartState title="Análise de Dispersão" />}
              </div>

              {hasData && (
                <div className="mt-4 md:mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:shadow-lg transition-all duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-[#ce6e46]">
                        <LuTarget size={16} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Outliers</span>
                    </div>
                    <span className={`text-lg font-black ${data?.statistics.totalOutliers > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {data?.statistics.totalOutliers}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mediana</span>
                      <span className="text-md font-black text-[#333333]">{data?.statistics.mediana.toFixed(2)}°C</span>
                    </div>
                    <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Q3 (Topo)</span>
                      <span className="text-md font-black text-[#333333]">
                        {(data?.statistics.mediaNoOutlier + data?.statistics.desvioPadrao).toFixed(2)}°
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Análise Estatística — largura total */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white p-4 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#333333] tracking-tight">Análise Estatística</h3>
                  <p className="text-xs md:text-sm text-gray-400 font-medium">Indicadores de estabilidade</p>
                </div>
                <div className="px-3 md:px-4 py-2 bg-[#ce6e46]/10 rounded-full text-[#ce6e46] text-[10px] md:text-xs font-bold uppercase tracking-widest hidden sm:block">
                  SafeTemp Analytics
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {[
                  { label: 'Total de Registros', val: data?.statistics?.totalRecords ?? 0, unit: '', icon: <LuSigma /> },
                  { label: 'Mínima Registrada', val: data?.statistics?.min ?? 0, unit: '', icon: <LucideArrowDown /> },
                  { label: 'Máxima Registrada', val: data?.statistics?.max ?? 0, unit: '', icon: <LucideArrowUp /> },
                  { label: 'Média Estabilizada', val: data?.statistics?.mediaNoOutlier ?? 0, unit: '°C', icon: <LuThermometer /> },
                  { label: 'Desvio Padrão', val: data?.statistics?.desvioPadrao ?? 0, unit: '%', icon: <LuActivity /> },
                  { label: 'CV sem Outliers', val: data?.statistics?.CVNoOutlier ?? 0, unit: '%', icon: <LuShieldCheck /> },
                  { label: 'CV com Outliers', val: data?.statistics?.CVOutlier ?? 0, unit: '%', icon: <LuFileWarning /> },
                ].map((stat, i) => (
                  <div key={i} className={`p-3 md:p-4 rounded-2xl border ${hasData ? 'bg-gray-50 border-transparent' : 'bg-white border-dashed border-gray-100 opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-[#ce6e46] shrink-0">{stat.icon}</div>
                      <div>
                        <span className="block text-base md:text-lg font-black text-gray-800">
                          {hasData ? stat.val.toFixed(2) : '—'}<span className="text-xs ml-0.5">{stat.unit}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{stat.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-br from-[#4b2a59] to-[#2d1936] rounded-3xl text-white relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-[#ce6e46]/20 transition-all duration-500" />
                <div className="relative z-10 flex gap-4 md:gap-5">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <LuLightbulb className="text-[#ce6e46]" size={22} />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h4 className="font-bold text-base md:text-lg">Guia de Interpretação Científica</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 text-xs text-purple-100/80 leading-relaxed font-medium">
                      <p>
                        <strong className="text-white block mb-1 uppercase tracking-widest text-[10px]">Coeficiente de Variação</strong>
                        Define a precisão relativa. Valores baixos indicam um ambiente laboratorial controlado e estável.
                      </p>
                      <p>
                        <strong className="text-white block mb-1 uppercase tracking-widest text-[10px]">Outliers & Variância</strong>
                        Pontos fora do padrão podem indicar falhas no hardware ou aberturas acidentais da estufa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          {showConsole && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SystemLogConsole />
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;