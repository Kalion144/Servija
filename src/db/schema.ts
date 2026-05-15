import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  timestamp,
  mysqlEnum,
  float,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const userTypeEnum = mysqlEnum("tipo", ["CLIENTE", "PROFISSIONAL"]);

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha_hash: varchar("senha_hash", { length: 255 }).notNull(),
  tipo: userTypeEnum.notNull(),
  foto: varchar("foto", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const professionalProfiles = mysqlTable("professional_profiles", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  descricao: text("descricao"),
  experiencia: int("experiencia"),
  cidade: varchar("cidade", { length: 255 }).notNull(),
  valor_hora: decimal("valor_hora", { precision: 10, scale: 2 }),
  media_estrelas: float("media_estrelas").default(0),
  total_avaliacoes: int("total_avaliacoes").default(0),
  telefone: varchar("telefone", { length: 20 }),
});

export const professionalServices = mysqlTable("professional_services", {
  id: int("id").primaryKey().autoincrement(),
  professional_profile_id: int("professional_profile_id")
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  categoria: varchar("categoria", { length: 255 }).notNull(),
  subcategoria: varchar("subcategoria", { length: 255 }),
});

export const proposalStatusEnum = mysqlEnum("status", [
  "PENDENTE",
  "ACEITA",
  "RECUSADA",
  "CANCELADA",
  "EM_ANDAMENTO",
  "FINALIZADA",
  "AVALIADA",
]);

export const proposals = mysqlTable("proposals", {
  id: int("id").primaryKey().autoincrement(),
  client_id: int("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  valor: decimal("valor", { precision: 10, scale: 2 }),
  prazo: varchar("prazo", { length: 255 }),
  status: proposalStatusEnum.default("PENDENTE"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const proposalProfessionals = mysqlTable("proposal_professionals", {
  id: int("id").primaryKey().autoincrement(),
  proposal_id: int("proposal_id")
    .notNull()
    .references(() => proposals.id, { onDelete: "cascade" }),
  professional_id: int("professional_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: proposalStatusEnum.default("PENDENTE"),
});

export const ratings = mysqlTable("ratings", {
  id: int("id").primaryKey().autoincrement(),
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
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  professionalProfile: one(professionalProfiles, {
    fields: [users.id],
    references: [professionalProfiles.user_id],
  }),
  clientProposals: many(proposals),
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
    services: many(professionalServices),
  }),
);

export const professionalServicesRelations = relations(
  professionalServices,
  ({ one }) => ({
    profile: one(professionalProfiles, {
      fields: [professionalServices.professional_profile_id],
      references: [professionalProfiles.id],
    }),
  }),
);

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  client: one(users, {
    fields: [proposals.client_id],
    references: [users.id],
  }),
  proposalProfessionals: many(proposalProfessionals),
}));

export const proposalProfessionalsRelations = relations(
  proposalProfessionals,
  ({ one, many }) => ({
    proposal: one(proposals, {
      fields: [proposalProfessionals.proposal_id],
      references: [proposals.id],
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
