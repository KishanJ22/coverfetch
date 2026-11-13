import { HttpResponse } from "msw";
import { graphql } from "msw/graphql";
import { config } from "../config.js";
import type { BooksQueryResult } from "../routes/books/booksQuery.js";
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

export const booksResolver = (books: BooksQueryResult["books"] = [mockBook]) =>
	hardcover.query("Books", () =>
		HttpResponse.json({
			data: { books },
		}),
	);

export const hardcoverErrorResolver = (operation: "Editions" | "Books") =>
	hardcover.query(operation, () =>
		HttpResponse.json({
			errors: [{ message: "Something went wrong" }],
		}),
	);

export const booksHandlers = [editionsResolver(), booksResolver()];
