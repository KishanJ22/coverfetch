import { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "../auth";

const authRouter = new OpenAPIHono().all("/auth/*", (c) =>
	auth.handler(c.req.raw),
);

export default authRouter;
