"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth/login";

  return (
    <div className="app-layout">
      {!isAuthPage && <Sidebar />}

      <div className="main-wrapper">
        <main className="main-content">
          <div key={pathname} className="page-content">
            {children}
          </div>
        </main>
        {!isAuthPage && <MobileNav />}
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

        @keyframes slideUpFade {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-content {
          animation: slideUpFade 0.4s ease-out forwards;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 16px;
            padding-bottom: 80px;
          }
        }
      `}</style>
    </div>
  );
}
