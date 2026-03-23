
import { Github, ArrowUpCircle } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-brand-purple text-white pt-20 pb-10">
       <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform -translate-y-[99%] pointer-events-none">
    <svg 
      viewBox="0 0 1200 140" 
      preserveAspectRatio="none" 
      className="relative block w-full h-[100px] rotate-180"
    >
      <path 
         d="M0,60 
     C150,20 300,20 450,50 
     C600,80 750,80 900,50 
     C1020,25 1100,30 1200,60 
     L1200,0 
     L0,0 
     Z"  
        className="fill-brand-purple" 
      ></path>
    </svg>
  </div>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-12 pb-16 border-b border-white/20">
          
   
          <div className="space-y-6">
            <h2 className="text-4xl font-black tracking-wide text-white ">
              SafeTemp
            </h2>
            <p className="text-white/80 leading-relaxed font-medium">
              Monitoramento inteligente e preciso para estufas laboratoriais. Desenvolvido por Gabriel Juliani.
            </p>
            <div className="flex gap-4">
              <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all cursor-pointer">
              <a href='https://github.com/gjulianni' target='_blank'>
                <Github size={20} />
                </a>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            © 2026 SafeTemp
          </p>
          
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Voltar ao topo
            <ArrowUpCircle size={20} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;