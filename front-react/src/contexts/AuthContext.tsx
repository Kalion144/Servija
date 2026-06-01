import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  loginUser,
  cadastrarUser,
  logoutUser,
  obterDadosUsuario,
  atualizarUsuario,
  loginCliente,
  loginProfissional,
  logoutCliente,
  logoutProfissional,
} from '../services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'CLIENTE' | 'PROFISSIONAL';
  foto?: string | null;
  telefone?: string | null;
  cpf?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  dataNascimento?: string | null;
  bio?: string | null;
  notificacoes?: string | null;
  idioma?: string | null;
  created_at: number;
  perfilProfissional?: any;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  cadastrar: (data: any) => Promise<Usuario>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<Usuario>) => Promise<void>;
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
    if (!resposta.usuario) throw new Error('Resposta inválida do servidor');
    setUsuario(resposta.usuario);
    return resposta.usuario;
  };

  const cadastrar = async (data: any) => {
    const resposta = await cadastrarUser(data);
    setUsuario(resposta.usuario);
    return resposta.usuario;
  };

  const logout = async () => {
    try {
      if (usuario?.tipo === 'CLIENTE') {
        await logoutCliente();
      } else if (usuario?.tipo === 'PROFISSIONAL') {
        await logoutProfissional();
      } else {
        await logoutUser();
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUsuario(null);
    }
  };

  const updateUser = async (data: Partial<Usuario>) => {
    if ('id' in data) {
      // If we're passing a full user object, just update state
      setUsuario(prev => prev ? { ...prev, ...data } : data as Usuario);
    } else {
      // Otherwise, make API call
      const resposta = await atualizarUsuario(data);
      if (resposta.usuario) {
        setUsuario(resposta.usuario);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ usuario, loading, login, cadastrar, logout, updateUser }}
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
