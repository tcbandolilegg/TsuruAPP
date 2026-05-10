import { motion } from "motion/react";
import { MessageSquareOff, CalendarDays, BrainCircuit } from "lucide-react";
import { useTranslation } from "react-i18next";

const painIcons = [MessageSquareOff, CalendarDays, BrainCircuit];

export default function PainPoints() {
  const { t } = useTranslation();
  const items = t('painPoints.items', { returnObjects: true }) as Array<{title: string, description: string}>;

  return (
    <section className="py-24 bg-tsuru-ink text-white">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-serif mb-6"
        >
          {t('painPoints.title', { 
            interpolation: { escapeValue: false }
          }).split('estresse').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && <span className="text-tsuru-gold italic">estresse</span>}
            </span>
          ))}
        </motion.h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {t('painPoints.description')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {items.map((pain, idx) => {
          const Icon = painIcons[idx];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              id={`pain-${idx}`}
            >
              <div className="w-14 h-14 bg-tsuru-blue rounded-2xl flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-serif mb-4">{pain.title}</h3>
              <p className="text-gray-400 leading-relaxed">{pain.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
