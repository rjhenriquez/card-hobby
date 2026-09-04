import type { Metadata } from "next";
import "@/styles/styles.scss";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
