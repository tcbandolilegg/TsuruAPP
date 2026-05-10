import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Download, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TsuruLogo from './TsuruLogo';

interface InstagramHeroProps {
  onRegister: () => void;
  onAccess: () => void;
}

export default function InstagramHero({ onRegister, onAccess }: InstagramHeroProps) {
  const { t } = useTranslation();

  return (
    <section className="min-h-screen bg-tsuru-bg flex items-center justify-center p-4 md:p-8 pt-24">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12">
        
        {/* Left Side: Mockup / Feature Area */}
        <div className="hidden md:flex relative w-[420px] h-[780px] perspective-1000">
          <motion.div 
            initial={{ rotateY: -10, x: -20, opacity: 0 }}
            animate={{ rotateY: 0, x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full h-full bg-white rounded-[3rem] border-[12px] border-tsuru-navy/10 shadow-2xl relative overflow-visible flex flex-col items-center p-8"
          >
            {/* Phone Notch/Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-tsuru-navy/10 rounded-b-2xl z-20" />
            
            {/* Mock Dashboard Content */}
            <div className="w-full space-y-8 pt-12 text-center flex-1 flex flex-col justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <TsuruLogo className="w-64 h-64 mx-auto drop-shadow-xl" />
              </motion.div>
              
              <div className="space-y-2">
                <div className="text-[10px] text-tsuru-blue font-bold uppercase tracking-[0.3em] mb-4">{t('hero.badge')}</div>
                <h2 className="text-4xl font-serif text-tsuru-navy leading-tight">
                  {t('hero.title1')} <br />
                  <span className="text-tsuru-blue italic">{t('hero.title2')}</span>
                </h2>
              </div>

              <div className="pt-12 px-4">
                <div className="h-1 w-full bg-tsuru-blue/10 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="h-full w-1/3 bg-tsuru-blue"
                  />
                </div>
              </div>
            </div>

            {/* Floating Brand Elements from User Image */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-10 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-tsuru-blue/5 hidden lg:flex items-center gap-4 z-50"
            >
              <TsuruLogo className="w-14 h-14" />
              <div className="text-left">
                <div className="text-[10px] text-tsuru-blue font-bold uppercase tracking-tighter leading-none mb-1">{t('common.symbol')}</div>
                <div className="font-serif italic text-lg text-tsuru-navy leading-none">{t('common.longevity')}</div>
              </div>
            </motion.div>

            {/* Floating Blue Card from User Image */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-20 -right-12 bg-tsuru-navy text-white p-6 rounded-2xl shadow-2xl max-w-[220px] hidden lg:block border border-white/10 z-50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <TsuruLogo className="w-8 h-8" />
                </div>
                <h4 className="font-serif italic text-sm text-tsuru-blue">O Tsuru</h4>
              </div>
              <p className="text-[11px] text-blue-100/70 leading-relaxed font-light text-left">
                {t('hero.legend')}
              </p>
            </motion.div>
          </motion.div>

          {/* Secondary Mockup Layer */}
          <motion.div 
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 0.4 }}
            className="absolute inset-0 bg-tsuru-blue/5 rounded-[3rem] -z-10 translate-x-12 translate-y-6 scale-95 border border-tsuru-blue/10"
          />
        </div>

        {/* Right Side: Authentication Cards */}
        <div className="w-full max-w-[350px] space-y-4">
          
          {/* Main Login Card */}
          <div className="bg-white border border-gray-200 px-10 py-10 rounded-sm flex flex-col items-center text-center">
            
            <div className="mb-8">
              <TsuruLogo className="w-24 h-24 mb-4" />
              <h1 className="text-4xl font-serif italic text-tsuru-navy">Tsuru</h1>
              <p className="text-xs text-tsuru-muted font-light mt-1 tracking-wider uppercase">Health & Longevity</p>
            </div>

            <div className="w-full space-y-3 mb-6">
              <button
                onClick={onAccess}
                className="w-full py-2 bg-tsuru-blue text-white rounded-md font-bold flex items-center justify-center gap-2 hover:bg-tsuru-blue/90 transition-all text-sm mb-4"
              >
                <LogIn className="w-4 h-4" />
                {t('common.loginGoogle')}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('common.or')}</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder={t('common.emailOrCpf')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-[3px] text-xs outline-none focus:border-gray-400"
                />
                <input 
                  type="password" 
                  placeholder={t('common.password')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-[3px] text-xs outline-none focus:border-gray-400"
                />
                <button 
                  disabled
                  className="w-full py-2 bg-tsuru-blue/40 text-white rounded-md font-bold text-xs cursor-not-allowed"
                >
                  {t('common.loginAction')}
                </button>
              </div>
            </div>

            <button className="text-[12px] text-tsuru-navy font-semibold hover:underline">
              {t('common.forgotPassword')}
            </button>
          </div>

          {/* Signup Card */}
          <div className="bg-white border border-gray-200 p-6 rounded-sm text-center">
            <p className="text-sm">
              {t('common.noAccount')} {' '}
              <button 
                onClick={onRegister}
                className="text-tsuru-blue font-bold hover:underline"
              >
                {t('common.register')}
              </button>
            </p>
          </div>

          {/* App Links */}
          <div className="text-center pt-2">
            <p className="text-sm mb-4">{t('common.getApp')}</p>
            <div className="flex justify-center gap-2 h-10">
              <div className="bg-tsuru-navy text-white px-4 rounded-md flex items-center gap-2 cursor-pointer hover:bg-tsuru-navy/90 transition-colors">
                <Smartphone className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-[8px] uppercase leading-none">Download on the</div>
                  <div className="text-[10px] font-bold leading-none">App Store</div>
                </div>
              </div>
              <div className="bg-tsuru-navy text-white px-4 rounded-md flex items-center gap-2 cursor-pointer hover:bg-tsuru-navy/90 transition-colors">
                <Smartphone className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-[8px] uppercase leading-none">GET IT ON</div>
                  <div className="text-[10px] font-bold leading-none">Google Play</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
