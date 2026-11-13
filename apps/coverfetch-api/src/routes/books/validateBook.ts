import type { BookResult } from "./booksQuery";
import type { Edition } from "./editionsQuery";
import { getAuthors } from "./formatCachedFields";

export const validateBook = (edition: Edition, book: BookResult) => {
	const { book_id, isbn_10, isbn_13 } = edition;
	const { cached_contributors, title, cached_image } = book;

	const authors = getAuthors(cached_contributors);

	const errors: string[] = [];

	if (book_id === null) {
		errors.push("Edition is missing a book id");
	}

	if (title === null) {
		errors.push("Book is missing a title");
	}

	if (authors.length === 0) {
		errors.push("Book has no author information");
	}

	if (cached_image.url === null) {
		errors.push("Book is missing a cover image");
	}

	if (isbn_10 === null) {
		errors.push("Book is missing an ISBN-10");
	}

	if (isbn_10 && isbn_10.length < 10) {
		errors.push("ISBN-10 is less than 10 characters long");
	}

	if (isbn_13 === null) {
		errors.push("Book is missing an ISBN-13");
	}

	if (isbn_13 && isbn_13.length < 13) {
		errors.push("ISBN-13 is less than 13 characters long");
	}

	return errors || [];
};
