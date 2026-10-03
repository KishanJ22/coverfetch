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
		.addColumn("content", "jsonb", (col) => col.notNull())
		.addColumn("generated_at", "timestamptz", (col) => col.notNull())
		.addUniqueConstraint("reading_strategies_book_familiarity_unique", [
			"book_id",
			"familiarity",
		])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.withSchema("coverfetch")
		.dropTable("reading_strategies")
		.execute();
}
