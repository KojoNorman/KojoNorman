import type { Metadata } from "next";
import "./globals.css"; //

export const metadata: Metadata = {
  title: "My E-Workbook",
  description: "Interactive learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning goes here on the body to fix extension errors */}
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}