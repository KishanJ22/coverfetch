import type { QueryResult } from "../../clients/hardcover/hardcover-graphql";

export const booksQuery = {
	books: {
		cached_contributors: true,
		cached_image: true,
		cached_tags: true,
		headline: true,
		slug: true,
		title: true,
		rating: true,
		pages: true,
		release_date: true,
	},
} as const;

export type BooksResult = QueryResult<typeof booksQuery>;
