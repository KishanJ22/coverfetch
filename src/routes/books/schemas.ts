import { z } from "@hono/zod-openapi";

export const bookSchema = z.object({
	id: z.number(),
	title: z.string(),
	subtitle: z.string().nullable(),
	headline: z.string().nullable(),
	slug: z.string().nullable(),
	pageCount: z.number(),
	authors: z.array(z.string()).min(1),
	coverUrl: z.string(),
	isbn10: z.string().length(10),
	isbn13: z.string().length(13),
	releaseDate: z.string(),
	rating: z.number().nullable(),
	tags: z.array(z.string()),
	genres: z.array(z.string()),
});

export type Book = z.infer<typeof bookSchema>;