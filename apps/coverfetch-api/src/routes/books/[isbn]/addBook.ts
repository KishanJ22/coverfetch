import db from "../../../db/db";
import type { BookResult } from "../booksQuery";

export const addBook = (book: BookResult) =>
	db
		.insertInto("coverfetch.books")
		.values({
			hardcoverId: book.id,
			title: book.title as string,
		})
		.onConflict((oc) =>
			oc.column("hardcoverId").doUpdateSet({
				title: book.title as string,
			}),
		)
		.returning(["coverfetch.books.id as bookId"]);
