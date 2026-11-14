import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Info
} from 'lucide-react';
import { SCHEMES_CONTENT } from '../data/governmentContent';

/**
 * Schemes Page Component
 * Showcases:
 * - Electricity subsidy information
 * - Rooftop solar initiative
 * - Rural electrification mission
 * - Eligibility parameters & application guidance
 *
 * All text is in English and semantic HTML, with data-translatable attributes
 * for translation engine evaluation.
 */
export default function Schemes() {
  const { header, schemesList, applicationProcess } = SCHEMES_CONTENT;

  return (
    <main id="main-content" className="page-wrapper">
      {/* Page Header */}
      <section className="page-hero-banner" aria-labelledby="schemes-page-title">
        <div className="container">
          <span className="section-tag">{header.tag}</span>
          <h1 id="schemes-page-title" className="page-hero-title" data-translatable="true">
            {header.title}
          </h1>
          <p className="page-hero-subtitle" data-translatable="true">
            {header.subtitle}
          </p>

          {/* Academic / Demo notice pill */}
          <div className="demo-notice-callout" role="note" aria-label="Demo Disclaimer">
            <Info size={16} aria-hidden="true" />
            <span data-translatable="true">{header.notice}</span>
          </div>
        </div>
      </section>

      {/* Flagship Schemes Section */}
      <section className="schemes-grid-section" aria-label="Available Government Schemes">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Welfare Catalog</span>
            <h2 className="section-title" data-translatable="true">
              Active Subsidy & Electrification Programs
            </h2>
            <p className="section-subtitle" data-translatable="true">
              Read through detailed scheme scopes, benefits, and eligibility criteria designed for Indian consumers.
            </p>
          </div>

          <div className="schemes-detailed-grid">
            {schemesList.map((scheme) => (
              <article key={scheme.id} className="scheme-detailed-card" data-translatable="true">
                <div className="scheme-card-top">
                  <div className="scheme-badge-group">
                    <span className="service-badge featured">{scheme.category}</span>
                    <span className="scheme-tag">{scheme.tag}</span>
                  </div>
                  <h3 className="scheme-card-title">{scheme.title}</h3>
                  <p className="scheme-card-summary">{scheme.summary}</p>
                </div>

                <div className="scheme-card-body">
                  <div className="scheme-info-block">
                    <h4 className="scheme-subheading">
                      <ShieldCheck size={16} color="#D97706" aria-hidden="true" />
                      Eligibility Requirements
                    </h4>
                    <ul className="scheme-checklist">
                      {scheme.eligibility.map((item, idx) => (
                        <li key={idx} className="scheme-check-item">
                          <CheckCircle2 size={15} color="#138808" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="scheme-info-block">
                    <h4 className="scheme-subheading">
                      <FileText size={16} color="#0B2545" aria-hidden="true" />
                      Application & Inspection Guidance
                    </h4>
                    <ul className="scheme-checklist guidance">
                      {scheme.guidance.map((item, idx) => (
                        <li key={idx} className="scheme-check-item">
                          <span className="step-bullet">{idx + 1}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="scheme-card-footer">
                  <div className="scheme-benefit-highlight">
                    <strong>Concession / Benefit:</strong> {scheme.benefits}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Standard Application Process Timeline */}
      <section className="process-timeline-section" aria-labelledby="timeline-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How To Apply</span>
            <h2 id="timeline-heading" className="section-title" data-translatable="true">
              Standard 4-Step Application Procedure
            </h2>
            <p className="section-subtitle" data-translatable="true">
              A simplified and transparent digital registration pipeline for citizens seeking subsidy benefits.
            </p>
          </div>

          <div className="process-steps-grid">
            {applicationProcess.map((proc) => (
              <div key={proc.step} className="process-step-card" data-translatable="true">
                <div className="process-step-number" aria-hidden="true">{proc.step}</div>
                <h3 className="process-step-title">{proc.title}</h3>
                <p className="process-step-desc">{proc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
