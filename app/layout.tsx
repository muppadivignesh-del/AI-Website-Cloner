import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebCloner AI — AI-Powered Website Cloner",
  description: "Clone any public website's frontend using AI. Analyze, generate, and modify React/Next.js code with natural language instructions.",
  keywords: "website cloner, AI, frontend, React, Next.js, Claude",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
