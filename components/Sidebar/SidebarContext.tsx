"use client";

import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { getStoredSidebarOpen, setStoredSidebarOpen } from "@/lib/storage";

interface SidebarContextValue {
	isOpen: boolean;
	toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
	undefined,
);

export function SidebarProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		setIsOpen(getStoredSidebarOpen());
	}, []);

	function toggleSidebar() {
		setIsOpen((current) => {
			const next = !current;

			setStoredSidebarOpen(next);

			return next;
		});
	}

	return (
		<SidebarContext.Provider
			value={{
				isOpen,
				toggleSidebar,
			}}
		>
			{children}
		</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const context = useContext(SidebarContext);

	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}

	return context;
}
