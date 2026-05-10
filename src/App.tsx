/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Navbar from "./components/Navbar";
import InstagramHero from "./components/InstagramHero";
import RegistrationForm from "./components/RegistrationForm";
import Plans from "./components/Plans";
import ContactModal from "./components/ContactModal";

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [view, setView] = useState<'home' | 'plans' | 'registration'>('home');
  const [selectedPlan, setSelectedPlan] = useState('dopamina');
  const [isLoginIntent, setIsLoginIntent] = useState(false);

  const goToPlans = () => {
    setIsLoginIntent(false);
    setView('plans');
    window.scrollTo(0, 0);
  };

  const handleAccess = () => {
    setIsLoginIntent(true);
    setSelectedPlan('dopamina');
    setView('registration');
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
        onRegister={goToPlans}
        onAccess={handleAccess}
        onLogoClick={goToHome}
      />
      
      {view === 'home' && (
        <InstagramHero onRegister={goToPlans} onAccess={handleAccess} />
      )}

      {view === 'plans' && (
        <Plans onSelectPlan={goToRegistration} />
      )}

      {view === 'registration' && (
        <RegistrationForm selectedPlan={selectedPlan} isLoginIntent={isLoginIntent} />
      )}

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </main>
  );
}

