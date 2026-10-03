declare module "bun" {
	interface Env {
		AUTH_URL: string;
		AUTH_CLIENT_ID: string;
		AUTH_USERNAME: string;
		AUTH_PASSWORD: string;
		BETTER_AUTH_SECRET: string;
		BETTER_AUTH_URL: string;
		DATABASE_URL: string;
		ENVIRONMENT: "local" | "test" | "production";
		FLIPT_BASE_URL: string;
		HARDCOVER_API_KEY: string;
		HARDCOVER_BASE_URL: string;
		OPENROUTER_BASE_URL: string;
		OPENROUTER_API_KEY: string;
		SERVER_PORT: number;
	}
}
