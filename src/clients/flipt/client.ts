import { FliptClient } from "@flipt-io/flipt-client-js";
import { config } from "../../config";
import { getJwtToken } from "./get-jwt-token";

export async function useFliptClient() {
	const fliptClient = await FliptClient.init({
		namespace: "coverfetch",
		url: config.flipt.baseUrl,
		authentication: {
			jwtToken: await getJwtToken(),
		},
	});

	return fliptClient;
}
