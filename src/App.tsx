/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import InstagramHero from "./components/InstagramHero";
import RegistrationForm from "./components/RegistrationForm";
import ContactModal from "./components/ContactModal";
import Footer from "./components/Footer";
import MedicalRecordsDashboard from "./components/MedicalRecordsDashboard";
import { auth } from "./lib/firebase";
import { User as FirebaseUser } from "firebase/auth";

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [view, setView] = useState<'home' | 'plans' | 'registration' | 'dashboard'>('home');
  const [selectedPlan, setSelectedPlan] = useState('dopamina');
  const [isLoginIntent, setIsLoginIntent] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        if (isLoginIntent) {
          setView('dashboard');
        }
      } else {
        setView('home');
      }
    });
    return () => unsubscribe();
  }, [isLoginIntent]);

  const goToPlans = () => {
    setIsLoginIntent(false);
    setSelectedPlan('dopamina');
    setView('registration');
    window.scrollTo(0, 0);
  };

  const handleAccess = () => {
    if (user) {
      setView('dashboard');
    } else {
      setIsLoginIntent(true);
      setSelectedPlan('dopamina');
      setView('registration');
    }
    window.scrollTo(0, 0);
  };

  const goToRegistration = (plan: string) => {
    setIsLoginIntent(false);
    setSelectedPlan(plan);
    setView('registration');
    window.scrollTo(0, 0);
  };

  const goToHome = () => {
    setView('home');
    window.scrollTo(0, 0);
  };

  return (
    <main className="min-h-screen">
      <Navbar 
        onOpenContact={() => setIsContactOpen(true)} 
        onAccess={handleAccess}
        onLogoClick={goToHome}
        user={user}
        onDashboardClick={() => setView('dashboard')}
      />
      
      {view === 'home' && (
        <InstagramHero onRegister={goToPlans} onAccess={handleAccess} />
      )}

      {view === 'registration' && (
        <RegistrationForm 
          selectedPlan={selectedPlan} 
          isLoginIntent={isLoginIntent} 
          onRegistrationComplete={() => setView('dashboard')}
        />
      )}

      {view === 'dashboard' && user && (
        <MedicalRecordsDashboard 
          user={user} 
          onLogout={() => {
            setUser(null);
            setView('home');
          }}
          onNavigateToRegistration={() => {
            setIsLoginIntent(false);
            setView('registration');
          }}
        />
      )}

      {view !== 'dashboard' && (
        <Footer 
          onOpenContact={() => setIsContactOpen(true)} 
          onLogoClick={goToHome}
        />
      )}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </main>
  );
}

