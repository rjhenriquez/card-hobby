import { useEffect, useState } from "react";

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
