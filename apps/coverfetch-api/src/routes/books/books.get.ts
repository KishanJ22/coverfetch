import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { hardcoverApiClient } from "../../clients/hardcover/client";
import { booksQuery } from "./booksQuery";
import { editionsQuery } from "./editionsQuery";
import { formatBook } from "./formatBook";
import { notFoundSchema, successResponseSchema } from "./schemas";
import { validateBook } from "./validateBook";

const isDigit = (char: string) => char >= "0" && char <= "9";

const isValidIsbn10 = (value: string) => {
	if (value.length !== 10) return false;
	if (!value.slice(0, 9).split("").every(isDigit)) return false;
	const checkDigit = value[9] ?? "";

	if (!isDigit(checkDigit) && checkDigit !== "X") return false;

	const sum = value
		.split("")
		.reduce(
			(acc, char, i) =>
				acc + (char === "X" ? 10 : Number(char)) * (10 - i),
			0,
		);

	return sum % 11 === 0;
};

const isValidIsbn13 = (value: string) => {
	if (value.length !== 13 || !value.split("").every(isDigit)) return false;

	const sum = value
		.split("")
		.reduce(
			(acc, char, i) => acc + Number(char) * (i % 2 === 0 ? 1 : 3),
			0,
		);

	return sum % 10 === 0;
};

const isbnSchema = z.string().superRefine((value, ctx) => {
	if (value.includes("-")) {
		ctx.addIssue({
			code: "custom",
			message: "ISBN cannot include dashes",
		});
		return;
	}

	if (!isValidIsbn10(value) && !isValidIsbn13(value)) {
		ctx.addIssue({
			code: "custom",
			message: "ISBN must be a valid 10 or 13 digit ISBN",
		});
	}
});

const paramsSchema = z.object({
	isbn: isbnSchema.openapi({
		param: {
			name: "isbn",
			in: "path",
		},
	}),
});

const booksGetRoute = createRoute({
	method: "get",
	path: "/books/{isbn}",
	request: {
		params: paramsSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: successResponseSchema,
				},
			},
		},
		400: {
			content: {
				"application/json": {
					schema: z.object({
						message: z.string(),
					}),
				},
			},
		},
		404: {
			content: {
				"application/json": {
					schema: notFoundSchema,
				},
			},
			description: "Returns a not found error",
		},
	},
});

const booksRouter = new OpenAPIHono().openapi(
	booksGetRoute,
	async (c) => {
		const { isbn } = c.req.valid("param");

		const edition = await hardcoverApiClient
			.query({
				__name: "Editions",
				editions: {
					...editionsQuery.editions,
					__args: {
						where: {
							_or: [
								{ isbn_10: { _eq: isbn } },
								{ isbn_13: { _eq: isbn } },
							],
						},
					},
				},
			})
			.then(({ editions }) => editions[0]);

		const book = await hardcoverApiClient
			.query({
				__name: "Books",
				books: {
					...booksQuery.books,
					__args: {
						where: {
							id: {
								_eq: edition?.book_id,
							},
						},
					},
				},
			})
			.then(({ books }) => books[0]);

		if (!edition || !book) {
			return c.json({ message: "Book not found" } as const, 404);
		}

		const bookValidationErrors = validateBook(edition, book);

		if (bookValidationErrors.length > 0) {
			return c.json(
				{
					message: "Book not found" as const,
					errors: bookValidationErrors,
				},
				404,
			);
		}

		return c.json({ data: formatBook(edition, book) }, 200);
	},
	(result, c) => {
		if (!result.success) {
			return c.json(
				{
					message:
						result.error.issues[0]?.message ??
						"Please check the ISBN entered",
				},
				400,
			);
		}
	},
);

export default booksRouter;
