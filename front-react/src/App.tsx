import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Sobre from './pages/Sobre';
import ClientHome from './pages/client/Home';
import ClientServices from './pages/client/Services';
import ClientProposals from './pages/client/Proposals';
import ClientProfile from './pages/client/Profile';
import LoginClient from './pages/client/LoginClient';
import CadastroClient from './pages/client/CadastroClient';
import ProfessionalHome from './pages/professional/Home';
import ProfessionalProposals from './pages/professional/Proposals';
import ProfessionalServiceDetails from './pages/professional/ServiceDetails';
import ProfessionalSendProposal from './pages/professional/SendProposal';
import ProfessionalProfile from './pages/professional/Profile';
import LoginProfessional from './pages/professional/LoginProfessional';
import CadastroProfessional from './pages/professional/CadastroProfessional';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/sobre" element={<Sobre />} />

        {/* Rotas do Cliente */}
        <Route path="/client/login" element={<LoginClient />} />
        <Route path="/client/cadastro" element={<CadastroClient />} />
        <Route path="/client/home" element={
          <ProtectedRoute allowedType="CLIENTE">
            <ClientHome />
          </ProtectedRoute>
        } />
        <Route path="/client/services" element={
          <ProtectedRoute allowedType="CLIENTE">
            <ClientServices />
          </ProtectedRoute>
        } />
        <Route path="/client/proposals" element={
          <ProtectedRoute allowedType="CLIENTE">
            <ClientProposals />
          </ProtectedRoute>
        } />
        <Route path="/client/profile" element={
          <ProtectedRoute allowedType="CLIENTE">
            <ClientProfile />
          </ProtectedRoute>
        } />

        {/* Rotas do Profissional */}
        <Route path="/professional/login" element={<LoginProfessional />} />
        <Route path="/professional/cadastro" element={<CadastroProfessional />} />
        <Route path="/professional/home" element={
          <ProtectedRoute allowedType="PROFISSIONAL">
            <ProfessionalHome />
          </ProtectedRoute>
        } />
        <Route
          path="/professional/proposals"
          element={
            <ProtectedRoute allowedType="PROFISSIONAL">
              <ProfessionalProposals />
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
        <Route path="/professional/profile" element={
          <ProtectedRoute allowedType="PROFISSIONAL">
            <ProfessionalProfile />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
