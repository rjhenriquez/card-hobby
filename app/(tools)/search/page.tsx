"use client";

import { useState } from "react";

import {
	SearchFilters,
	type FanaticsCollectType,
	type Platform,
	type EbaySort,
	type AltType,
} from "@/components/SearchFilters/SearchFilters";
import { SearchGeneratedUrls } from "@/components/SearchGeneratedUrls/SearchGeneratedUrls";
import { useSearch } from "@/components/SearchSidebar/SearchContext";
import { buildSearchUrl } from "@/lib/searchUrls";
import { useSearchParams } from "next/navigation";

import styles from "@/styles/page/Page.module.scss";

export default function SearchPage() {
	const { selectedValuesByGroup } = useSearch();
	const [fanaticsCollectType, setFanaticsCollectType] =
		useState<FanaticsCollectType>("weekly");
	const [altType, setAltType] = useState<AltType>("auctions");
	const [groupEbaySearches, setGroupEbaySearches] = useState(false);
	const [auctionsOnly, setAuctionsOnly] = useState(false);
	const [ebaySort, setEbaySort] = useState<EbaySort>("ending-soonest");
	const [minPrice, setMinPrice] = useState("");
	const [sportsCardsOnly, setSportsCardsOnly] = useState(false);
	const [hasBids, setHasBids] = useState(false);
	const [includeCategory, setIncludeCategory] = useState(false);
	const searchGroups = Object.entries(selectedValuesByGroup).map(
		([groupKey, searches]) => {
			const [, category] = groupKey.split(":");
			return {
				category,
				searches,
			};
		},
	);

	const selectedSearches = searchGroups.flatMap(({ category, searches }) =>
		searches.map((search) =>
			includeCategory ? `${category} ${search}` : search,
		),
	);
	const groupedSearches = searchGroups.map(({ category, searches }) => {
		if (!includeCategory) {
			return searches;
		}
		if (searches.length === 1) {
			return [`${category} ${searches[0]}`];
		}
		return [`${category} (${searches.join(", ")})`];
	});
	const searchParams = useSearchParams();
	const tab = searchParams.get("tab");
	const selectedPlatform: Platform =
		tab === "fanatics-collect" || tab === "alt" || tab === "card-ladder"
			? tab
			: "ebay";

	const searchUrlOptions = {
		platform: selectedPlatform,
		fanaticsCollectType,
		altType,
		auctionsOnly,
		ebaySort,
		minPrice,
		sportsCardsOnly,
		hasBids,
	};

	const urls =
		selectedPlatform === "ebay" && groupEbaySearches
			? [
					buildSearchUrl({
						...searchUrlOptions,
						searchGroups: groupedSearches,
					}),
				].filter((url): url is string => url !== null)
			: selectedSearches
					.map((search) =>
						buildSearchUrl({
							...searchUrlOptions,
							searchGroups: [[search]],
						}),
					)
					.filter((url): url is string => url !== null);

	return (
		<div className={`${styles.Page}`}>
			<SearchFilters
				fanaticsCollectType={fanaticsCollectType}
				altType={altType}
				ebaySort={ebaySort}
				groupEbaySearches={groupEbaySearches}
				includeCategory={includeCategory}
				auctionsOnly={auctionsOnly}
				minPrice={minPrice}
				sportsCardsOnly={sportsCardsOnly}
				hasBids={hasBids}
				onFanaticsCollectTypeChange={setFanaticsCollectType}
				onAltTypeChange={setAltType}
				onEbaySortChange={setEbaySort}
				onGroupEbaySearchesChange={() =>
					setGroupEbaySearches((current) => !current)
				}
				onIncludeCategoryChange={() =>
					setIncludeCategory((current) => !current)
				}
				onAuctionsOnlyChange={() => setAuctionsOnly((current) => !current)}
				onMinPriceChange={setMinPrice}
				onSportsCardsOnlyChange={() =>
					setSportsCardsOnly((current) => !current)
				}
				onHasBidsChange={() => setHasBids((current) => !current)}
			/>

			<SearchGeneratedUrls urls={urls} />
		</div>
	);
}
