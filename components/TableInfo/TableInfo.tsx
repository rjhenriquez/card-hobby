import { ReactNode } from "react";

import styles from "./TableInfo.module.scss";

interface TableInfoProps {
	headers: string[];
	children: ReactNode;
}

export function TableInfo({ headers, children }: TableInfoProps) {
	return (
		<div className={styles.TableInfo__scroll}>
			<table className={styles.TableInfo}>
				<thead>
					<tr>
						{headers.map((header, index) => (
							<th key={`${header}-${index}`}>{header}</th>
						))}
					</tr>
				</thead>

				<tbody>{children}</tbody>
			</table>
		</div>
	);
}
