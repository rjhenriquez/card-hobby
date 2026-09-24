"use client";

import Link from "next/link";
import { Icon } from "@/components/Icons/Icons";
import { SelectionGroup } from "@/components/SelectionGroup/SelectionGroup";
import { useSearch } from "@/components/SearchSidebar/SearchContext";

import styles from "./SearchSidebar.module.scss";

type TermsByGroup = Record<string, string[]>;
type TermsBySection = Record<string, TermsByGroup>;

interface SearchSidebarProps {
	searchTerms: TermsBySection;
}

function getGroupKey(section: string, category: string) {
	return `${section}:${category}`;
}

export function SearchSidebar({ searchTerms }: SearchSidebarProps) {
	const { selectedValuesByGroup, setSelectedValuesByGroup } = useSearch();

	function handleValueChange(groupKey: string, value: string) {
		setSelectedValuesByGroup((currentValues) => {
			const currentGroupValues = currentValues[groupKey] ?? [];

			const nextGroupValues = currentGroupValues.includes(value)
				? currentGroupValues.filter((currentValue) => currentValue !== value)
				: [...currentGroupValues, value];

			if (nextGroupValues.length === 0) {
				const nextValues = { ...currentValues };

				delete nextValues[groupKey];

				return nextValues;
			}

			return {
				...currentValues,
				[groupKey]: nextGroupValues,
			};
		});
	}

	function handleGroupChange(groupKey: string, values: string[]) {
		setSelectedValuesByGroup((currentValues) => {
			const currentGroupValues = currentValues[groupKey] ?? [];

			const areAllSelected = values.every((value) =>
				currentGroupValues.includes(value),
			);

			if (areAllSelected) {
				const nextValues = { ...currentValues };

				delete nextValues[groupKey];

				return nextValues;
			}

			return {
				...currentValues,
				[groupKey]: Array.from(new Set([...currentGroupValues, ...values])),
			};
		});
	}

	return (
		<aside className={styles.SearchSidebar}>
			<div className={styles.SearchSidebar__top}>
				<Link href='/' className={styles.SearchSidebar__logo}>
					CH
				</Link>
			</div>

			<div className={styles.SearchSidebar__bottom}>
				{Object.entries(searchTerms).map(([section, categories]) => (
					<section key={section} className={styles.SearchSidebar__section}>
						<div className={styles.SearchSidebar__header}>
							<h2>{section}</h2>
						</div>

						<div className={styles.SearchSidebar__groups}>
							{Object.entries(categories).map(([category, terms]) => {
								const groupKey = getGroupKey(section, category);

								return (
									<SelectionGroup
										key={groupKey}
										group={category}
										names={terms}
										isSingleSelect={false}
										selectedValues={selectedValuesByGroup[groupKey] ?? []}
										onChange={(value) => handleValueChange(groupKey, value)}
										onChangeAll={(values) =>
											handleGroupChange(groupKey, values)
										}
									/>
								);
							})}
						</div>
					</section>
				))}
			</div>
			<div className={styles.SearchSidebar__admin}>
				<Icon icon='settings' className={styles.SearchSidebar__admin__icon} />
				<Link href={`/search/admin`}>Admin</Link>
			</div>
		</aside>
	);
}
