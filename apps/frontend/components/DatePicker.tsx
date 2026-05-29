"use client";

import { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  value: string; // expected format: DD-MM-YYYY
  onChange: (dateStr: string) => void;
  placeholder?: string;
}

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) return null;
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());
  const pickerRef = useRef<HTMLDivElement>(null);

  const goPrevMonth = () => {
    if (tempMonth === 0) {
      setTempYear((prev) => prev - 1);
      setTempMonth(11);
    } else {
      setTempMonth((prev) => prev - 1);
    }
  };

  const goNextMonth = () => {
    if (tempMonth === 11) {
      setTempYear((prev) => prev + 1);
      setTempMonth(0);
    } else {
      setTempMonth((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const handleDateSelect = (date: Date) => {
    onChange(formatDate(date));
    setShowPicker(false);
  };

  const openPicker = () => {
    const parsed = parseDate(value);
    if (parsed && !isNaN(parsed.getTime())) {
      setTempYear(parsed.getFullYear());
      setTempMonth(parsed.getMonth());
    } else {
      const now = new Date();
      setTempYear(now.getFullYear());
      setTempMonth(now.getMonth());
    }
    setShowPicker(true);
  };

  // Get days array with proper weekday offsets
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray: (number | null)[] = [];

    // Add empty cells before the first day of the month
    for (let i = 0; i < startWeekday; i++) {
      daysArray.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    return daysArray;
  };

  const days = getDaysInMonth(tempYear, tempMonth);

  return (
    <div className="date-picker-wrapper" ref={pickerRef}>
      <div className="date-picker-input-wrap">
        <input
          type="text"
          className="date-picker-input"
          placeholder={placeholder}
          value={value}
          readOnly
          onClick={openPicker}
        />
        <button
          className="date-picker-icon-btn"
          type="button"
          onClick={openPicker}
          aria-label="Pick date"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {showPicker && (
        <div className="date-picker-popup">
          <div className="dp-header">
            <button onClick={goPrevMonth}>&lt;</button>
            <span>
              {new Date(tempYear, tempMonth).toLocaleString("default", {
                month: "long",
              })}{" "}
              {tempYear}
            </span>
            <button onClick={goNextMonth}>&gt;</button>
          </div>
          <div className="dp-weekdays">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="dp-days">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="dp-empty-day" />;
              }
              const date = new Date(tempYear, tempMonth, day);
              const isSelected = value === formatDate(date);
              return (
                <button
                  key={idx}
                  className={`dp-day ${isSelected ? "selected" : ""}`}
                  onClick={() => handleDateSelect(date)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .date-picker-wrapper {
          position: relative;
          width: 100%;
        }
        .date-picker-input-wrap {
          display: flex;
          align-items: center;
          background: var(--background-white);
          border: 1px solid var(--border-medium);
          border-radius: 12px;
        }
        .date-picker-input {
          flex: 1;
          border: none;
          padding: 12px 14px;
          font-size: 14px;
          background: transparent;
          color: var(--text-primary);
          font-family: var(--font);
        }
        .date-picker-input:focus {
          outline: none;
        }
        .date-picker-icon-btn {
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .date-picker-popup {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--card-bg);
          border: 1px solid
            color-mix(in srgb, var(--color-brand) 20%, transparent);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          z-index: 100;
          width: fit-content;
        }
        .dp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .dp-header button {
          background: transparent;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: var(--text-primary);
          padding: 4px 8px;
        }
        .dp-header span {
          font-weight: 600;
          color: var(--text-primary);
        }
        .dp-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .dp-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .dp-day {
          background: transparent;
          border: none;
          border-radius: 8px;
          padding: 8px;
          font-size: 13px;
          cursor: pointer;
          color: var(--text-primary);
          text-align: center;
          transition: background 0.1s;
        }
        .dp-day:hover {
          background: var(--background-light-gray);
        }
        .dp-day.selected {
          background: var(--color-brand);
          color: white;
        }
        .dp-empty-day {
          visibility: hidden;
        }
      `}</style>
    </div>
  );
}
