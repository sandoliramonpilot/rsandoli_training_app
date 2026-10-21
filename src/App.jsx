import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
import ProcedimentosEmergencia from '@/pages/ProcedimentosEmergencia';
import TreinamentoRecorrente from '@/pages/TreinamentoRecorrente';
import BriefingEmergencia from '@/pages/BriefingEmergencia';
import RecursosAudiovisuais from '@/pages/RecursosAudiovisuais';
import ProcedimentosNormais from '@/pages/ProcedimentosNormais';
import Limitacoes from '@/pages/Limitacoes';
import Gestao from '@/pages/Gestao';
import Pilotos from '@/pages/Pilotos';
import Questoes from '@/pages/Questoes';
import Simulados from '@/pages/Simulados';
import Usuarios from '@/pages/Usuarios';
import MeuPerfil from '@/pages/MeuPerfil';
import Escalas from '@/pages/Escalas';
import PainelProgresso from '@/pages/PainelProgresso';
import MarcosProjeto from '@/pages/MarcosProjeto';
import Oat from '@/pages/Oat';
import RequireModule from '@/components/RequireModule';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import InstallPrompt from '@/components/InstallPrompt';
import { ProfileProvider } from '@/lib/ProfileContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import Sobre from '@/pages/Sobre';
import Contato from '@/pages/Contato';
import Privacidade from '@/pages/Privacidade';
import Termos from '@/pages/Termos';
import Configuracoes from '@/pages/Configuracoes';
import UpdatePrompt from '@/components/UpdatePrompt';
// Add page imports here

const PUBLIC_TRUST_PATHS = ["/sobre", "/contato", "/privacidade", "/termos"];

const AuthenticatedApp = () => {
  const location = useLocation();
  const isPublicTrustPage = PUBLIC_TRUST_PATHS.includes(location.pathname);
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(
    () => localStorage.getItem("terms_accepted") === "true"
  );

  // A tela de abertura permanece visível somente durante o carregamento real.
  useEffect(() => {
    if (!isLoadingPublicSettings && !isLoadingAuth) {
      document.getElementById("app-splash")?.remove();
    }
  }, [isLoadingPublicSettings, isLoadingAuth]);

  // Show loading spinner while checking app public settings or auth
  if (!isPublicTrustPage && (isLoadingPublicSettings || isLoadingAuth)) {
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
    } else if (authError.type === 'auth_required' && !isPublicTrustPage) {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Após autenticação confirmada, exige aceite dos termos antes de liberar o app
  if (!termsAccepted && !isPublicTrustPage) {
    return <TermsModal onAccept={() => setTermsAccepted(true)} />;
  }

  // Render the main app
  return (
    <Routes>
      {/* Public trust pages — no auth required */}
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/termos" element={<Termos />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<RequireModule moduleId="dashboard"><Dashboard /></RequireModule>} />
        <Route path="/flight-log" element={<RequireModule moduleId="diario_bordo"><FlightLog /></RequireModule>} />
        <Route path="/aircraft" element={<Aircraft />} />
        <Route path="/checklist" element={<RequireModule moduleId="checklists"><Checklist /></RequireModule>} />
        <Route path="/qrh" element={<QRH />} />
        <Route path="/qrh-efis" element={<QRHEfis />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/treinamentos" element={<Treinamentos />} />
        <Route path="/aw119-training" element={<RequireModule moduleId="aw119_training"><AW119Training /></RequireModule>} />
        <Route path="/treinamentos-gerais" element={<TreinamentosGerais />} />
        <Route path="/limitacoes" element={<Limitacoes />} />
        <Route path="/procedimentos-normais" element={<ProcedimentosNormais />} />
        <Route path="/procedimentos-emergencia" element={<ProcedimentosEmergencia />} />
        <Route path="/treinamento-recorrente" element={<TreinamentoRecorrente />} />
        <Route path="/recursos-visuais" element={<RecursosAudiovisuais />} />
        <Route path="/recursos-audiovisuais" element={<RecursosAudiovisuais />} />
        <Route path="/briefing-emergencia" element={<RequireModule moduleId="briefing_emergencia"><BriefingEmergencia /></RequireModule>} />
        <Route path="/gestao" element={<RequireModule moduleId="gestao"><Gestao /></RequireModule>} />
        <Route path="/pilotos" element={<Pilotos />} />
        <Route path="/oat" element={<Oat />} />
        <Route path="/escalas" element={<Escalas />} />
        <Route path="/questoes" element={<Questoes />} />
        <Route path="/simulados" element={<Simulados />} />
        <Route path="/usuarios" element={<RequireModule moduleId="usuarios"><Usuarios /></RequireModule>} />
        <Route path="/perfil" element={<MeuPerfil />} />
        <Route path="/painel-progresso" element={<PainelProgresso />} />
        <Route path="/marcos-projeto" element={<MarcosProjeto />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
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
          <ThemeProvider>
            <ProfileProvider>
              <AuthenticatedApp />
            </ProfileProvider>
          </ThemeProvider>
        </Router>
        <InstallPrompt />
        <UpdatePrompt />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App