import { LuX, LuCircleAlert, LuInbox, LuCheckCheck, LuMail } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';


export const NotificationButton = ({ onPress, unreadCount }: { onPress: () => void, unreadCount: number }) => (
  <button 
    onClick={onPress} 
    className="relative p-2.5 rounded-2xl bg-gray-50 text-gray-500 hover:text-brand-purple hover:bg-brand-purple/5 transition-all cursor-pointer group"
  >
    <LuMail size={24} className="group-hover:rotate-12 transition-transform" />
    
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white border-2 border-white shadow-sm">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
  </button>
);

export const NotificationInbox = ({ isOpen, onClose, notifications, onMarkAsRead }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute right-0 mt-3 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden z-[110]"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Inbox</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <LuX size={20} />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((item: any) => (
                <div 
                  key={item.id} 
                  className={`flex gap-4 p-5 transition-colors border-b border-gray-50/50 ${!item.read ? 'bg-brand-purple/5' : 'bg-white'}`}
                >
                  <div className={`mt-1 p-2 rounded-xl h-fit ${item.title.includes('Alerta') ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'}`}>
                    {item.title.includes('Alerta') ? <LuCircleAlert size={18} /> : <LuCheckCheck size={18} />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className={`text-xs font-black ${!item.read ? 'text-gray-900' : 'text-gray-600'}`}>{item.title}</p>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{item.content}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(item.sent_at).toLocaleTimeString()}</p>
                  </div>
                  
                  {!item.read && <div className="w-2 h-2 rounded-full bg-brand-purple mt-2 shadow-sm animate-pulse" />}
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-gray-300 gap-3">
                <LuInbox size={48} className="opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Tudo limpo por aqui!</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50/50">
            <button 
              onClick={onMarkAsRead}
              className="w-full py-3 bg-white border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-purple hover:text-white hover:border-brand-purple transition-all shadow-sm cursor-pointer"
            >
              Marcar todas como lidas
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};