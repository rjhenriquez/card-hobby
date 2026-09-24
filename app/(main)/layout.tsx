import { Header } from "@/components/Header/Header";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { SidebarProvider } from "@/components/Sidebar/SidebarContext";

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SidebarProvider>
			<Sidebar />

			<div className='layout'>
				<Header />
				<main className='main'>{children}</main>
			</div>
		</SidebarProvider>
	);
}
