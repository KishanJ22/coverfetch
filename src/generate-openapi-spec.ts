import type { App } from "./app";

export async function generateSpec(app: App) {
  const res = await app.fetch(new Request("http://localhost/doc"));
  const spec = await res.json();
  await Bun.write("./docs/openapi.json", JSON.stringify(spec, null, 2));

  console.log("Generated spec successfully");
}
