import type { QueryResult } from "../../clients/hardcover/hardcover-graphql";

export const editionsQuery = {
	editions: {
		book_id: true,
		isbn_10: true,
		isbn_13: true,
	},
} as const;

type EditionsResult = QueryResult<typeof editionsQuery>;

export type Edition = EditionsResult["editions"][0];
