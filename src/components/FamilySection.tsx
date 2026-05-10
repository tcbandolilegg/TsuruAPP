import { motion } from "motion/react";
import { Users, Baby, HeartPulse } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FamilySection() {
  const { t } = useTranslation();

  return (
    <section id="family" className="py-24 bg-tsuru-blue/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif mb-6 text-tsuru-ink">
            {t('family.title').split('toda a família')[0]} <span className="italic">toda a família</span>
          </h2>
          <p className="text-tsuru-muted max-w-2xl mx-auto">
            {t('family.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-8"
            id="family-cases"
          >
            <div className="flex gap-6 p-8 bg-white rounded-3xl shadow-sm border border-tsuru-blue/5">
              <div className="bg-tsuru-blue text-white p-4 rounded-2xl h-fit">
                <Baby className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-serif mb-2">{t('family.dependents.title')}</h3>
                <p className="text-tsuru-muted leading-relaxed">
                  {t('family.dependents.description')}
                </p>
              </div>
            </div>

            <div className="flex gap-6 p-8 bg-white rounded-3xl shadow-sm border border-tsuru-blue/5">
              <div className="bg-tsuru-gold text-white p-4 rounded-2xl h-fit">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-serif mb-2">{t('family.experts.title')}</h3>
                <p className="text-tsuru-muted leading-relaxed">
                  {t('family.experts.description')}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl"
             id="family-image"
          >
            <img 
              src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1000" 
              alt="Happy Family" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-tsuru-blue/20 mix-blend-multiply" />
            <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-xl">
              <HeartPulse className="w-10 h-10 text-tsuru-blue" />
              <span className="font-serif italic text-lg text-tsuru-blue">{t('common.longevity')}.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
