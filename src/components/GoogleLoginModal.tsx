import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, LogIn, Check, Sparkles, Shield, Mail, KeyRound, Loader2, AlertCircle } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from "firebase/auth";
import { auth } from "../lib/firebase";

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: FirebaseUser) => void;
}

export default function GoogleLoginModal({ isOpen, onClose, onSuccess }: GoogleLoginModalProps) {
  const [selectedEmail, setSelectedEmail] = useState<string>("tcbandolilegg@gmail.com");
  const [customEmail, setCustomEmail] = useState<string>("");
  const [step, setStep] = useState<"choose" | "authorizations" | "authenticating">("choose");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Authorizations standard checkboxes
  const [permissions, setPermissions] = useState({
    profile: true,
    email: true,
    firestore: true,
    notifications: true,
  });

  if (!isOpen) return null;

  const handleChooseAccount = (email: string, isNewAccountSelection: boolean) => {
    setIsCustom(isNewAccountSelection);
    if (!isNewAccountSelection) {
      setSelectedEmail(email);
    }
  };

  const handleNextStep = () => {
    if (isCustom) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!customEmail || !emailRegex.test(customEmail)) {
        setError("Por favor, insira um e-mail válido do Google.");
        return;
      }
      setSelectedEmail(customEmail);
    }
    setError(null);
    setStep("authorizations");
  };

  const handleAuth = async () => {
    // Basic compliance check: at least mandatory ones are true
    if (!permissions.profile || !permissions.email || !permissions.firestore) {
      setError("As permissões básicas e do Firestore são obrigatórias para continuar.");
      return;
    }

    setStep("authenticating");
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      
      // Request standard custom parameters to enforce select account and full consent/authorizations
      provider.setCustomParameters({
        login_hint: selectedEmail,
        prompt: "select_account consent",
      });

      // Add standard profile information scopes
      provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
      provider.addScope("https://www.googleapis.com/auth/userinfo.email");

      // Sign in
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        if (onSuccess) {
          onSuccess(result.user);
        }
        onClose();
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      // Friendly messages for standard errors
      if (err.code === "auth/popup-closed-by-user") {
        setError("O login foi cancelado. A janela pop-up do Google foi fechada.");
      } else {
        setError(err.message || "Ocorreu um erro ao fazer login com o Google.");
      }
      setStep("authorizations");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep("choose");
    setIsCustom(false);
    setCustomEmail("");
    setError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tsuru-navy/60 backdrop-blur-sm">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={() => {
            if (step !== "authenticating") {
              onClose();
              resetModal();
            }
          }}
        />

        {/* Modal Window */}
        <motion.div
          id="google-login-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-tsuru-blue/10 overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-tsuru-blue/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-tsuru-blue" />
              </div>
              <span className="font-serif italic text-lg font-bold text-tsuru-navy">Tsuru Security</span>
            </div>
            
            {step !== "authenticating" && (
              <button
                onClick={() => {
                  onClose();
                  resetModal();
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-8 flex-1 overflow-y-auto max-h-[75vh]">
            {/* Step 1: Account Selection */}
            {step === "choose" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-serif font-bold text-tsuru-navy mb-2">
                    Iniciar sessão com o Google
                  </h3>
                  <p className="text-sm text-tsuru-muted">
                    Selecione ou insira a conta Google que gostaria de conectar ao seu perfil de saúde do Tsuru.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Account choice A: tcbandolilegg@gmail.com */}
                  <button
                    onClick={() => handleChooseAccount("tcbandolilegg@gmail.com", false)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      !isCustom && selectedEmail === "tcbandolilegg@gmail.com"
                        ? "border-tsuru-blue bg-tsuru-blue/5 shadow-md shadow-tsuru-blue/5"
                        : "border-gray-200 hover:border-tsuru-blue/30 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tsuru-blue text-white flex items-center justify-center font-bold text-base shadow-sm">
                        TC
                      </div>
                      <div>
                        <div className="font-bold text-tsuru-ink text-sm">tcbandolilegg</div>
                        <div className="text-xs text-tsuru-muted font-mono">tcbandolilegg@gmail.com</div>
                      </div>
                    </div>
                    {!isCustom && selectedEmail === "tcbandolilegg@gmail.com" && (
                      <div className="w-5 h-5 rounded-full bg-tsuru-blue flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>

                  {/* Account choice B: New Account */}
                  <button
                    onClick={() => handleChooseAccount("", true)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isCustom
                        ? "border-tsuru-blue bg-tsuru-blue/5 shadow-md"
                        : "border-gray-200 hover:border-tsuru-blue/30 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-tsuru-ink text-sm">Usar outra conta Google</div>
                        <div className="text-xs text-tsuru-muted">Conectar com qualquer outro e-mail</div>
                      </div>
                    </div>
                    {isCustom && (
                      <div className="w-5 h-5 rounded-full bg-tsuru-blue flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Custom Email Input block */}
                {isCustom && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-2"
                  >
                    <label className="block text-xs font-bold text-tsuru-muted uppercase tracking-widest mb-2 ml-1">
                      Endereço de E-mail Google
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seu-email@gmail.com"
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value);
                        setError(null);
                      }}
                      className="w-full px-5 py-4 bg-white border border-tsuru-blue/20 rounded-2xl outline-none focus:ring-2 focus:ring-tsuru-blue/20 transition-all text-tsuru-ink placeholder:text-tsuru-muted/50"
                    />
                  </motion.div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-4.5 bg-tsuru-navy text-white rounded-2xl font-bold hover:bg-tsuru-blue transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  Continuar
                </button>
              </motion.div>
            )}

            {/* Step 2: Authorizations / Consent */}
            {step === "authorizations" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 py-1 px-3 rounded-full text-xs font-bold mb-3 border border-amber-200">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Autorizações Necessárias</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-tsuru-navy mb-2">
                    Solicitação de Permissão
                  </h3>
                  <p className="text-sm text-tsuru-muted">
                    O aplicativo Tsuru Health requer as seguintes concessões na conta <strong className="text-tsuru-navy font-mono text-xs">{selectedEmail}</strong> para funcionar corretamente.
                  </p>
                </div>

                <div className="space-y-3.5 bg-gray-50 p-5 rounded-2.5rem border border-gray-100">
                  {/* Scope 1: Basic profiles */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="perm-profile"
                      className="mt-1 accent-tsuru-blue"
                      checked={permissions.profile}
                      disabled
                    />
                    <label htmlFor="perm-profile" className="text-xs leading-relaxed text-tsuru-ink">
                      <strong className="block text-tsuru-navy font-bold">Perfil Básico (Obrigatório)</strong>
                      Permite visualizar seu nome público, foto de perfil do Google e informações básicas públicas.
                    </label>
                  </div>

                  {/* Scope 2: Email */}
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-200/60">
                    <input
                      type="checkbox"
                      id="perm-email"
                      className="mt-1 accent-tsuru-blue"
                      checked={permissions.email}
                      disabled
                    />
                    <label htmlFor="perm-email" className="text-xs leading-relaxed text-tsuru-ink">
                      <strong className="block text-tsuru-navy font-bold">Endereço de E-mail (Obrigatório)</strong>
                      Permite ler o endereço de e-mail associado para correspondências, verificação de segurança e login.
                    </label>
                  </div>

                  {/* Scope 3: Firestore Database integrity */}
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-200/60">
                    <input
                      type="checkbox"
                      id="perm-firestore"
                      className="mt-1 accent-tsuru-blue"
                      checked={permissions.firestore}
                      disabled
                    />
                    <label htmlFor="perm-firestore" className="text-xs leading-relaxed text-tsuru-ink">
                      <strong className="block text-tsuru-navy font-bold">Base de Dados Firestore (Obrigatório)</strong>
                      Autoriza ler e escrever seus dados de saúde, agendamentos e planos no Firebase Cloud Storage de forma segura.
                    </label>
                  </div>

                  {/* Scope 4: Custom Notifications */}
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-200/60">
                    <input
                      type="checkbox"
                      id="perm-notify"
                      className="mt-1 accent-tsuru-blue"
                      checked={permissions.notifications}
                      onChange={(e) => setPermissions({ ...permissions, notifications: e.target.checked })}
                    />
                    <label htmlFor="perm-notify" className="text-xs leading-relaxed text-tsuru-ink cursor-pointer">
                      <strong className="block text-tsuru-navy font-bold">Sincronização de Alertas (Opcional)</strong>
                      Permite que o aplicativo Tsuru agende atualizações e notifique sobre vencimentos de planos de longevidade.
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep("choose");
                    }}
                    className="py-4 bg-gray-100 hover:bg-gray-200 text-tsuru-navy rounded-2xl font-bold transition-all text-sm"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleAuth}
                    className="py-4 bg-tsuru-blue hover:bg-tsuru-navy text-white rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Conectar Conta
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Authing Loading State */}
            {step === "authenticating" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-tsuru-blue/20 border-t-tsuru-blue animate-spin" />
                  <KeyRound className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-tsuru-blue" />
                </div>
                
                <div>
                  <h3 className="text-xl font-serif font-bold text-tsuru-navy mb-2">
                    Conectando ao Google...
                  </h3>
                  <p className="text-sm text-tsuru-muted max-w-sm">
                    Iniciando a verificação de identidade em uma janela segura do Google para <strong className="text-tsuru-blue font-mono">{selectedEmail}</strong>.
                  </p>
                </div>

                <div className="text-xs bg-gray-50 py-3 px-5 rounded-full text-tsuru-muted border border-gray-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Criptografia ponta a ponta ativa</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
