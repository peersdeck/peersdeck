import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PeersDeck — Ideas deserve a chance",
  description: "Africa's home for ideas, entrepreneurship and investment. Built in Africa. Open to the world.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
