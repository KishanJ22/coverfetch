import { beforeAll, beforeEach } from "bun:test";
import { sql } from "kysely";
import db from "../db/db";

/**
 *? Truncates every table in the `coverfetch` schema before each test.
 *? All test files share one database, so DB tests must not run under
 *? `bun test --parallel` or `test.concurrent` — runs would wipe each other's rows.
 */
export function useTestDb() {
	let truncate: string;

	beforeAll(async () => {
		const url = new URL(Bun.env.DATABASE_URL ?? "");
		if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
			throw new Error(`Refusing to run DB tests against ${url.hostname}`);
		}
		const { rows } = await sql<{ tablename: string }>`
      select tablename from pg_tables where schemaname = 'coverfetch'`.execute(
			db,
		);
		truncate = `TRUNCATE ${rows.map((r) => `coverfetch."${r.tablename}"`).join(", ")} RESTART IDENTITY CASCADE`;
	});

	beforeEach(() => sql.raw(truncate).execute(db));
}
