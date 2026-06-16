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
  media_estrelas: real("media_estrelas").default(0),
  media_trabalho: real("media_trabalho").default(0),
  media_tempo_execucao: real("media_tempo_execucao").default(0),
  media_tempo_resposta: real("media_tempo_resposta").default(0),
  total_avaliacoes: int("total_avaliacoes").default(0),
  verified: int("verified").default(0),
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
  media_trabalho: real("media_trabalho").default(0),
  media_tempo_execucao: real("media_tempo_execucao").default(0),
  media_tempo_resposta: real("media_tempo_resposta").default(0),
  total_avaliacoes: int("total_avaliacoes").default(0),
  telefone: text("telefone"),
});

export const clientProfiles = sqliteTable("client_profiles", {
  id: int("id").primaryKey({ autoIncrement: true }),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tipo_cliente: text("tipo_cliente").notNull(), // 'PF' | 'CONSTRUTORA' | 'IMOBILIARIA' | 'CONDOMINIO' | 'OUTRO'
  preferencias_busca: text("preferencias_busca"),
});

export const professionalServices = sqliteTable("professional_services", {
  id: int("id").primaryKey({ autoIncrement: true }),
  client_id: int("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  categoria: text("categoria"),
  subcategoria: text("subcategoria"),
  objetivo: text("objetivo"),
  preco: real("preco"),
  valor_minimo: real("valor_minimo"),
  valor_maximo: real("valor_maximo"),
  orcamento_definido: int("orcamento_definido").default(0),
  aceita_propostas: int("aceita_propostas").default(1),
  urgente: int("urgente").default(0),
  urgencia_nivel: text("urgencia_nivel"),
  data_inicio_desejada: text("data_inicio_desejada"),
  data_limite: text("data_limite"),
  tipo_atendimento: text("tipo_atendimento"),
  contato: text("contato"),
  nome_contratante: text("nome_contratante"),
  telefone: text("telefone"),
  whatsapp: text("whatsapp"),
  email_contato: text("email_contato"),
  localizacao: text("localizacao"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  referencia_local: text("referencia_local"),
  fotos: text("fotos"),
  anexos: text("anexos"),
  detalhes: text("detalhes"),
  status_solicitacao: text("status_solicitacao").default("AGUARDANDO_PROPOSTAS"),
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

export const conversations = sqliteTable("conversations", {
  id: int("id").primaryKey({ autoIncrement: true }),
  service_id: int("service_id")
    .notNull()
    .references(() => professionalServices.id, { onDelete: "cascade" }),
  client_id: int("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  professional_id: int("professional_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status")
    .notNull()
    .$type<
      | "ABERTA"
      | "EM_NEGOCIACAO"
      | "CONTRATADA"
      | "EM_ANDAMENTO"
      | "CONCLUIDA"
      | "CANCELADA"
    >()
    .default("ABERTA"),
  created_at: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: int("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const messages = sqliteTable("messages", {
  id: int("id").primaryKey({ autoIncrement: true }),
  conversation_id: int("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  sender_id: int("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tipo: text("tipo")
    .notNull()
    .$type<"texto" | "oferta" | "imagem" | "sistema">()
    .default("texto"),
  conteudo: text("conteudo").notNull(),
  metadata: text("metadata"),
  lida: int("lida").default(0),
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
  avaliador_tipo: text("avaliador_tipo").notNull().$type<"CLIENTE" | "PROFISSIONAL">().default("CLIENTE"),
  estrelas: int("estrelas").notNull(),
  estrelas_trabalho: int("estrelas_trabalho").notNull().default(0),
  estrelas_tempo_execucao: int("estrelas_tempo_execucao").notNull().default(0),
  estrelas_tempo_resposta: int("estrelas_tempo_resposta").notNull().default(0),
  comentario: text("comentario"),
  created_at: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const favorites = sqliteTable("favorites", {
  id: int("id").primaryKey({ autoIncrement: true }),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  favorite_user_id: int("favorite_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: int("id").primaryKey({ autoIncrement: true }),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  user_type: text("user_type")
    .notNull()
    .$type<"CLIENTE" | "PROFISSIONAL">(),
  plan: text("plan")
    .notNull()
    .$type<"FREE" | "PRO" | "PREMIUM">()
    .default("FREE"),
  stripe_customer_id: text("stripe_customer_id"),
  stripe_subscription_id: text("stripe_subscription_id"),
  status: text("status")
    .notNull()
    .$type<"active" | "past_due" | "canceled" | "trialing">()
    .default("active"),
  current_period_end: int("current_period_end", { mode: "timestamp_ms" }),
  created_at: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: int("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const favoriteServices = sqliteTable("favorite_services", {
  id: int("id").primaryKey({ autoIncrement: true }),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  favorite_service_id: int("favorite_service_id")
    .notNull()
    .references(() => professionalServices.id, { onDelete: "cascade" }),
  created_at: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  professionalProfile: one(professionalProfiles, {
    fields: [users.id],
    references: [professionalProfiles.user_id],
  }),
  clientProfile: one(clientProfiles, {
    fields: [users.id],
    references: [clientProfiles.user_id],
  }),
  clientServices: many(professionalServices),
  sentProposalProfessionals: many(proposalProfessionals, {
    relationName: "professional",
  }),
  clientRatings: many(ratings, { relationName: "client" }),
  professionalRatings: many(ratings, { relationName: "professional" }),
  sentFavorites: many(favorites, { relationName: "user" }),
  receivedFavorites: many(favorites, { relationName: "favorite_user" }),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.user_id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.user_id],
    references: [users.id],
  }),
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

export const clientProfilesRelations = relations(
  clientProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [clientProfiles.user_id],
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
    conversations: many(conversations),
  }),
);

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    service: one(professionalServices, {
      fields: [conversations.service_id],
      references: [professionalServices.id],
    }),
    client: one(users, {
      fields: [conversations.client_id],
      references: [users.id],
      relationName: "client_conversations",
    }),
    professional: one(users, {
      fields: [conversations.professional_id],
      references: [users.id],
      relationName: "professional_conversations",
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversation_id],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.sender_id],
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

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.user_id],
    references: [users.id],
    relationName: "user",
  }),
  favoriteUser: one(users, {
    fields: [favorites.favorite_user_id],
    references: [users.id],
    relationName: "favorite_user",
  }),
}));
