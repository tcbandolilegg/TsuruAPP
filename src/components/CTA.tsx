import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CTA({ onOpenContact, onRegister, onAccess }: { onOpenContact: () => void, onRegister: () => void, onAccess: () => void }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-tsuru-navy -z-20" />
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[4rem] p-16 md:p-24 relative"
           id="cta-box"
        >
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-tsuru-blue text-white p-5 rounded-full shadow-2xl">
            <Sparkles className="w-8 h-8" />
          </div>
          
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 leading-tight">
            {t('cta.title').split('cuidado com a saúde?')[0]} <br />
            <span className="italic">cuidado com a saúde?</span>
          </h2>
          
          <p className="text-white/70 text-xl max-w-2xl mx-auto mb-12">
            {t('cta.description')}
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white text-tsuru-navy px-12 py-5 rounded-full text-lg font-bold hover:bg-tsuru-blue hover:text-white transition-all shadow-2xl overflow-hidden relative group flex items-center gap-2"
              >
                <span className="relative z-10 font-bold uppercase tracking-widest text-sm">{t('common.getStarted')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-4 w-48 bg-white rounded-2xl shadow-2xl border border-tsuru-blue/10 overflow-hidden py-2 z-30"
                  >
                    <button
                      onClick={() => {
                        onRegister();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-tsuru-navy hover:bg-tsuru-blue/5 transition-colors font-bold uppercase tracking-widest text-xs"
                    >
                      {t('common.register')}
                    </button>
                    <button
                      onClick={() => {
                        onAccess();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-tsuru-navy hover:bg-tsuru-blue/5 transition-colors font-bold uppercase tracking-widest text-xs"
                    >
                      {t('common.login')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={onOpenContact}
              className="text-white border border-white/30 px-12 py-5 rounded-full text-lg font-medium hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
            >
              {t('cta.contact')}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
