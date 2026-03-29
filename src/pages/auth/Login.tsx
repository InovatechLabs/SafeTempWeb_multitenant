import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound, ShieldOff } from 'lucide-react';
import logost from '../../assets/logost.png';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import api, { setInMemoryToken } from '../../services/api';

interface BackendErrorResponse {
  message?: string;
  requires2FA?: boolean;
  errors?: { path: string | string[]; message: string }[];
}

type Step = 'credentials' | '2fa' | 'backup';

const Login = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code2FA, setCode2FA] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [loadingBackup, setLoadingBackup] = useState(false);

  const handleRegisterClick = () => navigate('/register');
  const handleHomeClick = () => navigate('/home');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response?.status === 206 || response?.data?.requires2FA) {
        setTempToken(response.data.tempToken);
        setStep('2fa');
        return;
      }
      toast.success('Login realizado com sucesso');
      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
      navigate('/home');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<BackendErrorResponse>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      if (status === 206 && data?.requires2FA) {
        setStep('2fa');
        setLoading(false);
        return;
      }

      const zodErrors = data?.errors;
      const backendMessage = data?.message || 'Erro ao conectar com o servidor';

      if (zodErrors && Array.isArray(zodErrors)) {
        zodErrors.forEach((error) => toast.error(`${error.path}: ${error.message}`));
      } else {
        toast.error(backendMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code2FA.length !== 6) {
      toast.error('Digite o código de 6 dígitos.');
      return;
    }
    setLoadingCode(true);
    try {
      const response = await api.post('2fa/verify-login-code', { token2FA: code2FA, ...(tempToken && { tempToken }) });
      setInMemoryToken(response.data.accessToken);
      toast.success('Login realizado com sucesso');
      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
      navigate('/home');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<BackendErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Código inválido. Tente novamente.');
      setCode2FA('');
    } finally {
      setLoadingCode(false);
    }
  };

  const handleVerifyBackupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode.trim()) {
      toast.error('Digite o código de backup.');
      return;
    }
    setLoadingBackup(true);
    try {
      await api.post('2fa/verify-backup-code', { backupCode: backupCode.trim() });
      toast.success('Login realizado com sucesso');
      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
      navigate('/home');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<BackendErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Código de backup inválido.');
      setBackupCode('');
    } finally {
      setLoadingBackup(false);
    }
  };

  const renderForm = () => {

    // ── Step: credenciais ──────────────────────────────────────────────
    if (step === 'credentials') {
      return (
        <motion.div key="credentials" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={20} />
                <input
                  type="email" placeholder="exemplo@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:bg-white transition-all font-medium text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Senha</label>
                <button type="button" tabIndex={-1} onClick={() => navigate('/recover')}
                  className="text-[11px] font-semibold text-brand-orange hover:underline cursor-pointer"
                >
                  Esqueceu?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  autoComplete='current-password'
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:bg-white transition-all font-medium text-gray-700"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-5 cursor-pointer bg-gradient-to-r from-brand-orange to-brand-orange/80 text-white font-bold rounded-2xl shadow-lg shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-wider mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center text-xs uppercase font-semibold tracking-widest bg-white px-4 text-gray-300">Ou</div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-sm font-medium text-gray-500">
              Não possui conta?{' '}
              <button className="text-brand-purple font-semibold hover:underline cursor-pointer" onClick={handleRegisterClick}>
                Criar acesso
              </button>
            </p>

            {/* ← Link para backup code */}
            <button
              onClick={() => { setBackupCode(''); setStep('backup'); }}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 hover:underline cursor-pointer transition-colors"
            >
              <KeyRound size={12} />
              Perdi acesso ao meu aplicativo autenticador
            </button>
          </div>
        </motion.div>
      );
    }

    // ── Step: 2FA ──────────────────────────────────────────────────────
    if (step === '2fa') {
      return (
        <motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 flex items-center justify-center">
              <ShieldCheck size={28} className="text-brand-purple" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">Autenticação em dois fatores</h3>
              <p className="text-sm text-gray-400 font-medium mt-1 leading-relaxed">
                Abra seu aplicativo autenticador e digite o código de 6 dígitos.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify2FA} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">
                Código do autenticador
              </label>
              <input
                type="text" inputMode="numeric" maxLength={6} placeholder="000000"
                value={code2FA} onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, ''))} autoFocus
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:bg-white transition-all font-black text-center text-2xl tracking-[0.5em] text-gray-800"
              />
            </div>

            <button type="submit" disabled={loadingCode || code2FA.length !== 6}
              className="w-full py-5 cursor-pointer bg-gradient-to-r from-brand-purple to-brand-purple/80 text-white font-bold rounded-2xl shadow-lg shadow-brand-purple/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loadingCode ? 'Verificando...' : 'Confirmar código'}
              {!loadingCode && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center text-xs uppercase font-semibold tracking-widest bg-white px-4 text-gray-300">Ou</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button onClick={() => { setStep('credentials'); setCode2FA(''); }}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer hover:underline"
              >
                ← Voltar ao login
              </button>
              <button
                onClick={() => { setBackupCode(''); setStep('backup'); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:underline cursor-pointer"
              >
                <KeyRound size={12} />
                Usar código de backup
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    // ── Step: backup code ──────────────────────────────────────────────
    if (step === 'backup') {
      return (
        <motion.div key="backup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
              <ShieldOff size={28} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">Código de backup</h3>
              <p className="text-sm text-gray-400 font-medium mt-1 leading-relaxed">
                Digite o código de backup gerado quando você ativou o 2FA.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyBackupCode} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">
                Código de backup
              </label>
              <input
                type="text" placeholder="••••••••••••" value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)} autoFocus
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:bg-white transition-all font-black text-center text-lg tracking-[0.3em] text-gray-800"
              />
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <KeyRound size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                Ao usar o código de backup, o 2FA será desativado da sua conta. Você poderá reativá-lo nas configurações.
              </p>
            </div>

            <button type="submit" disabled={loadingBackup || !backupCode.trim()}
              className="w-full py-5 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loadingBackup ? 'Verificando...' : 'Entrar com código de backup'}
              {!loadingBackup && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center text-xs uppercase font-semibold tracking-widest bg-white px-4 text-gray-300">Ou</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => { setStep('credentials'); setBackupCode(''); }}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer hover:underline"
              >
                ← Voltar ao login
              </button>
            </div>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-gray-50 font-sans">
      <div className="grid lg:grid-cols-2 min-h-screen">

        <div className="flex items-center justify-center p-8 relative overflow-hidden">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
            <div className="mb-10 flex flex-col justify-center items-center">
              <img src={logost} className="max-w-[70%] cursor-pointer hover:scale-105 transition-all duration-150" onClick={handleHomeClick} />
              <p className="text-gray-600 mt-3 text-xs tracking-[0.3em] uppercase font-jakarta font-bold">
                Sistema de monitoramento
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100">
              <AnimatePresence mode="wait">
                {renderForm()}
              </AnimatePresence>
            </div>

            <p className="text-center mt-10 text-[10px] uppercase tracking-[0.3em] text-gray-400">
              © 2026 SafeTemp
            </p>
          </motion.div>
        </div>

        <div className="hidden lg:flex items-center justify-center px-20 bg-gradient-to-br from-white to-gray-50">
          <div className="max-w-xl space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tighter">
                Sua estufa laboratorial em <span className="text-brand-orange">nuvem.</span>
              </h2>
              <p className="mt-6 text-gray-500 text-lg leading-relaxed">
                Junte-se à plataforma desenvolvida para transformar dados térmicos em inteligência científica.
                Acesse mais de 31.000 registros históricos e monitore em tempo real.
              </p>
            </motion.div>

            <ul className="space-y-6">
              {[
                'Acesso multiplataforma (Web & Mobile)',
                'Relatórios técnicos automatizados',
                'Segurança de dados ponta a ponta',
              ].map((item, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all">
                    <ArrowRight size={20} />
                  </div>
                  <span className="font-bold text-gray-700 tracking-tight">{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="pt-8 border-t border-gray-100 flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-black text-brand-purple">2026</p>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Feira de Tecnologia</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-brand-orange">99.9%</p>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Uptime Monitorado</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;