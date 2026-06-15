import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Sobre from './pages/Sobre';
import NotFound from './pages/NotFound';
import ClientHome from './pages/client/Home';
import ClientServices from './pages/client/Services';
import ClientProposals from './pages/client/Proposals';
import Messages from './pages/Messages';
import ClientProfile from './pages/client/Profile';
import ClientPostService from './pages/client/PostService';
import LoginClient from './pages/client/LoginClient';
import CadastroClient from './pages/client/CadastroClient';
import ProfessionalHome from './pages/professional/Home';
import ProfessionalProposals from './pages/professional/Proposals';
import ProfessionalServiceDetails from './pages/professional/ServiceDetails';
import ProfessionalSendProposal from './pages/professional/SendProposal';
import ProfessionalProfile from './pages/professional/Profile';
import LoginProfessional from './pages/professional/LoginProfessional';
import CadastroProfessional from './pages/professional/CadastroProfessional';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import OnboardingRoute from './components/OnboardingRoute';
import SubscriptionSuccess from './pages/SubscriptionSuccess';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/sobre" element={<Sobre />} />

        {/* Rotas do Cliente */}
        <Route path="/client/login" element={<LoginClient />} />
        <Route path="/client/cadastro" element={<CadastroClient />} />
        <Route
          path="/client/onboarding"
          element={
            <OnboardingRoute allowedType="CLIENTE">
              <OnboardingFlow userType="CLIENTE" />
            </OnboardingRoute>
          }
        />
        <Route
          path="/client/home"
          element={
            <ProtectedRoute allowedType="CLIENTE">
              <ClientHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/services"
          element={
            <ProtectedRoute allowedType="CLIENTE">
              <ClientServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/post-service"
          element={
            <ProtectedRoute allowedType="CLIENTE">
              <ClientPostService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/proposals"
          element={
            <ProtectedRoute allowedType="CLIENTE">
              <ClientProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/messages"
          element={
            <ProtectedRoute allowedType="CLIENTE">
              <Messages userType="CLIENTE" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/profile"
          element={
            <ProtectedRoute allowedType="CLIENTE">
              <ClientProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/subscription/success"
          element={
            <ProtectedRoute allowedType="CLIENTE">
              <SubscriptionSuccess userType="CLIENTE" />
            </ProtectedRoute>
          }
        />
        {/* Rotas do Profissional */}
        <Route path="/professional/login" element={<LoginProfessional />} />
        <Route
          path="/professional/cadastro"
          element={<CadastroProfessional />}
        />
        <Route
          path="/professional/onboarding"
          element={
            <OnboardingRoute allowedType="PROFISSIONAL">
              <OnboardingFlow userType="PROFISSIONAL" />
            </OnboardingRoute>
          }
        />
        <Route
          path="/professional/home"
          element={
            <ProtectedRoute allowedType="PROFISSIONAL">
              <ProfessionalHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professional/proposals"
          element={
            <ProtectedRoute allowedType="PROFISSIONAL">
              <ProfessionalProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professional/messages"
          element={
            <ProtectedRoute allowedType="PROFISSIONAL">
              <Messages userType="PROFISSIONAL" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professional/service-details/:id"
          element={
            <ProtectedRoute allowedType="PROFISSIONAL">
              <ProfessionalServiceDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professional/send-proposal"
          element={
            <ProtectedRoute allowedType="PROFISSIONAL">
              <ProfessionalSendProposal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professional/profile"
          element={
            <ProtectedRoute allowedType="PROFISSIONAL">
              <ProfessionalProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professional/subscription/success"
          element={
            <ProtectedRoute allowedType="PROFISSIONAL">
              <SubscriptionSuccess userType="PROFISSIONAL" />
            </ProtectedRoute>
          }
        />
        {/* Rota de 404 (Página não encontrada) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
