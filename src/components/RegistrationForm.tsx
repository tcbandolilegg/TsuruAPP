import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, MapPin, CreditCard, User, Calendar, FileText, ChevronDown, Check, LogIn, Loader2, Copy, Download, QrCode, Wallet, Eye, EyeOff, Mail, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import GoogleLoginModal from "./GoogleLoginModal";

interface RegistrationFormProps {
  selectedPlan: string;
  isLoginIntent?: boolean;
  onRegistrationComplete?: () => void;
}

const planPrices = {
  dopamina: { mensal: "R$ 9,49", anual: "R$ 94,90" },
  ocitocina: { mensal: "R$ 16,49", anual: "R$ 164,90" },
  serotonina: { mensal: "R$ 36,49", anual: "R$ 364,90" },
  endorfina: { mensal: "R$ 126,49", anual: "R$ 1.264,90" }
};

export default function RegistrationForm({ selectedPlan, isLoginIntent, onRegistrationComplete }: RegistrationFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [localLoginIntent, setLocalLoginIntent] = useState(isLoginIntent);

  // Email and Password States
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  useEffect(() => {
    setLocalLoginIntent(isLoginIntent);
  }, [isLoginIntent]);

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<"cartao" | "pix" | "boleto">("cartao");
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isBoletoDownloading, setIsBoletoDownloading] = useState(false);

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

  // Removed restriction that forced dopamina to be monthly only, allowing annual for all plans
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
    setIsGoogleModalOpen(true);
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Por favor, preencha o e-mail e a senha.");
      return;
    }
    
    setLoading(true);
    setLoginError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setUser(result.user);
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setLoginError("E-mail ou senha incorretos.");
      } else if (error.code === "auth/invalid-email") {
        setLoginError("Endereço de e-mail inválido.");
      } else {
        setLoginError("Erro ao fazer login: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let activeUser = user;
    
    if (!activeUser) {
      if (!emailInput) {
        alert("Por favor, informe seu e-mail para continuar.");
        return;
      }
      if (!hasMinLength || !hasNumber || !hasUppercase || !hasSpecial) {
        alert("A senha precisa ter no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial.");
        return;
      }
      if (password !== confirmPassword) {
        alert("A confirmação da senha não corresponde à senha digitada.");
        return;
      }
      
      setSubmitting(true);
      try {
        const result = await createUserWithEmailAndPassword(auth, emailInput, password);
        activeUser = result.user;
        setUser(activeUser);
      } catch (error: any) {
        console.error("Error creating email/password user:", error);
        if (error.code === "auth/email-already-in-use") {
          alert("Este e-mail já está cadastrado. Vá em 'Acessar' para fazer login.");
        } else if (error.code === "auth/invalid-email") {
          alert("E-mail inválido.");
        } else if (error.code === "auth/weak-password") {
          alert("Senha fraca.");
        } else {
          alert("Erro ao criar conta: " + error.message);
        }
        setSubmitting(false);
        return;
      }
    }

    if (!activeUser) {
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    const path = `users/${activeUser.uid}`;
    try {
      // Prepare data for Firestore (removing non-serializable fields for now, should handle upload separately if needed)
      const dataToSave = {
        fullName: formData.fullName,
        socialName: formData.socialName,
        email: activeUser.email,
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
        userType: activeUser.email === 'tcbandolilegg@gmail.com' ? 'superadmin' : 'user',
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "cartao" ? "pago" : "pendente",
        cardLast4: paymentMethod === "cartao" && cardData.number ? cardData.number.trim().slice(-4) : "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', activeUser.uid), dataToSave);

      // If superadmin, also add to admins collection for rules validation
      if (dataToSave.userType === 'superadmin') {
        const adminPath = `admins/${activeUser.uid}`;
        try {
          await setDoc(doc(db, 'admins', activeUser.uid), {
            email: activeUser.email,
            createdAt: serverTimestamp()
          });
        } catch (adminError) {
          // If first time setting up, the rules might block this until the email check passes
          console.warn("Could not set admin doc initially, will retry if email check allows:", adminError);
        }
      }

      alert("Cadastro realizado com sucesso e salvo no banco de dados!");
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-5 py-4 bg-white border border-tsuru-blue/20 rounded-2xl outline-none focus:ring-2 focus:ring-tsuru-blue/20 transition-all text-tsuru-ink placeholder:text-tsuru-muted/50";
  const labelClass = "block text-xs font-bold text-tsuru-muted uppercase tracking-widest mb-2 ml-1";

  if (localLoginIntent && !user) {
    return (
      <>
        <section className="py-32 px-6 bg-tsuru-bg min-h-[60vh] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-tsuru-blue/10 max-w-md w-full"
          >
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-tsuru-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-tsuru-blue" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-tsuru-navy mb-2">{t('common.login')}</h2>
              <p className="text-sm text-tsuru-muted">Acesse seu histórico médico com segurança.</p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs flex items-start gap-2.5">
                <span className="font-bold text-sm leading-none">⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleEmailPasswordLogin} className="space-y-4 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-tsuru-muted uppercase tracking-wider mb-1 ml-1">E-mail</label>
                <input 
                  required
                  type="email" 
                  placeholder="seu@email.com" 
                  className={inputClass} 
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-tsuru-muted uppercase tracking-wider mb-1 ml-1">Senha</label>
                <div className="relative">
                  <input 
                    required
                    type={loginPasswordVisible ? "text" : "password"} 
                    placeholder="Sua senha" 
                    className={inputClass + " pr-12"} 
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setLoginPasswordVisible(!loginPasswordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-tsuru-muted hover:text-tsuru-blue transition-colors"
                  >
                    {loginPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-tsuru-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-tsuru-navy transition-all shadow-lg shadow-tsuru-blue/10 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </form>

            <div className="flex items-center my-6">
              <hr className="flex-1 border-gray-100" />
              <span className="px-3 text-xs text-tsuru-muted font-bold uppercase tracking-wider">ou</span>
              <hr className="flex-1 border-gray-100" />
            </div>
            
            <button
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-tsuru-navy text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-tsuru-blue transition-all shadow-xl shadow-tsuru-navy/20"
            >
              <LogIn className="w-5 h-5" />
              Entrar com Google
            </button>
            
            <p className="mt-8 text-center text-sm text-tsuru-muted">
              Ainda não tem uma conta? <br />
              <button 
                type="button"
                onClick={() => {
                  setLocalLoginIntent(false);
                }} 
                className="text-tsuru-blue font-bold mt-2 hover:underline"
              >
                Crie uma agora mesmo
              </button>
            </p>
          </motion.div>
        </section>

        <GoogleLoginModal 
          isOpen={isGoogleModalOpen} 
          onClose={() => setIsGoogleModalOpen(false)}
          onSuccess={(firebaseUser) => {
            console.log("Successfully authenticated with account choice:", firebaseUser.email);
            setUser(firebaseUser);
            if (onRegistrationComplete) {
              onRegistrationComplete();
            }
          }}
        />
      </>
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
          {/* Account Credentials */}
          <div className="bg-tsuru-bg/50 p-8 md:p-12 rounded-[2.5rem] border border-tsuru-blue/10">
            <h3 className="text-xl font-bold text-tsuru-navy mb-8 flex items-center gap-3">
              <KeyRound className="w-6 h-6 text-tsuru-blue" />
              Dados de Acesso
            </h3>

            {user ? (
              <div className="p-6 bg-green-50 border border-green-100 rounded-3xl text-sm text-green-800 flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg">✓</span>
                <div>
                  <span className="block font-bold">Autenticado via Google</span>
                  <span className="text-xs opacity-80">{user.email} (Senha não requerida)</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue/50 pointer-events-none" />
                    <input 
                      required 
                      type="email" 
                      className={inputClass + " pl-12"} 
                      placeholder="seu@email.com"
                      value={emailInput} 
                      onChange={e => setEmailInput(e.target.value)} 
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Senha</label>
                  <div className="relative">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue/50 pointer-events-none" />
                    <input 
                      required 
                      type={passwordVisible ? "text" : "password"} 
                      className={inputClass + " pl-12 pr-12"} 
                      placeholder="Crie uma senha forte"
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-tsuru-muted hover:text-tsuru-blue transition-colors"
                    >
                      {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {password.length > 0 && (
                    <div className="mt-3 p-4 bg-white/80 rounded-2xl border border-tsuru-blue/10 text-xs space-y-2">
                      <p className="font-bold text-tsuru-navy mb-1 text-[11px] uppercase tracking-wider">Requisitos da Senha:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full transition-colors ${hasMinLength ? "bg-green-500" : "bg-gray-300"}`} />
                          <span className={hasMinLength ? "text-green-700 font-medium" : "text-tsuru-muted"}>Mínimo 8 caracteres</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full transition-colors ${hasUppercase ? "bg-green-500" : "bg-gray-300"}`} />
                          <span className={hasUppercase ? "text-green-700 font-medium" : "text-tsuru-muted"}>Uma letra maiúscula</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full transition-colors ${hasNumber ? "bg-green-500" : "bg-gray-300"}`} />
                          <span className={hasNumber ? "text-green-700 font-medium" : "text-tsuru-muted"}>Um número</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full transition-colors ${hasSpecial ? "bg-green-500" : "bg-gray-300"}`} />
                          <span className={hasSpecial ? "text-green-700 font-medium" : "text-tsuru-muted"}>Um caractere especial (ex: @, #, $, %)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Confirmar Senha</label>
                  <div className="relative">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-blue/50 pointer-events-none" />
                    <input 
                      required 
                      type={confirmPasswordVisible ? "text" : "password"} 
                      className={inputClass + " pl-12 pr-12"} 
                      placeholder="Repita a senha digitada"
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-tsuru-muted hover:text-tsuru-blue transition-colors"
                    >
                      {confirmPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${passwordsMatch ? "bg-green-500" : "bg-red-500"}`} />
                      <span className={passwordsMatch ? "text-green-700 font-medium" : "text-red-600 font-medium"}>
                        {passwordsMatch ? "As senhas coincidem" : "As senhas não coincidem"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
                <label className={labelClass}>
                  {t('registration.cep')} <span className="text-[11px] text-tsuru-muted/80 font-normal lowercase italic font-sans"> (apenas números)</span>
                </label>
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

          {/* Plan Selection Sync with values shown next to it */}
          <div className="bg-tsuru-navy p-8 md:p-12 rounded-[2.5rem] text-white shadow-xl shadow-tsuru-navy/20 border border-tsuru-blue/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Calendar className="w-6 h-6 text-tsuru-blue" />
              Seleção do Plano e Faturamento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-white/70">
                  {t('registration.selectedPlan')}
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-white/30 transition-all text-white appearance-none cursor-pointer font-bold text-lg"
                    value={formData.plan}
                    onChange={e => setFormData(p => ({...p, plan: e.target.value}))}
                  >
                    <option value="dopamina" className="text-tsuru-ink">DOPAMINA</option>
                    <option value="ocitocina" className="text-tsuru-ink">OCITOCINA</option>
                    <option value="serotonina" className="text-tsuru-ink">SEROTONINA</option>
                    <option value="endorfina" className="text-tsuru-ink">ENDORFINA</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 pointer-events-none" />
                </div>
                
                <p className="mt-4 text-xs text-white/60 leading-relaxed">
                  Ao selecionar um plano, você pode escolher o ciclo de faturamento mensal ou anual ao lado. O plano anual concede vantagens e vigência de 1 ano.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-white/70">
                  Opções de Valores para o Plano {formData.plan.toUpperCase()}
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Monthly Option Card */}
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, billingCycle: "mensal" }))}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      formData.billingCycle === "mensal"
                        ? "border-tsuru-blue bg-white/10 ring-2 ring-tsuru-blue"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold opacity-60">Mensal</span>
                      <div className="text-xl font-extrabold mt-1 text-white">
                        {planPrices[formData.plan as keyof typeof planPrices]?.mensal || "R$ 0,00"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-white/80">
                      {formData.billingCycle === "mensal" ? (
                        <span className="w-2 h-2 rounded-full bg-tsuru-blue" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white/30" />
                      )}
                      <span>Selecionado</span>
                    </div>
                  </button>

                  {/* Annual Option Card */}
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, billingCycle: "anual" }))}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      formData.billingCycle === "anual"
                        ? "border-tsuru-blue bg-white/10 ring-2 ring-tsuru-blue"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold opacity-60">Anual</span>
                      <div className="text-xl font-extrabold mt-1 text-white">
                        {planPrices[formData.plan as keyof typeof planPrices]?.anual || "R$ 0,00"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-white/80">
                      {formData.billingCycle === "anual" ? (
                        <span className="w-2 h-2 rounded-full bg-tsuru-blue" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white/30" />
                      )}
                      <span>Selecionado</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-tsuru-blue" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-widest font-bold text-white/60">Ciclo Ativo</span>
                    <span className="text-sm font-bold capitalize">Faturamento {formData.billingCycle}</span>
                  </div>
                </div>

                <div className="text-right sm:text-right w-full sm:w-auto">
                  <span className="block text-xs uppercase tracking-widest font-bold text-white/60 mb-1">Data de Vencimento / Vigência</span>
                  <span className="text-2xl font-black text-tsuru-blue">
                    {formData.validityDate ? new Date(formData.validityDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method section */}
          <div className="bg-tsuru-bg/50 p-8 md:p-12 rounded-[2.5rem] border border-tsuru-blue/10">
            <h3 className="text-xl font-bold text-tsuru-navy mb-4 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-tsuru-blue" />
              Método de Pagamento
            </h3>
            <p className="text-sm text-tsuru-muted mb-8">
              Selecione sua forma de pagamento preferida para ativar sua conta Tsuru Health.
            </p>

            {/* Method selection tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Credit Card Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cartao")}
                className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                  paymentMethod === "cartao"
                    ? "border-tsuru-blue bg-white shadow-md ring-1 ring-tsuru-blue"
                    : "border-gray-200 bg-white/60 hover:bg-white"
                }`}
              >
                <div className={`p-3 rounded-xl ${paymentMethod === "cartao" ? "bg-tsuru-blue/10 text-tsuru-blue" : "bg-gray-100 text-gray-500"}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-tsuru-navy">Cartão de Crédito</div>
                  <div className="text-xs text-tsuru-muted">Ativação instantânea</div>
                </div>
              </button>

              {/* PIX Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod("pix")}
                className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                  paymentMethod === "pix"
                    ? "border-tsuru-blue bg-white shadow-md ring-1 ring-tsuru-blue"
                    : "border-gray-200 bg-white/60 hover:bg-white"
                }`}
              >
                <div className={`p-3 rounded-xl ${paymentMethod === "pix" ? "bg-tsuru-blue/10 text-tsuru-blue" : "bg-gray-100 text-gray-500"}`}>
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-tsuru-navy">PIX</div>
                  <div className="text-xs text-tsuru-muted">Aprovação imediata</div>
                </div>
              </button>

              {/* Boleto Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod("boleto")}
                className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                  paymentMethod === "boleto"
                    ? "border-tsuru-blue bg-white shadow-md ring-1 ring-tsuru-blue"
                    : "border-gray-200 bg-white/60 hover:bg-white"
                }`}
              >
                <div className={`p-3 rounded-xl ${paymentMethod === "boleto" ? "bg-tsuru-blue/10 text-tsuru-blue" : "bg-gray-100 text-gray-500"}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-tsuru-navy">Boleto Bancário</div>
                  <div className="text-xs text-tsuru-muted">Compensação 1-2 dias</div>
                </div>
              </button>
            </div>

            {/* Method Details Panels */}
            <AnimatePresence mode="wait">
              {paymentMethod === "cartao" && (
                <motion.div
                  key="cartao"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-100"
                >
                  <h4 className="font-bold text-tsuru-navy text-sm border-b border-gray-100 pb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-tsuru-blue" />
                    Dados do Cartão de Crédito
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={labelClass}>Número do Cartão</label>
                      <input
                        type="text"
                        required={paymentMethod === "cartao"}
                        maxLength={19}
                        placeholder="0000 0000 0000 0000"
                        className={inputClass}
                        value={cardData.number}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                          setCardData({ ...cardData, number: val });
                        }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>Nome Impresso no Cartão</label>
                      <input
                        type="text"
                        required={paymentMethod === "cartao"}
                        placeholder="NOME COMPLETO"
                        className={inputClass + " uppercase"}
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Validade (MM/AA)</label>
                      <input
                        type="text"
                        required={paymentMethod === "cartao"}
                        maxLength={5}
                        placeholder="MM/AA"
                        className={inputClass}
                        value={cardData.expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 2) {
                            val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                          }
                          setCardData({ ...cardData, expiry: val });
                        }}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Código de Segurança (CVV)</label>
                      <input
                        type="text"
                        required={paymentMethod === "cartao"}
                        maxLength={4}
                        placeholder="123"
                        className={inputClass}
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {paymentMethod === "pix" && (
                <motion.div
                  key="pix"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 flex flex-col items-center text-center space-y-6"
                >
                  <h4 className="font-bold text-tsuru-navy text-sm border-b border-gray-100 pb-3 w-full text-left flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-tsuru-blue" />
                    Pagamento via PIX Instantâneo
                  </h4>

                  {/* Visual QR Code simulation */}
                  <div className="relative p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center">
                    <div className="w-44 h-44 bg-white border-2 border-dashed border-tsuru-blue/20 rounded-xl flex items-center justify-center overflow-hidden">
                      {/* Stylized QR Code placeholder */}
                      <div className="relative w-36 h-36 flex flex-col justify-between p-2">
                        <div className="flex justify-between">
                          <div className="w-8 h-8 border-4 border-tsuru-navy" />
                          <div className="w-8 h-8 border-4 border-tsuru-navy" />
                        </div>
                        {/* Interactive scan line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-tsuru-blue animate-bounce opacity-70" />
                        
                        {/* Mock QR content dots */}
                        <div className="flex flex-wrap gap-1 justify-center opacity-80 select-none pointer-events-none p-1">
                          {Array.from({ length: 48 }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-sm ${i % 3 === 0 || i % 7 === 0 ? "bg-tsuru-navy" : "bg-transparent"}`} />
                          ))}
                        </div>
                        <div className="flex justify-between">
                          <div className="w-8 h-8 border-4 border-tsuru-navy" />
                          <div className="w-8 h-8 border-t-4 border-l-4 border-tsuru-navy" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-tsuru-blue mt-2">QR Code Tsuru Oficial</span>
                  </div>

                  <div className="max-w-md space-y-4">
                    <p className="text-xs text-tsuru-muted">
                      Escaneie o código acima usando o aplicativo do seu banco ou copie a Chave PIX fornecida abaixo.
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-xs font-mono text-tsuru-navy outline-none"
                        value="contato@tsuru.app.br"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("contato@tsuru.app.br");
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="px-4 py-3 bg-tsuru-navy hover:bg-tsuru-blue text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {isCopied ? "Copiado!" : "Copiar"}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 py-2 px-4 rounded-full border border-green-200 inline-block">
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprovação e ativação em menos de 1 minuto</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {paymentMethod === "boleto" && (
                <motion.div
                  key="boleto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 space-y-6"
                >
                  <h4 className="font-bold text-tsuru-navy text-sm border-b border-gray-100 pb-3 w-full text-left flex items-center gap-2">
                    <FileText className="w-4 h-4 text-tsuru-blue" />
                    Pagamento por Boleto Bancário
                  </h4>

                  <div className="p-6 bg-amber-50/50 border border-amber-200/60 rounded-2xl flex flex-col md:flex-row items-center gap-5">
                    <div className="p-4 bg-amber-100/60 rounded-full text-amber-800">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center md:text-left space-y-1">
                      <div className="font-bold text-sm text-amber-900">Atenção ao prazo de liberação</div>
                      <p className="text-xs text-amber-800 max-w-lg">
                        Boletos levam entre 1 a 2 dias úteis para compensação bancária automática pelo sistema. Sua conta do Tsuru será ativada imediatamente após recebermos a confirmação.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Linha Digitável do Boleto</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-xs font-mono text-tsuru-navy outline-none"
                          value="34191.79001 01043.513184 91020.150008 7 934500000"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("34191.79001 01043.513184 91020.150008 7 934500000");
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className="px-4 py-3 bg-tsuru-navy hover:bg-tsuru-blue text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {isCopied ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
                      <div className="text-xs text-tsuru-muted text-center sm:text-left">
                        Você também pode baixar o documento oficial do boleto em formato PDF para impressão ou leitura de código de barras.
                      </div>
                      
                      <button
                        type="button"
                        disabled={isBoletoDownloading}
                        onClick={() => {
                          setIsBoletoDownloading(true);
                          setTimeout(() => {
                            setIsBoletoDownloading(false);
                            alert("Download do Boleto Tsuru_Assinatura.pdf iniciado com sucesso!");
                          }, 1500);
                        }}
                        className="px-5 py-3.5 bg-tsuru-blue hover:bg-tsuru-navy text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
                      >
                        {isBoletoDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Gerando PDF...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Baixar Boleto PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

      <GoogleLoginModal 
        isOpen={isGoogleModalOpen} 
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(firebaseUser) => {
          console.log("Successfully authenticated with account choice:", firebaseUser.email);
        }}
      />
    </section>
  );
}
