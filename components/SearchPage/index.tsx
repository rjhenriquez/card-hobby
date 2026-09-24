"use client";

import { useSearch } from "@/components/SearchSidebar/SearchContext";

export function SearchPage() {
	const { selectedValuesByGroup } = useSearch();

	const selectedSearches = Object.values(selectedValuesByGroup).flat();

	return (
		<section className='page'>
			<h1>Search</h1>

			<h2>Selected Searches</h2>

			{selectedSearches.length === 0 ? (
				<p>No searches selected.</p>
			) : (
				<ul>
					{selectedSearches.map((search) => (
						<li key={search}>{search}</li>
					))}
				</ul>
			)}
		</section>
	);
}
