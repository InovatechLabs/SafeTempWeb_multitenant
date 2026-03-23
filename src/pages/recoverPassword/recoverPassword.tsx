import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import logost from '../../assets/logost.png';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../services/api';
import { AxiosError } from 'axios';
import type BackendErrorResponse from '../../types/axios';

const RecoverPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Etapa 1 — solicitar e-mail
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // Etapa 2 — redefinir senha (vem pelo link com token)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

const handleRequestEmail = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoadingEmail(true);
  try {
    await api.post(`recover/request`, { email });
    setEmailSent(true);
  } catch (err: unknown) {
    const axiosError = err as AxiosError<BackendErrorResponse>;
    toast.error(axiosError.response?.data?.message || 'Erro ao solicitar recuperação.');
  } finally {
    setLoadingEmail(false);
  }
};

const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  if (newPassword !== confirmPassword) {
    toast.error('As senhas não coincidem.');
    return;
  }
  if (newPassword.length < 6) {
    toast.error('A senha deve ter pelo menos 6 caracteres.');
    return;
  }
  setLoadingReset(true);
  try {
    await api.post(`recover/reset`, { token, newPassword });
    setResetDone(true);
    toast.success('Senha redefinida com sucesso!');
    setTimeout(() => navigate('/login'), 3000);
  } catch (err: unknown) {
    const axiosError = err as AxiosError<BackendErrorResponse>;
    toast.error(axiosError.response?.data?.message || 'Token inválido ou expirado.');
  } finally {
    setLoadingReset(false);
  }
};

  const renderLeftContent = () => {

    if (token) {
      if (resetDone) {
        return (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Senha redefinida!</h2>
            <p className="text-sm text-gray-400 font-medium">
              Você será redirecionado para o login em instantes...
            </p>
          </motion.div>
        );
      }

      return (
        <motion.div key="reset" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <KeyRound size={12} /> Nova senha
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-tight">
              Redefina sua <span className="text-brand-purple">senha</span>
            </h2>
            <p className="text-sm text-gray-400 font-medium mt-2">
              Escolha uma senha segura para proteger sua conta.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">
                Nova senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:bg-white transition-all font-medium text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">
                Confirmar senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={20} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:bg-white transition-all font-medium text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-[11px] font-semibold ml-1 ${newPassword === confirmPassword ? 'text-green-500' : 'text-red-400'}`}>
                  {newPassword === confirmPassword ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loadingReset}
              className="w-full py-5 cursor-pointer bg-gradient-to-r from-brand-purple to-brand-purple/80 text-white font-bold rounded-2xl shadow-lg shadow-brand-purple/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-wider mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loadingReset ? 'Salvando...' : 'Redefinir senha'}
              {!loadingReset && <ArrowRight size={18} />}
            </button>
          </form>
        </motion.div>
      );
    }

    if (emailSent) {
      return (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
            <Mail size={32} className="text-brand-purple" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Verifique seu e-mail</h2>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            Se o endereço <span className="font-bold text-gray-600">{email}</span> estiver cadastrado,
            você receberá um link de recuperação em instantes.
          </p>
          <p className="text-[11px] text-gray-300 uppercase tracking-widest font-bold mt-2">
            O link expira em 15 minutos
          </p>
          <button
            onClick={() => setEmailSent(false)}
            className="mt-4 text-xs font-semibold text-brand-purple hover:underline cursor-pointer"
          >
            Usar outro e-mail
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div key="request" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={12} /> Recuperação de acesso
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-tight">
            Esqueceu sua <span className="text-brand-orange">senha?</span>
          </h2>
          <p className="text-sm text-gray-400 font-medium mt-2">
            Informe o e-mail cadastrado e enviaremos um link para redefinição.
          </p>
        </div>

        <form onSubmit={handleRequestEmail} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">
              E-mail
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={20} />
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:bg-white transition-all font-medium text-gray-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingEmail}
            className="w-full py-5 cursor-pointer bg-gradient-to-r from-brand-orange to-brand-orange/80 text-white font-bold rounded-2xl shadow-lg shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loadingEmail ? 'Enviando...' : 'Enviar link de recuperação'}
            {!loadingEmail && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-semibold tracking-widest bg-white px-4 text-gray-300">
            Ou
          </div>
        </div>

        <p className="text-center text-sm font-medium text-gray-500">
          Lembrou a senha?{' '}
          <button
            className="text-brand-purple font-semibold hover:underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Voltar ao login
          </button>
        </p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-gray-50 font-sans">
      <div className="grid lg:grid-cols-2 min-h-screen">

        <div className="flex items-center justify-center p-8 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="mb-10 flex flex-col justify-center items-center">
              <img
                src={logost}
                className="max-w-[70%] cursor-pointer hover:scale-105 transition-all duration-150"
                onClick={() => navigate('/home')}
              />
              <p className="text-gray-600 mt-3 text-xs tracking-[0.3em] uppercase font-jakarta font-bold">
                Sistema de monitoramento
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100">
              <AnimatePresence mode="wait">
                {renderLeftContent()}
              </AnimatePresence>
            </div>

            <p className="text-center mt-10 text-[10px] uppercase tracking-[0.3em] text-gray-400">
              © 2026 SafeTemp
            </p>
          </motion.div>
        </div>

        <div className="hidden lg:flex items-center justify-center px-20 bg-gradient-to-br from-white to-gray-50">
          <div className="max-w-xl space-y-10">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
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
                "Acesso multiplataforma (Web & Mobile)",
                "Relatórios técnicos automatizados",
                "Segurança de dados ponta a ponta",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                    <ShieldCheck size={20} />
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

export default RecoverPassword;