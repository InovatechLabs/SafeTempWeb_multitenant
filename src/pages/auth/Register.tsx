import  { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
} from 'lucide-react';
import logost from '../../assets/logost.png';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { LucideLoader2 } from 'lucide-react';
import { LuArrowRight } from 'react-icons/lu';


const Register = () => {

  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // states de formulário de cadastro
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

  const handleLoginClick = () => {
    navigate('/login');
  }

  const handleHomeClick = () => {
    navigate('/home')
  };

   const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
    return toast.error("As senhas não coincidem");
  }
     setLoading(true);
  
    try {
      await authService.register({ name, email, password });
     
      toast.success("Login realizado com sucesso")
      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
  
      navigate('/home');
   } catch (err: any) {
  
      const zodErrors = err.response?.data?.errors;
      const backendMessage = err.response?.data?.message || "Erro ao conectar com o servidor";
  
      if (zodErrors && Array.isArray(zodErrors)) {
        zodErrors.forEach((error: any) => {
          toast.error(`${error.path}: ${error.message}`);
        });
      } else {
        toast.error(backendMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-gray-50 font-sans">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="flex items-center justify-center p-8 relative overflow-hidden">
     

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10 w-full max-w-md"
          >
          <div className="mb-5 flex flex-col justify-center items-center">
           <img src={logost} className='max-w-[70%] cursor-pointer hover:scale-103 transition-all duration-150' onClick={handleHomeClick} />
            <p className="text-gray-600 mt-3 text-xs tracking-[0.3em] uppercase font-jakarta font-bold">
              Sistema de monitoramento
            </p>
          </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight text-center">Cadastro</h2>
              
              <form className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:bg-white transition-all font-medium text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">
                    E-mail
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="exemplo@fatec.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:bg-white transition-all font-medium text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">
                    Defina sua Senha
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      autoComplete='new-password'
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:bg-white transition-all font-medium text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 ml-1">
                    Confirme a Senha
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:bg-white transition-all font-medium text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
  onClick={handleRegister} 
  disabled={loading} 
  className={`w-full py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 uppercase text-xs font-bold tracking-wider mt-6
    ${loading 
      ? "bg-gray-400 cursor-not-allowed opacity-70" 
      : "bg-brand-orange text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-brand-orange/30"
    }`}
>
  {loading ? (
    <>
      <LucideLoader2 className="animate-spin" size={20} />
      Processando...
    </>
  ) : (
    <>
      Finalizar Cadastro
      <LuArrowRight size={18} />
    </>
  )}
</button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase font-semibold tracking-widest bg-white px-4 text-gray-300">
                  Ou
                </div>
              </div>

              <p className="text-center text-sm font-medium text-gray-500">
                Já possui uma conta?{" "}
                <button className="text-brand-purple font-semibold hover:underline cursor-pointer" onClick={handleLoginClick}>
                  Fazer login
                </button>
              </p>
            </div>

            <p className="text-center mt-8 text-[10px] uppercase tracking-[0.3em] text-gray-400">
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
                "Segurança de dados ponta a ponta"
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all">
                    <ArrowRight size={20} />
                  </div>
                  <span className="font-bold text-gray-700 tracking-tight">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Badges Técnicos */}
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

export default Register;