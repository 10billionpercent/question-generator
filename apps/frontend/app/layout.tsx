import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "VedaAI",
  description: "AI Assessment Creator for Teachers",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
      </head>
      <body>
        <div className="app-layout">
          {/* Desktop sidebar */}
          <Sidebar />

          <div className="main-wrapper">
            {/* Mobile top header */}
            <MobileHeader />

            {/* Page content */}
            <main className="main-content">{children}</main>

            {/* Mobile bottom nav */}
            <MobileNav />
          </div>
        </div>

        <style>{`
          .app-layout {
            display: flex;
            min-height: 100vh;
          }

          .main-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .main-content {
            flex: 1;
            padding: 32px;
            background: var(--main-bg);
          }

          @media (max-width: 768px) {
            .main-content {
              padding: 16px;
              padding-bottom: 80px;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
