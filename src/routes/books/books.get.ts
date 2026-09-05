import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";
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
      __scalar: true,
      book_id: true,
      cached_contributors: true,
      cached_image: true,
      title: true,
      __args: {
        where: {
          _or: [{ isbn_13: { _eq: isbn } }, { isbn_10: { _eq: isbn } }],
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

  return c.json({ data: editions[0] }, 200);
});

export default booksRouter;
