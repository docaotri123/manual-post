import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Media Portal",
  description: "Quản lý nội dung và hình ảnh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
