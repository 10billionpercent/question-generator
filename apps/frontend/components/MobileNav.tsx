"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, Users, FileText, Box, Library } from "lucide-react";
import { useState, useEffect } from "react";

const tabs = [
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
  },
  {
    label: "AI Toolkit",
    href: "/assignments",
    icon: Box,
  },
  {
    label: "My Library",
    href: "/assignments",
    icon: Library,
  },
];

export default function MobileNav() {
  const router = useRouter();
  const [activeLabel, setActiveLabel] = useState<string>("Home");

  // Load saved active nav item from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("activeNav");
    if (saved && tabs.some((tab) => tab.label === saved)) {
      setActiveLabel(saved);
    } else {
      setActiveLabel("Home");
    }
  }, []);

  const handleTabClick = (label: string, href: string) => {
    setActiveLabel(label);
    localStorage.setItem("activeNav", label);
    router.push(href);
  };

  // For the Settings tab (if you add one later) you could use pathname,
  // but here all tabs use the same logic.

  return (
    <>
      <nav className="mobile-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeLabel === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => handleTabClick(tab.label, tab.href)}
              className={`mn-tab ${isActive ? "active" : ""}`}
            >
              <span className="mn-icon">
                <Icon size={22} strokeWidth={2} />
              </span>
              <span className="mn-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        .mobile-nav {
          display: none;
          position: fixed;
          margin-top: 10px;
          bottom: 0;
          left: 0;
          right: 0;
          background: #111111;
          border-top: 1px solid #2a2a2a;
          padding: 8px 0 20px;
          z-index: 100;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
        }

        .mn-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
          padding: 6px 0;
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          transition: color 0.15s;
          font-family: var(--font);
        }

        .mn-tab.active {
          color: white;
        }

        .mn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mn-label {
          font-size: 10px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .mobile-nav {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
