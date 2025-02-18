import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Parser",
  description: "PDF text extraction tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
