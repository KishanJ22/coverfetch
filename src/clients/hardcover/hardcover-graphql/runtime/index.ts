// @ts-nocheck

export type { ClientOptions } from "./createClient";
export { createClient } from "./createClient";
export { GenqlError } from "./error";
// export { Observable } from 'zen-observable-ts'
export { createFetcher } from "./fetcher";
export type { GraphqlOperation } from "./generateGraphqlOperation";
export { generateGraphqlOperation } from "./generateGraphqlOperation";
export { linkTypeMap } from "./linkTypeMap";
export type { FieldsSelection } from "./typeSelection";
export const everything = {
	__scalar: true,
};
