import { afterAll, afterEach, beforeAll } from "bun:test";
import { server } from "./server";

beforeAll(() => server.enable());
afterEach(() => server.resetHandlers());
afterAll(() => server.disable());
