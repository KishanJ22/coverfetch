import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { hardcoverApiClient } from "../../clients/hardcover/client";

const paramsSchema = z.object({
	isbn: z
		.string()
		.min(10)
		.openapi({
			param: {
				name: "isbn",
				in: "path",
			},
		}),
});

const notFoundSchema = z.object({
	message: z.literal("Book not found"),
});

const booksGetRoute = createRoute({
	method: "get",
	path: "/books/{isbn}",
	request: {
		params: paramsSchema,
	},
	responses: {
		200: {},
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

const booksRouter = new OpenAPIHono();

booksRouter.openapi(booksGetRoute, async (c) => {
	const { isbn } = c.req.valid("param");

	const { editions } = await hardcoverApiClient.query({
		editions: {
			book_id: true,
			isbn_10: true,
			isbn_13: true,
			__args: {
				where: {
					_or: [
						{ isbn_13: { _eq: isbn } },
						{ isbn_10: { _eq: isbn } },
					],
				},
			},
		},
	});

	if (editions.length === 0) {
		return c.json(
			{
				message: "Book not found",
			},
			404,
		);
	}

	const { books } = await hardcoverApiClient.query({
		books: {
			__args: {
				where: {
					id: {
						_eq: editions[0]?.book_id
					}
				}
			},
			cached_contributors: true,
			cached_image: true,
			cached_tags: true,
			headline: true,
			slug: true,
			title: true,
			rating: true,
		}
	});

	return c.json({ data: books[0] }, 200);
});

export default booksRouter;
