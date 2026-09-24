"use client";

import { useVisitedUrls } from "@/hooks/useVisitedUrls";
import { Icon } from "@/components/Icons/Icons";
import { Button } from "@/components/Button/Button";

import styles from "./SearchGeneratedUrls.module.scss";

interface SearchGeneratedUrlsProps {
	urls: string[];
}

export function SearchGeneratedUrls({ urls }: SearchGeneratedUrlsProps) {
	const { markUrlVisited, isRecentlyVisited, clearVisitedUrls } =
		useVisitedUrls();

	const hasVisitedUrls = urls.some((url) => isRecentlyVisited(url));

	const handleOpenAll = () => {
		urls.forEach((url) => {
			window.open(url, "_blank", "noopener,noreferrer");
			markUrlVisited(url);
		});
	};
	return (
		<div className={styles.SearchGeneratedUrls}>
			<div className={styles.SearchGeneratedUrls__header}>
				<h3
					className={`${styles.SearchGeneratedUrls__heading} ${
						urls.length === 0
							? styles["SearchGeneratedUrls__header--inactive"]
							: ""
					}`}
				>
					Generated URLs
				</h3>

				<div className={styles.SearchGeneratedUrls__actions}>
					<Button
						type='icon'
						htmlType='button'
						leadingIcon='open-all'
						tooltip='Open All'
						onClick={handleOpenAll}
						disabled={urls.length === 0}
					></Button>

					<Button
						type='icon'
						htmlType='button'
						leadingIcon='clear'
						tooltip='Clear Visited'
						disabled={urls.length === 0 || !hasVisitedUrls}
						onClick={clearVisitedUrls}
					></Button>
				</div>
			</div>

			<ul className={styles.SearchGeneratedUrls__list}>
				{urls.map((url) => (
					<li className={styles.SearchGeneratedUrls__item} key={url}>
						<a
							href={url}
							target='_blank'
							rel='noreferrer'
							className={`${styles.SearchGeneratedUrls__link} ${
								isRecentlyVisited(url)
									? styles["SearchGeneratedUrls__link--visited"]
									: ""
							}`}
							onClick={() => markUrlVisited(url)}
						>
							{url}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
