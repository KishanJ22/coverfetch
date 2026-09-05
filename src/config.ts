import * as z from "zod";

const configSchema = z.object({
  server: z.object({
    port: z.number(),
  }),
  hardcover: z.object({
    baseUrl: z.string(),
    apiKey: z.string(),
  }),
});

type Config = z.infer<typeof configSchema>;

export const config = {
  server: {
    port: Bun.env.SERVER_PORT,
  },
  hardcover: {
    baseUrl: Bun.env.HARDCOVER_BASE_URL,
    apiKey: Bun.env.HARDCOVER_API_KEY,
  },
} satisfies Config;
