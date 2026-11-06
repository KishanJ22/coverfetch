import type { QueryResult } from "../../../clients/hardcover/hardcover-graphql";

export const bookDetailsQuery = {
	books: {
		description: true,
		cached_contributors: true,
		cached_tags: true,
		title: true,
		pages: true,
		release_date: true,
	},
} as const;

type BookDetailsResult = QueryResult<typeof bookDetailsQuery>;

export type BookDetails = BookDetailsResult["books"][0];