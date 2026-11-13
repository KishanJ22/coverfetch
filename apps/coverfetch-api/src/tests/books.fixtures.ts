import type { BookDetails } from "../routes/books/[id]/bookDetailsQuery";
import type { BookResult } from "../routes/books/booksQuery";
import type { Edition } from "../routes/books/editionsQuery";

export const mockEdition = {
	book_id: 4321,
	isbn_10: "1098166302",
	isbn_13: "9781098166304",
} satisfies Edition;

export const mockBook = {
	id: 4321,
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
} satisfies BookResult;

export const mockBookDetails = {
	title: mockBook.title,
	description:
		"A practical guide to building applications with foundation models.",
	cached_contributors: mockBook.cached_contributors,
	cached_tags: mockBook.cached_tags,
	pages: mockBook.pages,
	release_date: mockBook.release_date,
} satisfies BookDetails;
