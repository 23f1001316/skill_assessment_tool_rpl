import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBanner } from './components/layout/RoleSwitcherBanner';
import { Navbar } from './components/layout/Navbar';
import { AppContainer } from './components/layout/AppContainer';
import { WelcomePage } from './pages/WelcomePage';
import { WorkerPortalPage } from './pages/WorkerPortalPage';
import { AssessorPortalPage } from './pages/AssessorPortalPage';
import { CoordinatorPortalPage } from './pages/CoordinatorPortalPage';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';

function AppContent() {
  const { activeRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* PWA Install Guidance Banner (Auto-detects browser compatibility) */}
      <PwaInstallPrompt />

      {/* Top Demo Switcher & Viewport Controls */}
      <RoleSwitcherBanner />

      {/* Main Header / Navbar */}
      <Navbar />

      {/* Content Container (Mobile Frame or Full Responsive) */}
      <AppContainer>
        {activeRole === 'welcome' && <WelcomePage />}
        {activeRole === 'worker' && <WorkerPortalPage />}
        {activeRole === 'assessor' && <AssessorPortalPage />}
        {activeRole === 'coordinator' && <CoordinatorPortalPage />}
      </AppContainer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  );
}
