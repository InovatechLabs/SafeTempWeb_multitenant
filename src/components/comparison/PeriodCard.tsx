import { LuThermometer, LuShieldAlert, LuArrowDown, LuArrowUp, LuCalendar } from 'react-icons/lu';
import type { TemperatureStatistics } from '../../types/statistics/TemperatureStatistics';

interface PeriodCardProps {
  title: string;
  date: string | undefined;
  stats: TemperatureStatistics; 
  isAlternative?: boolean; 
}

export const PeriodCard = ({ title, date, stats, isAlternative = false }: PeriodCardProps) => {
  const brandColor = isAlternative ? 'text-brand-orange' : 'text-brand-purple';
  const bgColor = isAlternative ? 'bg-brand-orange/5' : 'bg-brand-purple/5';

  return (
    <div className={`${bgColor} p-8 rounded-[2.5rem] border border-transparent hover:border-white/50 transition-all shadow-sm flex-1`}>

      <div className="flex justify-between items-start mb-6">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${brandColor} opacity-70`}>
            {title}
          </span>
          <div className="flex items-center gap-2 text-gray-800 mt-1">
            <LuCalendar size={14} className="text-gray-400" />
            <h4 className="text-lg font-black">{date}</h4>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/50 rounded-lg border border-white text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
          {stats?.totalRecords} registros
        </div>
      </div>

      <div className="h-[1px] bg-gray-200/50 w-full mb-6" />

      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        <StatItem 
          icon={<LuThermometer size={16} />} 
          value={`${stats?.media.toFixed(1)}°C`} 
          label="Média" 
          color={brandColor} 
        />
        <StatItem 
          icon={<LuShieldAlert size={16} />} 
          value={stats?.totalOutliers} 
          label="Outliers" 
          color={stats?.totalOutliers > 0 ? 'text-red-500' : 'text-green-500'} 
        />
        <StatItem 
          icon={<LuArrowDown size={16} />} 
          value={`${stats?.min.toFixed(1)}°`} 
          label="Mínima" 
          color="text-blue-500" 
        />
        <StatItem 
          icon={<LuArrowUp size={16} />} 
          value={`${stats?.max.toFixed(1)}°`} 
          label="Máxima" 
          color="text-orange-500" 
        />
      </div>
    </div>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
}

const StatItem = ({ icon, value, label, color }: StatItemProps) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 mb-1">
      <div className={`${color} opacity-80`}>{icon}</div>
      <span className="text-lg font-black text-gray-800 leading-none">{value}</span>
    </div>
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-6">{label}</span>
  </div>
);