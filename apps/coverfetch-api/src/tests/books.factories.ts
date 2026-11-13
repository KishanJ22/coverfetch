import type { Insertable } from "kysely";
import db from "../db/db";
import type { CoverfetchBooks, CoverfetchReadingStrategies } from "../db/types";

//? Start well above fixture ids (e.g. mockBook.id) so default rows never collide with them
let seq = 100_000;
const next = () => ++seq;

export const createBook = (
	overrides: Partial<Insertable<CoverfetchBooks>> = {},
) =>
	db
		.insertInto("coverfetch.books")
		.values({ hardcoverId: next(), title: "Test Book", ...overrides })
		.returningAll()
		.executeTakeFirstOrThrow();

export const createReadingStrategy = async (
	overrides: Partial<Insertable<CoverfetchReadingStrategies>> = {},
) => {
	const bookId = overrides.bookId ?? (await createBook()).id;
	return db
		.insertInto("coverfetch.readingStrategies")
		.values({
			bookId,
			familiarity: "beginner",
			goal: "overview",
			readingStatus: "not_started",
			content: JSON.stringify({ steps: [] }),
			modelName: "test-model",
			promptVersion: 1,
			generatedAt: new Date(),
			...overrides,
		})
		.returningAll()
		.executeTakeFirstOrThrow();
};
