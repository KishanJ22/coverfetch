import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createSchema("coverfetch").ifNotExists().execute();

	//? Create minimal user table for testing
	if (Bun.env.ENVIRONMENT === "test") {
		await db.schema
			.withSchema("auth")
			.createTable("user")
			.ifNotExists()
			.addColumn("id", "text", (col) => col.primaryKey())
			.execute();
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropSchema("coverfetch").execute();
}
