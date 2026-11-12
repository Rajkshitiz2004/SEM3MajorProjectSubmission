import React from 'react';
import { 
  CheckCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { SERVICES_CONTENT } from '../data/governmentContent';

/**
 * Services Page Component
 * Showcases:
 * - Electricity bill information & tariff structure
 * - New connection application guidance
 * - Complaint & fault registration information
 * - Application status & tracking guidance
 * - Consumer charter guarantees
 *
 * All text is in English and semantic HTML, with data-translatable attributes
 * for translation engine evaluation.
 */
export default function Services() {
  const { header, servicesList, consumerCharter } = SERVICES_CONTENT;

  return (
    <main id="main-content" className="page-wrapper">
      {/* Page Header */}
      <section className="page-hero-banner" aria-labelledby="services-page-title">
        <div className="container">
          <span className="section-tag">{header.tag}</span>
          <h1 id="services-page-title" className="page-hero-title" data-translatable="true">
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

      {/* Services Detailed List */}
      <section className="services-section" aria-label="Core Electricity Services">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Public Utilities</span>
            <h2 className="section-title" data-translatable="true">
              Available Electricity Portal Services
            </h2>
            <p className="section-subtitle" data-translatable="true">
              Read comprehensive operational instructions and feature breakdowns for each utility service.
            </p>
          </div>

          <div className="services-detailed-grid">
            {servicesList.map((service) => (
              <article key={service.id} className="service-detailed-card" data-translatable="true">
                <div className="service-detailed-header">
                  <span className="service-badge featured">{service.category}</span>
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.description}</p>
                </div>

                <div className="service-features-block">
                  <h4 className="service-features-title">Key Provisions & Capabilities</h4>
                  <ul className="service-features-list">
                    {service.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="service-feature-item">
                        <CheckCircle size={15} color="#138808" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="service-card-footer">
                  <span className="service-status-indicator">
                    <span className="status-dot" aria-hidden="true" />
                    Available 24x7 Online
                  </span>
                  <button type="button" className="service-action-btn" aria-label={`Read more about ${service.title}`}>
                    {service.actionText} <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Consumer Rights & Service Charter */}
      <section className="charter-section" aria-labelledby="charter-heading">
        <div className="container">
          <div className="charter-box" data-translatable="true">
            <div className="charter-header">
              <span className="section-tag" style={{ color: '#FCD34D' }}>Statutory Rights</span>
              <h2 id="charter-heading" className="charter-title">
                Electricity Consumer Protection Charter
              </h2>
              <p className="charter-subtitle">
                Guaranteed minimum service performance standards established under standard electricity governance frameworks.
              </p>
            </div>

            <div className="charter-grid">
              {consumerCharter.map((item, idx) => (
                <div key={idx} className="charter-card">
                  <h3 className="charter-card-title">{item.title}</h3>
                  <p className="charter-card-text">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
