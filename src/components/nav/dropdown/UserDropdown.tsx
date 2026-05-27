import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, ShieldCheck, LucideBell, Plus, Check, ThermometerSun, Key, X } from 'lucide-react';
import { useAuth } from '../../../contexts/auth/authContext';
import TwoFAModal from '../../twoFA/TwoFAModal'; 
import api from '../../../services/api';
import { toast } from 'sonner';
import { CreateGreenhouseModal } from './greenhouseModal/CreateGreenhouseModal';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const { user, logout, activeGreenhouse, setActiveGreenhouse } = useAuth();

  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is2FAEnabled ?? false);
  const [isWebPushEnabled] = useState(user?.hasWebPush ?? false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewTokenData, setViewTokenData] = useState<{name: string, token: string} | null>(null);
  const [pendingTokens, setPendingTokens] = useState<{name: string, token: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = JSON.parse(localStorage.getItem('@SafeTemp:pendingTokens') || '[]');
      setPendingTokens(saved);
    }
  }, [isOpen]);

  const removePendingToken = (tokenToRemove: string) => {
    const updated = pendingTokens.filter(t => t.token !== tokenToRemove);
    setPendingTokens(updated);
    localStorage.setItem('@SafeTemp:pendingTokens', JSON.stringify(updated));
  };

  const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'denied') {
        alert('Você bloqueou as notificações. Libere no cadeado ao lado da URL.');
        setIsSubscribing(false);
        return;
      }

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        await api.post('alerts/save-web-token', {
          webPushSubscription: subscription
        });

        toast.success('Tudo certo! Você receberá alertas de temperatura neste dispositivo.');
      }
    } catch (error) {
      console.error('Erro ao ativar notificações web:', error);
      toast.error('Ocorreu um erro ao tentar ativar as notificações.');
    } finally {
      setIsSubscribing(false);
    }
  };

 return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all">
            <User size={20} />
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Conta Conectada
                  </p>
                  <p className="text-sm font-black text-gray-900 truncate">
                    {user?.name || 'Usuário SafeTemp'}
                  </p>
                  <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${is2FAEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <ShieldCheck size={10} />
                    {is2FAEnabled ? '2FA ativo' : '2FA inativo'}
                  </div>
                </div>

                <div className="px-4 py-3 border-b border-gray-50 bg-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Meus Ambientes
                  </p>
                  
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {user?.greenhouses?.map((gh) => (
                      <button
                        key={gh.id}
                        onClick={() => {
                          setActiveGreenhouse(gh);
                          setIsOpen(false);
                          toast.success(`Visão alterada para ${gh.name}`);
                        }}
                        className={`flex items-center justify-between cursor-pointer px-3 py-2 text-sm rounded-lg transition-colors ${
                          activeGreenhouse?.id === gh.id 
                            ? 'bg-brand-purple/10 text-brand-purple font-bold' 
                            : 'text-gray-600 hover:bg-gray-50 font-medium'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <ThermometerSun size={14} />
                          {gh.name}
                        </span>
                        {activeGreenhouse?.id === gh.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setViewTokenData(null); // Reseta o estado para garantir que abrirá no modo de criação
                      setIsCreateModalOpen(true);
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-zinc-500 bg-transparent hover:bg-brand-purple/5 rounded-md transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Adicionar Equipamento
                  </button>
                </div>
                    
                {pendingTokens.length > 0 && (
                  <div className="px-4 py-3 border-b border-gray-50 bg-orange-50/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-2 flex items-center gap-1.5">
                      <Key size={12} /> Aguardando Ativação
                    </p>
                    <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                      {pendingTokens.map((pt) => (
                        <div key={pt.token} className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-orange-100 shadow-sm">
                          <span className="text-xs font-bold text-gray-700 truncate max-w-[90px]" title={pt.name}>
                            {pt.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                setViewTokenData(pt); // Seta a chave para visualizar
                                setIsCreateModalOpen(true); // Abre o modal
                              }}
                              className="text-[10px] font-black uppercase text-brand-orange hover:text-orange-600 transition-colors cursor-pointer"
                            >
                              Ver Chave
                            </button>
                            <div className="w-[1px] h-3 bg-gray-200"></div>
                            <button
                              onClick={() => removePendingToken(pt.token)}
                              className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remover (Já ativei)"
                            >
                               <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* ==================================================== */}

                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIs2FAModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <ShieldCheck size={18} className={is2FAEnabled ? 'text-green-500' : 'text-gray-400'} />
                    Autenticação 2FA
                  </button>
                  <button 
                    onClick={handleSubscribe} 
                    disabled={isSubscribing || isWebPushEnabled} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer text-left disabled:opacity-80 disabled:cursor-default"
                  >
                    <LucideBell 
                      size={18} 
                      className={isWebPushEnabled ? 'text-green-400' : 'text-gray-400'} 
                    />
                    {isSubscribing 
                      ? 'Ativando...' 
                      : isWebPushEnabled 
                        ? 'Alertas Ativados' 
                        : 'Ativar Alertas'
                    }
                  </button>

                  <button
                    onClick={() => { setIsOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left mt-1"
                  >
                    <LogOut size={18} />
                    Sair
                  </button>
                </div>

                <div className="p-4 bg-gray-50/30 text-center">
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                    SafeTemp v1.0 • 2026
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {is2FAModalOpen && (
          <TwoFAModal
            isOpen={is2FAModalOpen}
            onClose={() => setIs2FAModalOpen(false)}
            is2FAEnabled={is2FAEnabled}
            onStatusChange={(enabled) => setIs2FAEnabled(enabled)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateGreenhouseModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setViewTokenData(null); // Reseta o estado ao fechar
            }}
            viewData={viewTokenData} // Passa os dados (ou nulo) para o modal
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default UserDropdown;