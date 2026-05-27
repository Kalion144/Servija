import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Cadastro from './pages/Cadastro';
import LoginUser from './pages/LoginUser';
import Sobre from './pages/Sobre';
import ClientHome from './pages/client/Home';
import ClientServices from './pages/client/Services';
import ClientPostService from './pages/client/PostService';
import ClientProposals from './pages/client/Proposals';
import ClientProfile from './pages/client/Profile';
import ProfessionalHome from './pages/professional/Home';
import ProfessionalProposals from './pages/professional/Proposals';
import ProfessionalServiceDetails from './pages/professional/ServiceDetails';
import ProfessionalSendProposal from './pages/professional/SendProposal';
import ProfessionalProfile from './pages/professional/Profile';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<LoginUser />} />
        <Route path="/sobre" element={<Sobre />} />

        {/* Rotas do Cliente */}
        <Route path="/client/home" element={<ClientHome />} />
        <Route path="/client/services" element={<ClientServices />} />
        <Route path="/client/post-service" element={<ClientPostService />} />
        <Route path="/client/proposals" element={<ClientProposals />} />
        <Route path="/client/profile" element={<ClientProfile />} />

        {/* Rotas do Profissional */}
        <Route path="/professional/home" element={<ProfessionalHome />} />
        <Route
          path="/professional/proposals"
          element={<ProfessionalProposals />}
        />
        <Route
          path="/professional/service-details/:id"
          element={<ProfessionalServiceDetails />}
        />
        <Route
          path="/professional/send-proposal"
          element={<ProfessionalSendProposal />}
        />
        <Route path="/professional/profile" element={<ProfessionalProfile />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
