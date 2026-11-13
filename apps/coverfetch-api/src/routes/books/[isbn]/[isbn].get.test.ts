import { describe, expect, it, spyOn } from "bun:test";
import { testClient } from "hono/testing";
import db from "../../../db/db";
import { createBook } from "../../../tests/books.factories";
import { mockBook } from "../../../tests/books.fixtures";
import {
	booksResolver,
	editionsResolver,
	hardcoverErrorResolver,
} from "../../../tests/books.handlers";
import { useTestDb } from "../../../tests/db";
import { server } from "../../../tests/server";
import booksRouter from "./[isbn].get";

useTestDb();

const booksInDb = () => db.selectFrom("coverfetch.books").selectAll().execute();

const expectedBook = {
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
};

describe("GET /books/:isbn", () => {
	const client = testClient(booksRouter);

	it("returns the formatted book for a valid 10-digit ISBN", async () => {
		const res = await client.books[":isbn"].$get({
			param: { isbn: "1098166302" },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ data: expectedBook });
	});

	it("returns the formatted book for a valid 13-digit ISBN", async () => {
		const res = await client.books[":isbn"].$get({
			param: { isbn: "9781098166304" },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ data: expectedBook });
	});

	it("adds the book and returns its database id when it is new", async () => {
		const res = await client.books[":isbn"].$get({
			param: { isbn: "9781098166304" },
		});

		const rows = await booksInDb();
		expect(rows).toEqual([
			expect.objectContaining({
				hardcoverId: String(mockBook.id), //? numeric columns come back from pg as strings
				title: mockBook.title,
			}),
		]);
		expect(await res.json()).toMatchObject({ data: { id: rows[0]?.id } });
	});

	it("returns the existing database id without adding a duplicate", async () => {
		await createBook(); //? unrelated row takes id 1, so the match can't pass by coincidence
		const existing = await createBook({
			hardcoverId: mockBook.id,
			title: mockBook.title,
		});

		const res = await client.books[":isbn"].$get({
			param: { isbn: "9781098166304" },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ data: { id: existing.id } });
		expect(await booksInDb()).toHaveLength(2);
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
		expect(await booksInDb()).toHaveLength(0);
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
		expect(await booksInDb()).toHaveLength(0);
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
		expect(await booksInDb()).toHaveLength(0);
	});

	it("returns 500 when an error is returned when getting the Edition", async () => {
		//? Suppresses the error stack trace from the error
		spyOn(console, "error").mockImplementationOnce(() => {});
		
		server.use(hardcoverErrorResolver("Editions"));

		const res = await client.books[":isbn"].$get({
			param: { isbn: "9781098166304" },
		});

		//? 500 isn't in the route's declared responses, so widen the type
		expect(res.status as number).toBe(500);
		expect(await booksInDb()).toHaveLength(0);
	});

	it("returns 500 when an error is returned when getting the Book", async () => {
		//? Suppresses the error stack trace from the error
		spyOn(console, "error").mockImplementationOnce(() => {});

		server.use(hardcoverErrorResolver("Books"));

		const res = await client.books[":isbn"].$get({
			param: { isbn: "9781098166304" },
		});

		//? 500 isn't in the route's declared responses, so widen the type
		expect(res.status as number).toBe(500);
		expect(await booksInDb()).toHaveLength(0);
	});

	describe("ISBN validation", () => {
		it("should accept an isbn-10 with an X check digit", async () => {
			const res = await client.books[":isbn"].$get({
				param: { isbn: "080442957X" },
			});

			expect(res.status).toBe(200);
		});

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
