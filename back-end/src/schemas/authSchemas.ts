import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  tipo: z.enum(["CLIENTE", "PROFISSIONAL"]),
  foto: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export const onboardingSchema = z.object({
  foto: z.string().optional(),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  profissao: z.string().optional(),
  experiencia: z.string().optional(),
  habilidades: z.union([z.string(), z.array(z.string())]).optional(),
  tipo_cliente: z
    .enum(["PF", "CONSTRUTORA", "IMOBILIARIA", "CONDOMINIO", "OUTRO"])
    .optional(),
  preferencias_busca: z.union([z.string(), z.array(z.string())]).optional(),
});

export const updateUserSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  foto: z.string().optional().nullable(),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  dataNascimento: z.string().optional(),
  bio: z.string().optional(),
});
