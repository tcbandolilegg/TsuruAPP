import { Instagram, Facebook, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import TsuruLogo from "./TsuruLogo";
import AscenderLogo from "./AscenderLogo";

export default function Footer({ onOpenContact, onLogoClick }: { onOpenContact: () => void, onLogoClick: () => void }) {
  const { t } = useTranslation();

  return (
    <footer className="bg-tsuru-ink text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div className="md:col-span-1">
            <div 
              className="flex items-center gap-2 mb-8 cursor-pointer group"
              onClick={onLogoClick}
            >
              <TsuruLogo className="w-12 h-12 group-hover:scale-110 transition-transform" />
              <span className="text-3xl font-serif font-bold tracking-tight text-tsuru-blue">Tsuru</span>
            </div>
            <p className="text-gray-400 max-w-sm text-lg leading-relaxed mb-8">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-tsuru-blue/20 transition-colors group">
                <Instagram className="w-5 h-5 text-tsuru-blue group-hover:text-white" />
              </a>
              <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-tsuru-blue/20 transition-colors group">
                <Facebook className="w-5 h-5 text-tsuru-blue group-hover:text-white" />
              </a>
              <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-tsuru-blue/20 transition-colors group">
                <Mail className="w-5 h-5 text-tsuru-blue group-hover:text-white" />
              </a>
            </div>
          </div>

          <div className="hidden md:block" />

          <div>
            <h4 className="text-tsuru-blue font-bold uppercase tracking-widest text-xs mb-8">{t('footer.support')}</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mb-8">
          <a 
            href="https://www.ascenderideias.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2"
          >
            <AscenderLogo className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" fill="currentColor" />
            <span className="text-gray-500 group-hover:text-white text-xs transition-colors italic">
              mais um projeto <span className="font-bold not-italic">Ascender Ideias</span>
            </span>
          </a>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {t('footer.rights')}
          </p>
          <div className="flex items-center gap-2 text-tsuru-blue/60 text-sm">
            <span>{t('footer.symbolLongevity')}</span>
            <span className="w-1 h-1 bg-tsuru-blue/30 rounded-full" />
            <span>Saúde Connect</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
