import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import "@/styles/styles.scss";
import "@/styles/temporary.scss";

export const metadata: Metadata = {
	title: "Hobby Helpers",
	description: "Description to come",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body>
				<div className='DevApp'>
					<Sidebar />

					<div className='DevApp__content'>{children}</div>
				</div>
			</body>
		</html>
	);
}
