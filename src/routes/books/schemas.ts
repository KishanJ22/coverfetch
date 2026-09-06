import { z } from "@hono/zod-openapi";

export const bookSchema = z.object({
	id: z.number(),
	title: z.string(),
	subtitle: z.string().nullable(),
	description: z.string().nullable(),
	pageCount: z.number(),
	authors: z.array(z.string()).min(1),
	coverUrl: z.string(),
	isbn10: z.number(),
	isbn13: z.number(),
	releaseDate: z.string(),
});
