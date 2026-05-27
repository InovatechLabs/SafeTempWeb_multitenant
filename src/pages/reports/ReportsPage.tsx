import React, { useEffect, useState } from 'react';
import api from '../../services/api'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuFileText, LuSearch,
  LuChevronRight, LuFilter, 
  LuDownload,
  LuLoader,
  LuShare2,
  LuThermometer,
  LuActivity
} from 'react-icons/lu';
import Navbar from '../../components/nav/Navbar';
import logost from '../../assets/logost.png';
import formatToBR from '../../utils/formatters/formatDateToBR';
import ReportsHero from '../../components/reports/ReportsHero';
import ReportDataChart from '../../components/reports/ReportDataChart';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/auth/authContext';
import { useQuery } from '@tanstack/react-query';

interface Report {
  id: number;
  chip_id: string;
  data: string;
  relatorio: string;
  greenhouse: {
    name: string;
  };
  resumo: string; 
  criado_em: string;
}

const ReportsPage: React.FC = () => {
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filters, setFilters] = useState({ inicio: '', fim: '' });
  const [searchDates, setSearchDates] = useState({ inicio: '', fim: '' });
  const [isDownloading, setIsDownloading] = useState({ pdf: false, csv: false, share: false });
  const [viewMode, setViewMode] = useState<"leitura" | "graphical">(() => {
  const savedMode = localStorage.getItem("@SafeTemp:viewMode");
  return (savedMode === "graphical" || savedMode === "leitura") ? savedMode : "leitura";
});

  const {activeGreenhouse} = useAuth();
 const { data: reports = [], isLoading } = useQuery<Report[]>({
  queryKey: ['reports', activeGreenhouse?.id, filters],
  queryFn: async () => {
    const endpoint = filters.inicio && filters.fim ? 'reports/interval' : 'reports/today';
    const params = filters.inicio && filters.fim ? { inicio: filters.inicio, fim: filters.fim } : {};
    const response = await api.get(endpoint, { params });
    return response.data; 
  },
  enabled: !!activeGreenhouse?.id 
});
  const { data: dashboardData } = useDashboard(activeGreenhouse?.id);

  const record = dashboardData?.lastRecord;

useEffect(() => {
  if (reports && reports.length > 0) {
    setSelectedReport(reports[0]);
  } else {
    setSelectedReport(null);
  }
}, [reports]);

  const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setFilters({ inicio: searchDates.inicio, fim: searchDates.fim });
};

  const parseResumo = (jsonStr: string) => {
    try { return JSON.parse(jsonStr); } catch { return null; }
  };

  const handlePDFDownload = async (id: number) => {
  setIsDownloading(prev => ({ ...prev, pdf: true }));
  try {
  
    const response = await api.get(`reports/reportpdf/${id}`, { 
      responseType: 'blob' 
    });

   
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_${id}_safetemp.pdf`);
    document.body.appendChild(link);
    link.click();
    
   
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Não foi possível baixar o PDF.");
  } finally {
    setIsDownloading(prev => ({ ...prev, pdf: false }));
  }
};

const handleCSVDownload = async (id: number) => {
  setIsDownloading(prev => ({ ...prev, csv: true }));
  try {
    const response = await api.get(`data/exportcsv`, { 
      params: { type: 'relatorios', id },
      responseType: 'blob' 
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resumo_relatorio_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Erro ao exportar CSV.");
  } finally {
    setIsDownloading(prev => ({ ...prev, csv: false }));
  }
};

const handleShare = async (id: number) => {
 
  if (!navigator.share) {
    alert("Compartilhamento não suportado neste navegador. O arquivo será baixado.");
    handlePDFDownload(id);
    return;
  }

  setIsDownloading(prev => ({ ...prev, share: true }));
  try {
    const response = await api.get(`reports/reportpdf/${id}`, { responseType: 'blob' });
    const file = new File([response.data], `relatorio_${id}.pdf`, { type: 'application/pdf' });

    await navigator.share({
      title: 'Relatório SafeTemp',
      text: `Confira os dados térmicos da estufa #${id}`,
      files: [file],
    });
  } catch (error) {
    console.error("Erro ao compartilhar:", error);
  } finally {
    setIsDownloading(prev => ({ ...prev, share: false }));
  }
};

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] max-w-[100vw] overflow-x-hidden">
    <Navbar />

   <div className="flex-1 flex flex-col p-4 sm:p-8 w-full max-w-full">
      
      <div className="mb-8 mt-16 sm:mt-20 w-full">
        <ReportsHero viewMode={viewMode} setViewMode={setViewMode}/>
      </div>
      <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-start justify-center xl:justify-between w-full">
       <aside className="w-full xl:w-[380px] xl:sticky xl:top-24 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 flex flex-col shadow-xl z-10 overflow-hidden order-2 xl:order-1">
      <div className="p-5 sm:p-6 border-b border-gray-50 bg-gray-50/30">
        <h2 className="text-lg sm:text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
          <LuFilter className="text-brand-purple" /> Filtro de Relatórios
        </h2>
        
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Início</label>
              <input 
                type="date" 
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-brand-purple transition-all"
                onChange={(e) => setSearchDates({...searchDates, inicio: e.target.value})}
              />
            </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Fim</label>
                    <input
                      type="date"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-brand-purple transition-all"
                      onChange={(e) => setSearchDates({ ...searchDates, fim: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 cursor-pointer bg-brand-purple text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <LuLoader size={16} className="animate-spin" /> : <LuSearch size={16} />}
                  {isLoading ? 'Buscando...' : 'Pesquisar'}
                </button>
              </form>
            </div>

            <div className="max-h-[400px] xl:max-h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">
                {reports.length} Resultados encontrados
              </p>
              {isLoading ? (
                <div className="text-center py-10 font-bold text-gray-300 animate-pulse">Buscando...</div>
              ) : (
              reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left border
                    ${selectedReport?.id === report.id 
                      ? 'bg-brand-purple cursor-pointer text-white border-brand-purple shadow-lg scale-[1.02]' 
                      : 'bg-white cursor-pointer text-gray-600 border-gray-100 hover:border-brand-purple/30'}
                  `}
                >
                  <div className={`p-2.5 rounded-xl ${selectedReport?.id === report.id ? 'bg-white/20' : 'bg-brand-purple/10 text-brand-purple'}`}>
                    <LuFileText size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black truncate">Relatório #{report.id}</p>
                    <p className={`text-[9px] font-bold ${selectedReport?.id === report.id ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(report.data).toLocaleDateString()} às {new Date(report.data).toLocaleTimeString()}
                    </p>
                  </div>
                  <LuChevronRight size={14} />
                </button>
              ))
            )}
          </div>
        </aside>

      <main className="w-full xl:flex-1 bg-[#f8f9fc] relative order-3 xl:order-2 flex flex-col px-3 sm:px-6 xl:px-8  overflow-x-hidden">
            <AnimatePresence mode="wait">
              {selectedReport ? (
           <motion.div
  key={selectedReport.id + viewMode}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  className="w-full space-y-8"
>
                  <div className="bg-white p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-100">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-2 border-b border-gray-50 pb-6 md:pb-8">
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Visualizar Relatório</h2>
                    </div>

          {/* Logo + título */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-center mb-6">
            <img src={logost} className="max-w-[40%] sm:max-w-[20%]" alt="Logo" />
            <h1 className="text-gray-900 uppercase font-normal tracking-[0.15em] sm:tracking-[0.2em] text-center sm:text-right text-xs sm:text-sm">
              Relatório de Temperatura
            </h1>
          </div>

          {/* Metadados */}
          <div className="flex flex-col max-w-full px-2 gap-1 text-sm">
            <p><strong>ID Relatório:</strong> {selectedReport.id}</p>
            <p><strong>Gerado em:</strong> {formatToBR(selectedReport.criado_em)}</p>
            <p><strong>Ambiente:</strong> {selectedReport.greenhouse.name}</p>
          </div>

          <div className="h-[1px] bg-[#e7e7e7] mb-6 md:mb-8 mt-5" />

          {viewMode === 'leitura' ? (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-gray-900 font-bold text-lg border-l-4 md:border-l-6 border-[#4A148C] pl-2 mb-6">
                Resumo Estatístico
              </h1>

              {/* Grid de stats — 2 colunas em mobile, 4 em sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
                {[
                  { label: 'Média Geral', val: parseResumo(selectedReport.resumo)?.media.toFixed(2), unit: '°C' },
                  { label: 'Mínima',      val: parseResumo(selectedReport.resumo)?.min,              unit: '°C' },
                  { label: 'Máxima',      val: parseResumo(selectedReport.resumo)?.max,              unit: '°C' },
                  { label: 'Registros',   val: parseResumo(selectedReport.resumo)?.registros,        unit: 'un' },
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-50 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{stat.label}</p>
                    <p className="text-lg md:text-xl font-black text-brand-purple">
                      {stat.val}<span className="text-xs ml-0.5">{stat.unit}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Área do texto do relatório — mais espaçosa e legível */}
              <div className="prose prose-purple max-w-none mb-8 md:mb-10">
                <div className="whitespace-pre-wrap text-sm md:text-base text-gray-600 leading-relaxed md:leading-loose font-medium bg-gray-50/80 p-5 sm:p-7 md:p-8 rounded-2xl md:rounded-3xl border border-dashed border-gray-200 min-h-[200px]">
                  {selectedReport.relatorio}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 space-y-8">
              <h1 className="text-gray-900 font-bold text-lg border-l-4 md:border-l-6 border-brand-orange pl-2">
                Histórico de Telemetria
              </h1>
              <ReportDataChart reportId={selectedReport.id} />
            </div>
          )}

          {/* Exportação — responsiva */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 justify-between gap-4 p-4 sm:p-6 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm">
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${viewMode === 'leitura' ? 'text-brand-purple' : 'text-brand-orange'}`}>
                Gestão de Dados
              </span>
              <h3 className="text-sm font-bold text-gray-700">Exportar Resultados</h3>
            </div>

            {/* Botões — wrap em mobile para não vazar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => handlePDFDownload(selectedReport.id)}
                disabled={isDownloading.pdf}
                className="flex-1 sm:flex-none group flex items-center justify-center cursor-pointer gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-[#ff3838] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 transition-all disabled:opacity-50"
              >
                {isDownloading.pdf ? <LuLoader size={16} className="animate-spin" /> : <LuFileText size={16} />}
                <span>PDF</span>
              </button>

              <button
                onClick={() => handleCSVDownload(selectedReport.id)}
                disabled={isDownloading.csv}
                className="flex-1 sm:flex-none group flex items-center justify-center cursor-pointer gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-[#27ae60] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-green-600/20 hover:scale-105 transition-all disabled:opacity-50"
              >
                {isDownloading.csv ? <LuLoader size={16} className="animate-spin" /> : <LuDownload size={16} />}
                <span>CSV</span>
              </button>

              <button
                onClick={() => handleShare(selectedReport.id)}
                className="flex items-center cursor-pointer justify-center w-11 h-11 bg-[#3498db] text-white rounded-2xl shadow-lg hover:scale-110 transition-all shrink-0"
              >
                <LuShare2 size={18} />
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    ) : (
      <div className="h-full flex flex-col items-center justify-center text-gray-300 mt-15 p-8">
        <LuFileText size={64} className="mb-4 opacity-20" />
        <p className="font-bold text-xl text-center">Selecione um relatório para visualizar</p>
      </div>
    )}
  </AnimatePresence>
</main>
 <aside className="w-full xl:w-[320px] xl:sticky xl:top-24 h-auto space-y-6 order-1 xl:order-3">
  {/* Card 1: Status Atual */}
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl">
    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
       <LuActivity className="text-brand-orange" /> Status Atual
    </h3>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-black text-gray-800">
    {record?.value ?? "--"}°C 
  </p>
      </div>
      <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
         <LuThermometer size={24} />
      </div>
    </div>
  </div>
</aside>
    </div>
    </div>
  </div>
  );
};

export default ReportsPage;