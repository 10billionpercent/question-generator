"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutGrid,
  Users,
  FileText,
  Box,
  Library,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: LayoutGrid,
  },
  {
    label: "My Groups",
    href: "/assignments",
    icon: Users,
  },
  {
    label: "Assignments",
    href: "/assignments",
    icon: FileText,
    badge: 10,
  },
  {
    label: "AI Teacher's Toolkit",
    href: "/assignments",
    icon: Box,
  },
  {
    label: "My Library",
    href: "/assignments",
    icon: Library,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeLabel, setActiveLabel] = useState<string>("Home");

  // Load saved active nav item from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("activeNav");
    if (saved && navItems.some((item) => item.label === saved)) {
      setActiveLabel(saved);
    } else {
      // default to "Home"
      setActiveLabel("Home");
    }
  }, []);

  const handleNavClick = (label: string, href: string) => {
    setActiveLabel(label);
    localStorage.setItem("activeNav", label);
    router.push(href);
  };

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
          <Sparkles size={20} />
          Create Assignment
        </Link>

        {/* Navigation items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.label, item.href)}
                className={`nav-item ${activeLabel === item.label ? "active" : ""}`}
              >
                <span className="nav-icon">
                  <Icon size={20} />
                </span>
                <span className="nav-label">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
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
            <Settings size={20} />
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
            <span className="school-name">Training Corps Academy</span>
            <span className="school-sub">Shiganshina</span>
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
          background: none;
          border: none;
          width: 100%;
          font-family: inherit;
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
          text-align: left;
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
