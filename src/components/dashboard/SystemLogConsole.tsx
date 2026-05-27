import { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, ChevronRight, HelpCircle, Cpu } from 'lucide-react';
import { useSystemLogs } from '../../hooks/useSystemStatus';
import api from '../../services/api'; 
import { commandGuide } from './systemLog/helpCommands';
import { AxiosError } from 'axios';
import type BackendErrorResponse from '../../types/axios';
import type { SystemLog } from '../../types/systemLogs';
import { useAuth } from '../../contexts/auth/authContext';

const SystemLogConsole = () => {

  const { activeGreenhouse } = useAuth();
  const CHIP_ID = activeGreenhouse?.devices?.[0]?.mac_address;

  const { logs: sseLogs, isConnected: isSSEConected, status: sseStatus, clearLogs } = useSystemLogs(activeGreenhouse?.id);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [isHelpVisible, setIsHelpVisible] = useState(true);
  const [localLogs, setLocalLogs] = useState<SystemLog[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCursorLeft = (text: string): number => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    ctx.font = '16px monospace'; 
    return ctx.measureText(text).width;
  };

  const statusConfig = {
    connecting: {
      color: 'text-zinc-600',
      message: '[SYSTEM] ESTABLISHING CLOUD LINK...',
      indicator: 'bg-zinc-600 animate-pulse'
    },
    connected: {
      color: 'text-emerald-500',
      message: '[SYSTEM] DASHBOARD SYNC SUCCESSFUL',
      indicator: 'bg-green-500 animate-pulse'
    },
    error: {
      color: 'text-red-500',
      message: '[SYSTEM] CONNECTION FAILED - RETRYING',
      indicator: 'bg-red-500'
    }
  };

  const currentUI = statusConfig[sseStatus];

  // 2. O Polling agora depende de ter um CHIP_ID válido
  useEffect(() => {
    if (!CHIP_ID) return;

    const checkStatus = async () => {
      try {
        const { data } = await api.get('device/connected');
        setIsDeviceOnline(data.connected.includes(CHIP_ID));
      } catch (e) {
        setIsDeviceOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [CHIP_ID]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommandInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommandInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput("");
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [sseLogs, localLogs]);

const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd || !CHIP_ID) return;

    if (['clear', 'cls', 'sys:clear', 'sys:cls'].includes(cmd)) {
      clearLogs();      
      setLocalLogs([]); 
      setCommandInput("");
      return;
    }

    // Interceptador de segurança para o Restart
    if (cmd === 'restart') {
      const confirmed = window.confirm("ATENÇÃO: O equipamento será reiniciado remotamente e ficará offline por alguns segundos. Deseja continuar?");
      if (!confirmed) return;
    }

    setHistory(prev => [cmd, ...prev.filter(c => c !== cmd)].slice(0, 20));
    setHistoryIndex(-1);
    setCommandInput("");

    try {
      await api.post(`device/${CHIP_ID}/command`, { command: cmd }, {
        headers: { 'x-greenhouse-id': activeGreenhouse?.id }
      });

    } catch (error: unknown) {
      const axiosError = error as AxiosError<BackendErrorResponse>;
      const errorMsg = axiosError.response?.data?.message || "Falha na comunicação com o servidor.";

      const errorLog: SystemLog = {
        id: Date.now(),
        chipId: CHIP_ID as string, 
        level: 'ERROR',
        message: `[SISTEMA] ${errorMsg}`, 
        timestamp: new Date().toISOString()
      };

      // Adiciona apenas o erro na tela, se houver
      setLocalLogs(prev => [errorLog, ...prev].slice(0, 10));
    }
  };

  if (!CHIP_ID) {
    return (
      <div className={`bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(75,42,89,0.15)] border border-brand-purple/10 flex flex-col items-center justify-center h-auto lg:h-[650px] transition-all w-full mt-4`}>
         <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-6">
           <Cpu size={32} />
         </div>
         <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Nenhum hardware vinculado</h3>
         <p className="text-sm text-gray-500 font-medium text-center max-w-md leading-relaxed">
           Este ambiente ainda não possui um equipamento ESP32 ativo para receber comandos remotos. Adicione um equipamento no menu da sua conta para habilitar o Terminal.
         </p>
      </div>
    );
  }

  const isSystemFullyOperational = isSSEConected && isDeviceOnline;
  const allLogs = [...localLogs, ...sseLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50);

  return (
    <div className={`bg-white rounded-[2.5rem] max-w-full p-6 mt-4 sm:p-8 shadow-[0_10px_40px_rgba(75,42,89,0.15)] w-full border border-brand-purple/10 flex flex-col h-auto lg:h-[650px] transition-all duration-500 overflow-x-hidden ${isHelpVisible ? 'max-w-[950px]' : 'max-w-[700px]'}`}>
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-brand-purple/10 p-2 rounded-xl text-brand-purple">
            <Terminal size={18} />
          </div>
          <div>
            <span className="text-[14px] font-black uppercase tracking-widest text-gray-900 block leading-none">
              SafeTemp Cloud
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isSystemFullyOperational ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                {isSystemFullyOperational ? 'Conexão estabelecida' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsHelpVisible(!isHelpVisible)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all border ${isHelpVisible ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
          >
            <HelpCircle size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Comandos</span>
          </button>
          <Activity size={18} className="text-gray-300" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        <div 
          className={`${isHelpVisible ? 'flex-[2]' : 'flex-1'} bg-zinc-950 p-6 font-mono text-[11px] overflow-hidden flex flex-col shadow-2xl border border-zinc-800 cursor-text min-h-[400px] lg:min-h-0 transition-all duration-500`}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="border-b border-zinc-900 pb-3 mb-4 shrink-0 flex justify-between items-start">
            <div>
              <p className={`${currentUI.color} font-bold tracking-tight transition-colors duration-500`}>
                  {currentUI.message}
              </p>
              <p className="text-zinc-600 text-[9px] mt-0.5">DEVICE_ID: {CHIP_ID}</p>
            </div>
            <span className="text-zinc-800 text-[8px] font-bold">ST-V3.0</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar-dark space-y-2 mb-4 pr-2">
            {allLogs.map((log, index) => (
              <div key={log.id || index} className="leading-relaxed animate-in fade-in duration-500">
                <span className="text-zinc-600 mr-2 text-[12px]">
                  {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour12: false })}
                </span>
                <span className={`font-bold mr-2 text-[12px] ${
                  log.level === 'ERROR' ? 'text-red-500' : 
                  log.level === 'WARN' ? 'text-yellow-500' : 'text-blue-400'
                }`}>
                  {log.level}:
                </span>
                <span className={log.level === 'ERROR' ? 'text-red-400/80 text-[12px]' : 'text-zinc-400 text-[12px]'}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-zinc-900 pt-3 shrink-0">
            <form onSubmit={handleCommand} className="flex items-center gap-1 group relative">
              <span className="text-white font-bold flex items-center shrink-0">
                <ChevronRight size={16} className="mr-0.5" />
              </span>
              <div className="relative flex-1 flex items-center min-w-0">
                <input 
                  ref={inputRef}
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)} 
                  onBlur={() => setIsFocused(false)}
                  autoFocus
                  style={{ fontSize: '16px'}}
                  className="w-full bg-transparent outline-none border-none focus:ring-0 p-0 text-zinc-200 caret-transparent"
                  spellCheck="false"
                  autoComplete="off"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div 
                className={`h-[2px] bg-white absolute pointer-events-none transition-all duration-75 
                    ${isFocused ? 'animate-terminal-cursor' : 'opacity-100'}`}
                  style={{
                    left: `${getCursorLeft(commandInput)}px`, 
                    width: '8px',
                    bottom: '4.2px'
                  }}
                />
              </div>
            </form>
          </div>
        </div>

        {isHelpVisible && (
          <div className="w-full lg:w-64 shrink-0 overflow-y-auto pr-2 border-l border-gray-50 lg:pl-6 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
              {commandGuide.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <cat.icon size={11} className="text-gray-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      {cat.category}
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {cat.commands.map((cmd) => (
                      <li 
                        key={cmd.code} 
                        className="group cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors" 
                        onClick={() => setCommandInput(cmd.code)}
                      >
                        <p className="text-[9px] font-mono font-bold text-brand-purple leading-none mb-1 group-hover:underline">
                          {cmd.code}
                        </p>
                        <p className="text-[9px] text-gray-400 font-medium leading-tight">
                          {cmd.desc}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogConsole;