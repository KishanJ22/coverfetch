import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.withSchema("coverfetch")
		.createTable("books")
		.ifNotExists()
		.addColumn("id", "serial", (col) => col.primaryKey().notNull())
		.addColumn("hardcover_id", "text", (col) => col.notNull().unique())
		.addColumn("title", "text", (col) => col.notNull())
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.withSchema("coverfetch").dropTable("books").execute();
}
