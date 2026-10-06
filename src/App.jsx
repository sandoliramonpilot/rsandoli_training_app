import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TermsModal from "@/components/TermsModal";
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import FlightLog from '@/pages/FlightLog';
import Aircraft from '@/pages/Aircraft';
import Checklist from '@/pages/Checklist';
import QRH from '@/pages/QRH';
import QRHEfis from '@/pages/QRHEfis';
import Biblioteca from '@/pages/Biblioteca';
import Treinamentos from '@/pages/Treinamentos';
import AW119Training from '@/pages/AW119Training';
import TreinamentosGerais from '@/pages/TreinamentosGerais';
import EmConstrucao from '@/pages/EmConstrucao';
import Gestao from '@/pages/Gestao';
import Pilotos from '@/pages/Pilotos';
import Questoes from '@/pages/Questoes';
import Simulados from '@/pages/Simulados';
import Usuarios from '@/pages/Usuarios';
import MeuPerfil from '@/pages/MeuPerfil';
import Escalas from '@/pages/Escalas';
import PainelProgresso from '@/pages/PainelProgresso';
import RequireModule from '@/components/RequireModule';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(
    () => sessionStorage.getItem("terms_accepted") === "true"
  );

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Após autenticação confirmada, exige aceite dos termos antes de liberar o app
  if (!termsAccepted) {
    return <TermsModal onAccept={() => setTermsAccepted(true)} />;
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/flight-log" element={<FlightLog />} />
        <Route path="/aircraft" element={<Aircraft />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/qrh" element={<QRH />} />
        <Route path="/qrh-efis" element={<QRHEfis />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/treinamentos" element={<Treinamentos />} />
        <Route path="/aw119-training" element={<AW119Training />} />
        <Route path="/treinamentos-gerais" element={<TreinamentosGerais />} />
        <Route path="/limitacoes" element={<EmConstrucao title="Limitações" subtitle="Limitações operacionais do AW119Kx Koala." />} />
        <Route path="/procedimentos-normais" element={<EmConstrucao title="Procedimentos Normais" subtitle="Procedimentos operacionais padrão (POH)." />} />
        <Route path="/procedimentos-emergencia" element={<EmConstrucao title="Procedimentos de Emergência" subtitle="Procedimentos anormais e de emergência (QRH)." />} />
        <Route path="/treinamento-recorrente" element={<EmConstrucao title="Treinamento Recorrente" subtitle="Programa de proficiência e reciclagem periódica." />} />
        <Route path="/recursos-visuais" element={<EmConstrucao title="Recursos Visuais" subtitle="Mídia, diagramas e materiais de apoio visual." />} />
        <Route path="/briefing-emergencia" element={<EmConstrucao title="Briefing de Emergência" subtitle="Briefings e procedimentos de emergência." />} />
        <Route path="/gestao" element={<RequireModule moduleId="gestao"><Gestao /></RequireModule>} />
        <Route path="/pilotos" element={<Pilotos />} />
        <Route path="/escalas" element={<Escalas />} />
        <Route path="/questoes" element={<Questoes />} />
        <Route path="/simulados" element={<Simulados />} />
        <Route path="/usuarios" element={<RequireModule moduleId="usuarios"><Usuarios /></RequireModule>} />
        <Route path="/perfil" element={<MeuPerfil />} />
        <Route path="/painel-progresso" element={<PainelProgresso />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App