import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import TsuruLogo from "./TsuruLogo";

export default function Hero({ onRegister, onAccess }: { onRegister: () => void, onAccess: () => void }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="about" className="relative min-h-screen pt-32 flex items-center overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-tsuru-blue/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          id="hero-content"
        >
          <span className="inline-block px-6 py-2 rounded-full bg-tsuru-gold text-tsuru-navy text-sm font-black uppercase tracking-[0.2em] mb-6 shadow-lg shadow-tsuru-gold/20">
            {t('hero.badge')}
          </span>
          <h1 className="text-6xl md:text-8xl font-serif leading-[0.9] text-tsuru-ink mb-8">
            {t('hero.title1')} <br />
            <span className="italic font-medium text-tsuru-blue">{t('hero.title2')}</span>
          </h1>
          <p className="text-lg text-tsuru-muted max-w-lg mb-10 leading-relaxed">
            {t('hero.description')}
          </p>
          
          <div className="flex flex-wrap gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-tsuru-blue text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 group hover:bg-tsuru-blue/90 transition-all shadow-xl shadow-tsuru-blue/20"
              >
                {t('common.getStarted')}
                <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute left-0 mt-4 w-60 bg-white rounded-3xl shadow-2xl border border-tsuru-blue/10 overflow-hidden py-3 z-30"
                  >
                    <button
                      onClick={() => {
                        onRegister();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-6 py-3 text-tsuru-navy hover:bg-tsuru-blue/5 transition-colors font-bold uppercase tracking-widest text-xs"
                    >
                      {t('common.register')}
                    </button>
                    <div className="h-px bg-tsuru-blue/5 mx-4 my-1" />
                    <button
                      onClick={() => {
                        onAccess();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-6 py-3 text-tsuru-navy hover:bg-tsuru-blue/5 transition-colors font-bold uppercase tracking-widest text-xs"
                    >
                      {t('common.login')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button className="border border-tsuru-blue/20 text-tsuru-blue px-8 py-4 rounded-full font-semibold hover:bg-tsuru-blue/5 transition-all">
              {t('common.learnMore')}
            </button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className="relative aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center"
          id="hero-logo-container"
        >
          {/* Light Blue Block Frame */}
          <div className="absolute inset-0 bg-tsuru-blue/5 rounded-3xl -z-10 border border-tsuru-blue/10" />
          
          {/* Large Hero Logo - Occupying almost the entire frame */}
          <motion.div
            animate={{ 
              y: [0, -12, 0],
              rotate: [-1, 1, -1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-[92%] h-[92%] drop-shadow-[0_20px_50px_rgba(58,190,249,0.3)]"
          >
            <TsuruLogo className="w-full h-full opacity-100" />
          </motion.div>
          
          {/* Blue Block with Legend (Already updated in previous step) */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -bottom-10 -right-6 md:-right-12 bg-tsuru-navy text-white p-8 rounded-3xl shadow-2xl max-w-sm border border-white/10"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <TsuruLogo className="w-10 h-10" />
              </div>
              <h4 className="font-serif italic text-xl text-tsuru-blue">O Tsuru</h4>
            </div>
            <p className="text-sm text-blue-100/80 leading-relaxed font-light italic">
              {t('hero.legend')}
            </p>
          </motion.div>
          
          {/* Floating Symbol Overlay */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 bg-white p-8 rounded-2xl shadow-xl border border-tsuru-blue/10 flex items-center gap-6 hidden lg:flex"
          >
            <TsuruLogo className="w-12 h-12" />
            <div>
              <div className="text-tsuru-blue text-sm font-bold uppercase tracking-tighter mb-1">{t('common.symbol')}</div>
              <div className="font-serif italic text-xl text-tsuru-navy">{t('common.longevity')}</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
