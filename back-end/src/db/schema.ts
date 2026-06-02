import { sqliteTable, int, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: int("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senha_hash: text("senha_hash").notNull(),
  tipo: text("tipo").notNull().$type<"CLIENTE" | "PROFISSIONAL">(),
  foto: text("foto"),
  telefone: text("telefone"),
  cpf: text("cpf"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  estado: text("estado"),
  dataNascimento: text("dataNascimento"),
  bio: text("bio"),
  notificacoes: text("notificacoes"),
  idioma: text("idioma"),
  created_at: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const professionalProfiles = sqliteTable("professional_profiles", {
  id: int("id").primaryKey({ autoIncrement: true }),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  profissao: text("profissao"),
  bio: text("bio"),
  experiencia: text("experiencia"),
  habilidades: text("habilidades"),
  localizacao: text("localizacao"),
  descricao: text("descricao"),
  cidade: text("cidade"),
  valor_hora: real("valor_hora"),
  media_estrelas: real("media_estrelas").default(0),
  total_avaliacoes: int("total_avaliacoes").default(0),
  telefone: text("telefone"),
});

export const professionalServices = sqliteTable("professional_services", {
  id: int("id").primaryKey({ autoIncrement: true }),
  client_id: int("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  categoria: text("categoria"),
  preco: real("preco"),
  urgente: int("urgente").default(0),
  contato: text("contato"),
  localizacao: text("localizacao"),
  fotos: text("fotos"), // array de URLs em JSON
  status: text("status")
    .notNull()
    .$type<
      | "PENDENTE"
      | "ACEITA"
      | "RECUSADA"
      | "CANCELADA"
      | "EM_ANDAMENTO"
      | "FINALIZADA"
      | "AVALIADA"
    >()
    .default("PENDENTE"),
  created_at: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const proposalProfessionals = sqliteTable("proposal_professionals", {
  id: int("id").primaryKey({ autoIncrement: true }),
  service_id: int("service_id")
    .notNull()
    .references(() => professionalServices.id, { onDelete: "cascade" }),
  professional_id: int("professional_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mensagem: text("mensagem"),
  valor: real("valor"),
  negociavel: int("negociavel").default(0),
  status: text("status")
    .notNull()
    .$type<
      | "PENDENTE"
      | "ACEITA"
      | "RECUSADA"
      | "CANCELADA"
      | "EM_ANDAMENTO"
      | "FINALIZADA"
      | "AVALIADA"
    >()
    .default("PENDENTE"),
  created_at: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const ratings = sqliteTable("ratings", {
  id: int("id").primaryKey({ autoIncrement: true }),
  proposal_professional_id: int("proposal_professional_id")
    .notNull()
    .references(() => proposalProfessionals.id, { onDelete: "cascade" }),
  client_id: int("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  professional_id: int("professional_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  estrelas: int("estrelas").notNull(),
  comentario: text("comentario"),
  created_at: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  professionalProfile: one(professionalProfiles, {
    fields: [users.id],
    references: [professionalProfiles.user_id],
  }),
  clientServices: many(professionalServices),
  sentProposalProfessionals: many(proposalProfessionals, {
    relationName: "professional",
  }),
  clientRatings: many(ratings, { relationName: "client" }),
  professionalRatings: many(ratings, { relationName: "professional" }),
}));

export const professionalProfilesRelations = relations(
  professionalProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [professionalProfiles.user_id],
      references: [users.id],
    }),
  }),
);

export const professionalServicesRelations = relations(
  professionalServices,
  ({ one, many }) => ({
    client: one(users, {
      fields: [professionalServices.client_id],
      references: [users.id],
    }),
    proposalProfessionals: many(proposalProfessionals),
  }),
);

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  client: one(users, {
    fields: [proposals.client_id],
    references: [users.id],
  }),
}));

export const proposalProfessionalsRelations = relations(
  proposalProfessionals,
  ({ one, many }) => ({
    service: one(professionalServices, {
      fields: [proposalProfessionals.service_id],
      references: [professionalServices.id],
    }),
    professional: one(users, {
      fields: [proposalProfessionals.professional_id],
      references: [users.id],
      relationName: "professional",
    }),
    rating: one(ratings, {
      fields: [proposalProfessionals.id],
      references: [ratings.proposal_professional_id],
    }),
  }),
);

export const ratingsRelations = relations(ratings, ({ one }) => ({
  proposalProfessional: one(proposalProfessionals, {
    fields: [ratings.proposal_professional_id],
    references: [proposalProfessionals.id],
  }),
  client: one(users, {
    fields: [ratings.client_id],
    references: [users.id],
    relationName: "client",
  }),
  professional: one(users, {
    fields: [ratings.professional_id],
    references: [users.id],
    relationName: "professional",
  }),
}));
