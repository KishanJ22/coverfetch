import { createAnthropic } from "@ai-sdk/anthropic";
import type { AnthropicModelId } from "@ai-sdk/anthropic/internal";
import { config } from "../../config";
import { useFliptClient } from "../flipt/client";

export async function useAnthropicModel() {
	//TODO: get model name from Flipt feature flag
	const fliptClient = await useFliptClient();

	const modelName: AnthropicModelId = fliptClient.evaluateVariant({
		flagKey: "api-model",
		entityId: "global",
		context: {},
	}).variantKey;

	const anthropicClient = createAnthropic({
		apiKey: config.ai.anthropicApiKey,
	});

	return anthropicClient(modelName);
}
