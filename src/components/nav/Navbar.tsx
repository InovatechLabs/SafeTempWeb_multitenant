import { useEffect, useState } from 'react';
import { LayoutDashboard, History, GitCompare, Menu, X, ChevronDown, LucideBell } from 'lucide-react';
import logoSafetemp from '../../assets/logost.png';
import { useAuth } from '../../contexts/auth/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UserDropdown from './dropdown/UserDropdown';
import HistoryMegaMenu from './history/HistoryMegaMenu';
import { AnimatePresence, motion } from 'framer-motion';
import type { Notification } from '../../utils/types/notification';
import { getNotifications } from '../../hooks/useNotification';
import { NotificationButton, NotificationInbox } from './notification/NotificationInbox';
import api from '../../services/api';
import AlertsManagerModal from '../alerts/AlertsManagerModal';
import { toast } from 'sonner';


const linksNavegacao = [
  { nome: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { nome: 'Histórico', path: '/historico', icon: History },
  { nome: 'Comparações', path: '/historico/comparar', icon: GitCompare },
  { nome: 'Alertas', path: '/', icon: LucideBell},
];

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAtivo = (path: string) => location.pathname === path;
  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleLoginClick = () => {
    navigate('/login')
  };

  const handleHomeClick = () => {
    navigate('/home');
  };

  const handleReportsClick = () => {
    navigate('/historico/relatorios');
  }

  const loadNotifications = async () => {

    if (isAuthenticated) {
    const res = await getNotifications();
    setNotifications(res.data);
    }
    return;
  };

    useEffect(() => {
    loadNotifications();
  }, []);
 const unreadCount = notifications.filter(n => !n.read).length;

 const handleMarkAsRead = async () => {
  try {
    await api.patch('/notifications/read');
    setNotifications([]);
  } catch (error) {
    console.error("Erro ao marcar notificações como lidas:", error);
  }
};

 return (
   <nav className={`
      fixed top-0 left-0 right-0 z-30 flex justify-center transition-all duration-500 ease-in-out
      ${activeMenu ? 'p-0' : 'p-4'} 
    `}>
      {activeMenu && (
        <div 
          className="fixed inset-0 z-30 cursor-default" 
          onClick={() => setActiveMenu(null)} 
        />
      )}
      
      <AnimatePresence>
        {(activeMenu || isOpen) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setActiveMenu(null); setIsOpen(false); }}
            className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div className={`
        relative w-full bg-white backdrop-blur-md border border-white/20 shadow-lg px-6 py-3 z-50 transition-all duration-500 ease-in-out
        ${activeMenu 
          ? 'max-w-full rounded-none border-x-0 border-t-0 shadow-xl' 
          : 'max-w-7xl rounded-[2.5rem]'
        }
      `}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
              <img
                className="h-10 w-auto group-hover:scale-105 transition-transform"
                src={logoSafetemp}
                alt="SafeTemp Logo"
                onClick={handleHomeClick}
              />
            </div>
          </div>

          {/* LINKS DESKTOP */}
          <div className="hidden md:flex items-center">
            {linksNavegacao.map((link) => {
              const ativo = isAtivo(link.path);
              const temSubmenu = link.nome === 'Histórico';
              const isOpenMenu = activeMenu === link.nome;
              
              const isAlertas = link.nome === 'Alertas';

              return (
                <div key={link.nome} className="relative">
                  <button
                  onClick={() => {
                    if (isAlertas) {
                      if (!isAuthenticated) {
                      toast.error('Você precisa fazer login para configurar alertas.', {
                      description: 'Crie uma conta ou entre para usar este recurso.'
                      });
                } else {
                      setIsAlertModalOpen(true);
                        }
                        setActiveMenu(null);
                      } else if (temSubmenu) {
                        toggleMenu(link.nome);
                      } else {
                        setActiveMenu(null);
                        navigate(link.path);
                      }
                    }}
                    className={`
                      relative group overflow-hidden cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-md font-semibold transition-all duration-500
                      ${ativo || isOpenMenu ? 'text-white' : 'text-gray-600 hover:text-white transition-all duration-100'}
                    `}
                  >
                    <span className={`
                      absolute inset-0 bg-brand-purple transition-transform duration-200 ease-out z-0
                      ${ativo || isOpenMenu ? 'scale-100' : 'scale-0 group-hover:scale-100'}
                    `} style={{ transformOrigin: 'center' }} />

                    <span className="relative z-10 flex items-center gap-2">
                      <link.icon size={18} />
                      {link.nome}
                      {temSubmenu && (
                        <ChevronDown 
                          size={14} 
                          className={`ml-1 transition-transform duration-300 ${isOpenMenu ? 'rotate-180' : ''}`} 
                        />
                      )}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* DIREITA (Notificações, Perfil, Login) */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="relative">
                <NotificationButton 
                  onPress={() => setIsInboxOpen(!isInboxOpen)} 
                  unreadCount={unreadCount} 
                />

                <NotificationInbox 
                  isOpen={isInboxOpen}
                  onClose={() => setIsInboxOpen(false)}
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                />
              </div>
            )}
            
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <button onClick={handleLoginClick} className="hidden sm:block px-5 py-2 bg-brand-purple text-white text-sm font-bold rounded-xl hover:opacity-90 cursor-pointer transition-opacity shadow-sm">
                Entrar
              </button>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* MENU MOBILE */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-100 overflow-hidden bg-white mt-3"
            >
              <div className="flex flex-col p-6 gap-4">
                {linksNavegacao.map((link) => {
                  const hasSubmenu = link.nome === 'Histórico' || link.nome === 'Comparações';
                  const isSubOpen = activeMenu === link.nome;
                  
                  // 2. VERIFICAÇÃO MOBILE
                  const isAlertas = link.nome === 'Alertas';

                  return (
                    <div key={link.nome} className="flex flex-col">
                      <button
                        onClick={() => {
                          if (isAlertas) {
                            if (!isAuthenticated) {
                              toast.error('Você precisa fazer login para configurar alertas.');
                            } else {
                              setIsAlertModalOpen(true);
                            }
                            setIsOpen(false);
                          } else if (hasSubmenu) {
                            toggleMenu(link.nome);
                          } else {
                            navigate(link.path);
                            setIsOpen(false);
                          }
                        }}
                        className="flex items-center justify-between py-3 text-lg font-bold text-gray-700"
                      >
                        <span className="flex items-center gap-3"><link.icon size={20}/> {link.nome}</span>
                        {hasSubmenu && <ChevronDown className={`transition-transform ${isSubOpen ? 'rotate-180' : ''}`} />}
                      </button>

                      {/* SUBMENU MOBILE (ACCORDION) */}
                      <AnimatePresence>
                        {isSubOpen && hasSubmenu && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                            className="pl-8 flex flex-col gap-3 border-l-2 border-brand-purple/20 ml-2 mb-4"
                          >
                            <button onClick={handleReportsClick} className="text-left text-sm text-gray-500 py-1">Relatórios</button>
                            <button className="text-left text-sm text-gray-500 py-1">Consulta de Dados</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                
                {!isAuthenticated && (
                  <button onClick={handleLoginClick} className="w-full py-4 bg-brand-purple text-white rounded-2xl font-bold mt-4">
                    Entrar na Conta
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MEGA MENU DESKTOP */}
        <div className="hidden md:block">
          <AnimatePresence>
            {activeMenu === 'Histórico' && <HistoryMegaMenu />}
          </AnimatePresence>
        </div>
      </div>
  
      <AlertsManagerModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />

    </nav>
  );
};

export default Navbar;