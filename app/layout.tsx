import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "送る前ととのえ",
  description: "言いづらい文章を、自然で角が立たない日本語に整えます。",
  openGraph: {
    title: "送る前ととのえ",
    description: "言いづらい文章を、自然で角が立たない日本語に整えます。",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
