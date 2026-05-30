"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Sparkles } from "lucide-react";
import { getMe, getToken, removeToken } from "@/services/authService";
import { deleteAssignment } from "@/services/assignmentService";
import type { Assignment as AuthAssignment } from "@/services/authService";
import styles from "./assignments.module.css";
import { useAssignmentStore } from "@/stores/assignmentStore";

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

function AssignmentCard({
  assignment,
  onDelete,
  onError,
}: {
  assignment: Assignment;
  onDelete: (id: string) => void;
  onError: (message: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setShowConfirm(false);
      }
    }
    if (menuOpen || showConfirm)
      document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, showConfirm]);

  const handleDeleteClick = () => {
    setMenuOpen(false);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteAssignment(assignment.id);
      onDelete(assignment.id);
      setShowConfirm(false);
    } catch (err: unknown) {
      console.error("Delete failed", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete assignment. Please try again.";
      onError(errorMessage);
      setShowConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Link
          href={`/assignments/created?paperId=${assignment.id}`}
          className={styles.title}
        >
          {assignment.title}
        </Link>
        <div className={styles.menuWrap} ref={menuRef}>
          <button
            className={styles.menuBtn}
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
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                View Assignment
              </button>
              <button
                className={`${styles.dropdownItem} ${styles.dropdownDelete}`}
                onClick={handleDeleteClick}
              >
                Delete
              </button>
            </div>
          )}

          {showConfirm && (
            <div className={styles["confirm-modal"]}>
              <div className={styles["confirm-message"]}>
                Are you sure you want to delete this assignment? This action
                cannot be undone.
              </div>
              <div className={styles["confirm-buttons"]}>
                <button
                  className={`${styles["confirm-btn"]} ${styles["confirm-cancel"]}`}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className={`${styles["confirm-btn"]} ${styles["confirm-delete"]}`}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.meta}>
          <span className={styles.metaLabel}>Assigned on : </span>
          {assignment.assignedOn}
        </span>
        {assignment.due && (
          <span className={styles.meta}>
            <span className={styles.metaLabel}>Due : </span>
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setCount, decrement } = useAssignmentStore();

  // Auto-clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsLoggedIn(false);
          setAssignments([]);
          setCount(0);
          setLoading(false);
          return;
        }

        const data = await getMe(token);
        const apiAssignments = data.assignments || [];

        const mapped: Assignment[] = apiAssignments.map(
          (item: AuthAssignment) => ({
            id: item._id,
            title: item.title,
            assignedOn: formatDate(item.createdAt),
          }),
        );

        setIsLoggedIn(true);
        setAssignments(mapped);
        setCount(apiAssignments.length);
      } catch (err: unknown) {
        console.error("Failed to fetch assignments", err);
        const error = err instanceof Error ? err : new Error(String(err));
        if (error.message.includes("401")) {
          removeToken();
          setIsLoggedIn(false);
        } else {
          setIsLoggedIn(false);
        }
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setCount]);

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    decrement();
  };

  const hasAssignments = assignments.length > 0;
  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <>
        <TopBar title="Assignment" />
        <div className={styles.loadingSpinner}>Loading your assignments...</div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Assignment" />

      {/* Error notification banner */}
      {errorMessage && (
        <div className={styles.errorBanner}>
          <span>{errorMessage}</span>
          <button
            className={styles.errorBannerClose}
            onClick={() => setErrorMessage(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className={styles.page}>
        {!hasAssignments ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIllustration}>
              <img
                src="/no-assignments.png"
                alt="No assignments"
                className={styles.emptyImg}
              />
            </div>
            {!isLoggedIn ? (
              <>
                <h2 className={styles.emptyTitle}>
                  Please log in to view your assignments
                </h2>
                <Link href="/auth/login" className={styles.emptyCta}>
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
                  Log In
                </Link>
              </>
            ) : (
              <>
                <h2 className={styles.emptyTitle}>No assignments yet</h2>
                <p className={styles.emptyDesc}>
                  Create your first assignment to start collecting and grading
                  student submissions. You can set up rubrics, define marking
                  criteria, and let AI assist with grading.
                </p>
                <Link href="/assignments/create" className={styles.emptyCta}>
                  <Sparkles size={20} />
                  Create Your First Assignment
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={styles.heading}>
              <div className={styles.headingLeft}>
                <span className={styles.statusDot} />
                <div>
                  <h1 className={styles.headingTitle}>Assignments</h1>
                  <p className={styles.headingSub}>
                    Manage and create assignments for your classes.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile inline Create button – visible only on mobile */}
            <div className={styles.mobileCreateInline}>
              <Link
                href="/assignments/create"
                className={styles.mobileCreateBtnInline}
              >
                <Sparkles size={20} />
                Create Assignment
              </Link>
            </div>

            <div className={styles.toolbar}>
              <button className={styles.filterBtn}>
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

              <div className={styles.search}>
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

            <div className={styles.grid}>
              {filtered.map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  onDelete={handleDeleteAssignment}
                  onError={setErrorMessage}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Desktop FAB and bottom bar (hidden on mobile via CSS) */}
      {hasAssignments && (
        <>
          <Link
            href="/assignments/create"
            className={styles.mobileFab}
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

          <div className={styles.mobileCreateBar}>
            <Link href="/assignments/create" className={styles.mobileCreateBtn}>
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
    </>
  );
}
