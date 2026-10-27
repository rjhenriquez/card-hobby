"use client";

import Link from "next/link";
import { Icon } from "@/components/Icons/Icons";
import { SelectionGroup } from "@/components/SelectionGroup/SelectionGroup";

import styles from "./SearchSidebar.module.scss";

type TermsByGroup = Record<string, string[]>;
export type TermsBySection = Record<string, TermsByGroup>;
export type SelectedValuesByGroup = Record<string, string[]>;

interface SearchSidebarProps {
	searchTerms: TermsBySection;
	selectedValuesByGroup: SelectedValuesByGroup;
	onSelectedValuesChange: React.Dispatch<
		React.SetStateAction<SelectedValuesByGroup>
	>;
}

function getGroupKey(section: string, category: string) {
	return `${section}:${category}`;
}

export function SearchSidebar({
	searchTerms,
	selectedValuesByGroup,
	onSelectedValuesChange: setSelectedValuesByGroup,
}: SearchSidebarProps) {
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
									onChangeAll={(values) => handleGroupChange(groupKey, values)}
								/>
							);
						})}
					</div>
				</section>
			))}
		</aside>
	);
}
