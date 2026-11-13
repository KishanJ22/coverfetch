import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.withSchema("coverfetch")
		.createTable("reading_strategies")
		.ifNotExists()
		.addColumn("id", "serial", (col) => col.primaryKey().notNull())
		.addColumn("book_id", "integer", (col) =>
			col.notNull().references("coverfetch.books.id"),
		)
		.addColumn("familiarity", "text", (col) => col.notNull())
		.addColumn("goal", "text", (col) => col.notNull())
		.addColumn("reading_status", "text", (col) => col.notNull())
		.addColumn("content", "jsonb", (col) => col.notNull())
		.addColumn("model_name", "text", (col) => col.notNull())
		.addColumn("prompt_version", "numeric", (col) => col.notNull())
		.addColumn("generated_at", "timestamptz", (col) => col.notNull())
		.addUniqueConstraint(
			"reading_strategies_book_familiarity_goal_status_unique",
			[
				"book_id",
				"familiarity",
				"goal",
				"reading_status",
				"model_name",
				"prompt_version",
			],
		)
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.withSchema("coverfetch")
		.dropTable("reading_strategies")
		.execute();
}
