import React from 'react';
import { 
  Calendar, 
  ShieldAlert, 
  Clock, 
  Info 
} from 'lucide-react';
import { NOTICES_CONTENT } from '../data/governmentContent';

/**
 * Notices Page Component
 * Showcases:
 * - Official public notices & circulars
 * - Application & renewal cutoff deadlines
 * - Domestic and agricultural electricity safety guidelines
 *
 * All text is in English and semantic HTML, with data-translatable attributes
 * for translation engine evaluation.
 */
export default function Notices() {
  const { header, publicNotices, deadlines, safetyGuidelines } = NOTICES_CONTENT;

  return (
    <main id="main-content" className="page-wrapper">
      {/* Page Header */}
      <section className="page-hero-banner" aria-labelledby="notices-page-title">
        <div className="container">
          <span className="section-tag">{header.tag}</span>
          <h1 id="notices-page-title" className="page-hero-title" data-translatable="true">
            {header.title}
          </h1>
          <p className="page-hero-subtitle" data-translatable="true">
            {header.subtitle}
          </p>

          <div className="demo-notice-callout" role="note" aria-label="Demo Disclaimer">
            <Info size={16} aria-hidden="true" />
            <span data-translatable="true">{header.notice}</span>
          </div>
        </div>
      </section>

      {/* Public Notices and Circulars */}
      <section className="notices-section" aria-label="Official Circulars">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Public Board</span>
            <h2 className="section-title" data-translatable="true">
              Recent Notifications & Circulars
            </h2>
            <p className="section-subtitle" data-translatable="true">
              Regulatory orders, departmental updates, and consumer advisories issued for public awareness.
            </p>
          </div>

          <div className="notices-list">
            {publicNotices.map((item) => (
              <article key={item.id} className="notice-card" data-translatable="true">
                <div className="notice-card-header">
                  <div className="notice-meta-line">
                    <span className="notice-date-badge">
                      <Calendar size={13} aria-hidden="true" />
                      {item.date}
                    </span>
                    <span className="notice-department-badge">{item.department}</span>
                    <span className="service-badge">{item.category}</span>
                  </div>
                  <h3 className="notice-card-title">{item.title}</h3>
                </div>
                <p className="notice-card-body">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Deadlines Section */}
      <section className="deadlines-section" aria-labelledby="deadlines-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Important Dates</span>
            <h2 id="deadlines-heading" className="section-title" data-translatable="true">
              Statutory Application & Concession Deadlines
            </h2>
            <p className="section-subtitle" data-translatable="true">
              Keep track of approaching cutoff dates for annual subsidies, renewal filings, and technical verifications.
            </p>
          </div>

          <div className="deadlines-grid">
            {deadlines.map((dl) => (
              <div key={dl.id} className="deadline-card" data-translatable="true">
                <div className="deadline-status-pill">{dl.status}</div>
                <h3 className="deadline-event-title">{dl.event}</h3>
                <div className="deadline-date-box">
                  <Clock size={16} color="#DC2626" aria-hidden="true" />
                  <span className="deadline-date-text">Cutoff Date: {dl.deadline}</span>
                </div>
                <p className="deadline-notes">{dl.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Guidelines Section */}
      <section className="safety-section" aria-labelledby="safety-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-tag" style={{ color: '#DC2626' }}>Safety Advisory</span>
            <h2 id="safety-heading" className="section-title" data-translatable="true">
              Mandatory Electricity Safety Guidelines
            </h2>
            <p className="section-subtitle" data-translatable="true">
              Essential precautions to prevent electrocution hazards, wiring fires, and grid accidents at home and in agricultural fields.
            </p>
          </div>

          <div className="safety-grid">
            {safetyGuidelines.map((guide) => (
              <article key={guide.id} className="safety-card" data-translatable="true">
                <div className="safety-card-header">
                  <div className="safety-icon-box" aria-hidden="true">
                    <ShieldAlert size={22} />
                  </div>
                  <h3 className="safety-card-title">{guide.title}</h3>
                </div>
                <ul className="safety-points-list">
                  {guide.points.map((pt, idx) => (
                    <li key={idx} className="safety-point-item">
                      <span className="safety-bullet" aria-hidden="true">⚠️</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
