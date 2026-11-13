import { sql } from "kysely";
import db from "../db/db";

//? Script to test the connection to the database for testing
const dbHealthCheck = async () => {
    try {
        console.log("Waiting 5 seconds for db to be ready");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await sql`SELECT 1`.execute(db);

        console.log("Database connection is healthy.");
        process.exit(0);
    } catch (error) {
        console.error("Database connection failed");
        throw error;
    }
};

dbHealthCheck();
