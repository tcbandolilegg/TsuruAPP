import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  FileText, 
  Calendar, 
  Plus, 
  Trash2, 
  Search, 
  LogOut, 
  Check, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Pill, 
  Stethoscope, 
  ClipboardList, 
  MapPin, 
  Download, 
  Sparkles,
  Loader2,
  FileSpreadsheet
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { signOut, User as FirebaseUser } from "firebase/auth";

interface MedicalRecordsDashboardProps {
  user: FirebaseUser;
  onLogout: () => void;
  onNavigateToRegistration?: () => void;
}

interface UserProfile {
  fullName: string;
  socialName?: string;
  email: string;
  race?: string;
  gender?: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  motherName?: string;
  plan: string;
  billingCycle: string;
  validityDate?: string;
  userType: string;
}

interface MedicalRecord {
  id: string;
  type: "consultation" | "exam" | "allergy" | "medication";
  title: string; // Doctor name, Exam name, Substance, or Medication name
  subtitle: string; // Specialty, Laboratory, Severity, or Dosage
  date: string;
  description: string; // Diagnoses, Results, Symptoms, or Frequency
  additionalInfo?: string; // Additional notes
  createdAt: any;
}

export default function MedicalRecordsDashboard({ user, onLogout, onNavigateToRegistration }: MedicalRecordsDashboardProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "consultation" | "exam" | "allergy" | "medication">("all");
  
  // New Record Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<"consultation" | "exam" | "allergy" | "medication">("consultation");
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    additionalInfo: ""
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load user profile from Firestore
  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    const userDocRef = doc(db, "users", user.uid);
    
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setProfileLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setProfileLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  // Load medical records from subcollection
  useEffect(() => {
    if (!user) return;
    setRecordsLoading(true);
    const recordsColRef = collection(db, "users", user.uid, "medical_records");
    const q = query(recordsColRef, orderBy("date", "desc"));

    const unsubscribeRecords = onSnapshot(q, (snapshot) => {
      const loadedRecords: MedicalRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedRecords.push({
          id: docSnap.id,
          type: data.type,
          title: data.title || "",
          subtitle: data.subtitle || "",
          date: data.date || "",
          description: data.description || "",
          additionalInfo: data.additionalInfo || "",
          createdAt: data.createdAt
        });
      });
      setRecords(loadedRecords);
      setRecordsLoading(false);
    }, (error) => {
      console.error("Error fetching medical records:", error);
      setRecordsLoading(false);
    });

    return () => unsubscribeRecords();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormSubmitting(true);
    try {
      const recordsColRef = collection(db, "users", user.uid, "medical_records");
      await addDoc(recordsColRef, {
        type: formType,
        title: formData.title,
        subtitle: formData.subtitle,
        date: formData.date,
        description: formData.description,
        additionalInfo: formData.additionalInfo,
        createdAt: serverTimestamp()
      });

      // Reset form
      setFormData({
        title: "",
        subtitle: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        additionalInfo: ""
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving medical record:", error);
      alert("Erro ao salvar prontuário. Por favor, tente novamente.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!user) return;
    if (!confirm("Tem certeza que deseja remover este registro médico? Esta ação é permanente.")) return;

    try {
      const recordDocRef = doc(db, "users", user.uid, "medical_records", recordId);
      await deleteDoc(recordDocRef);
    } catch (error) {
      console.error("Error deleting medical record:", error);
      alert("Erro ao excluir prontuário.");
    }
  };

  const seedSampleData = async () => {
    if (!user) return;
    try {
      const recordsColRef = collection(db, "users", user.uid, "medical_records");
      
      const sampleRecords = [
        {
          type: "consultation",
          title: "Dra. Carolina Mendonça",
          subtitle: "Cardiologia",
          date: "2026-05-12",
          description: "Consulta de rotina. Pressão arterial 12/8 mmHg. Eletrocardiograma normal.",
          additionalInfo: "Recomendado acompanhamento anual e manutenção de exercícios moderados.",
          createdAt: serverTimestamp()
        },
        {
          type: "exam",
          title: "Hemograma Completo & Lipidograma",
          subtitle: "Lab. Fleury",
          date: "2026-05-15",
          description: "Colesterol total: 190 mg/dL (Desejável < 200). Glicemia de jejum: 88 mg/dL.",
          additionalInfo: "Todos os parâmetros dentro dos limites de referência saudáveis.",
          createdAt: serverTimestamp()
        },
        {
          type: "allergy",
          title: "Dipirona Monoidratada",
          subtitle: "Gravidade: Alta",
          date: "2026-01-10",
          description: "Apresenta urticária severa, edema labial e dificuldade respiratória após ingestão.",
          additionalInfo: "Evitar qualquer medicação derivada ou composta por Dipirona.",
          createdAt: serverTimestamp()
        },
        {
          type: "medication",
          title: "Vitamina D3 (Colecalciferol)",
          subtitle: "2.000 UI por dia",
          date: "2026-03-01",
          description: "Tomar 1 cápsula via oral junto ao almoço.",
          additionalInfo: "Prescrito para manutenção de níveis séricos acima de 30 ng/mL.",
          createdAt: serverTimestamp()
        }
      ];

      for (const rec of sampleRecords) {
        await addDoc(recordsColRef, rec);
      }
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  };

  const filteredRecords = records.filter(rec => {
    const matchesTab = selectedTab === "all" || rec.type === selectedTab;
    const matchesSearch = 
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.additionalInfo?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    const lower = severity.toLowerCase();
    if (lower.includes("alta")) return "bg-red-50 text-red-700 border-red-200";
    if (lower.includes("média") || lower.includes("media")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "consultation": return <Stethoscope className="w-5 h-5 text-emerald-600" />;
      case "exam": return <FileText className="w-5 h-5 text-blue-600" />;
      case "allergy": return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "medication": return <Pill className="w-5 h-5 text-purple-600" />;
      default: return <ClipboardList className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-tsuru-bg min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10" id="medical-records-dashboard">
        {/* Profile Card Header */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-tsuru-blue/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-tsuru-blue/10 text-tsuru-blue rounded-3xl flex items-center justify-center font-bold font-serif text-2xl shadow-sm border border-tsuru-blue/20">
              {profile?.fullName ? profile.fullName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() : user.email?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-tsuru-navy">
                  {profile?.fullName || "Acesso de Saúde"}
                </h1>
                {profile?.userType === "superadmin" && (
                  <span className="px-3 py-1 bg-tsuru-navy text-white text-[10px] font-bold tracking-widest rounded-full">SUPERADMIN</span>
                )}
              </div>
              <p className="text-sm text-tsuru-muted font-mono mt-1">{user.email}</p>
              
              {profile?.plan && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 bg-tsuru-blue/10 text-tsuru-blue text-xs font-bold rounded-lg border border-tsuru-blue/20 uppercase">
                    Plano {profile.plan} ({profile.billingCycle})
                  </span>
                  <span className="text-xs text-tsuru-muted font-medium">
                    Ativo até {profile.validityDate ? new Date(profile.validityDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                window.print();
              }}
              className="flex-1 md:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-tsuru-navy rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-gray-200"
            >
              <Download className="w-4 h-4" />
              Imprimir Ficha
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 md:flex-none px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        {/* Loading States */}
        {profileLoading && (
          <div className="bg-white rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 border border-tsuru-blue/10">
            <Loader2 className="w-10 h-10 animate-spin text-tsuru-blue" />
            <p className="text-sm text-tsuru-muted">Carregando dados de saúde...</p>
          </div>
        )}

        {/* Profile incomplete / Not Registered warning */}
        {!profileLoading && !profile && (
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 text-center border-2 border-dashed border-tsuru-blue/30 max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-tsuru-navy">Seu cadastro está incompleto</h3>
              <p className="text-sm text-tsuru-muted max-w-md mx-auto">
                Seu e-mail do Google foi autenticado com sucesso, porém não encontramos um plano ativo ou ficha cadastral de saúde vinculada.
              </p>
            </div>
            <button
              onClick={onNavigateToRegistration}
              className="px-8 py-4 bg-tsuru-blue text-white rounded-2xl font-bold hover:bg-tsuru-navy transition-all shadow-lg shadow-tsuru-blue/20 text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Preencher Cadastro & Ativar Plano
            </button>
          </div>
        )}

        {/* Complete Registered Dashboard Grid */}
        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Registered Personal data & Fast indicators */}
            <div className="space-y-8">
              {/* Personal data Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-tsuru-blue/5 space-y-6">
                <h3 className="text-lg font-serif font-bold text-tsuru-navy flex items-center gap-2 border-b border-gray-100 pb-3">
                  <User className="w-5 h-5 text-tsuru-blue" />
                  Dados Cadastrais
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="block font-bold text-tsuru-muted uppercase tracking-wider text-[10px] mb-1">Nome Completo</span>
                    <span className="text-tsuru-navy font-semibold text-sm">{profile.fullName}</span>
                  </div>
                  {profile.socialName && (
                    <div>
                      <span className="block font-bold text-tsuru-muted uppercase tracking-wider text-[10px] mb-1">Nome Social</span>
                      <span className="text-tsuru-navy font-semibold text-sm">{profile.socialName}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block font-bold text-tsuru-muted uppercase tracking-wider text-[10px] mb-1">CPF</span>
                      <span className="text-tsuru-navy font-semibold text-sm">{profile.cpf || "-"}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-tsuru-muted uppercase tracking-wider text-[10px] mb-1">RG</span>
                      <span className="text-tsuru-navy font-semibold text-sm">{profile.rg || "-"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block font-bold text-tsuru-muted uppercase tracking-wider text-[10px] mb-1">Nascimento</span>
                      <span className="text-tsuru-navy font-semibold text-sm">
                        {profile.birthDate ? new Date(profile.birthDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="block font-bold text-tsuru-muted uppercase tracking-wider text-[10px] mb-1">Gênero</span>
                      <span className="text-tsuru-navy font-semibold text-sm capitalize">{profile.gender || "-"}</span>
                    </div>
                  </div>
                  {profile.motherName && (
                    <div>
                      <span className="block font-bold text-tsuru-muted uppercase tracking-wider text-[10px] mb-1">Nome da Mãe</span>
                      <span className="text-tsuru-navy font-semibold text-sm">{profile.motherName}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <span className="block font-bold text-tsuru-navy uppercase tracking-widest text-[10px] mb-2">Endereço de Correspondência</span>
                    <div className="flex gap-2 text-tsuru-muted">
                      <MapPin className="w-4 h-4 text-tsuru-blue shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-[11px]">
                        {profile.address}, {profile.number} {profile.complement ? `- ${profile.complement}` : ""}<br />
                        {profile.neighborhood} - CEP {profile.cep}<br />
                        {profile.city} / {profile.state}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Health Indicator stats */}
              <div className="bg-tsuru-navy rounded-[2.5rem] p-8 text-white shadow-xl space-y-6">
                <h3 className="text-lg font-serif font-bold flex items-center gap-2 border-b border-white/10 pb-3">
                  <Sparkles className="w-5 h-5 text-tsuru-blue" />
                  Ficha do Paciente
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-white/50 block">Registros Totais</span>
                    <span className="text-3xl font-extrabold text-tsuru-blue mt-1 block">{records.length}</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-white/50 block">Alergias Ativas</span>
                    <span className={`text-3xl font-extrabold mt-1 block ${records.filter(r => r.type === "allergy").length > 0 ? "text-red-400" : "text-white/60"}`}>
                      {records.filter(r => r.type === "allergy").length}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-white/80">
                    Seu portfólio está assegurado por criptografia de ponta a ponta e compliance com a LGPD de saúde.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side (2cols): Medical Records Directory & Search */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Directory Toolbar / Navigation */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-tsuru-blue/5 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-tsuru-navy">Prontuário de Consultas e Exames</h2>
                    <p className="text-xs text-tsuru-muted">Gerencie suas receitas, diagnósticos médicos e históricos com simplicidade.</p>
                  </div>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full sm:w-auto px-5 py-3.5 bg-tsuru-blue hover:bg-tsuru-navy text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-tsuru-blue/10"
                  >
                    {showAddForm ? "Fechar Formulário" : "Lançar Novo Registro"}
                    {showAddForm ? null : <Plus className="w-4 h-4" />}
                  </button>
                </div>

                {/* Addition Form Panel (Expandable) */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
                        <span className="font-bold text-tsuru-navy text-sm">Adicionar Registro de Saúde</span>
                        
                        {/* Tab selection for form */}
                        <div className="flex flex-wrap gap-2">
                          {(["consultation", "exam", "allergy", "medication"] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormType(type);
                                setFormData({
                                  title: "",
                                  subtitle: "",
                                  date: new Date().toISOString().split("T")[0],
                                  description: "",
                                  additionalInfo: ""
                                });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                formType === type 
                                  ? "bg-tsuru-navy text-white" 
                                  : "bg-white border border-gray-200 text-tsuru-muted hover:bg-gray-100"
                              }`}
                            >
                              {type === "consultation" && "Consulta"}
                              {type === "exam" && "Exame"}
                              {type === "allergy" && "Alergia"}
                              {type === "medication" && "Remédio"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-tsuru-muted mb-1">
                            {formType === "consultation" && "Médico(a) / Profissional"}
                            {formType === "exam" && "Nome do Exame / Procedimento"}
                            {formType === "allergy" && "Alergênico (Medicamento/Alimento)"}
                            {formType === "medication" && "Nome do Medicamento"}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={
                              formType === "consultation" ? "Ex: Dr. Marcelo Ramos" :
                              formType === "exam" ? "Ex: Ressonância Magnética do Joelho" :
                              formType === "allergy" ? "Ex: Penicilina / Glúten" : "Ex: Losartana Potássica"
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-tsuru-blue/20"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-tsuru-muted mb-1">
                            {formType === "consultation" && "Especialidade Médica"}
                            {formType === "exam" && "Laboratório / Hospital"}
                            {formType === "allergy" && "Grau de Gravidade (Alta, Média, Baixa)"}
                            {formType === "medication" && "Dosagem / Concentração"}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={
                              formType === "consultation" ? "Ex: Ortopedia / Clínica Geral" :
                              formType === "exam" ? "Ex: Laboratório Sabin" :
                              formType === "allergy" ? "Ex: Alta / Média / Baixa" : "Ex: 50mg / 1 gota por kg"
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-tsuru-blue/20"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-tsuru-muted mb-1">
                            Data do Evento / Diagnóstico
                          </label>
                          <input
                            type="date"
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-tsuru-blue/20"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-tsuru-muted mb-1">
                            {formType === "consultation" && "Diagnóstico / Motivo da Consulta"}
                            {formType === "exam" && "Status ou Resultados Principais"}
                            {formType === "allergy" && "Sintomas / Reação Alérgica Comum"}
                            {formType === "medication" && "Frequência / Forma de Uso"}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={
                              formType === "consultation" ? "Ex: Dor lombar crônica sob esforço" :
                              formType === "exam" ? "Ex: Concluído - Sem alterações estruturais" :
                              formType === "allergy" ? "Ex: Choque anafilático, coceira intensa" : "Ex: 1 comprimido ao acordar de 12h em 12h"
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-tsuru-blue/20"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-tsuru-muted mb-1">
                            Observações Médicas Adicionais (Opcional)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Adicione recomendações médicas, datas de retorno, efeitos colaterais ou receitas anexas."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-tsuru-blue/20 resize-none"
                            value={formData.additionalInfo}
                            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-all text-[11px]"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={formSubmitting}
                            className="px-6 py-2.5 bg-tsuru-blue hover:bg-tsuru-navy text-white rounded-xl font-bold transition-all text-[11px] flex items-center gap-2"
                          >
                            {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Salvar Registro
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter and Search controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center border-t border-gray-100 pt-6">
                  {/* Category select buttons */}
                  <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto scrollbar-none">
                    {[
                      { key: "all", label: "Todos" },
                      { key: "consultation", label: "Consultas" },
                      { key: "exam", label: "Exames" },
                      { key: "allergy", label: "Alergias" },
                      { key: "medication", label: "Remédios" }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSelectedTab(tab.key as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          selectedTab === tab.key
                            ? "bg-tsuru-navy text-white shadow-md shadow-tsuru-navy/10"
                            : "bg-gray-50 hover:bg-gray-100 text-tsuru-muted border border-gray-100"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search box */}
                  <div className="relative w-full md:flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tsuru-muted/50" />
                    <input
                      type="text"
                      placeholder="Pesquise por médicos, exames, medicamentos ou alergias..."
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-tsuru-blue/15 transition-all text-tsuru-ink"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Records Listing */}
                {recordsLoading ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-tsuru-blue" />
                    <span className="text-xs text-tsuru-muted">Sincronizando prontuário...</span>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="p-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 space-y-4">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto" />
                    <div className="space-y-1">
                      <p className="font-bold text-tsuru-navy text-sm">Nenhum registro encontrado</p>
                      <p className="text-xs text-tsuru-muted max-w-sm mx-auto">
                        {searchQuery || selectedTab !== "all" 
                          ? "Nenhum resultado corresponde aos seus filtros de pesquisa atuais." 
                          : "Seu prontuário eletrônico está vazio no momento."}
                      </p>
                    </div>
                    {!searchQuery && selectedTab === "all" && (
                      <button
                        onClick={seedSampleData}
                        className="px-5 py-2.5 bg-tsuru-blue/15 hover:bg-tsuru-blue/25 text-tsuru-blue rounded-xl text-xs font-bold transition-all"
                      >
                        Preencher Dados de Exemplo para Testar
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRecords.map((rec) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 md:p-6 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all shadow-sm flex justify-between items-start gap-4 group"
                      >
                        <div className="flex gap-4 items-start">
                          <div className="p-3 bg-gray-50 rounded-xl shrink-0 border border-gray-100">
                            {getRecordIcon(rec.type)}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-tsuru-navy text-sm md:text-base leading-tight">
                                {rec.title}
                              </span>
                              {rec.type === "allergy" && (
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${getSeverityColor(rec.subtitle)}`}>
                                  {rec.subtitle}
                                </span>
                              )}
                              {rec.type !== "allergy" && (
                                <span className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded-md text-[9px] font-medium uppercase tracking-wider">
                                  {rec.subtitle}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-tsuru-ink/80 leading-relaxed font-medium">
                              {rec.description}
                            </p>

                            {rec.additionalInfo && (
                              <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-[11px] text-tsuru-muted/90 italic leading-relaxed">
                                <span className="font-bold uppercase text-[9px] tracking-wider text-tsuru-navy block not-italic mb-1">Notas adicionais</span>
                                {rec.additionalInfo}
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-[10px] text-tsuru-muted pt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-tsuru-blue" />
                                {new Date(rec.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                              </span>
                              <span className="capitalize font-bold text-tsuru-blue/80">
                                {rec.type === "consultation" && "Consulta Clínica"}
                                {rec.type === "exam" && "Exame Médico"}
                                {rec.type === "allergy" && "Registro Alérgico"}
                                {rec.type === "medication" && "Medicação de Uso"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
