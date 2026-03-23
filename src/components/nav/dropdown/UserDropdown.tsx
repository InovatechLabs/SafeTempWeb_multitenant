import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../contexts/auth/authContext';
import TwoFAModal from '../../twoFA/TwoFAModal'; 

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is2FAEnabled ?? false);

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
                    onClick={() => { setIsOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left mt-1"
                  >
                    <LogOut size={18} />
                    Sair da conta
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

      {/* Modal de 2FA — fora do dropdown para não herdar o z-index */}
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