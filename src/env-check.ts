import { config, configSchema } from "./config";

export async function envCheck() {
	const result = configSchema.safeParse(config);

	if (!result.success) {
		console.error("Invalid environment configuration:");
		for (const issue of result.error.issues) {
			console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
		}
		process.exit(1);
	}
}
