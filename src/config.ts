import * as z from "zod";

export const configSchema = z.object({
	server: z.object({
		port: z.coerce.number().min(1),
	}),
	hardcover: z.object({
		baseUrl: z.httpUrl(),
		apiKey: z.string(),
	}),
	ai: z.object({
		anthropicApiKey: z.string(),
	}),
	flipt: z.object({
		baseUrl: z.httpUrl(),
		authUrl: z.httpUrl(),
		authClientId: z.string(),
		authUsername: z.string(),
		authPassword: z.string(),
	}),
});

export type Config = z.infer<typeof configSchema>;

export const config: z.input<typeof configSchema> = {
	server: {
		port: Bun.env.SERVER_PORT,
	},
	hardcover: {
		baseUrl: Bun.env.HARDCOVER_BASE_URL,
		apiKey: Bun.env.HARDCOVER_API_KEY,
	},
	ai: {
		anthropicApiKey: Bun.env.ANTHROPIC_API_KEY,
	},
	flipt: {
		baseUrl: Bun.env.FLIPT_BASE_URL,
		authUrl: Bun.env.AUTH_URL,
		authClientId: Bun.env.AUTH_CLIENT_ID,
		authUsername: Bun.env.AUTH_USERNAME,
		authPassword: Bun.env.AUTH_PASSWORD,
	},
};
