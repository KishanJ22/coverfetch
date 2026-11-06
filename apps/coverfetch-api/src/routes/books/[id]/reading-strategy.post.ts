import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { hardcoverApiClient } from "../../../clients/hardcover/client";
import { bookByHardcoverIdQuery } from "../bookByHardcoverIdQuery";
import { notFoundSchema } from "../schemas";
import { bookDetailsQuery } from "./bookDetailsQuery";
import { generateReadingStrategy } from "./generateReadingStrategy";

const familiarityValues = z.enum([
	"newToTopic",
	"someKnowledge",
	"strongKnowledge",
]);

export type Familiarity = z.infer<typeof familiarityValues>;

const readingStatusValues = z.enum([
	"firstRead",
	"rereading",
	"alreadyStarted",
]);

export type ReadingStatus = z.infer<typeof readingStatusValues>;

const goalValues = z.enum(["applying", "enjoyment", "learning", "discussion"]);

export type Goal = z.infer<typeof goalValues>;

const bodySchema = z.object({
	familiarity: familiarityValues,
	goal: goalValues,
	readingStatus: readingStatusValues.default("firstRead"),
});

const paramsSchema = z.object({
	id: z.string(),
});

export const strategyPointsSchema = z.object({
	points: z
		.array(
			z.object({
				title: z
					.string()
					.describe("Short imperative takeaway, under 10 words."),
				detail: z
					.string()
					.describe(
						"One or two sentences giving the reason or a practical tip. Does not restate the title.",
					),
			}),
		)
		.describe("3 to 5 reading strategy points."),
});

const successResponseSchema = z.object({
	data: strategyPointsSchema,
});

const readingStrategyRoute = createRoute({
	method: "post",
	path: "/books/{id}/reading-strategy",
	request: {
		params: paramsSchema,
		body: {
			content: {
				"application/json": {
					schema: bodySchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: successResponseSchema,
				},
			},
		},
		404: {
			content: {
				"application/json": {
					schema: notFoundSchema,
				},
			},
		},
	},
});

const readingStrategyRouter = new OpenAPIHono().openapi(
	readingStrategyRoute,
	async (c) => {
		const { id } = c.req.valid("param");
		const { familiarity, goal, readingStatus } = c.req.valid("json");

		const { hardcoverId } = await bookByHardcoverIdQuery(
			Number(id),
		).executeTakeFirstOrThrow();

		const bookDetails = await hardcoverApiClient
			.query({
				__name: "Book",
				books: {
					...bookDetailsQuery.books,
					__args: {
						where: {
							id: {
								_eq: Number(hardcoverId),
							},
						},
					},
				},
			})
			.then(({ books }) => books[0]);

		if (!bookDetails) {
			return c.json(
				{
					message: "Book not found" as const,
				},
				404,
			);
		}

		const generatedStrategy = await generateReadingStrategy(
			bookDetails,
			familiarity,
			goal,
			readingStatus,
		);

		return c.json(
			{
				data: generatedStrategy,
			},
			200,
		);
	},
);

export default readingStrategyRouter;
