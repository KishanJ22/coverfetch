import { FetchInterceptor } from "@mswjs/interceptors/fetch/web";
import { defineNetwork, InterceptorSource } from "msw/experimental";
import { booksHandlers } from "./books.handlers";

const handlers = [...booksHandlers];

/**
 *? `msw/node` intercepts by patching `node:net` sockets, which Bun's native
 *? `fetch` never touches. The web fetch interceptor patches `globalThis.fetch`
 *? instead. See https://github.com/oven-sh/bun/issues/44916
 */
export const server = defineNetwork({
	sources: [
		new InterceptorSource({
			interceptors: [new FetchInterceptor()],
		}),
	],
	handlers,
	onUnhandledFrame: "error",
	context: {
		quiet: true,
	},
});
