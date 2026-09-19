import { describe, expect, it } from "bun:test";
import { testClient } from "hono/testing";
import { mockBook } from "../../tests/books.fixtures";
import { booksResolver, editionsResolver } from "../../tests/books.handlers";
import { server } from "../../tests/server";
import booksRouter from "./books.get";

describe("GET /books/:isbn", () => {
	const client = testClient(booksRouter);

	it("returns the formatted book for a valid 10-digit ISBN", async () => {
		const res = await client.books[":isbn"].$get({
			param: { isbn: "1098166302" },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({
			data: {
				id: 1,
				title: "AI Engineering: Building Applications with Foundation Models",
				headline: "AI Engineering",
				slug: "ai-engineering",
				pageCount: 532,
				authors: ["Chip Huyen"],
				coverUrl: "https://api.hardcover.app/cover-page.jpg",
				isbn10: "1098166302",
				isbn13: "9781098166304",
				releaseDate: "2024-12-20",
				rating: 4.6,
				tags: ["software-engineering"],
				genres: ["Computers"],
			},
		});
	});

	it("returns the formatted book for a valid 13-digit ISBN", async () => {
		const res = await client.books[":isbn"].$get({
			param: { isbn: "9781098166304" },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({
			data: {
				id: 1,
				title: "AI Engineering: Building Applications with Foundation Models",
				headline: "AI Engineering",
				slug: "ai-engineering",
				pageCount: 532,
				authors: ["Chip Huyen"],
				coverUrl: "https://api.hardcover.app/cover-page.jpg",
				isbn10: "1098166302",
				isbn13: "9781098166304",
				releaseDate: "2024-12-20",
				rating: 4.6,
				tags: ["software-engineering"],
				genres: ["Computers"],
			},
		});
	});

	it("returns 404 when no edition is returned", async () => {
		server.use(editionsResolver([]));

		const res = await client.books[":isbn"].$get({
			param: { isbn: "9781098166304" },
		});

		expect(res.status).toBe(404);
		expect(await res.json()).toMatchObject({
			message: "Book not found",
		});
	});

	it("returns 404 when no book returned", async () => {
		server.use(booksResolver([]));

		const res = await client.books[":isbn"].$get({
			param: { isbn: "9781098166304" },
		});

		expect(res.status).toBe(404);
		expect(await res.json()).toMatchObject({
			message: "Book not found",
		});
	});

	it("returns 404 when the book fails validation", async () => {
		server.use(booksResolver([{ ...mockBook, title: null }]));

		const res = await client.books[":isbn"].$get({
			param: { isbn: "9781098166304" },
		});

		expect(res.status).toBe(404);
		expect(await res.json()).toMatchObject({
			errors: ["Book is missing a title"],
		});
	});

	describe("ISBN validation", () => {
		it("should return 400 when the isbn is less than 10 characters long", async () => {
			const res = await client.books[":isbn"].$get({
				param: { isbn: "978109816" },
			});

			expect(res.status).toBe(400);
			expect(await res.json()).toMatchObject({
				message: "ISBN must be a valid 10 or 13 digit ISBN",
			});
		});

		it("should return 400 when the isbn is more than 13 characters long", async () => {
			const res = await client.books[":isbn"].$get({
				param: { isbn: "97810981663045" },
			});

			expect(res.status).toBe(400);
			expect(await res.json()).toMatchObject({
				message: "ISBN must be a valid 10 or 13 digit ISBN",
			});
		});

		it("should return 400 when the isbn has a dash", async () => {
			const res = await client.books[":isbn"].$get({
				param: { isbn: "97810-98166304" },
			});

			expect(res.status).toBe(400);
			expect(await res.json()).toMatchObject({
				message: "ISBN cannot include dashes",
			});
		});

		it("should return 400 when the isbn has letters", async () => {
			const res = await client.books[":isbn"].$get({
				param: { isbn: "AB81098166304" },
			});

			expect(res.status).toBe(400);
			expect(await res.json()).toMatchObject({
				message: "ISBN must be a valid 10 or 13 digit ISBN",
			});
		});

		it("should return 400 when the isbn-10 checksum is invalid", async () => {
			const res = await client.books[":isbn"].$get({
				// valid length/digits, but the check digit doesn't satisfy the checksum
				param: { isbn: "1098166303" },
			});

			expect(res.status).toBe(400);
			expect(await res.json()).toMatchObject({
				message: "ISBN must be a valid 10 or 13 digit ISBN",
			});
		});

		it("should return 400 when the isbn-13 checksum is invalid", async () => {
			const res = await client.books[":isbn"].$get({
				// valid length/digits, but the check digit doesn't satisfy the checksum
				param: { isbn: "9781098166305" },
			});

			expect(res.status).toBe(400);
			expect(await res.json()).toMatchObject({
				message: "ISBN must be a valid 10 or 13 digit ISBN",
			});
		});
	});
});
