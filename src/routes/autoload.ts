import { OpenAPIHono } from "@hono/zod-openapi";

const routeFilePattern = new Bun.Glob("**/*.{get,post,put,patch,delete}.ts");
const routesDir = new URL(".", import.meta.url).pathname;

export async function autoloadRoutes(app: OpenAPIHono) {
	let loadedRoutes = 0;
	for (const file of routeFilePattern.scanSync({ cwd: routesDir })) {
		const mod = await import(`./${file}`);
		const router = mod.default;

		if (!(router instanceof OpenAPIHono)) {
			throw new Error(
				`Route file "${file}" must have a default export that is an OpenAPIHono instance.`,
			);
		}

		loadedRoutes++;

		app.route("/", router);
	}

	console.log(`Loaded ${loadedRoutes} routes.`);
}
