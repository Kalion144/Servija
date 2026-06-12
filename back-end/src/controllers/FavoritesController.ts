import type { Request, Response } from "express";
import { db } from "../db/connection.js";
import { favorites, favoriteServices, users, professionalProfiles } from "../db/schema.js";
import { eq, and, desc, like, or, SQL } from "drizzle-orm";

export class FavoritesController {
  static async toggleFavoriteUser(req: Request, res: Response) {
    const user = req.user!;
    const { favorite_user_id } = req.body;

    if (!favorite_user_id) {
      return res.status(400).json({ erro: "ID do usuário favoritado é obrigatório" });
    }

    if (Number(favorite_user_id) === user.userId) {
      return res.status(400).json({ erro: "Não pode favoritar a si mesmo" });
    }

    try {
      // Check if already favorite
      const existingFavorite = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.user_id, user.userId),
            eq(favorites.favorite_user_id, Number(favorite_user_id))
          )
        );

      if (existingFavorite.length > 0) {
        // Remove favorite
        await db
          .delete(favorites)
          .where(
            and(
              eq(favorites.user_id, user.userId),
              eq(favorites.favorite_user_id, Number(favorite_user_id))
            )
          );

        return res.status(200).json({ message: "Favorito removido", isFavorite: false });
      } else {
        // Add favorite
        await db
          .insert(favorites)
          .values({
            user_id: user.userId,
            favorite_user_id: Number(favorite_user_id),
          });

        return res.status(201).json({ message: "Favorito adicionado", isFavorite: true });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async checkFavoriteUser(req: Request, res: Response) {
    const user = req.user!;
    const { favorite_user_id } = req.params;

    try {
      const existingFavorite = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.user_id, user.userId),
            eq(favorites.favorite_user_id, Number(favorite_user_id))
          )
        );

      return res.status(200).json({ isFavorite: existingFavorite.length > 0 });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async listFavoriteUsers(req: Request, res: Response) {
    const user = req.user!;
    const { search = "", page = 1, limit = 10, sortBy = "recent" } = req.query;

    try {
      let query = db
        .select({
          id: favorites.id,
          user_id: favorites.user_id,
          favorite_user_id: favorites.favorite_user_id,
          favoriteUser: users,
          professionalProfile: professionalProfiles,
          created_at: favorites.created_at,
        })
        .from(favorites)
        .innerJoin(users, eq(favorites.favorite_user_id, users.id))
        .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.user_id))
        .where(eq(favorites.user_id, user.userId));

      if (search && typeof search === "string") {
        const searchTerm = `%${search}%`;
        query = query.where(
          and(
            eq(favorites.user_id, user.userId),
            or(
              like(users.nome, searchTerm),
              like(professionalProfiles.profissao, searchTerm),
              like(professionalProfiles.descricao, searchTerm),
              like(professionalProfiles.cidade, searchTerm),
              like(professionalProfiles.localizacao, searchTerm),
              like(users.cidade, searchTerm),
            )
          )
        );
      }

      if (sortBy === "recent") {
        query = query.orderBy(desc(favorites.created_at));
      } else if (sortBy === "name") {
        query = query.orderBy(users.nome);
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;

      const favoritesList = await query.limit(limitNum).offset(offset);

      // Import sql from drizzle-orm
      const { sql } = await import("drizzle-orm");

      let countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(favorites)
        .where(eq(favorites.user_id, user.userId));

      if (search && typeof search === "string") {
        const searchTerm = `%${search}%`;
        countQuery = countQuery.innerJoin(users, eq(favorites.favorite_user_id, users.id)).leftJoin(professionalProfiles, eq(users.id, professionalProfiles.user_id)).where(
          and(
            eq(favorites.user_id, user.userId),
            or(
              like(users.nome, searchTerm),
              like(professionalProfiles.profissao, searchTerm),
              like(professionalProfiles.descricao, searchTerm),
              like(professionalProfiles.cidade, searchTerm),
              like(professionalProfiles.localizacao, searchTerm),
              like(users.cidade, searchTerm),
            )
          )
        );
      }

      const countResult = await countQuery;
      const total = Number(countResult[0]?.count || 0);

      if (favoritesList.length === 0) {
        console.log(`ℹ️ [FavoritesController] Nenhum profissional favoritado encontrado para o usuário ID: ${user.userId}`);
      }

      return res.status(200).json({
        data: favoritesList,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.warn("⚠️ [FavoritesController.listFavoriteUsers] Erro ao listar favoritos de usuários:", error);
      return res.status(200).json({
        data: [],
        total: 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: 0,
        aviso: "Não foi possível carregar os favoritos, mas a requisição foi concluída de forma segura."
      });
    }
  }

  static async toggleFavoriteService(req: Request, res: Response) {
    const user = req.user!;
    const { favorite_service_id } = req.body;

    if (!favorite_service_id) {
      return res.status(400).json({ erro: "ID do serviço favoritado é obrigatório" });
    }

    try {
      const existingFavorite = await db
        .select()
        .from(favoriteServices)
        .where(
          and(
            eq(favoriteServices.user_id, user.userId),
            eq(favoriteServices.favorite_service_id, Number(favorite_service_id))
          )
        );

      if (existingFavorite.length > 0) {
        await db
          .delete(favoriteServices)
          .where(
            and(
              eq(favoriteServices.user_id, user.userId),
              eq(favoriteServices.favorite_service_id, Number(favorite_service_id))
            )
          );

        return res.status(200).json({ message: "Serviço favorito removido", isFavorite: false });
      } else {
        await db
          .insert(favoriteServices)
          .values({
            user_id: user.userId,
            favorite_service_id: Number(favorite_service_id),
          });

        return res.status(201).json({ message: "Serviço favorito adicionado", isFavorite: true });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async checkFavoriteService(req: Request, res: Response) {
    const user = req.user!;
    const { favorite_service_id } = req.params;

    try {
      const existingFavorite = await db
        .select()
        .from(favoriteServices)
        .where(
          and(
            eq(favoriteServices.user_id, user.userId),
            eq(favoriteServices.favorite_service_id, Number(favorite_service_id))
          )
        );

      return res.status(200).json({ isFavorite: existingFavorite.length > 0 });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async listFavoriteServices(req: Request, res: Response) {
    const user = req.user!;
    const { search = "", page = 1, limit = 10, sortBy = "recent" } = req.query;

    try {
      // Import here since they are needed
      const { professionalServices } = await import("../db/schema.js");

      let query = db
        .select({
          id: favoriteServices.id,
          user_id: favoriteServices.user_id,
          favorite_service_id: favoriteServices.favorite_service_id,
          service: professionalServices,
          cliente_nome: users.nome,
          cliente_cidade: users.cidade,
          cliente_estado: users.estado,
          created_at: favoriteServices.created_at,
        })
        .from(favoriteServices)
        .innerJoin(professionalServices, eq(favoriteServices.favorite_service_id, professionalServices.id))
        .leftJoin(users, eq(professionalServices.client_id, users.id))
        .where(eq(favoriteServices.user_id, user.userId));

      if (search && typeof search === "string") {
        const searchTerm = `%${search}%`;
        query = query.where(
          and(
            eq(favoriteServices.user_id, user.userId),
            or(
              like(professionalServices.titulo, searchTerm),
              like(professionalServices.descricao, searchTerm),
              like(professionalServices.localizacao, searchTerm),
              like(users.nome, searchTerm),
              like(users.cidade, searchTerm),
            )
          )
        );
      }

      if (sortBy === "recent") {
        query = query.orderBy(desc(favoriteServices.created_at));
      } else if (sortBy === "title") {
        query = query.orderBy(professionalServices.titulo);
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;

      const favoritesList = await query.limit(limitNum).offset(offset);

      const { sql } = await import("drizzle-orm");

      let countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(favoriteServices)
        .where(eq(favoriteServices.user_id, user.userId));

      if (search && typeof search === "string") {
        const searchTerm = `%${search}%`;
        countQuery = countQuery
          .innerJoin(
            professionalServices,
            eq(favoriteServices.favorite_service_id, professionalServices.id),
          )
          .leftJoin(users, eq(professionalServices.client_id, users.id))
          .where(
            and(
              eq(favoriteServices.user_id, user.userId),
              or(
                like(professionalServices.titulo, searchTerm),
                like(professionalServices.descricao, searchTerm),
                like(professionalServices.localizacao, searchTerm),
                like(users.nome, searchTerm),
                like(users.cidade, searchTerm),
              )
            )
          );
      }

      const countResult = await countQuery;
      const total = Number(countResult[0]?.count || 0);

      if (favoritesList.length === 0) {
        console.log(`ℹ️ [FavoritesController] Nenhum serviço favoritado encontrado para o usuário ID: ${user.userId}`);
      }

      return res.status(200).json({
        data: favoritesList,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.warn("⚠️ [FavoritesController.listFavoriteServices] Erro ao listar favoritos de serviços:", error);
      return res.status(200).json({
        data: [],
        total: 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: 0,
        aviso: "Não foi possível carregar os serviços favoritos, mas a requisição foi concluída de forma segura."
      });
    }
  }
}
