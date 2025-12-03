/**
 * TimelineSlider Component
 *
 * Interactive year range selector with histogram visualization.
 * Shows distribution of papers by year with draggable range handles.
 *
 * @module components/CitationNetwork/Timeline/TimelineSlider
 */

'use client';

import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import type { Paper } from '@/types/citationNetwork';

interface TimelineSliderProps {
  /** All papers in the network */
  papers: Paper[];
  /** Current year range filter [min, max] */
  yearRange: [number, number];
  /** Callback when year range changes */
  onYearRangeChange: (range: [number, number]) => void;
  /** Optional CSS class name */
  className?: string;
}

interface YearBucket {
  year: number;
  count: number;
  papers: Paper[];
}

/**
 * Interactive timeline slider with histogram visualization
 */
export function TimelineSlider({
  papers,
  yearRange,
  onYearRangeChange,
  className = '',
}: TimelineSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    year: number;
    visible: boolean;
  }>({ x: 0, year: 0, visible: false });

  // Calculate year buckets and range
  const { buckets, minYear, maxYear, maxCount } = useMemo(() => {
    if (papers.length === 0) {
      const currentYear = new Date().getFullYear();
      return {
        buckets: [],
        minYear: currentYear - 50,
        maxYear: currentYear,
        maxCount: 0,
      };
    }

    const years = papers.map((p) => p.year);
    const min = Math.min(...years);
    const max = Math.max(...years);

    // Create buckets for each year
    const yearMap = new Map<number, Paper[]>();
    papers.forEach((paper) => {
      const existing = yearMap.get(paper.year) || [];
      yearMap.set(paper.year, [...existing, paper]);
    });

    const yearBuckets: YearBucket[] = [];
    for (let year = min; year <= max; year++) {
      const papersInYear = yearMap.get(year) || [];
      yearBuckets.push({
        year,
        count: papersInYear.length,
        papers: papersInYear,
      });
    }

    const counts = yearBuckets.map((b) => b.count);
    const maxBucketCount = Math.max(...counts, 1);

    return {
      buckets: yearBuckets,
      minYear: min,
      maxYear: max,
      maxCount: maxBucketCount,
    };
  }, [papers]);

  // Convert year to pixel position
  const yearToPixel = useCallback(
    (year: number): number => {
      if (!containerRef.current) return 0;
      const width = containerRef.current.clientWidth;
      const range = maxYear - minYear;
      if (range === 0) return width / 2;
      return ((year - minYear) / range) * width;
    },
    [minYear, maxYear]
  );

  // Convert pixel position to year
  const pixelToYear = useCallback(
    (pixel: number): number => {
      if (!containerRef.current) return minYear;
      const width = containerRef.current.clientWidth;
      const range = maxYear - minYear;
      const year = Math.round(minYear + (pixel / width) * range);
      return Math.max(minYear, Math.min(maxYear, year));
    },
    [minYear, maxYear]
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!containerRef.current || (!isDraggingMin && !isDraggingMax)) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      const year = pixelToYear(x);

      if (isDraggingMin) {
        const newMin = Math.min(year, yearRange[1] - 1);
        onYearRangeChange([newMin, yearRange[1]]);
        setTooltipPosition({ x, year: newMin, visible: true });
      } else if (isDraggingMax) {
        const newMax = Math.max(year, yearRange[0] + 1);
        onYearRangeChange([yearRange[0], newMax]);
        setTooltipPosition({ x, year: newMax, visible: true });
      }
    },
    [isDraggingMin, isDraggingMax, yearRange, onYearRangeChange, pixelToYear]
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDraggingMin(false);
    setIsDraggingMax(false);
    setTooltipPosition((prev) => ({ ...prev, visible: false }));
  }, []);

  // Add/remove event listeners for dragging
  useEffect(() => {
    if (isDraggingMin || isDraggingMax) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingMin, isDraggingMax, handleMouseMove, handleMouseUp]);

  // Handle click on histogram bar
  const handleBarClick = useCallback(
    (year: number) => {
      const center = yearRange[0] + (yearRange[1] - yearRange[0]) / 2;
      if (year < center) {
        onYearRangeChange([year, yearRange[1]]);
      } else {
        onYearRangeChange([yearRange[0], year]);
      }
    },
    [yearRange, onYearRangeChange]
  );

  // Reset to full range
  const handleReset = useCallback(() => {
    onYearRangeChange([minYear, maxYear]);
  }, [minYear, maxYear, onYearRangeChange]);

  // Generate decade markers
  const decadeMarkers = useMemo(() => {
    const markers: number[] = [];
    const startDecade = Math.floor(minYear / 10) * 10;
    const endDecade = Math.ceil(maxYear / 10) * 10;
    for (let decade = startDecade; decade <= endDecade; decade += 10) {
      if (decade >= minYear && decade <= maxYear) {
        markers.push(decade);
      }
    }
    return markers;
  }, [minYear, maxYear]);

  if (papers.length === 0) {
    return (
      <div className={`timeline-slider timeline-slider-empty ${className}`}>
        <div className="timeline-empty-state">
          <span className="timeline-empty-icon">📅</span>
          <span className="timeline-empty-text">No papers to display</span>
        </div>
      </div>
    );
  }

  const minHandlePos = yearToPixel(yearRange[0]);
  const maxHandlePos = yearToPixel(yearRange[1]);
  const isFiltered = yearRange[0] !== minYear || yearRange[1] !== maxYear;

  return (
    <div className={`timeline-slider ${className}`}>
      {/* Header */}
      <div className="timeline-header">
        <div className="timeline-title">
          <span className="timeline-icon">📅</span>
          <span className="timeline-label">Publication Timeline</span>
          <span className="timeline-range-text">
            {yearRange[0]} - {yearRange[1]}
          </span>
        </div>
        {isFiltered && (
          <button
            className="timeline-reset-btn"
            onClick={handleReset}
            aria-label="Reset year range"
          >
            Reset
          </button>
        )}
      </div>

      {/* Histogram Container */}
      <div className="timeline-container" ref={containerRef}>
        {/* Histogram Bars */}
        <div className="timeline-histogram">
          {buckets.map((bucket) => {
            const height = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
            const isInRange =
              bucket.year >= yearRange[0] && bucket.year <= yearRange[1];
            const x = yearToPixel(bucket.year);
            const barWidth = Math.max(
              1,
              (containerRef.current?.clientWidth || 800) / buckets.length - 1
            );

            return (
              <div
                key={bucket.year}
                className={`timeline-bar ${isInRange ? 'timeline-bar-active' : 'timeline-bar-inactive'}`}
                style={{
                  left: `${x}px`,
                  width: `${barWidth}px`,
                  height: `${height}%`,
                }}
                onClick={() => handleBarClick(bucket.year)}
                title={`${bucket.year}: ${bucket.count} paper${bucket.count !== 1 ? 's' : ''}`}
              />
            );
          })}
        </div>

        {/* Selected Range Overlay */}
        <div
          className="timeline-range-overlay"
          style={{
            left: `${minHandlePos}px`,
            width: `${maxHandlePos - minHandlePos}px`,
          }}
        />

        {/* Year Axis Markers */}
        <div className="timeline-axis">
          {decadeMarkers.map((decade) => {
            const x = yearToPixel(decade);
            return (
              <div
                key={decade}
                className="timeline-marker"
                style={{ left: `${x}px` }}
              >
                <div className="timeline-marker-line" />
                <div className="timeline-marker-label">{decade}</div>
              </div>
            );
          })}
        </div>

        {/* Min Handle */}
        <div
          className={`timeline-handle timeline-handle-min ${isDraggingMin ? 'timeline-handle-dragging' : ''}`}
          style={{ left: `${minHandlePos}px` }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingMin(true);
            setTooltipPosition({
              x: minHandlePos,
              year: yearRange[0],
              visible: true,
            });
          }}
          role="slider"
          aria-label="Minimum year"
          aria-valuemin={minYear}
          aria-valuemax={maxYear}
          aria-valuenow={yearRange[0]}
          tabIndex={0}
        >
          <div className="timeline-handle-line" />
          <div className="timeline-handle-grip" />
        </div>

        {/* Max Handle */}
        <div
          className={`timeline-handle timeline-handle-max ${isDraggingMax ? 'timeline-handle-dragging' : ''}`}
          style={{ left: `${maxHandlePos}px` }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingMax(true);
            setTooltipPosition({
              x: maxHandlePos,
              year: yearRange[1],
              visible: true,
            });
          }}
          role="slider"
          aria-label="Maximum year"
          aria-valuemin={minYear}
          aria-valuemax={maxYear}
          aria-valuenow={yearRange[1]}
          tabIndex={0}
        >
          <div className="timeline-handle-line" />
          <div className="timeline-handle-grip" />
        </div>

        {/* Tooltip */}
        {tooltipPosition.visible && (
          <div
            className="timeline-tooltip"
            style={{ left: `${tooltipPosition.x}px` }}
          >
            {tooltipPosition.year}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="timeline-stats">
        <span className="timeline-stat">
          <strong>{papers.filter((p) => p.year >= yearRange[0] && p.year <= yearRange[1]).length}</strong>{' '}
          papers in range
        </span>
        <span className="timeline-stat-separator">•</span>
        <span className="timeline-stat">
          <strong>{papers.length}</strong> total
        </span>
      </div>
    </div>
  );
}
