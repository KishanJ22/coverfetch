import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { config } from "../config";
import type { DB } from "./types";

export const createPool = (options?: string) =>
	new Pool({
		connectionString: config.database.url,
		ssl: false,
		options,
	});

const dialect = new PostgresDialect({
	pool: createPool(),
});

const plugins = [new CamelCasePlugin()];

const db = new Kysely<DB>({
	dialect,
	plugins,
});

export default db;
