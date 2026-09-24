"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type SelectedValuesByGroup = Record<string, string[]>;

interface SearchContextValue {
	selectedValuesByGroup: SelectedValuesByGroup;
	setSelectedValuesByGroup: React.Dispatch<
		React.SetStateAction<SelectedValuesByGroup>
	>;
}

const SearchContext = createContext<SearchContextValue | null>(null);

interface SearchProviderProps {
	children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
	const [selectedValuesByGroup, setSelectedValuesByGroup] =
		useState<SelectedValuesByGroup>({});

	return (
		<SearchContext.Provider
			value={{
				selectedValuesByGroup,
				setSelectedValuesByGroup,
			}}
		>
			{children}
		</SearchContext.Provider>
	);
}

export function useSearch() {
	const context = useContext(SearchContext);

	if (!context) {
		throw new Error("useSearch must be used within a SearchProvider");
	}

	return context;
}
