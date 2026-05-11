import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, MapPin, CreditCard, User, Calendar, FileText, ChevronDown, Check, LogIn, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface RegistrationFormProps {
  selectedPlan: string;
  isLoginIntent?: boolean;
}

export default function RegistrationForm({ selectedPlan, isLoginIntent }: RegistrationFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [formData, setFormData] = useState({
    photo: null as File | null,
    fullName: "",
    socialName: "",
    race: "branca",
    gender: "homem",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    cpf: "",
    rg: "",
    documentPhoto: null as File | null,
    birthDate: "",
    motherName: "",
    plan: selectedPlan,
    billingCycle: "mensal" as "mensal" | "anual",
    validityDate: "",
    userType: "user"
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setFormData(prev => ({ 
          ...prev, 
          fullName: prev.fullName || user.displayName || "",
          userType: user.email === 'tcbandolilegg@gmail.com' ? 'superadmin' : 'user'
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (formData.plan === "dopamina") {
      setFormData(prev => ({ ...prev, billingCycle: "mensal" }));
    }
  }, [formData.plan]);

  useEffect(() => {
    const calculateValidity = () => {
      const today = new Date();
      if (isNaN(today.getTime())) return;
      
      let expiry = new Date(today);
      
      if (formData.billingCycle === "mensal") {
        expiry.setMonth(today.getMonth() + 1);
      } else {
        expiry.setFullYear(today.getFullYear() + 1);
      }
      
      setFormData(prev => ({ ...prev, validityDate: expiry.toISOString().split('T')[0] }));
    };

    calculateValidity();
  }, [formData.billingCycle, formData.plan]);

  const handleCEPChange = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, cep: cleanCEP }));

    if (cleanCEP.length === 8) {
      setLoading(true);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            address: data.street,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state
          }));
        }
      } catch (error) {
        console.error("Error fetching CEP:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleGoogleLogin();
      return;
    }

    setSubmitting(true);
    const path = `users/${user.uid}`;
    try {
      // Prepare data for Firestore (removing non-serializable fields for now, should handle upload separately if needed)
      const dataToSave = {
        fullName: formData.fullName,
        socialName: formData.socialName,
        email: user.email,
        race: formData.race,
        gender: formData.gender,
        cep: formData.cep,
        address: formData.address,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        cpf: formData.cpf,
        rg: formData.rg,
        birthDate: formData.birthDate,
        motherName: formData.motherName,
        plan: formData.plan,
        billingCycle: formData.billingCycle,
        validityDate: formData.validityDate,
        userType: formData.userType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), dataToSave);

      // If superadmin, also add to admins collection for rules validation
      if (formData.userType === 'superadmin') {
        const adminPath = `admins/${user.uid}`;
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            createdAt: serverTimestamp()
          });
        } catch (adminError) {
          // If first time setting up, the rules might block this until the email check passes
          console.warn("Could not set admin doc initially, will retry if email check allows:", adminError);
        }
      }

      alert("Cadastro realizado com sucesso e salvo no banco de dados!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-5 py-4 bg-white border border-tsuru-blue/20 rounded-2xl outline-none focus:ring-2 focus:ring-tsuru-blue/20 transition-all text-tsuru-ink placeholder:text-tsuru-muted/50";
  const labelClass = "block text-xs font-bold text-tsuru-muted uppercase tracking-widest mb-2 ml-1";

  if (isLoginIntent && !user) {
    return (
      <section className="py-32 px-6 bg-tsuru-bg min-h-[60vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl border border-tsuru-blue/10 max-w-md w-full text-center"
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-tsuru-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-tsuru-blue" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-tsuru-navy mb-4">{t('common.login')}</h2>
            <p className="text-tsuru-muted">Acesse seu histórico médico com segurança.</p>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-tsuru-navy text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-tsuru-blue transition-all shadow-xl shadow-tsuru-navy/20"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Google
          </button>
          
          <p className="mt-8 text-sm text-tsuru-muted">
            Ainda não tem uma conta? <br />
            <button 
              onClick={() => {
                // This is a bit tricky as App handles view. 
                // In a real app we'd have a router or a parent callback.
                // For now, we'll just show the reg form by setting isLoginIntent to false locally if we had that state, 
                // but since it's a prop, we should probably just show the reg button.
              }} 
              className="text-tsuru-blue font-bold mt-2"
            >
              Crie uma agora mesmo
            </button>
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-tsuru-navy mb-4">{t('registration.title')}</h2>
          <p className="text-tsuru-muted">{t('registration.subtitle')}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Personal Info */}
          <div className="bg-tsuru-bg/50 p-8 md:p-12 rounded-[2.5rem] border border-tsuru-blue/10">
            <h3 className="text-xl font-bold text-tsuru-navy mb-8 flex items-center gap-3">
              <User className="w-6 h-6 text-tsuru-blue" />
              {t('registration.personalInfo')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Upload */}
              <div className="md:col-span-2 flex flex-col items-center mb-8">
                <label className="relative cursor-pointer group">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-tsuru-blue/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-tsuru-blue/30">
                    {formData.photo ? (
                      <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-10 h-10 text-tsuru-blue/30 transition-transform group-hover:scale-110" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.files?.[0] || null }))}
                  />
                  <div className="absolute bottom-0 right-0 bg-tsuru-blue text-white p-2 rounded-full shadow-lg">
                    <Check className="w-4 h-4" />
                  </div>
                </label>
                <span className={labelClass + " mt-4"}>{t('registration.photo')}</span>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>{t('registration.fullName')}</label>
                <input required type="text" className={inputClass} value={formData.fullName} onChange={e => setFormData(p => ({...p, fullName: e.target.value}))} />
              </div>

              <div>
                <label className={labelClass}>{t('registration.socialName')}</label>
                <input type="text" className={inputClass} value={formData.socialName} onChange={e => setFormData(p => ({...p, socialName: e.target.value}))} />
              </div>

              <div>
                <label className={labelClass}>{t('registration.birthDate')}</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue pointer-events-none" />
                  <input required type="date" className={inputClass + " pl-12"} value={formData.birthDate} onChange={e => setFormData(p => ({...p, birthDate: e.target.value}))} />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('registration.race')}</label>
                <div className="relative">
                  <select className={inputClass + " appearance-none"} value={formData.race} onChange={e => setFormData(p => ({...p, race: e.target.value}))}>
                    {Object.entries(t('registration.races', { returnObjects: true })).map(([key, value]) => (
                      <option key={key} value={key}>{value as string}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('registration.gender')}</label>
                <div className="relative">
                  <select className={inputClass + " appearance-none"} value={formData.gender} onChange={e => setFormData(p => ({...p, gender: e.target.value}))}>
                    {Object.entries(t('registration.genders', { returnObjects: true })).map(([key, value]) => (
                      <option key={key} value={key}>{value as string}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>{t('registration.motherName')}</label>
                <input required type="text" className={inputClass} value={formData.motherName} onChange={e => setFormData(p => ({...p, motherName: e.target.value}))} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-tsuru-bg/50 p-8 md:p-12 rounded-[2.5rem] border border-tsuru-blue/10">
            <h3 className="text-xl font-bold text-tsuru-navy mb-8 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-tsuru-blue" />
              {t('registration.addressInfo')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>{t('registration.cep')}</label>
                <input 
                  required 
                  maxLength={8}
                  type="text" 
                  className={inputClass} 
                  placeholder="00000000"
                  value={formData.cep} 
                  onChange={e => handleCEPChange(e.target.value)} 
                />
              </div>

              <div className="md:col-span-3">
                <label className={labelClass}>{t('registration.address')}</label>
                <input required type="text" className={inputClass} value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} />
              </div>

              <div>
                <label className={labelClass}>{t('registration.number')}</label>
                <input required type="text" className={inputClass} value={formData.number} onChange={e => setFormData(p => ({...p, number: e.target.value}))} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>{t('registration.neighborhood')}</label>
                <input required type="text" className={inputClass} value={formData.neighborhood} onChange={e => setFormData(p => ({...p, neighborhood: e.target.value}))} />
              </div>

              <div>
                <label className={labelClass}>{t('registration.complement')}</label>
                <input type="text" className={inputClass} value={formData.complement} onChange={e => setFormData(p => ({...p, complement: e.target.value}))} />
              </div>

              <div>
                <label className={labelClass}>{t('registration.city')}</label>
                <input required type="text" className={inputClass} value={formData.city} onChange={e => setFormData(p => ({...p, city: e.target.value}))} />
              </div>

              <div>
                <label className={labelClass}>{t('registration.state')}</label>
                <input required type="text" className={inputClass} value={formData.state} onChange={e => setFormData(p => ({...p, state: e.target.value}))} />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-tsuru-bg/50 p-8 md:p-12 rounded-[2.5rem] border border-tsuru-blue/10">
            <h3 className="text-xl font-bold text-tsuru-navy mb-8 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-tsuru-blue" />
              {t('registration.documents')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t('registration.cpf')}</label>
                <input required type="text" className={inputClass} value={formData.cpf} onChange={e => setFormData(p => ({...p, cpf: e.target.value}))} />
              </div>

              <div>
                <label className={labelClass}>{t('registration.rg')}</label>
                <input required type="text" className={inputClass} value={formData.rg} onChange={e => setFormData(p => ({...p, rg: e.target.value}))} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>{t('registration.documentPhoto')}</label>
                <label className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed border-tsuru-blue/20 rounded-[2rem] bg-white cursor-pointer hover:bg-tsuru-blue/5 transition-all group">
                  {formData.documentPhoto ? (
                    <div className="flex items-center gap-4 text-tsuru-blue font-bold">
                      <FileText className="w-10 h-10" />
                      <span>{formData.documentPhoto.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-tsuru-blue/30 mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-sm text-tsuru-muted">Clique ou arraste o arquivo (PDF, PNG, JPG)</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept=".pdf,image/*" 
                    className="hidden" 
                    onChange={(e) => setFormData(prev => ({ ...prev, documentPhoto: e.target.files?.[0] || null }))}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Plan Selection Sync */}
          <div className="bg-tsuru-blue p-8 md:p-12 rounded-[2.5rem] text-white shadow-xl shadow-tsuru-blue/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-70">{t('registration.selectedPlan')}</h3>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-white/20 transition-all text-white appearance-none cursor-pointer"
                    value={formData.plan}
                    onChange={e => setFormData(p => ({...p, plan: e.target.value}))}
                  >
                    <option value="dopamina" className="text-tsuru-ink">{t('plans.dopamina.name')}</option>
                    <option value="ocitocina" className="text-tsuru-ink">{t('plans.ocitocina.name')}</option>
                    <option value="serotonina" className="text-tsuru-ink">{t('plans.serotonina.name')}</option>
                    <option value="endorfina" className="text-tsuru-ink">{t('plans.endorfina.name')}</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-70">{t('registration.billingCycle')}</h3>
                <div className="relative">
                  <select 
                    disabled={formData.plan === 'dopamina'}
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-white/20 transition-all text-white appearance-none cursor-pointer disabled:opacity-50"
                    value={formData.plan === 'dopamina' ? 'mensal' : formData.billingCycle}
                    onChange={e => setFormData(p => ({...p, billingCycle: e.target.value as "mensal" | "anual"}))}
                  >
                    <option value="mensal" className="text-tsuru-ink">{t('registration.mensal')}</option>
                    <option value="anual" className="text-tsuru-ink">{t('registration.anual')}</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 opacity-70" />
                    <span className="font-bold uppercase tracking-widest text-sm opacity-70">{t('registration.planValidity')}</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {formData.validityDate ? new Date(formData.validityDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full py-6 bg-tsuru-navy text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-tsuru-navy/30 hover:bg-tsuru-blue transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processando...
              </>
            ) : user ? (
              t('registration.submit')
            ) : (
              <>
                <LogIn className="w-6 h-6" />
                Login com Google para Continuar
              </>
            )}
          </motion.button>
        </form>
      </div>
    </section>
  );
}
