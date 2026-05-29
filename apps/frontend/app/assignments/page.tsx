"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Sparkles } from "lucide-react";
import { getMe, getToken, removeToken } from "@/services/authService";
import type { Assignment as AuthAssignment } from "@/services/authService";

// UI Assignment type (id as string, formatted date)
type Assignment = {
  id: string;
  title: string;
  assignedOn: string;
  due?: string;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="asgn-card">
      <div className="asgn-card-header">
        <Link href={`/assignments/${assignment.id}`} className="asgn-title">
          {assignment.title}
        </Link>
        <div className="asgn-menu-wrap" ref={menuRef}>
          <button
            className="asgn-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div className="asgn-dropdown">
              <button
                className="asgn-dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                View Assignment
              </button>
              <button
                className="asgn-dropdown-item asgn-dropdown-delete"
                onClick={() => setMenuOpen(false)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="asgn-card-footer">
        <span className="asgn-meta">
          <span className="asgn-meta-label">Assigned on : </span>
          {assignment.assignedOn}
        </span>
        {assignment.due && (
          <span className="asgn-meta">
            <span className="asgn-meta-label">Due : </span>
            {assignment.due}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const [search, setSearch] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsLoggedIn(false);
          setAssignments([]);
          setLoading(false);
          return;
        }

        const data = await getMe(token);
        // data.assignments is AuthAssignment[]
        const apiAssignments = data.assignments || [];

        // Map to UI Assignment type – note: API uses _id and createdAt
        const mapped: Assignment[] = apiAssignments.map(
          (item: AuthAssignment) => ({
            id: item._id, // ✅ _id from API
            title: item.title,
            assignedOn: formatDate(item.createdAt), // ✅ createdAt from API
          }),
        );

        setIsLoggedIn(true);
        setAssignments(mapped);
      } catch (err: any) {
        console.error("Failed to fetch assignments", err);
        // Only remove token if error is authentication related (401)
        if (err.message?.includes("401") || err.status === 401) {
          removeToken();
          setIsLoggedIn(false);
        } else {
          // Network or other error – keep token but treat as not logged in
          setIsLoggedIn(false);
        }
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hasAssignments = assignments.length > 0;
  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <>
        <TopBar title="Assignment" />
        <div className="loading-spinner">Loading your assignments...</div>
        <style>{`
          .loading-spinner {
            text-align: center;
            padding: 80px 20px;
            font-size: 16px;
            color: var(--text-secondary);
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <TopBar title="Assignment" />

      <div className="asgn-page">
        {!hasAssignments ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <img
                src="/no-assignments.png"
                alt="No assignments"
                className="empty-img"
              />
            </div>
            {!isLoggedIn ? (
              <>
                <h2 className="empty-title">
                  Please sign in to view your assignments
                </h2>
                <Link href="/auth/login" className="empty-cta">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In
                </Link>
              </>
            ) : (
              <>
                <h2 className="empty-title">No assignments yet</h2>
                <p className="empty-desc">
                  Create your first assignment to start collecting and grading
                  student submissions. You can set up rubrics, define marking
                  criteria, and let AI assist with grading.
                </p>
                <Link href="/assignments/create" className="empty-cta">
                  <Sparkles size={18} />
                  Create Your First Assignment
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="asgn-heading">
              <div className="asgn-heading-left">
                <span className="asgn-status-dot" />
                <div>
                  <h1 className="asgn-heading-title">Assignments</h1>
                  <p className="asgn-heading-sub">
                    Manage and create assignments for your classes.
                  </p>
                </div>
              </div>
            </div>

            <div className="asgn-toolbar">
              <button className="asgn-filter-btn">
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
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filter By
              </button>

              <div className="asgn-search">
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="asgn-grid">
              {filtered.map((a) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))}
            </div>
          </>
        )}
      </div>

      {hasAssignments && (
        <>
          <Link
            href="/assignments/create"
            className="mobile-fab"
            aria-label="Create Assignment"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>

          <div className="mobile-create-bar">
            <Link href="/assignments/create" className="mobile-create-btn">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Assignment
            </Link>
          </div>
        </>
      )}

      <style>{`
        .asgn-page {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 24px;
          gap: 16px;
        }

        .empty-illustration {
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .empty-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .empty-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .empty-desc {
          font-size: 14px;
          color: var(--text-secondary);
          max-width: 420px;
          line-height: 1.6;
        }

        .empty-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--text-primary);
          color: white;
          padding: 14px 28px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          margin-top: 8px;
          transition: background 0.15s;
        }

        .empty-cta:hover {
          background: #222;
        }

        .asgn-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .asgn-heading-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .asgn-status-dot {
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .asgn-heading-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .asgn-heading-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .asgn-toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .asgn-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          font-family: var(--font);
          cursor: pointer;
          padding: 8px 0;
        }

        .asgn-search {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 50px;
          padding: 10px 18px;
        }

        .asgn-search svg {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .asgn-search input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--text-primary);
          font-family: var(--font);
        }

        .asgn-search input::placeholder {
          color: var(--text-tertiary);
        }

        .asgn-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .asgn-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 16px;
          padding: 20px 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: box-shadow 0.15s;
        }

        .asgn-card:hover {
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .asgn-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }

        .asgn-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
          letter-spacing: -0.2px;
        }

        .asgn-title:hover {
          color: var(--color-brand);
        }

        .asgn-menu-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .asgn-menu-btn {
          width: 30px;
          height: 30px;
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

        .asgn-menu-btn:hover {
          background: #f0f0f0;
        }

        .asgn-dropdown {
          position: absolute;
          top: 36px;
          right: 0;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          min-width: 160px;
          z-index: 10;
          overflow: hidden;
        }

        .asgn-dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 500;
          font-family: var(--font);
          color: var(--text-primary);
          cursor: pointer;
          transition: background 0.1s;
        }

        .asgn-dropdown-item:hover {
          background: #f5f5f5;
        }

        .asgn-dropdown-delete {
          color: #e53e3e;
        }

        .asgn-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 4px;
        }

        .asgn-meta {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .asgn-meta-label {
          font-weight: 700;
          color: var(--text-primary);
        }

        .mobile-fab {
          display: none;
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 52px;
          height: 52px;
          background: var(--color-brand);
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          z-index: 90;
          box-shadow: 0 4px 16px rgba(232,71,10,0.35);
        }

        .mobile-create-bar {
          display: none;
          position: fixed;
          bottom: 68px;
          left: 0;
          right: 0;
          padding: 8px 16px;
          z-index: 89;
        }

        .mobile-create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--text-primary);
          color: white;
          border-radius: 50px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font);
          text-decoration: none;
          width: 100%;
        }

        @media (max-width: 768px) {
          .asgn-grid {
            grid-template-columns: 1fr;
          }
          .asgn-toolbar {
            flex-direction: row;
          }
          .mobile-create-bar {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
