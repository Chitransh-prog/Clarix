import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Clarix — Clarity for your team", template: "%s | Clarix" },
  description: "Ship faster. Stay focused. One minimal, powerful surface.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-obsidian-950 text-obsidian-50">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: { background: "#27272A", border: "0.5px solid #3F3F46", color: "#F4F4F5" },
          }}
        />
      </body>
    </html>
  );
}
