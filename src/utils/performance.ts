import React, { useState, useMemo, useEffect, useCallback, UIEvent } from "react";

/**
 * Custom hook for virtualizing list rows to optimize performance
 * with large datasets (e.g. food database or many log rows).
 */
export const useVirtualizedRows = <T>(rows: T[], rowHeight = 44, visibleCount = 30) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRows = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
    const endIndex = Math.min(rows.length, startIndex + visibleCount + 4);
    
    return rows.slice(startIndex, endIndex).map((row, index) => ({
      row,
      index: startIndex + index,
      style: {
        position: "absolute" as const,
        top: `${(startIndex + index) * rowHeight}px`,
        height: `${rowHeight}px`,
        left: 0,
        right: 0,
      }
    }));
  }, [rows, scrollTop, rowHeight, visibleCount]);

  const totalHeight = rows.length * rowHeight;

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleRows,
    totalHeight,
    onScroll,
  };
};

/**
 * Throttle function to limit execution frequency of heavy calculations.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce utility.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}
