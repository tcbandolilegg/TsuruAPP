import { motion, AnimatePresence } from "motion/react";
import { Globe, ChevronDown, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import TsuruLogo from "./TsuruLogo";

const languages = [
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (PT)', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export default function Navbar({ 
  onOpenContact, 
  onAccess, 
  onLogoClick 
}: { 
  onOpenContact: () => void, 
  onAccess: () => void, 
  onLogoClick: () => void 
}) {
  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-tsuru-bg/80 backdrop-blur-md border-b border-tsuru-blue/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onLogoClick}
          id="nav-logo"
        >
          <TsuruLogo className="w-10 h-10 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-serif font-bold tracking-tight text-tsuru-blue">Tsuru</span>
        </motion.div>
        
        <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-tsuru-navy">
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 text-tsuru-blue hover:bg-tsuru-blue/5 px-2 py-2 rounded-lg transition-all text-xl"
              id="lang-selector-btn"
            >
              <span>{currentLang.flag}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-16 bg-white rounded-xl shadow-2xl border border-tsuru-blue/10 overflow-hidden py-1"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full flex items-center justify-center p-3 text-xl hover:bg-tsuru-blue/5 transition-colors ${i18n.language === lang.code ? 'bg-tsuru-blue/5' : ''}`}
                    >
                      {lang.flag}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
