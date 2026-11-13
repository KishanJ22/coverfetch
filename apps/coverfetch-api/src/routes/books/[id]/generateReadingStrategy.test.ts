import { expect, it } from "bun:test";
import { z } from "zod";
import type { BookDetails } from "./bookDetailsQuery";
import {
	buildReadingStrategyPrompt,
	familiarityGuidance,
	goalGuidance,
	promptVersion,
	readingStatusGuidance,
	systemPrompt,
} from "./generateReadingStrategy";
import { strategyPointsSchema } from "./reading-strategy.post";

/**
 *? This snapshot guards everything that shapes what the model is asked and
 *? what it must return. If this test fails after you change the prompt:
 *?  - substantive change (it would change the advice): bump `promptVersion`
 *?    in generateReadingStrategy.ts, then run `bun test -u`.
 *?  - cosmetic change (typo, whitespace): run `bun test -u` only.
 */

const fullBook = {
	title: "AI Engineering",
	description:
		"<p>Build <b>applications</b> with foundation models.</p>  A practical guide.",
	pages: 532,
	release_date: "2024-12-20",
	cached_contributors: [
		{ author: { name: "Chip Huyen" } },
		{ author: { name: "Chip Huyen" } },
	],
	cached_tags: {
		Genre: [
			{ tag: "Computers", count: 10 },
			{ tag: "Business", count: 30 },
		],
		Tag: [],
	},
} as unknown as BookDetails;

const thinBook = {
	title: "Thin Book",
	description: null,
	pages: null,
	release_date: null,
	cached_contributors: null,
	cached_tags: null,
} as unknown as BookDetails;

it("should match strategy prompt content", () => {
	expect({
		promptVersion,
		systemPrompt,
		familiarityGuidance,
		readingStatusGuidance,
		goalGuidance,
		outputSchema: z.toJSONSchema(strategyPointsSchema),
		renderedPrompts: {
			fullBook: buildReadingStrategyPrompt(
				fullBook,
				"someKnowledge",
				"applying",
				"firstRead",
			),
			thinBook: buildReadingStrategyPrompt(
				thinBook,
				"newToTopic",
				"enjoyment",
				"rereading",
			),
		},
	}).toMatchSnapshot();
});
