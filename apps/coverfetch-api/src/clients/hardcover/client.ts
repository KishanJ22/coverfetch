import { config } from "../../config";
import { createClient } from "./hardcover-graphql";

export const hardcoverApiClient = createClient({
	url: config.hardcover.baseUrl,
	headers: {
		Authorization: `Bearer ${config.hardcover.apiKey}`,
	},
});
