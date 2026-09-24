import { SidebarProvider } from "@/components/Sidebar/SidebarContext";
import { SearchSidebar } from "@/components/SearchSidebar/SearchSidebar";
import { SearchProvider } from "@/components/SearchSidebar/SearchContext";
import { Header } from "@/components/Header/Header";
import { getSearchTermsBySection } from "@/db/queries/searches";

export default async function ToolsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const searchTerms = await getSearchTermsBySection();

	return (
		<SidebarProvider>
			<SearchProvider>
				<SearchSidebar searchTerms={searchTerms} />

				<div className='layout'>
					<Header />
					<main className='main'>{children}</main>
				</div>
			</SearchProvider>
		</SidebarProvider>
	);
}
