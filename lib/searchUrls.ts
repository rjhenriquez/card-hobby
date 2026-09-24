import type {
	Platform,
	FanaticsCollectType,
	EbaySort,
	AltType,
} from "@/components/SearchFilters/SearchFilters";

interface BuildSearchUrlParams {
	platform: Platform;
	searchGroups: string[][];
	fanaticsCollectType?: FanaticsCollectType;
	altType?: AltType;
	auctionsOnly?: boolean;
	ebaySort?: EbaySort;
	minPrice?: string;
	sportsCardsOnly?: boolean;
	hasBids?: boolean;
}

const platformBaseUrls = {
	ebay: "https://www.ebay.com/sch/i.html",
	"fanatics-collect": "https://www.fanaticscollect.com/marketplace",
	alt: "https://alt.xyz",
} as const;

export function buildSearchUrl({
	platform,
	searchGroups,
	fanaticsCollectType = "weekly",
	altType = "auctions",
	auctionsOnly = false,
	ebaySort = "default",
	minPrice = "",
	sportsCardsOnly = false,
	hasBids = false,
}: BuildSearchUrlParams): string | null {
	const populatedGroups = searchGroups.filter((group) => group.length > 0);

	if (populatedGroups.length === 0) {
		return null;
	}

	if (platform === "fanatics-collect") {
		const url = new URL(platformBaseUrls[platform]);
		const firstSearchTerm = populatedGroups.flat()[0];

		url.searchParams.set("type", fanaticsCollectType.toUpperCase());
		url.searchParams.set("q", firstSearchTerm);

		return url.toString();
	}

	if (platform === "alt") {
		const searchQuery = populatedGroups
			.map((group) => (group.length === 1 ? group[0] : `(${group.join(", ")})`))
			.join(" ");
		const path = altType === "fixed" ? "fixed-price" : "auctions";
		const url = new URL(`https://alt.xyz/browse/${path}`);
		url.searchParams.set("query", searchQuery);
		return url.toString();
	}

	if (platform === "ebay") {
		const url = new URL(platformBaseUrls[platform]);

		const searchQuery = populatedGroups
			.map((group) => (group.length === 1 ? group[0] : `(${group.join(", ")})`))
			.join(" ");

		url.searchParams.set("_nkw", searchQuery);

		if (auctionsOnly) {
			url.searchParams.set("LH_Auction", "1");
		}

		if (ebaySort === "ending-soonest") {
			url.searchParams.set("_sop", "1");
		}

		if (minPrice) {
			url.searchParams.set("_udlo", minPrice);
		}

		if (sportsCardsOnly) {
			url.searchParams.set("_sacat", "261328");
		}

		if (hasBids) {
			url.searchParams.set("LH_NOB", "1");
			url.searchParams.set("_sabdlo", "1");
		}

		return url.toString();
	}

	return null;
}
