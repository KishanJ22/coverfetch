import * as z from "zod";

export const configSchema = z.object({
	server: z.object({
		port: z.coerce.number().min(1),
	}),
	hardcover: z.object({
		baseUrl: z.httpUrl(),
		apiKey: z.string(),
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
};
