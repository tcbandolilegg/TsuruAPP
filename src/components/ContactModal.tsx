import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Phone, Mail, User, MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    situation: 'duvida',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Save to Firestore
      await addDoc(collection(db, 'leads'), {
        ...formData,
        createdAt: serverTimestamp()
      });

      const situationLabel = t(`contact.options.${formData.situation as any}`);
      const subject = encodeURIComponent(`Tsuru Health - ${situationLabel}`);
      const body = encodeURIComponent(
        `${t('contact.name')}: ${formData.name}\n` +
        `${t('contact.email')}: ${formData.email}\n` +
        `${t('contact.phone')}: ${formData.phone}\n\n` +
        `${t('contact.description')}:\n${formData.description}`
      );
      
      window.location.href = `mailto:contato@tsuru.app.br?subject=${subject}&body=${body}`;
      alert("Sua mensagem foi enviada com sucesso!");
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'leads');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-tsuru-navy/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-tsuru-blue/10"
          >
            {/* Header */}
            <div className="bg-tsuru-blue p-8 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-3xl font-serif font-bold mb-2">{t('contact.title')}</h2>
              <p className="text-white/80">{t('contact.subtitle')}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Name */}
                <div className="relative">
                  <label className="block text-xs font-bold text-tsuru-muted uppercase tracking-wider mb-1.5 ml-1">
                    {t('contact.name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue" />
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-tsuru-blue/5 border border-tsuru-blue/10 rounded-xl focus:ring-2 focus:ring-tsuru-blue/20 outline-none transition-all text-tsuru-ink"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-tsuru-muted uppercase tracking-wider mb-1.5 ml-1">
                      {t('contact.phone')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue" />
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-tsuru-blue/5 border border-tsuru-blue/10 rounded-xl focus:ring-2 focus:ring-tsuru-blue/20 outline-none transition-all text-tsuru-ink"
                        placeholder="+55 (00) 00000-0000"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-tsuru-muted uppercase tracking-wider mb-1.5 ml-1">
                      {t('contact.email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue" />
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-tsuru-blue/5 border border-tsuru-blue/10 rounded-xl focus:ring-2 focus:ring-tsuru-blue/20 outline-none transition-all text-tsuru-ink"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Situation */}
                <div className="relative">
                  <label className="block text-xs font-bold text-tsuru-muted uppercase tracking-wider mb-1.5 ml-1">
                    {t('contact.situation')}
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue pointer-events-none" />
                    <select
                      name="situation"
                      value={formData.situation}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-tsuru-blue/5 border border-tsuru-blue/10 rounded-xl focus:ring-2 focus:ring-tsuru-blue/20 outline-none transition-all text-tsuru-ink appearance-none"
                    >
                      <option value="duvida">{t('contact.options.duvida')}</option>
                      <option value="problema">{t('contact.options.problema')}</option>
                      <option value="denuncia">{t('contact.options.denuncia')}</option>
                      <option value="sugestao">{t('contact.options.sugestao')}</option>
                      <option value="elogio">{t('contact.options.elogio')}</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-tsuru-blue/20 pl-4">
                      <ChevronDown className="w-4 h-4 text-tsuru-blue" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="relative">
                  <label className="block text-xs font-bold text-tsuru-muted uppercase tracking-wider mb-1.5 ml-1">
                    {t('contact.description')}
                  </label>
                  <textarea
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-tsuru-blue/5 border border-tsuru-blue/10 rounded-xl focus:ring-2 focus:ring-tsuru-blue/20 outline-none transition-all text-tsuru-ink resize-none"
                    placeholder="..."
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-tsuru-navy text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-tsuru-navy/90 shadow-xl shadow-tsuru-navy/10 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? 'Enviando...' : t('contact.send')}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
