"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from 'lucide-react';

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "My Groups",
    href: "/groups",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Assignments",
    href: "/assignments",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    badge: 10,
  },
  {
    label: "AI Teacher's Toolkit",
    href: "/toolkit",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    label: "My Library",
    href: "/library",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src="/logo.png" alt="VedaAI" />
          </div>
          <span className="logo-text">VedaAI</span>
        </div>

        {/* Create Assignment CTA */}
        <Link href="/assignments/create" className="create-btn">
          <Sparkles size={20} fill="currentColor" />
          Create Assignment
        </Link>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Settings */}
        <Link
          href="/settings"
          className={`nav-item ${pathname === "/settings" ? "active" : ""}`}
          style={{ marginBottom: 16 }}
        >
          <span className="nav-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="nav-label">Settings</span>
        </Link>

        {/* School profile */}
        <div className="school-profile">
          <div className="school-avatar">
            <img
              src="/school-avatar.png"
              alt="School"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                if (t.parentElement) {
                  t.parentElement.innerHTML =
                    '<span style="font-size:20px">🎭</span>';
                }
              }}
            />
          </div>
          <div className="school-info">
            <span className="school-name">Delhi Public School</span>
            <span className="school-sub">Bokaro Steel City</span>
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          min-height: 100vh;
          background: var(--sidebar-bg);
          border-right: 1px solid #ebebeb;
          display: flex;
          flex-direction: column;
          padding: 24px 20px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          padding: 0 4px;
        }

        .logo-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .logo-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .logo-text {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }

        .create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--text-primary);
          color: white;
          border: 2px solid var(--color-brand);
          border-radius: 50px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font);
          margin-bottom: 32px;
          transition: background 0.15s, transform 0.1s;
          cursor: pointer;
          text-decoration: none;
        }

        .create-btn:hover {
          background: #222;
          transform: scale(0.99);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 15px;
          font-weight: 500;
          transition: background 0.12s, color 0.12s;
          text-decoration: none;
          cursor: pointer;
          position: relative;
        }

        .nav-item:hover {
          background: #f5f5f5;
          color: var(--text-primary);
        }

        .nav-item.active {
          background: #f0f0f0;
          color: var(--text-primary);
        }

        .nav-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-label {
          flex: 1;
        }

        .nav-badge {
          background: var(--color-brand);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          min-width: 24px;
          text-align: center;
        }

        .school-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f7f7f7;
          border-radius: 14px;
          padding: 12px 14px;
          margin-top: 4px;
        }

        .school-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #e0e0e0;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .school-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .school-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .school-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .school-sub {
          font-size: 12px;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
