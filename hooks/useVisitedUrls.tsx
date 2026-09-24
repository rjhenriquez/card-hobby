"use client";

import { useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "visited-searches";
const DEFAULT_DAYS = 6;
const STORAGE_EVENT = "visited-searches-change";

type VisitedUrls = Record<string, number>;

function subscribe(callback: () => void) {
	window.addEventListener("storage", callback);
	window.addEventListener(STORAGE_EVENT, callback);

	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener(STORAGE_EVENT, callback);
	};
}

function getSnapshot() {
	return localStorage.getItem(STORAGE_KEY) ?? "{}";
}

function getServerSnapshot() {
	return "{}";
}

export function useVisitedUrls(days = DEFAULT_DAYS) {
	const storedValue = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);

	const visitedUrls = useMemo<VisitedUrls>(() => {
		try {
			return JSON.parse(storedValue);
		} catch {
			return {};
		}
	}, [storedValue]);

	function updateVisitedUrls(nextVisitedUrls: VisitedUrls) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVisitedUrls));
		window.dispatchEvent(new Event(STORAGE_EVENT));
	}

	function markUrlVisited(url: string) {
		updateVisitedUrls({
			...visitedUrls,
			[url]: Date.now(),
		});
	}

	function isRecentlyVisited(url: string) {
		const timestamp = visitedUrls[url];

		if (!timestamp) {
			return false;
		}

		const maxAge = days * 24 * 60 * 60 * 1000;

		return Date.now() - timestamp < maxAge;
	}

	function clearVisitedUrls() {
		localStorage.removeItem(STORAGE_KEY);
		window.dispatchEvent(new Event(STORAGE_EVENT));
	}

	return {
		visitedUrls,
		markUrlVisited,
		isRecentlyVisited,
		clearVisitedUrls,
	};
}
