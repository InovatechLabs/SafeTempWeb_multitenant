import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, ShieldCheck, LucideBell } from 'lucide-react';
import { useAuth } from '../../../contexts/auth/authContext';
import TwoFAModal from '../../twoFA/TwoFAModal'; 
import api from '../../../services/api';
import { toast } from 'sonner';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is2FAEnabled ?? false);
  const [isWebPushEnabled] = useState(user?.hasWebPush ?? false);
  const [isSubscribing, setIsSubscribing] = useState(false);

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
                  {/* Badge de status do 2FA */}
                  <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${is2FAEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <ShieldCheck size={10} />
                    {is2FAEnabled ? '2FA ativo' : '2FA inativo'}
                  </div>
                </div>

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
    </>
  );
};

export default UserDropdown;