import { LuSparkles, LuTag, LuArrowUpRight, LuArrowDownRight } from 'react-icons/lu';
import type { ComparisonResponse } from '../../types/comparison';

type SummaryType = ComparisonResponse['summary'];
type StatisticsType = ComparisonResponse['rangeA']['statistics'];
type MetricsType = ComparisonResponse['comparison']['metrics'];

interface Props {
  summary?: SummaryType;
  statisticsA?: StatisticsType;
  statisticsB?: StatisticsType;
  metrics?: MetricsType;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (val: number | undefined, decimals = 2) => {
  if (val === undefined || isNaN(val)) return '—';
  return val.toFixed(decimals);
};

const absPct = (val: number | null | undefined) => {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${Math.abs(val).toFixed(1)}%`;
};

// ─── Sub-componente: bloco de métrica individual ─────────────────────────────

interface MetricBlockProps {
  label: string;
  valB: number | undefined;
  valA: number | undefined;
  percentage: number | null | undefined;
  /** 
   * isInverse = true: queda no valor é positiva (ex: variância menor = melhor)
   * isInverse = false: queda no valor é negativa (ex: média menor pode ser ruim)
   */
  isInverse?: boolean;
}

const MetricBlock = ({ label, valB, valA, percentage, isInverse = false }: MetricBlockProps) => {
  const isDown = (percentage ?? 0) < 0;
  // isBetter: verde se a direção da mudança for "boa"
  const isBetter = isInverse ? isDown : !isDown;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '0.5px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    }}>
      <span style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.3)',
      }}>
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px' }}>
        {/* Valores: B em destaque, A riscado */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#ffffff',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {fmt(valB)}°
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.25)',
            textDecoration: 'line-through',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {fmt(valA)}°
          </span>
        </div>

        {/* Badge de variação */}
        <span style={{
          fontSize: '10px',
          fontWeight: 800,
          color: isBetter ? '#4ade80' : '#f87171',
          background: isBetter ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
          borderRadius: '6px',
          padding: '2px 7px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          whiteSpace: 'nowrap' as const,
          flexShrink: 0,
        }}>
          {isDown
            ? <LuArrowDownRight size={11} />
            : <LuArrowUpRight size={11} />
          }
          {absPct(percentage)}
        </span>
      </div>
    </div>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

const ComparisonSummaryCard = ({ summary, statisticsA, statisticsB, metrics }: Props) => {
  if (!summary) return null;

  const hasMetrics = metrics && statisticsA && statisticsB;

  return (
   <div className={`flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden transition-all hover:shadow-brand-purple/5`}>
      {/* ── Lado esquerdo: conteúdo editorial ── */}
   <div className={`flex flex-col p-6 md:p-8 border-l-[6px] ${hasMetrics ? 'lg:flex-1 lg:border-r border-slate-100' : 'w-full'}`}>

        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Sumário</h3>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {summary.tags.map((tag, i) => (
            <div key={i} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <LuTag size={10} /> #{tag}
            </div>
          ))}
        </div>

        <p className="text-lg md:text-xl font-extrabold text-slate-800 leading-tight mb-6">
          {summary.headline}
        </p>

        {/* Highlights */}
        <div className="flex-1 space-y-4 mb-8">
          {summary.highlights.map((highlight, i) => (
            <div key={i} className="flex items-start gap-3 group">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-purple shrink-0 group-hover:scale-150 transition-transform" />
              <p className="text-sm md:text-md text-slate-600 font-medium leading-relaxed">{highlight}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
           <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
          <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl">
            <LuSparkles size={18} className="animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-brand-purple italic opacity-80">
            Análise gerada pelo sistema SafeTemp
          </span>
        </div>
      </div>

      {/* ── Lado direito: painel de métricas-chave ── */}
       {hasMetrics && (
 <div style={{ background: '#11111b' }}
      className="w-full lg:w-[320px] lg:flex-shrink-0 p-5 md:p-6 flex flex-col gap-2 rounded-b-[1.5rem] lg:rounded-b-none lg:rounded-r-[2.5rem]"
    >
          {/* Header do painel */}
          <div style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
            paddingBottom: '10px', borderBottom: '0.5px solid rgba(255,255,255,0.07)',
            marginBottom: '2px',
          }}>
            Métricas-chave
          </div>

          <MetricBlock
            label="Média térmica"
            valB={statisticsB.media}
            valA={statisticsA.media}
            percentage={metrics.media.percentage}
            isInverse={false}
          />

          <MetricBlock
            label="Variância"
            valB={statisticsB.variancia}
            valA={statisticsA.variancia}
            percentage={metrics.variancia.percentage}
            isInverse={true}
          />

          <MetricBlock
            label="Desvio padrão"
            valB={statisticsB.desvioPadrao}
            valA={statisticsA.desvioPadrao}
            percentage={metrics.desvioPadrao.percentage}
            isInverse={true}
          />

          {/* Divisor visual */}
          <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '2px 0' }} />

          <MetricBlock
            label="Amplitude"
            valB={statisticsB.max - statisticsB.min}
            valA={statisticsA.max - statisticsA.min}
            percentage={metrics.amplitude.percentage}
            isInverse={true}
          />

          <MetricBlock
            label="Mediana"
            valB={statisticsB.mediana}
            valA={statisticsA.mediana}
            percentage={metrics.mediana.percentage}
            isInverse={false}
          />
        </div>
      )}
    </div>
  );
};

export default ComparisonSummaryCard;
