import type { BasicTagType } from "../../clients/hardcover/hardcover-graphql";
import type { CachedContributor } from "../../clients/hardcover/hardcover-graphql/extended-schema";

export const getAuthors = (
	cachedContributors: CachedContributor[] | null | undefined,
): string[] => [
	...new Set((cachedContributors ?? []).map(({ author }) => author.name)),
];

export const getTopTags = (
	cachedTags: Record<string, BasicTagType[]> | null | undefined,
	tagType: "Tag" | "Genre",
	limit = 3,
): string[] => {
	const sortedTags = [...(cachedTags?.[tagType] ?? [])].sort(
		(a, b) => (b.count ?? 0) - (a.count ?? 0),
	);

	return [...new Set(sortedTags.map(({ tag }) => tag))].slice(0, limit);
};
