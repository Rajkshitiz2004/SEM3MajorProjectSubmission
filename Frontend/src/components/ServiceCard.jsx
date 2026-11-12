import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * ServiceCard Component
 * Reusable card displaying an electricity citizen service.
 * @param {Object} props
 * @param {string} props.title - Title of service
 * @param {string} props.description - Detailed description
 * @param {React.ReactNode} props.icon - Lucide icon component
 * @param {string} props.badgeText - Category or status pill text
 * @param {boolean} [props.isFeatured] - Whether this service is highlighted
 * @param {string} [props.actionLabel] - Action text (default: 'Access Service')
 */
export default function ServiceCard({
  title,
  description,
  icon,
  badgeText = 'Consumer Service',
  isFeatured = false,
  actionLabel = 'Access Service',
}) {
  return (
    <article className="service-card">
      <div className="service-card-header">
        <div className="service-icon-box" aria-hidden="true">
          {icon}
        </div>
        <span className={`service-badge ${isFeatured ? 'featured' : ''}`}>
          {badgeText}
        </span>
      </div>

      <h3 className="service-card-title">{title}</h3>
      <p className="service-card-desc">{description}</p>

      <div className="service-card-footer">
        <span className="service-status-indicator">
          <span className="status-dot" aria-hidden="true" />
          Active Portal
        </span>
        <span className="service-action-link">
          {actionLabel} <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

