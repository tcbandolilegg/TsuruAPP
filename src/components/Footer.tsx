import { Instagram, Twitter, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import TsuruLogo from "./TsuruLogo";

export default function Footer({ onOpenContact, onLogoClick, onRegister }: { onOpenContact: () => void, onLogoClick: () => void, onRegister: () => void }) {
  const { t } = useTranslation();

  return (
    <footer className="bg-tsuru-ink text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
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
                <Twitter className="w-5 h-5 text-tsuru-blue group-hover:text-white" />
              </a>
              <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-tsuru-blue/20 transition-colors group">
                <Mail className="w-5 h-5 text-tsuru-blue group-hover:text-white" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-tsuru-blue font-bold uppercase tracking-widest text-xs mb-8">{t('footer.platform')}</h4>
            <ul className="space-y-4 text-gray-400">
              <li><button onClick={onRegister} className="hover:text-white transition-colors">{t('common.plans')}</button></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('features.items.0.title')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('common.features')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('hero.cta')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-tsuru-blue font-bold uppercase tracking-widest text-xs mb-8">{t('footer.support')}</h4>
            <ul className="space-y-4 text-gray-400">
              <li><button onClick={onOpenContact} className="hover:text-white transition-colors">{t('common.contactUs')}</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
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
