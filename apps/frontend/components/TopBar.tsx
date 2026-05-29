"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeToken } from "@/services/authService";
import { useUserStore } from "@/stores/userStore";
import ThemeToggle from "@/components/ThemeToggle";

interface TopBarProps {
  title: string;
  showBack?: boolean;
}

export default function TopBar({ title, showBack = true }: TopBarProps) {
  const router = useRouter();
  const { user, fetchUser } = useUserStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure user data is loaded on mount (especially after refresh)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    removeToken();
    router.push("/auth/login");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const userName = user?.name || "Guest User";
  const userAvatar = user?.avatarUrl || "/avatar.png";

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          {showBack && (
            <button
              className="topbar-back desktop-only"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}

          <div className="topbar-grid-icon desktop-only">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>

          <span className="topbar-title desktop-only">{title}</span>

          {/* Mobile left side – logo and text */}
          <div className="mobile-logo">
            <div className="mobile-logo-icon">
              <img src="/logo.png" alt="VedaAI" />
            </div>
            <span className="mobile-logo-text">VedaAI</span>
          </div>
        </div>

        <div className="topbar-right">
          <ThemeToggle />
          <button className="topbar-icon-btn" aria-label="Notifications">
            <div style={{ position: "relative", display: "flex" }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="topbar-dot" />
            </div>
          </button>

          <div className="topbar-user-wrapper" ref={dropdownRef}>
            <button
              className="topbar-user"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="topbar-avatar">
                <img src={userAvatar} alt={userName} />
              </div>
              <span className="topbar-username">{userName}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`chevron ${dropdownOpen ? "rotated" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="topbar-dropdown">
                <button
                  className="topbar-dropdown-item"
                  onClick={handleSettings}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="dropdown-icon"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </button>
                <button
                  className="topbar-dropdown-item topbar-dropdown-danger"
                  onClick={handleLogout}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="dropdown-icon"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Your existing styles – unchanged */
        .topbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 32px; background: var(--main-bg); border-bottom: 1px solid var(--background-gray); position: sticky; top: 0; z-index: 40; }
        .topbar-left { display: flex; align-items: center; gap: 10px; }
        .topbar-back { width: 32px; height: 32px; background: transparent; border: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); transition: background 0.12s; }
        .topbar-back:hover { background: #e8e8e8; }
        .topbar-grid-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); }
        .topbar-title { font-size: 16px; font-weight: 500; color: var(--text-secondary); }
        .mobile-logo { display: none; align-items: center; gap: 8px; }
        .mobile-logo-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .mobile-logo-icon img { width: 100%; height: 100%; object-fit: contain; }
        .mobile-logo-text { font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
        .desktop-only { display: flex; }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .topbar-icon-btn { width: 36px; height: 36px; background: transparent; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-primary); }
        .topbar-dot { position: absolute; top: 0; right: 0; width: 8px; height: 8px; background: var(--color-brand); border-radius: 50%; border: 1.5px solid var(--main-bg); }
        .topbar-user-wrapper { position: relative; }
        .topbar-user { display: flex; align-items: center; gap: 8px; background: transparent; border: none; cursor: pointer; color: var(--text-primary); font-size: 15px; font-weight: 600; font-family: var(--font); padding: 6px 10px; border-radius: 10px; transition: background 0.12s; }
        .topbar-user:hover { background: var(--background-gray); }
        .topbar-avatar { width: 32px; height: 32px; border-radius: 50%; background: #ddd; overflow: hidden; }
        .topbar-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .topbar-username { font-size: 15px; font-weight: 600; }
        .chevron { transition: transform 0.2s ease; }
        .chevron.rotated { transform: rotate(180deg); }
        .topbar-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: var(--background-white); border: 1px solid var(--background-gray); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); min-width: 180px; z-index: 50; overflow: hidden; }
        .topbar-dropdown-item { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; padding: 12px 16px; background: transparent; border: none; font-size: 14px; font-weight: 500; font-family: var(--font); color: var(--text-primary); cursor: pointer; transition: background 0.1s; }
        .topbar-dropdown-item:hover { background: #f5f5f5; }
        .dropdown-icon { flex-shrink: 0; color: currentColor; }
        .topbar-dropdown-danger { color: #dc2626; }
        @media (max-width: 840px) {
          .topbar { padding: 12px 16px; }
          .desktop-only { display: none; }
          .mobile-logo { display: flex; }
          .topbar-username { display: none; }
          .topbar-user { padding: 4px; }
        }
      `}</style>
    </>
  );
}
