import { motion } from "motion/react";
import { Check, X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";

interface PlanProps {
  name: string;
  price: string;
  priceAnnual?: string;
  priceNote?: string;
  trial?: string;
  features: string[];
  disabled: string[];
  onSelect: () => void;
  isPopular?: boolean;
  key?: string | number;
}

function PlanCard({ name, price, priceAnnual, priceNote, trial, features, disabled, onSelect, isPopular }: PlanProps) {
  const { t } = useTranslation();
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`relative bg-white rounded-[2rem] p-8 border-2 transition-all flex flex-col h-full ${
        isPopular ? 'border-tsuru-blue shadow-2xl z-10' : 'border-tsuru-blue/10 hover:border-tsuru-blue/30 shadow-xl'
      }`}
    >
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold tracking-widest text-tsuru-ink mb-6">{name}</h3>
        
        <div className="mb-6">
          <div className="text-5xl font-bold text-tsuru-blue mb-1">
            {isAnnual && priceAnnual ? priceAnnual : price}
          </div>
          <p className={`mb-1 ${trial ? 'text-black text-base font-bold' : 'text-tsuru-muted text-sm'}`}>
            {trial || t('plans.monthly')}
          </p>
          {priceNote && <p className="text-[10px] text-tsuru-blue font-semibold">{priceNote}</p>}
        </div>

        {priceAnnual ? (
          <div className="relative inline-block w-full max-w-[200px]">
             <select 
              value={isAnnual ? 'annual' : 'monthly'}
              onChange={(e) => setIsAnnual(e.target.value === 'annual')}
              className="w-full bg-white border border-tsuru-blue/20 rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:ring-2 focus:ring-tsuru-blue/20 transition-all cursor-pointer shadow-sm"
            >
              <option value="monthly">Mensal - {price}</option>
              <option value="annual">Anual - {priceAnnual}</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue pointer-events-none" />
          </div>
        ) : (
          <div className="w-full max-w-[200px] mx-auto bg-tsuru-blue/5 border border-tsuru-blue/10 rounded-xl px-4 py-3 text-sm text-tsuru-blue font-bold">
            Mensal - {price}
          </div>
        )}
      </div>

      <div className="flex-grow">
        <p className="text-center font-bold text-tsuru-ink mb-6 text-sm">Esse plano contém:</p>
        <ul className="space-y-3 mb-10">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 bg-tsuru-blue/5 rounded-lg p-3 text-sm text-tsuru-ink leading-tight">
              <div className="mt-0.5 min-w-[18px]">
                <Check className="w-4 h-4 text-tsuru-blue" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
          {disabled.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 opacity-30 text-sm text-tsuru-muted leading-tight p-3">
              <div className="mt-0.5 min-w-[18px]">
                <X className="w-4 h-4" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={onSelect}
        className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95 ${
          isPopular 
            ? 'bg-tsuru-blue text-white hover:bg-tsuru-navy shadow-tsuru-blue/20' 
            : 'bg-tsuru-navy text-white hover:bg-tsuru-blue shadow-tsuru-navy/20'
        }`}
      >
        {t('plans.acquire')}
      </button>
    </motion.div>
  );
}

export default function Plans({ onSelectPlan }: { onSelectPlan: (plan: string) => void }) {
  const { t, i18n } = useTranslation();

  const planData = [
    { key: 'dopamina', isPopular: false },
    { key: 'ocitocina', isPopular: false },
    { key: 'serotonina', isPopular: true },
    { key: 'endorfina', isPopular: false },
  ];

  return (
    <section className="py-32 px-6 bg-tsuru-bg relative overflow-hidden" id="plans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-serif font-bold text-tsuru-navy mb-6">{t('plans.title')}</h2>
          <p className="text-tsuru-muted max-w-2xl mx-auto text-lg">{t('plans.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {planData.map((plan) => (
            <PlanCard
              name={t(`plans.${plan.key}.name`)}
              price={t(`plans.${plan.key}.price`)}
              priceAnnual={i18n.exists(`plans.${plan.key}.priceAnnual`) ? t(`plans.${plan.key}.priceAnnual`) : undefined}
              priceNote={i18n.exists(`plans.${plan.key}.priceNote`) ? t(`plans.${plan.key}.priceNote`) : undefined}
              trial={t(`plans.${plan.key}.trial`, { defaultValue: '' })}
              features={t(`plans.${plan.key}.features`, { returnObjects: true }) as string[]}
              disabled={t(`plans.${plan.key}.disabled`, { returnObjects: true }) as string[]}
              onSelect={() => onSelectPlan(plan.key)}
              isPopular={plan.isPopular}
              key={plan.key}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
