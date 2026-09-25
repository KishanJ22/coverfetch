import ky from "ky";
import { config } from "../../config";

interface AuthTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export async function getJwtToken() {
	const { authUrl, authClientId, authUsername, authPassword } = config.flipt;

	try {
		const body = new URLSearchParams();
		body.set("grant_type", "client_credentials");
		body.set("client_id", authClientId);
		body.set("username", authUsername);
		body.set("password", authPassword);

		const response = await ky.post<AuthTokenResponse>(authUrl, {
			body,
		});
		const data = await response.json();

		if (data?.access_token) {
			return data.access_token;
		}
	} catch (err) {
		// TODO add logger
		console.error(err);
	}
}
