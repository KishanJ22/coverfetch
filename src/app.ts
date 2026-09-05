import { OpenAPIHono } from "@hono/zod-openapi";
import { config } from "./config";
import { autoloadRoutes } from "./routes/autoload";
import pkg from "../package.json";
import { generateSpec } from "./generate-openapi-spec";

export const app = new OpenAPIHono();
export type App = typeof app;

await autoloadRoutes(app);

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: pkg.name,
    version: pkg.version,
  },
});

await generateSpec(app);

export default {
  port: config.server.port,
  fetch: app.fetch,
};
