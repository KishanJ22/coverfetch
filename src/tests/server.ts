import { setupServer } from "msw/node";
import { booksHandlers } from "./books.handlers";

const handlers = [...booksHandlers];

export const server = setupServer(...handlers);
