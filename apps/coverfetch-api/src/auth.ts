import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { config } from "./config";
import db from "./db/db";

export const auth = betterAuth({
	appName: "Coverfetch",
	baseURL: config.auth.baseUrl,
	basePath: "/auth",
	database: {
		db,
		type: "postgres",
		schemaName: "auth",
	},
	emailAndPassword: {
		enabled: false,
	},
	plugins: [
		apiKey({
			references: "user",
		}),
		username({
			minUsernameLength: 5,
		}),
	],
});
