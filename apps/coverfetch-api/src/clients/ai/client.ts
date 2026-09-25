import { createOpenAI } from "@ai-sdk/openai";
import { config } from "../../config";
import { useFliptClient } from "../flipt/client";

export async function useAiModel() {
	const fliptClient = await useFliptClient();

	const model = fliptClient.evaluateVariant({
		flagKey: "api-model",
		entityId: "global",
		context: {},
	}).variantAttachment;

	const modelName = JSON.parse(model)?.model;

	const aiClient = createOpenAI({
		baseURL: config.ai.openRouterBaseUrl,
		apiKey: config.ai.openRouterKey,
		name: "coverfetch",
	});

	return aiClient(modelName);
}
