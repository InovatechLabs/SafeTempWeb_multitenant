import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Clock, Trash2, Edit2, ShieldAlert, Check, Power, PowerOff } from 'lucide-react';
import type { Alert } from '../../utils/types/alert/index';
import api from '../../services/api';
import { formatTimeBRT } from '../../utils/formatters/formatTimeBRT';
import { useAuth } from '../../contexts/auth/authContext';


type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  onConfirm?: () => void;
}

let toastId = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl max-w-sm w-full text-sm font-semibold border
              ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
              ${toast.type === 'error'   ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
            `}
          >
            <span className="flex-1 leading-snug">{toast.message}</span>

            {/* Toast de confirmação (warning com Sim/Não) */}
            {toast.type === 'warning' && toast.onConfirm ? (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { toast.onConfirm!(); onDismiss(toast.id); }}
                  className="px-3 py-1 cursor-pointer bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors"
                >
                  Sim
                </button>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="px-3 py-1 cursor-pointer bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                >
                  Não
                </button>
              </div>
            ) : (
              <button onClick={() => onDismiss(toast.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <X size={14} />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, onConfirm?: () => void) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message, onConfirm }]);

    // Auto-dismiss apenas se NÃO for confirmação
    if (!onConfirm) {
      setTimeout(() => dismiss(id), 3500);
    }
  }, [dismiss]);

  const success = (msg: string) => addToast('success', msg);
  const error   = (msg: string) => addToast('error', msg);
  const confirm = (msg: string, onConfirm: () => void) => addToast('warning', msg, onConfirm);

  return { toasts, dismiss, success, error, confirm };
}

interface AlertsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const detectOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'Windows';
  if (userAgent.includes('mac')) return 'MacOS';
  if (userAgent.includes('linux')) return 'Linux';
  return 'Outro';
};

export default function AlertsManagerModal({ isOpen, onClose }: AlertsManagerModalProps) {

  const toast = useToast();
  const {isAuthenticated} = useAuth();

  // Form
  const [nome, setNome] = useState('');
  const [nota, setNota] = useState('');
  const [temperaturaMin, setTemperaturaMin] = useState('');
  const [temperaturaMax, setTemperaturaMax] = useState('');
  const [is24h, setIs24h] = useState(true);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lista
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [editingId, setEditingId]     = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const [os, setOs] = useState('');
  useEffect(() => {
  setOs(detectOS());
}, []);

  const fetchAlerts = async () => {
    if (isAuthenticated) {
        try {
            const response = await api.get('alerts/list');
            setAlerts(response.data);
        } catch {
        toast.error('Falha ao carregar a lista de alertas.');
        }
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleTempBlur = () => {
    const min = Number(temperaturaMin);
    const max = Number(temperaturaMax);
    if (temperaturaMin && temperaturaMax && min >= max) {
      setTemperaturaMin(String(max - 1));
    }
  };

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temperaturaMin && !temperaturaMax) {
      toast.error('Defina ao menos uma temperatura mínima ou máxima!');
      return;
    }
    if (!is24h && (!horaInicio || !horaFim)) {
      toast.error('Defina o horário de início e fim do monitoramento!');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('alerts/register-alert', {
        nome:            nome || undefined,
        nota:            nota || undefined,
        temperatura_min: temperaturaMin ? Number(temperaturaMin) : undefined,
        temperatura_max: temperaturaMax ? Number(temperaturaMax) : undefined,
        hora_inicio:     !is24h ? horaInicio : undefined,
        hora_fim:        !is24h ? horaFim    : undefined,
      });
      toast.success('Alerta criado com sucesso!');
      setNome(''); setNota(''); setTemperaturaMin(''); setTemperaturaMax('');
      setIs24h(true); setHoraInicio(''); setHoraFim('');
      fetchAlerts();
    } catch {
      toast.error('Falha ao criar o alerta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    toast.confirm('Deseja realmente excluir este alerta?', async () => {
      try {
        await api.delete(`alerts/delete/${id}`);
        toast.success('Alerta excluído.');
        fetchAlerts();
      } catch {
        toast.error('Falha ao excluir o alerta.');
      }
    });
  };

  const handleToggleStatus = async (alert: Alert) => {
    const route = alert.ativo ? `alerts/disable/${alert.id}` : `alerts/enable/${alert.id}`;
    try {
      await api.patch(route);
      toast.success(alert.ativo ? 'Alerta desativado.' : 'Alerta ativado!');
      fetchAlerts();
    } catch {
      toast.error('Falha ao alterar o status do alerta.');
    }
  };

  const startEditing = (alert: Alert) => {
    setEditingId(alert.id);
    setEditingName(alert.nome || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleConfirmEdit = async (id: number) => {
    if (!editingName.trim()) {
      toast.error('O nome não pode estar vazio.');
      return;
    }
    try {
      await api.patch(`alerts/editname/${id}`, { nome: editingName.trim() });
      toast.success('Nome atualizado!');
      cancelEditing();
      fetchAlerts();
    } catch {
      toast.error('Falha ao atualizar o nome.');
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl bg-white rounded-[1rem] shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
              <button
                onClick={onClose}
                className="absolute cursor-pointer top-4 right-4 z-10 p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
              >
                <X size={20} color='red'/>
              </button>

              {/* ── LADO ESQUERDO: FORMULÁRIO ─────────────────── */}
              <div className="w-full md:w-[40%] bg-gray-50 p-6 md:p-8 border-r border-gray-100 overflow-y-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <ShieldAlert className="text-brand-orange" />
                    Configurar Alerta
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Defina os gatilhos de emergência</p>
                </div>

                <form onSubmit={handleSaveAlert} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                        Nome do Alerta <span className="text-gray-400 font-medium">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Experimento com Fungos"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-purple transition-colors text-sm font-bold text-gray-900 placeholder:font-medium placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                        Nota <span className="text-gray-400 font-medium">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Desativar após as 13:00h"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-purple transition-colors text-sm font-bold text-gray-900 placeholder:font-medium placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Limites de Temperatura</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Mínima</label>
                        <input
                          type="number" step="0.1" placeholder="Ex: 10"
                          value={temperaturaMin} onBlur={handleTempBlur}
                          onChange={(e) => setTemperaturaMin(e.target.value)}
                          className="w-full p-3.5 bg-white border border-blue-100 rounded-xl outline-none focus:border-blue-400 transition-colors text-sm font-black text-gray-900"
                        />
                        <span className="absolute right-4 top-[26px] text-blue-300 font-bold text-sm">°C</span>
                      </div>
                      <div className="relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Máxima</label>
                        <input
                          type="number" step="0.1" placeholder="Ex: 35"
                          value={temperaturaMax} onBlur={handleTempBlur}
                          onChange={(e) => setTemperaturaMax(e.target.value)}
                          className="w-full p-3.5 bg-white border border-red-100 rounded-xl outline-none focus:border-red-400 transition-colors text-sm font-black text-gray-900"
                        />
                        <span className="absolute right-4 top-[26px] text-red-300 font-bold text-sm">°C</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Período de Monitoramento</h3>
                    <div
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl mb-4 cursor-pointer"
                      onClick={() => setIs24h(!is24h)}
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={18} className={is24h ? 'text-green-500' : 'text-gray-400'} />
                        <span className="text-sm font-bold text-gray-700">
                          {is24h ? 'Monitoramento 24h' : 'Horário Específico'}
                        </span>
                      </div>
                      <button type="button" className={`w-12 h-6 cursor-pointer rounded-full transition-colors relative ${is24h ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${is24h ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {!is24h && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Hora Início</label>
                          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}
                            className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-purple transition-colors text-sm font-bold text-gray-900" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Hora Fim</label>
                          <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)}
                            className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-purple transition-colors text-sm font-bold text-gray-900" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose}
                      className="flex-1 py-3.5 cursor-pointer rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isLoading}
                      className="flex-1 py-3.5 cursor-pointer rounded-xl font-bold text-white bg-brand-purple hover:bg-brand-purple/90 transition-colors shadow-lg shadow-brand-purple/20 disabled:opacity-60 disabled:cursor-not-allowed">
                      {isLoading ? 'Salvando...' : 'Salvar Alerta'}
                    </button>
                  </div>
 <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl">
  {os === 'Windows' && (
    <p className="text-[12px] text-gray-500 font-medium">
      *Certifique-se de{' '}
      <a href="ms-settings:notifications" className="text-blue-500 hover:text-blue-600 underline transition-colors cursor-pointer">
        habilitar as notificações
      </a>{' '}
      nas configurações do Windows.
    </p>
  )}

  {os === 'MacOS' && (
    <p className="text-[12px] text-gray-500 font-medium">
      *No Mac, certifique-se de habilitar os alertas para o seu navegador indo em <strong>Ajustes do Sistema {'>'} Notificações</strong>.
    </p>
  )}

  {os === 'Linux' && (
    <p className="text-[12px] text-gray-500 font-medium">
      *Certifique-se de que o seu ambiente de desktop (GNOME, KDE, etc.) permite que o navegador exiba notificações.
    </p>
  )}
</div>
                </form>
              </div>

              {/* ── LADO DIREITO: LISTA ───────────────────────── */}
              <div className="w-full md:w-[60%] bg-white p-6 md:p-8 overflow-y-auto">
                <div className="mb-8 pr-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <Bell className="text-brand-purple" />
                    Alertas Ativos
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Gerencie suas regras de monitoramento</p>
                </div>

                <div className="space-y-4">
                  {alerts.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <Bell size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-bold text-sm">Nenhum alerta cadastrado</p>
                      <p className="text-xs mt-1">Crie um alerta no painel ao lado</p>
                    </div>
                  )}

                  {alerts.map((alert) => {
                    const isEditing = editingId === alert.id;
                    const isActive  = alert.ativo;

                    return (
                      <div
                        key={alert.id}
                        className={`border rounded-2xl p-5 transition-all group ${
                          isActive
                            ? 'border-gray-100 hover:border-brand-purple/30'
                            : 'border-gray-100 opacity-60 bg-gray-50'
                        }`}
                      >
                        {/* Header do card */}
                        <div className="flex justify-between items-start mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            {/* ── Nome editável ── */}
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleConfirmEdit(alert.id);
                                    if (e.key === 'Escape') cancelEditing();
                                  }}
                                  className="flex-1 min-w-0 text-base font-bold text-gray-900 border-b-2 border-brand-purple outline-none bg-transparent pb-0.5"
                                />
                                <button
                                  onClick={() => handleConfirmEdit(alert.id)}
                                  className="shrink-0 p-1.5 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors"
                                  title="Confirmar"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="shrink-0 p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Cancelar"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <h4 className="text-base font-bold text-gray-900 truncate">
                                {alert.nome || 'Alerta sem nome'}
                              </h4>
                            )}

                            {alert.nota && !isEditing && (
                              <p className="text-xs text-gray-400 mt-0.5 italic truncate">{alert.nota}</p>
                            )}

                            {/* ── Horário formatado ── */}
                            <p className="text-xs font-medium text-gray-400 mt-0.5">
                              {alert.hora_inicio && alert.hora_fim
                                ? `${formatTimeBRT(alert.hora_inicio)} às ${formatTimeBRT(alert.hora_fim)}`
                                : 'Monitoramento 24h'}
                            </p>
                          </div>

                          {/* Badge de status */}
                          <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                            isActive
                              ? 'bg-green-50 text-green-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isActive ? 'Ativo' : 'Pausado'}
                          </span>
                        </div>

                        {/* Temperaturas */}
                        <div className="flex items-center gap-4 mb-4">
                          {alert.temperatura_min != null && (
                            <div className="bg-blue-50 px-3 py-1.5 rounded-lg">
                              <span className="text-[10px] font-black uppercase text-blue-400 block mb-0.5">Mínima</span>
                              <span className="text-sm font-black text-blue-600">{alert.temperatura_min}°C</span>
                            </div>
                          )}
                          {alert.temperatura_max != null && (
                            <div className="bg-red-50 px-3 py-1.5 rounded-lg">
                              <span className="text-[10px] font-black uppercase text-red-400 block mb-0.5">Máxima</span>
                              <span className="text-sm font-black text-red-600">{alert.temperatura_max}°C</span>
                            </div>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2 border-t border-gray-50 pt-4 mt-2">
                          {/* Editar nome */}
                          {!isEditing ? (
                            <button
                              onClick={() => startEditing(alert)}
                              className="flex-1 py-2 text-xs font-bold cursor-pointer text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Edit2 size={14} /> Editar nome
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConfirmEdit(alert.id)}
                              className="flex-1 py-2 text-xs font-bold text-brand-purple bg-brand-purple/10 hover:bg-brand-purple/20 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Check size={14} /> Confirmar edição
                            </button>
                          )}

                          {/* Ativar / Desativar */}
                          <button
                            onClick={() => handleToggleStatus(alert)}
                            className={`flex-1 py-2 cursor-pointer text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                              isActive
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                : 'text-green-600 bg-green-50 hover:bg-green-100'
                            }`}
                          >
                            {isActive
                              ? <><PowerOff size={14} /> Desativar</>
                              : <><Power size={14} /> Ativar</>
                            }
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleDelete(alert.id)}
                            className="flex-1 py-2 cursor-pointer text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Trash2 size={14} /> Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}