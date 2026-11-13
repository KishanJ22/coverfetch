import { beforeEach, describe, expect, it, spyOn, vi } from "bun:test";
import { MockLanguageModelV4 } from "ai/test";
import { testClient } from "hono/testing";
import { HttpResponse } from "msw";
import { createBook } from "../../../tests/books.factories";
import { mockBook, mockBookDetails } from "../../../tests/books.fixtures";
import {
	bookDetailsResolver,
	hardcover,
	hardcoverErrorResolver,
} from "../../../tests/books.handlers";
import { useTestDb } from "../../../tests/db";
import { server } from "../../../tests/server";
import {
	familiarityGuidance,
	goalGuidance,
	readingStatusGuidance,
} from "./generateReadingStrategy";
import readingStrategyRouter from "./reading-strategy.post";

const strategy = {
	points: [
		{
			title: "Skim the evaluation chapter first",
			detail: "It frames how every later technique is judged.",
		},
		{
			title: "Map each pattern to your own project",
			detail: "The patterns stick better when tied to a real use case.",
		},
		{
			title: "Treat the tooling sections as reference",
			detail: "Specific tools date quickly; the reasoning behind them does not.",
		},
	],
};

const modelResponse = (text: string) => ({
	content: [{ type: "text" as const, text }],
	finishReason: { unified: "stop" as const, raw: undefined },
	usage: {
		inputTokens: {
			total: 10,
			noCache: 10,
			cacheRead: undefined,
			cacheWrite: undefined,
		},
		outputTokens: { total: 20, text: 20, reasoning: undefined },
	},
	warnings: [],
});

let mockModel: MockLanguageModelV4;

//? useAiModel is the adapter to Flipt (model selection) and OpenRouter, so
//? mocking it keeps both external services out of the tests.
vi.mock("../../../clients/ai/client", () => ({
	useAiModel: async () => mockModel,
}));

/** The user prompt text sent on the most recent model call */
const sentPrompt = () =>
	(mockModel.doGenerateCalls.at(-1)?.prompt ?? [])
		.filter((message) => message.role === "user")
		.flatMap((message) => message.content)
		.map((part) => (part.type === "text" ? part.text : ""))
		.join("");

useTestDb();

describe("POST /books/:id/reading-strategy", () => {
	const client = testClient(readingStrategyRouter);

	const post = (
		id: number | string,
		json: Record<string, unknown> = {
			familiarity: "someKnowledge",
			goal: "applying",
		},
	) =>
		client.books[":id"]["reading-strategy"].$post({
			param: { id: String(id) },
			json: json as never,
		});

	/**
	 *? Seeds an unrelated row first so the matching book's database id (2)
	 *? differs from both 1 and its hardcover id (mockBook.id).
	 */
	const seedBook = async () => {
		await createBook();
		return createBook({ hardcoverId: mockBook.id, title: mockBook.title });
	};

	beforeEach(() => {
		mockModel = new MockLanguageModelV4({
			doGenerate: modelResponse(JSON.stringify(strategy)),
		});
	});

	describe("success", () => {
		it("returns the generated strategy", async () => {
			const book = await seedBook();

			const res = await post(book.id);

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual({ data: strategy });
			expect(mockModel.doGenerateCalls).toHaveLength(1);
		});

		it("looks the book up in Hardcover by its stored hardcover id", async () => {
			const book = await seedBook();
			let hardcoverRequest = "";
			server.use(
				hardcover.query("Book", async ({ request }) => {
					hardcoverRequest = await request.clone().text();
					return HttpResponse.json({
						data: { books: [mockBookDetails] },
					});
				}),
			);

			await post(book.id);

			expect(hardcoverRequest).toContain(String(mockBook.id));
		});

		it("sends the book and the reader's context to the model", async () => {
			const book = await seedBook();

			await post(book.id, {
				familiarity: "strongKnowledge",
				goal: "discussion",
				readingStatus: "rereading",
			});

			const prompt = sentPrompt();
			expect(prompt).toContain(`title: ${mockBookDetails.title}`);
			expect(prompt).toContain(familiarityGuidance.strongKnowledge);
			expect(prompt).toContain(goalGuidance.discussion);
			expect(prompt).toContain(readingStatusGuidance.rereading);
		});

		it("defaults readingStatus to firstRead", async () => {
			const book = await seedBook();

			await post(book.id, {
				familiarity: "newToTopic",
				goal: "learning",
			});

			expect(sentPrompt()).toContain(readingStatusGuidance.firstRead);
		});
	});

	describe("not found", () => {
		it("returns 404 when the book is not in the database", async () => {
			const res = await post(999);

			expect(res.status).toBe(404);
			expect(await res.json()).toMatchObject({
				message: "Book not found",
			});
			expect(mockModel.doGenerateCalls).toHaveLength(0);
		});

		it("returns 404 when Hardcover has no matching book", async () => {
			const book = await seedBook();
			server.use(bookDetailsResolver([]));

			const res = await post(book.id);

			expect(res.status).toBe(404);
			expect(await res.json()).toMatchObject({
				message: "Book not found",
			});
			expect(mockModel.doGenerateCalls).toHaveLength(0);
		});
	});

	describe("upstream failures", () => {
		beforeEach(() => {
			//? Hono logs unhandled errors; keep passing runs quiet
			spyOn(console, "error").mockImplementation(() => {});
		});

		it("returns 500 when Hardcover returns an error", async () => {
			const book = await seedBook();
			server.use(hardcoverErrorResolver("Book"));

			const res = await post(book.id);

			//? 500 isn't in the route's declared responses, so widen the type
			expect(res.status as number).toBe(500);
			expect(mockModel.doGenerateCalls).toHaveLength(0);
		});

		it("returns 500 when the model output does not match the schema", async () => {
			const book = await seedBook();
			mockModel = new MockLanguageModelV4({
				doGenerate: modelResponse(
					JSON.stringify({ advice: "read it" }),
				),
			});

			const res = await post(book.id);

			expect(res.status as number).toBe(500);
		});
	});

	describe("request validation", () => {
		it.each([
			["familiarity is missing", { goal: "applying" }],
			["goal is missing", { familiarity: "someKnowledge" }],
			[
				"familiarity is not a known value",
				{ familiarity: "expert", goal: "applying" },
			],
			[
				"goal is not a known value",
				{ familiarity: "someKnowledge", goal: "speedReading" },
			],
			[
				"readingStatus is not a known value",
				{
					familiarity: "someKnowledge",
					goal: "applying",
					readingStatus: "skimming",
				},
			],
		])("returns 400 when %s", async (_, json) => {
			const book = await seedBook();

			const res = await post(book.id, json);

			expect(res.status).toBe(400);
			expect(mockModel.doGenerateCalls).toHaveLength(0);
		});

		it("returns 400 when the id is not a positive integer", async () => {
			const res = await post("abc");

			expect(res.status).toBe(400);
		});
	});
});
