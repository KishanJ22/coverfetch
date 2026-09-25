declare module "bun" {
	interface Env {
		AUTH_URL: string;
		AUTH_CLIENT_ID: string;
		AUTH_USERNAME: string;
		AUTH_PASSWORD: string;
		ANTHROPIC_API_KEY: string;
		HARDCOVER_BASE_URL: string;
		HARDCOVER_API_KEY: string;
		FLIPT_BASE_URL: string;
		SERVER_PORT: number;
	}
}
