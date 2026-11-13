import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { hardcoverApiClient } from "../../../clients/hardcover/client";
import db from "../../../db/db";
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
	id: z.coerce
		.number({ error: "must be a positive whole number" })
		.int({ error: "must be a positive whole number" })
		.positive({ error: "must be a positive whole number" })
		.openapi({
			param: {
				name: "id",
				in: "path",
			},
		}),
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

const badRequestSchema = z.object({
	message: z.string(),
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
		400: {
			content: {
				"application/json": {
					schema: badRequestSchema,
				},
			},
			description:
				"Returns a validation error for the id or request body",
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

const readingStrategyRouter = new OpenAPIHono().openapi(
	readingStrategyRoute,
	async (c) => {
		const { id } = c.req.valid("param");
		const { familiarity, goal, readingStatus } = c.req.valid("json");

		const storedBook = await db
			.selectFrom("coverfetch.books")
			.where("id", "=", id)
			.select("hardcoverId")
			.executeTakeFirst();

		if (!storedBook) {
			return c.json({ message: "Book not found" as const }, 404);
		}

		const { hardcoverId } = storedBook;

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
	(result, c) => {
		if (!result.success) {
			const issue = result.error.issues[0];
			const field = issue?.path.join(".");

			return c.json(
				{
					message: issue
						? field
							? `${field}: ${issue.message}`
							: issue.message
						: "Please check the request",
				},
				400,
			);
		}
	},
);

export default readingStrategyRouter;
