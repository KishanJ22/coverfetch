import type { CachedContributor } from "../../clients/hardcover/hardcover-graphql/extended-schema";
import type { BooksResult } from "./booksQuery";
import type { EditionsResult } from "./editionsQuery";

export const validateBook = (
	edition: EditionsResult["editions"][0],
	book: BooksResult["books"][0],
) => {
	const { book_id, isbn_10, isbn_13 } = edition;
	const { cached_contributors, title, cached_image } = book;

	const authors = cached_contributors.reduce(
		(acc: string[], { author }: CachedContributor) => {
			const authorName = author.name;

			if (!acc.includes(authorName)) {
				acc.push(authorName);
			}

			return acc;
		},
		[] as string[],
	);

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
