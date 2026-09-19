import type { BooksResult } from "../routes/books/booksQuery";
import type { EditionsResult } from "../routes/books/editionsQuery";

export const mockEdition: EditionsResult["editions"][0] = {
	book_id: 1,
	isbn_10: "1098166302",
	isbn_13: "9781098166304",
};

export const mockBook: BooksResult["books"][0] = {
	cached_contributors: [
		{
			author: { name: "Chip Huyen" },
		},
	],
	cached_image: { url: "https://api.hardcover.app/cover-page.jpg" },
	cached_tags: {
		Tag: [{ tag: "software-engineering", count: 42 }],
		Genre: [{ tag: "Computers", count: 10 }],
	},
	headline: "AI Engineering",
	slug: "ai-engineering",
	title: "AI Engineering: Building Applications with Foundation Models",
	rating: 4.6,
	pages: 532,
	release_date: "2024-12-20",
};
