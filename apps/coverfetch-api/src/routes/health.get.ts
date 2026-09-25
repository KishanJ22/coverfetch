import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import pkg from "../../package.json";

const successResponseSchema = z.object({
	status: z.literal("healthy"),
	version: z.string(),
});

const healthRouter = new OpenAPIHono();

healthRouter.openapi(
	createRoute({
		method: "get",
		path: "/health",
		responses: {
			200: successResponseSchema,
		},
	}),
	async (c) =>
		c.json(
			{
				status: "healthy",
				version: pkg.version,
			},
			200,
		),
);

export default healthRouter;
