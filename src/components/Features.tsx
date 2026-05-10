import { motion } from "motion/react";
import { ShieldCheck, History, Search, FileSpreadsheet } from "lucide-react";
import { useTranslation } from "react-i18next";

const featureIcons = [History, ShieldCheck, Search, FileSpreadsheet];

export default function Features() {
  const { t } = useTranslation();
  const items = t('features.items', { returnObjects: true }) as Array<{title: string, description: string}>;

  return (
    <section id="features" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            id="features-intro"
          >
            <h2 className="text-5xl font-serif mb-8 text-tsuru-ink">
              {t('features.title').split('um só lugar')[0]} <br />
              <span className="text-tsuru-blue">um só lugar</span>
            </h2>
            <p className="text-lg text-tsuru-muted leading-relaxed mb-8">
              {t('features.description')}
            </p>
            <div className="space-y-4">
              {items.map((f, i) => {
                const Icon = featureIcons[i];
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-tsuru-blue/5 transition-colors cursor-default">
                    <div className="bg-tsuru-gold/10 p-2 rounded-lg">
                      <Icon className="w-5 h-5 text-tsuru-gold" />
                    </div>
                    <span className="font-medium text-tsuru-ink">{f.title}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
            id="features-visual"
          >
            <div className="absolute inset-0 bg-tsuru-gold/20 blur-[100px] -z-10" />
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-tsuru-blue/10">
              <div className="min-h-72 bg-tsuru-blue/5 rounded-2xl flex items-center justify-center p-10 text-center text-tsuru-navy font-serif italic text-3xl font-medium tracking-tight leading-snug">
                "{t('features.quote')}"
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <div className="h-4 w-3/4 bg-tsuru-blue/10 rounded-full" />
                <div className="h-4 w-1/2 bg-tsuru-blue/10 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
