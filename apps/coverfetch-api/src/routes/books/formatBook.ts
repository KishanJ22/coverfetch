import type { BasicTagType } from "../../clients/hardcover/hardcover-graphql";
import type { CachedContributor } from "../../clients/hardcover/hardcover-graphql/extended-schema";
import type { BooksResult } from "./booksQuery";
import type { EditionsResult } from "./editionsQuery";
import type { Book } from "./schemas";

export const formatBook = (
	edition: EditionsResult["editions"][0],
	book: BooksResult["books"][0],
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

	const authors = cached_contributors.reduce(
		(acc: string[], { author }: CachedContributor) => {
			const authorName = author.name;

			if (acc.includes(authorName)) {
				return acc;
			} else {
				acc.push(authorName);
			}

			return acc;
		},
		[] as string[],
	);

	const getTopTags = (tagType: "Tag" | "Genre") => {
		const sortedTags = cached_tags[tagType].sort(
			(a: any, b: any) => b.count > a.count,
		) as BasicTagType[];

		return sortedTags.slice(0, 3).reduce((acc, { tag }) => {
			if (acc.includes(tag)) {
				return acc;
			} else {
				acc.push(tag);
				return acc;
			}
		}, [] as string[]);
	};

	const tags = getTopTags("Tag");
	const genres = getTopTags("Genre");

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
