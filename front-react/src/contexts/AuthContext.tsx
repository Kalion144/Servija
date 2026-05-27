
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { loginUser, cadastrarUser, logoutUser, obterDadosUsuario } from '../services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'CLIENTE' | 'PROFISSIONAL';
  foto?: string;
  perfilProfissional?: any;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await obterDadosUsuario();
        if (response.usuario) {
          setUsuario(response.usuario);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    const resposta = await loginUser({ email, senha });
    setUsuario(resposta.usuario);
    return resposta.usuario;
  };

  const cadastrar = async (data: any) => {
    const resposta = await cadastrarUser(data);
    setUsuario(resposta.usuario);
    return resposta.usuario;
  };

  const logout = async () => {
    await logoutUser();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, loading, login, cadastrar, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

