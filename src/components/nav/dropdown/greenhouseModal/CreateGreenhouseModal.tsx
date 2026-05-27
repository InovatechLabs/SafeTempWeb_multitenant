import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Copy, Check, Cpu, Loader2 } from 'lucide-react';
import { useCreateGreenhouse } from '../../../../hooks/useCreateGreenhouse'; 
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface CreateGreenhouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewData?: { name: string; token: string } | null;
}

export const CreateGreenhouseModal = ({ isOpen, onClose, viewData }: CreateGreenhouseModalProps) => {
  const [name, setName] = useState('');
  const [tokenGerado, setTokenGerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { mutate: criarEstufa, isPending } = useCreateGreenhouse();

  useEffect(() => {
    if (isOpen) {
      if (viewData) {
        setName(viewData.name);
        setTokenGerado(viewData.token);
      } else {
        setName('');
        setTokenGerado(null);
      }
      setCopiado(false);
    }
  }, [isOpen, viewData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmeter = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('O nome do ambiente é obrigatório.');
      return;
    }

    criarEstufa(
      { name: name.trim() },
      {
        onSuccess: (data) => {

          setTokenGerado(data.activationToken);

          const pending = JSON.parse(localStorage.getItem('@SafeTemp:pendingTokens') || '[]');
          const filtered = pending.filter((p: any) => p.name !== name.trim()); 
          filtered.push({ name: name.trim(), token: data.activationToken });
          localStorage.setItem('@SafeTemp:pendingTokens', JSON.stringify(filtered));

          toast.success('Ambiente pré-cadastrado com sucesso!');
        },
        onError: (error: any) => {
          console.error(error);
          toast.error(error.response?.data?.message || 'Erro ao criar o ambiente.');
        },
      }
    );
  };

  const handleCopiarToken = () => {
    if (!tokenGerado) return;
    navigator.clipboard.writeText(tokenGerado);
    setCopiado(true);
    toast.success('Código de ativação copiado!');
    setTimeout(() => setCopiado(false), 2000);
  };

  const resetarEFechar = () => {
    setName('');
    setTokenGerado(null);
    setCopiado(false);
    onClose();
  };

    if (!mounted) return null;

 return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isPending ? undefined : resetarEFechar}
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden relative z-[9999]"
            >
              <button
                disabled={isPending}
                onClick={resetarEFechar}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {!tokenGerado ? (
                    <motion.div
                      key="form-step"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple mb-4">
                        <Plus size={24} />
                      </div>
                      
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        Adicionar Equipamento
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        Cadastre o local físico de monitoramento para gerar a chave de vinculação do hardware.
                      </p>

                      <form onSubmit={handleSubmeter} className="space-y-5">
                        <div className="text-left">
                          <label className="block text-xs font-black uppercase tracking-widest text-brand-purple mb-2">
                            Nome do Ambiente
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Freezer de Vacinas 02, Estufa Lab"
                            disabled={isPending}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl font-medium outline-none transition-all bg-gray-50/50 focus:border-brand-purple focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isPending}
                          className="w-full py-4 bg-brand-purple text-white font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isPending ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Processando...
                            </>
                          ) : (
                            'Gerar Chave de Ativação'
                          )}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="token-step"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-4 border border-green-100">
                        <Cpu size={32} />
                      </div>

                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        Vincular ao Equipamento
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        Siga estes passos para vincular seu equipamento <strong>{name}</strong> ao SafeTemp:
                      </p>

                      <div className="text-left space-y-4 mb-6">
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-purple text-white text-xs font-black flex items-center justify-center">1</span>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Utilizando um computador, celular ou notebook, conecte-se à rede Wi-Fi criada pelo dispositivo (ex: <strong>SafeTemp_XXXX</strong>).
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-purple text-white text-xs font-black flex items-center justify-center">2</span>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Seu navegador padrão irá abrir automaticamente no endereço do equipamento. Insira o <strong>SSID (nome)</strong> e <strong>senha</strong> da sua rede WiFi.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-purple text-white text-xs font-black flex items-center justify-center">3</span>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Insira a chave de ativação fornecida abaixo no campo <strong>Chave de Ativação</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-6">
                        <span className="font-mono text-2xl font-black tracking-wider text-gray-800 select-all pl-2">
                          {tokenGerado}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopiarToken}
                          className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-brand-purple hover:border-brand-purple/30 shadow-sm transition-all cursor-pointer active:scale-95"
                        >
                          {copiado ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={resetarEFechar}
                        className="w-full py-4 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        Entendido, fechar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};