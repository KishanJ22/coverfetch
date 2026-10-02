import { PostgresDialect } from "kysely";
import { defineConfig } from "kysely-ctl";
import { Pool } from "pg";

export default defineConfig({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: Bun.env.DATABASE_URL,
            ssl: false,
        }),
    }),
    migrations: {
        migrationFolder: "src/db/migrations",
        migrationTableSchema: "coverfetch_migrations",
        migrationTableName: "db_migrations",
        getMigrationPrefix: () => {
            const date = new Date();
            const formattedDate = date
                .toISOString()
                .replace(/[-:T]/g, "")
                .slice(0, 13); // YYYYMMDDHHMM

            return `${formattedDate}_`;
        },
    },
    seeds: {
        seedFolder: "src/db/seeds",
        getSeedPrefix: () => {
            const date = new Date();
            const formattedDate = date
                .toISOString()
                .replace(/[-:T]/g, "")
                .slice(0, 13); // YYYYMMDDHHMM
            return `${formattedDate}_`;
        },
    },
});
