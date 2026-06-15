import { z } from "zod";

export const enviarProposalSchema = z.object({
  servicoId: z.number().int().positive(),
  valor: z.number().positive().nullable().optional(),
  mensagem: z.string().max(1000).optional(),
  negociavel: z.boolean().optional(),
});
