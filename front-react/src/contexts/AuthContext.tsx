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
  logoutCliente,
  logoutProfissional,
} from '../services/api';
import { User, RegisterData } from '../lib/types';

interface AuthContextType {
  usuario: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<User>;
  cadastrar: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (): Promise<User | null> => {
    try {
      const response = await obterDadosUsuario();
      if (response.usuario) {
        setUsuario(response.usuario);
        return response.usuario;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser();
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

  const cadastrar = async (data: RegisterData) => {
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

  const updateUser = async (data: Partial<User>) => {
    if ('id' in data) {
      setUsuario((prev) => (prev ? { ...prev, ...data } : (data as User)));
    } else {
      const resposta = await atualizarUsuario(data);
      if (resposta.usuario) {
        setUsuario(resposta.usuario);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ usuario, loading, login, cadastrar, logout, updateUser, refreshUser }}
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
