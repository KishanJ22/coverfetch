import { describe, expect, test } from "bun:test";
import { getAuthors, getTopTags } from "./formatCachedFields";

describe("getAuthors", () => {
	test("returns deduped author names in order", () => {
		const contributors = [
			{ author: { name: "A" } },
			{ author: { name: "B" } },
			{ author: { name: "A" } },
		] as any;

		expect(getAuthors(contributors)).toEqual(["A", "B"]);
	});

	test("returns an empty array for missing data", () => {
		expect(getAuthors(null)).toEqual([]);
		expect(getAuthors(undefined)).toEqual([]);
	});
});

describe("getTopTags", () => {
	const tags = {
		Genre: [
			{ tag: "low", count: 1 },
			{ tag: "high", count: 9 },
			{ tag: "mid", count: 5 },
			{ tag: "high", count: 2 },
		],
		Tag: [],
	} as any;

	test("returns tags ordered by count, deduped and limited", () => {
		expect(getTopTags(tags, "Genre", 2)).toEqual(["high", "mid"]);
	});

	test("does not mutate the input", () => {
		const before = tags.Genre.map((t: any) => t.tag);
		getTopTags(tags, "Genre");
		expect(tags.Genre.map((t: any) => t.tag)).toEqual(before);
	});

	test("returns an empty array when the tag type or data is missing", () => {
		expect(getTopTags({ Genre: [] } as any, "Tag")).toEqual([]);
		expect(getTopTags(null, "Genre")).toEqual([]);
	});
});
