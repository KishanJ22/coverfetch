import type { QueryResult } from "../../clients/hardcover/hardcover-graphql";

export const booksQuery = {
	books: {
		id: true,
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

type BooksQueryResult = QueryResult<typeof booksQuery>;

export type BookResult = BooksQueryResult["books"][0];
