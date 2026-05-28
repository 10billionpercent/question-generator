"use client";

export default function MobileHeader() {
  return (
    <>
      <header className="mobile-header">
        {/* Logo */}
        <div className="mh-logo">
          <div className="mh-logo-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="mh-logo-text">VedaAI</span>
        </div>

        {/* Right actions */}
        <div className="mh-actions">
          <button className="mh-icon-btn" aria-label="Notifications">
            <div className="mh-bell-wrap">
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
              <span className="mh-dot" />
            </div>
          </button>

          <button className="mh-avatar" aria-label="Profile">
            <img
              src="/avatar.png"
              alt="John Doe"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                if (t.parentElement) t.parentElement.style.background = "#555";
              }}
            />
          </button>

          <button className="mh-icon-btn" aria-label="Menu">
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
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      <style>{`
        .mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: white;
          border-bottom: 1px solid #ebebeb;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .mh-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mh-logo-icon {
          width: 32px;
          height: 32px;
          background: var(--color-brand);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mh-logo-text {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .mh-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mh-icon-btn {
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          cursor: pointer;
        }

        .mh-bell-wrap {
          position: relative;
          display: flex;
        }

        .mh-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 8px;
          height: 8px;
          background: var(--color-brand);
          border-radius: 50%;
          border: 1.5px solid white;
        }

        .mh-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          overflow: hidden;
          border: none;
          background: #ddd;
          cursor: pointer;
        }

        .mh-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
