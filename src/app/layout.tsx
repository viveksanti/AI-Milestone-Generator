import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Milestone Generator — Tomorrow University",
  description:
    "Staff tool: generate, review, and save learning milestones for challenges using AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
