import { createOpenAI } from "@ai-sdk/openai";
import { config } from "../../config";
import { useFliptClient } from "../flipt/client";

export async function useAiModel() {
	const fliptClient = await useFliptClient();

	const model = fliptClient.evaluateVariant({
		flagKey: "ai-model",
		entityId: "global",
		context: {},
	}).variantAttachment;

	const aiClient = createOpenAI({
		baseURL: config.ai.openRouterBaseUrl,
		apiKey: config.ai.openRouterKey,
		name: "coverfetch",
	});

	const modelName = JSON.parse(model)?.model;

	return aiClient(modelName);
}
