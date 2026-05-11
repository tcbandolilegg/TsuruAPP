import { Instagram, Facebook, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import TsuruLogo from "./TsuruLogo";

export default function Footer({ onOpenContact, onLogoClick }: { onOpenContact: () => void, onLogoClick: () => void }) {
  const { t } = useTranslation();

  return (
    <footer className="bg-tsuru-ink text-white py-12 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1">
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer group"
              onClick={onLogoClick}
            >
              <TsuruLogo className="w-10 h-10 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-serif font-bold tracking-tight text-tsuru-blue">Tsuru</span>
            </div>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-tsuru-blue font-bold uppercase tracking-widest text-[10px] mb-1">Social</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-tsuru-blue transition-colors group text-sm">
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-tsuru-blue transition-colors group text-sm">
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-tsuru-blue transition-colors group text-sm">
                <Mail className="w-4 h-4" />
                <span>E-mail</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-tsuru-blue font-bold uppercase tracking-widest text-[10px] mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center mb-6">
          <a 
            href="https://www.ascenderideias.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center"
          >
            <span className="text-gray-500 group-hover:text-white text-[20px] transition-colors italic">
              mais um projeto <span className="font-bold not-italic">Ascender Ideias</span>
            </span>
          </a>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
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
