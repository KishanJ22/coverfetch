import { graphql, HttpResponse } from "msw";
import { config } from "../config.js";
import type { BooksResult } from "../routes/books/booksQuery.js";
import type { EditionsResult } from "../routes/books/editionsQuery.js";
import { mockBook, mockEdition } from "./books.fixtures.js";

const hardcover = graphql.link(config.hardcover.baseUrl);

/**
 *? The genql client sends anonymous operations (no operation name), so
 *? requests can only be told apart by which root field they select.
 */
export const editionsResolver = (
	editions: EditionsResult["editions"] = [mockEdition],
) =>
	hardcover.query("Editions", () =>
		HttpResponse.json({
			data: { editions },
		}),
	);

export const booksResolver = (books: BooksResult["books"] = [mockBook]) =>
	hardcover.query("Books", () =>
		HttpResponse.json({
			data: { books },
		}),
	);

export const booksHandlers = [editionsResolver(), booksResolver()];
