"use client";

import { Tabs } from "@/components/Tabs/Tabs";
import { ToggleSmall } from "@/components/ToggleSmall/ToggleSmall";
import { InputText } from "@/components/InputText/InputText";
import { useSearchParams } from "next/navigation";

import styles from "./SearchFilters.module.scss";

export type FanaticsCollectType = "weekly" | "premier";
export type Platform = "ebay" | "fanatics-collect" | "alt" | "card-ladder";
export type EbaySort = "default" | "ending-soonest";
export type AltType = "auctions" | "fixed";

interface FiltersProps {
	fanaticsCollectType: FanaticsCollectType;
	altType: AltType;
	ebaySort: EbaySort;
	groupEbaySearches: boolean;
	includeCategory: boolean;
	auctionsOnly: boolean;
	minPrice: string;
	sportsCardsOnly: boolean;
	hasBids: boolean;
	onFanaticsCollectTypeChange: (value: FanaticsCollectType) => void;
	onAltTypeChange: (value: AltType) => void;
	onEbaySortChange: (value: EbaySort) => void;
	onGroupEbaySearchesChange: () => void;
	onIncludeCategoryChange: () => void;
	onAuctionsOnlyChange: () => void;
	onMinPriceChange: (value: string) => void;
	onSportsCardsOnlyChange: () => void;
	onHasBidsChange: () => void;
}

export function SearchFilters({
	fanaticsCollectType,
	altType,
	ebaySort,
	groupEbaySearches,
	includeCategory,
	auctionsOnly,
	minPrice,
	sportsCardsOnly,
	hasBids,
	onFanaticsCollectTypeChange,
	onAltTypeChange,
	onEbaySortChange,
	onGroupEbaySearchesChange,
	onIncludeCategoryChange,
	onAuctionsOnlyChange,
	onMinPriceChange,
	onSportsCardsOnlyChange,
	onHasBidsChange,
}: FiltersProps) {
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") ?? "ebay";

	const tabs = [
		{
			logo: "ebay",
			value: "ebay",
			children: (
				<div className={styles.SearchFilters__section}>
					<div className={styles.SearchFilters__section__divider}>
						<ToggleSmall
							id='group-ebay-searches'
							label='Group searches'
							checked={groupEbaySearches}
							onChange={onGroupEbaySearchesChange}
						/>
						<ToggleSmall
							id='include-category'
							label='Include category'
							checked={includeCategory}
							onChange={onIncludeCategoryChange}
						/>
						<ToggleSmall
							id='ending-soonest'
							label='Ending soonest'
							checked={ebaySort === "ending-soonest"}
							onChange={() =>
								onEbaySortChange(
									ebaySort === "ending-soonest" ? "default" : "ending-soonest",
								)
							}
						/>
						<ToggleSmall
							id='sports-cards-only'
							label='Trading Card Singles'
							checked={sportsCardsOnly}
							onChange={onSportsCardsOnlyChange}
						/>
					</div>
					<div className={styles.SearchFilters__section__divider}>
						<ToggleSmall
							id='auctions-only'
							label='Auctions only'
							checked={auctionsOnly}
							onChange={onAuctionsOnlyChange}
						/>
						<ToggleSmall
							id='has-bids'
							label='Has bids'
							checked={hasBids}
							onChange={onHasBidsChange}
						/>

						<InputText
							name='minPrice'
							label='Min price'
							type='number'
							min={0}
							placeholder='0'
							value={minPrice}
							className={styles.SearchFilters__input}
							onChange={(event) => onMinPriceChange(event.target.value)}
						/>
					</div>
				</div>
			),
		},
		{
			logo: "fanatics",
			value: "fanatics-collect",
			children: (
				<div>
					<label>
						Type
						<select
							value={fanaticsCollectType}
							onChange={(event) =>
								onFanaticsCollectTypeChange(
									event.target.value as FanaticsCollectType,
								)
							}
						>
							<option value='weekly'>Weekly</option>
							<option value='premier'>Premier</option>
						</select>
					</label>
				</div>
			),
		},
		{
			logo: "alt",
			value: "alt",
			children: (
				<div>
					<label>
						Type
						<select
							value={altType}
							onChange={(event) =>
								onAltTypeChange(event.target.value as AltType)
							}
						>
							<option value='auctions'>Auctions</option>
							<option value='fixed'>Fixed</option>
						</select>
					</label>
				</div>
			),
		},
		{
			logo: "card-ladder",
			value: "card-ladder",
			children: <p>Available Soon</p>,
		},
	];

	return <Tabs tabs={tabs} activeTab={activeTab} />;
}
