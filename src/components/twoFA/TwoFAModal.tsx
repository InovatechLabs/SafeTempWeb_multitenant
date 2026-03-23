import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ShieldOff, KeyRound, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api'; 
import { AxiosError } from 'axios';
import type BackendErrorResponse from '../../types/axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  is2FAEnabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

type Step = 'overview' | 'qr' | 'verify' | 'success' | 'disable';

const TwoFAModal = ({ isOpen, onClose, is2FAEnabled, onStatusChange }: Props) => {
  const [step, setStep] = useState<Step>('overview');
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [backupFromServer, setBackupFromServer] = useState('');

  // Reseta o estado ao abrir/fechar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('overview');
        setQrUrl('');
        setSecret('');
        setBackupCode('');
        setCode('');
        setShowBackup(false);
        setBackupFromServer('');
      }, 300);
    }
  }, [isOpen]);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Etapa 1: solicitar QR code
  const handleEnable = async () => {
    setLoading(true);
    try {
      const res = await api.post('2fa/enable-2fa');
      setQrUrl(res.data.otpauth_url);
      setSecret(res.data.secret);
      setBackupCode(res.data.backupCode);
      setStep('qr');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<BackendErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Erro ao iniciar configuração do 2FA.');
    } finally {
      setLoading(false);
    }
  };

  // Etapa 2: verificar código e ativar
  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Digite o código de 6 dígitos do autenticador.');
      return;
    }
    setLoading(true);
    try {
      await api.post('2fa/verify-2fa', { token2FA: code });
      onStatusChange(true);
      setStep('success');
      toast.success('2FA ativado com sucesso!');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<BackendErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Desativar 2FA
  const handleDisable = async () => {
    if (code.length !== 6) {
      toast.error('Digite o código de 6 dígitos para confirmar.');
      return;
    }
    setLoading(true);
    try {
      await api.patch('2fa/disable-2fa', { token2FA: code });
      onStatusChange(false);
      toast.success('2FA desativado.');
      onClose();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<BackendErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar backup code de quem já tem 2FA ativo
  const handleGetBackupCode = async () => {
    setLoading(true);
    try {
      const res = await api.get('2fa/get-backup-code');
      setBackupFromServer(res.data.backupCode);
    } catch (err: unknown) {
        const axiosError = err as AxiosError<BackendErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Erro ao buscar código de backup.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    // ── Overview: 2FA desativado ─────────────────────────────────────────
    if (step === 'overview' && !is2FAEnabled) {
      return (
        <motion.div key="overview-off" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ShieldOff size={32} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">2FA desativado</h3>
              <p className="text-sm text-gray-400 font-medium mt-1 leading-relaxed">
                Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador.
              </p>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-brand-purple/5 rounded-2xl border border-brand-purple/10">
            {['Instale o Google Authenticator ou Authy', 'Escaneie o QR Code que será gerado', 'Digite o código de 6 dígitos para confirmar'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-purple/20 text-brand-purple text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-xs font-medium text-gray-600">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full py-4 bg-brand-purple text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} />
            {loading ? 'Gerando QR Code...' : 'Ativar autenticação 2FA'}
          </button>
        </motion.div>
      );
    }

    // ── Overview: 2FA ativado ────────────────────────────────────────────
    if (step === 'overview' && is2FAEnabled) {
      return (
        <motion.div key="overview-on" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
              <ShieldCheck size={32} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">2FA ativado</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">
                Sua conta está protegida com autenticação em dois fatores.
              </p>
            </div>
          </div>

          {/* Backup code */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={14} className="text-amber-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Código de backup</span>
              </div>
              <button onClick={() => setShowBackup(!showBackup)} className="text-amber-600 cursor-pointer">
                {showBackup ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {!backupFromServer ? (
              <button
                onClick={handleGetBackupCode}
                disabled={loading}
                className="w-full py-2 text-xs font-black text-amber-700 bg-amber-100 rounded-xl hover:bg-amber-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Revelar código de backup'}
              </button>
            ) : (
              <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
                <span className="text-sm font-black text-gray-700 tracking-widest font-mono">
                  {showBackup ? backupFromServer : '••••••••••••'}
                </span>
                <button onClick={() => handleCopy(backupFromServer)} className="text-amber-600 hover:text-amber-800 cursor-pointer transition-colors">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}
            <p className="text-[10px] text-amber-600 font-medium leading-relaxed">
              Guarde este código em local seguro. Ele permite recuperar o acesso caso perca o autenticador.
            </p>
          </div>

          <button
            onClick={() => { setCode(''); setStep('disable'); }}
            className="w-full py-4 bg-red-50 text-red-500 border border-red-100 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-100 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldOff size={16} />
            Desativar 2FA
          </button>
        </motion.div>
      );
    }

    // ── QR Code ──────────────────────────────────────────────────────────
    if (step === 'qr') {
      return (
        <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-gray-800">Escaneie o QR Code</h3>
            <p className="text-sm text-gray-400 font-medium">Abra seu aplicativo autenticador e escaneie o código abaixo.</p>
          </div>

          {/* QR Code via Google Charts API */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}`}
                alt="QR Code 2FA"
                className="w-44 h-44"
              />
            </div>
          </div>

          {/* Secret manual */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Ou insira manualmente</p>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <span className="text-xs font-black text-gray-600 tracking-widest font-mono break-all">{secret}</span>
              <button onClick={() => handleCopy(secret)} className="ml-3 text-gray-400 hover:text-brand-purple transition-colors cursor-pointer shrink-0">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => { setCode(''); setStep('verify'); }}
            className="w-full py-4 bg-brand-purple text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Já escaniei → Confirmar código
          </button>
        </motion.div>
      );
    }

    // ── Verificar código ─────────────────────────────────────────────────
    if (step === 'verify') {
      return (
        <motion.div key="verify" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-gray-800">Confirme o código</h3>
            <p className="text-sm text-gray-400 font-medium">Digite o código de 6 dígitos gerado pelo seu autenticador.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">Código do autenticador</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:bg-white transition-all font-black text-center text-2xl tracking-[0.5em] text-gray-800"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('qr')}
              className="flex-1 py-4 bg-gray-50 text-gray-500 border border-gray-100 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all cursor-pointer"
            >
              Voltar
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="flex-1 py-4 bg-brand-purple text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Verificando...' : 'Ativar 2FA'}
            </button>
          </div>
        </motion.div>
      );
    }

    // ── Sucesso ──────────────────────────────────────────────────────────
    if (step === 'success') {
      return (
        <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
              <ShieldCheck size={32} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">2FA ativado!</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">Sua conta agora está protegida com autenticação em dois fatores.</p>
            </div>
          </div>

          {/* Backup code — exibido uma única vez */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound size={14} className="text-amber-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Guarde seu código de backup</span>
            </div>
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
              <span className="text-sm font-black text-gray-700 tracking-widest font-mono">{backupCode}</span>
              <button onClick={() => handleCopy(backupCode)} className="text-amber-600 hover:text-amber-800 cursor-pointer transition-colors">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-amber-600 font-medium leading-relaxed">
              Este código só é exibido uma vez. Salve-o agora em local seguro — ele permite recuperar o acesso caso perca o autenticador.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-brand-purple text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all cursor-pointer"
          >
            Concluir
          </button>
        </motion.div>
      );
    }

    // ── Desativar ────────────────────────────────────────────────────────
    if (step === 'disable') {
      return (
        <motion.div key="disable" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-gray-800">Desativar 2FA</h3>
            <p className="text-sm text-gray-400 font-medium">Digite o código do seu autenticador para confirmar a desativação.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">Código do autenticador</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:bg-white transition-all font-black text-center text-2xl tracking-[0.5em] text-gray-800"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('overview')}
              className="flex-1 py-4 bg-gray-50 text-gray-500 border border-gray-100 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleDisable}
              disabled={loading || code.length !== 6}
              className="flex-1 py-4 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Desativando...' : 'Desativar'}
            </button>
          </div>
        </motion.div>
      );
    }
  };

  return (
  <motion.div
   drag
  dragMomentum={false}
  dragElastic={0}
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className="absolute right-0 top-1 w-96 bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 overflow-hidden z-[110]"
    onClick={(e) => e.stopPropagation()}
  >
    <div
  className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-50 cursor-grab active:cursor-grabbing select-none"
>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-brand-purple/10 flex items-center justify-center">
          <ShieldCheck size={16} className="text-brand-purple" />
        </div>
        <span className="text-sm font-black text-gray-800 uppercase tracking-widest">Autenticação 2FA</span>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
        <X size={20} />
      </button>
    </div>

    <div className="px-8 py-6">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  </motion.div>
);
};

export default TwoFAModal;