import type { BookResult } from "./booksQuery";
import type { Edition } from "./editionsQuery";
import { getAuthors, getTopTags } from "./formatCachedFields";
import type { Book } from "./schemas";

export const formatBook = (
	edition: Edition,
	book: BookResult,
): Book => {
	const { book_id, isbn_10, isbn_13 } = edition;
	const {
		title,
		headline,
		slug,
		pages,
		cached_image,
		cached_contributors,
		cached_tags,
		rating,
		release_date,
	} = book;

	const authors = getAuthors(cached_contributors);
	const tags = getTopTags(cached_tags, "Tag");
	const genres = getTopTags(cached_tags, "Genre");

	return {
		id: book_id,
		title: title as string,
		headline,
		slug,
		pageCount: pages as number,
		authors,
		coverUrl: cached_image.url as string,
		isbn10: isbn_10 as string,
		isbn13: isbn_13 as string,
		releaseDate: release_date,
		rating,
		tags,
		genres,
	} satisfies Book;
};
