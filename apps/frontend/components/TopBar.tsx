"use client";

import { useRouter } from "next/navigation";

interface TopBarProps {
  title: string;
  showBack?: boolean;
}

export default function TopBar({ title, showBack = true }: TopBarProps) {
  const router = useRouter();

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          {showBack && (
            <button
              className="topbar-back"
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
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}

          <div className="topbar-grid-icon">
            <svg
              width="16"
              height="16"
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
          </div>

          <span className="topbar-title">{title}</span>
        </div>

        <div className="topbar-right">
          <button className="topbar-icon-btn" aria-label="Notifications">
            <div style={{ position: "relative", display: "flex" }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="topbar-dot" />
            </div>
          </button>

          <button className="topbar-user">
            <div className="topbar-avatar">
              <img
                src="/avatar.png"
                alt="John Doe"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = "none";
                }}
              />
            </div>
            <span className="topbar-username">John Doe</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 32px;
          background: var(--main-bg);
          border-bottom: 1px solid #e8e8e8;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .topbar-back {
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: background 0.12s;
        }

        .topbar-back:hover {
          background: #e8e8e8;
        }

        .topbar-grid-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .topbar-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topbar-icon-btn {
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
        }

        .topbar-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 8px;
          height: 8px;
          background: var(--color-brand);
          border-radius: 50%;
          border: 1.5px solid var(--main-bg);
        }

        .topbar-user {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font);
          padding: 6px 10px;
          border-radius: 10px;
          transition: background 0.12s;
        }

        .topbar-user:hover {
          background: #e8e8e8;
        }

        .topbar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ddd;
          overflow: hidden;
        }

        .topbar-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .topbar-username {
          font-size: 15px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .topbar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
