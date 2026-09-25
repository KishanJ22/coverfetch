import { describe, expect, it } from "bun:test";
import { testClient } from "hono/testing";
import rootRouter from "./root.get";

describe("GET /", () => {
	const mockApp = testClient(rootRouter);

	it("should return a response successfully", async () => {
		const res = await mockApp.index.$get("/");

		expect(res.status).toBe(200);
	});
});
