import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VLearn Multi-Agent Classroom | D1",
  description: "Lớp học mô phỏng đa tác tử trên VLearn (Attention - transcript-06)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className="bg-neutral-50 text-neutral-900 min-h-screen antialiased flex flex-col"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
