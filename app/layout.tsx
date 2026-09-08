import type { Metadata } from "next";

import { Header } from "@/components/Header/Header";
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
		<html lang='en' className='theme--light'>
			<body>
				<Header />
				<div className='layout'>
					<Sidebar />
					<main className='main'>{children}</main>
				</div>
			</body>
		</html>
	);
}
