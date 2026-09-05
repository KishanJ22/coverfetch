import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";

const successResponseSchema = z.object({
  message: z.literal("Welcome to coverfetch!"),
});

const rootRouter = new OpenAPIHono();

rootRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: successResponseSchema,
    },
  }),
  async (c) => c.json({ message: "Welcome to coverfetch!" }, 200),
);

export default rootRouter;
