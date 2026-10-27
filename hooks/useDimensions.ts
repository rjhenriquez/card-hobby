import { useEffect, useState, useSyncExternalStore } from "react";

export const useIsMobileView = () => {
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const mediaQuery = window.matchMedia("(max-width: 768px)");
		const updateIsMobile = () => {
			setIsMobile(mediaQuery.matches);
		};
		updateIsMobile();
		mediaQuery.addEventListener("change", updateIsMobile);
		return () => {
			mediaQuery.removeEventListener("change", updateIsMobile);
		};
	}, []);
	return isMobile;
};

function subscribeToResize(onChange: () => void) {
	window.addEventListener("resize", onChange);
	return () => window.removeEventListener("resize", onChange);
}

/**
 * The browser window's current width in px, updated on resize.
 * Returns 0 during server rendering, before the browser width is known.
 *
 * const browserWidth = useDimensions();
 * const isLargeWidth = browserWidth > 768;
 */
export const useDimensions = () =>
	useSyncExternalStore(
		subscribeToResize,
		() => window.innerWidth,
		() => 0,
	);
