/**
 * Citation Network Navigation Button
 *
 * Entry point button for accessing the citation network visualization.
 * Can be used in toolbar, sidebar, or next steps panel.
 *
 * @module components/Navigation/CitationNetworkButton
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Props for CitationNetworkButton
 */
interface CitationNetworkButtonProps {
  /** Visual variant for different placement contexts */
  variant?: 'toolbar' | 'sidebar' | 'nextSteps' | 'contextMenu';
  /** Pre-fill search query when opening */
  query?: string;
  /** Custom callback when button is clicked */
  onNavigate?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Show badge indicator */
  showBadge?: boolean;
}

/**
 * Citation Network Navigation Button
 *
 * Provides navigation to the citation network visualization with
 * consistent styling across different UI contexts.
 *
 * @example
 * // In toolbar
 * <CitationNetworkButton variant="toolbar" />
 *
 * // With pre-filled query
 * <CitationNetworkButton query="CRISPR gene editing" />
 *
 * // In next steps panel
 * <CitationNetworkButton variant="nextSteps" showBadge />
 */
export function CitationNetworkButton({
  variant = 'toolbar',
  query,
  onNavigate,
  className = '',
  showBadge = false,
}: CitationNetworkButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Call custom callback if provided
    if (onNavigate) {
      onNavigate();
    }

    // Navigate to citation network page
    if (query) {
      router.push(`/citation-network?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/citation-network');
    }
  };

  // Render based on variant
  switch (variant) {
    case 'toolbar':
      return (
        <button
          onClick={handleClick}
          className={`toolbar-button citation-network-btn ${className}`}
          title="Citation Network Visualization"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <circle cx="6" cy="6" r="2" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
            <line x1="9" y1="7" x2="10" y2="10" />
            <line x1="15" y1="7" x2="14" y2="10" />
            <line x1="9" y1="17" x2="10" y2="14" />
            <line x1="15" y1="17" x2="14" y2="14" />
          </svg>
          <span>Citation Network</span>
          {showBadge && <span className="badge-new">new</span>}
        </button>
      );

    case 'sidebar':
      return (
        <div
          onClick={handleClick}
          className={`sidebar-nav-item ${className}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
          <div className="nav-icon">🔗</div>
          <div className="nav-labels">
            <div className="nav-label">Literature Network</div>
            <div className="nav-sublabel">文献关系可视化</div>
          </div>
          {showBadge && <span className="badge-indicator" />}
        </div>
      );

    case 'nextSteps':
      return (
        <div
          onClick={handleClick}
          className={`next-step-card ${className}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
          <div className="step-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v7m0 6v7M2 12h7m6 0h7" />
            </svg>
          </div>
          <div className="step-content">
            <div className="step-title">
              Explore Literature Network
              {showBadge && <span className="badge-new">new</span>}
            </div>
            <div className="step-description">可视化相关文献的引用关系网络</div>
          </div>
          <div className="step-arrow">→</div>
        </div>
      );

    case 'contextMenu':
      return (
        <button
          onClick={handleClick}
          className={`context-menu-item ${className}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v7m0 6v7M2 12h7m6 0h7" />
          </svg>
          <span>Search Citation Network</span>
        </button>
      );

    default:
      return null;
  }
}

export default CitationNetworkButton;
