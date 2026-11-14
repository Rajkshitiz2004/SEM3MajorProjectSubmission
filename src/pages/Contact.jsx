import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  HelpCircle, 
  Send, 
  CheckCircle2,
  Info 
} from 'lucide-react';
import { CONTACT_CONTENT } from '../data/governmentContent';

/**
 * Contact Page Component
 * Showcases:
 * - Demo departmental office locations and contact directories
 * - Multichannel citizen support options
 * - Common consumer FAQs
 * - Interactive inquiry submission form (mock)
 *
 * All text is in English and semantic HTML, with data-translatable attributes
 * for translation engine evaluation.
 */
export default function Contact() {
  const { header, demoOffices, supportChannels, faqList } = CONTACT_CONTENT;
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <main id="main-content" className="page-wrapper">
      {/* Page Header */}
      <section className="page-hero-banner" aria-labelledby="contact-page-title">
        <div className="container">
          <span className="section-tag">{header.tag}</span>
          <h1 id="contact-page-title" className="page-hero-title" data-translatable="true">
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

      {/* Support Channels Overview */}
      <section className="support-channels-section" aria-label="Support Channels">
        <div className="container">
          <div className="channels-grid">
            {supportChannels.map((channel, idx) => (
              <div key={idx} className="channel-card" data-translatable="true">
                <span className="channel-type-badge">{channel.type}</span>
                <h3 className="channel-title">{channel.title}</h3>
                <div className="channel-identifier">{channel.identifier}</div>
                <p className="channel-desc">{channel.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Locations & Inquiry Form Grid */}
      <section className="contact-main-section" aria-label="Directory and Inquiries">
        <div className="container">
          <div className="contact-layout-grid">
            {/* Left: Department Directories */}
            <div className="contact-directory-column">
              <div className="section-header text-left">
                <span className="section-tag">Offices</span>
                <h2 className="section-title" data-translatable="true">
                  Departmental Directory & Office Hours
                </h2>
                <p className="section-subtitle" data-translatable="true">
                  Official administrative headquarters and grievance redressal forum locations (placeholder demo entries).
                </p>
              </div>

              <div className="offices-list">
                {demoOffices.map((office) => (
                  <article key={office.id} className="office-card" data-translatable="true">
                    <h3 className="office-name">{office.name}</h3>
                    <div className="office-division">{office.division}</div>

                    <div className="office-detail-row">
                      <MapPin size={16} className="office-icon" aria-hidden="true" />
                      <span>{office.address}</span>
                    </div>

                    <div className="office-detail-row">
                      <Mail size={16} className="office-icon" aria-hidden="true" />
                      <span>{office.email}</span>
                    </div>

                    <div className="office-detail-row">
                      <Phone size={16} className="office-icon" aria-hidden="true" />
                      <span>{office.phone}</span>
                    </div>

                    <div className="office-detail-row">
                      <Clock size={16} className="office-icon" aria-hidden="true" />
                      <span>{office.timing}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Right: Citizen Inquiry Form */}
            <div className="contact-form-column">
              <div className="form-card" data-translatable="true">
                <h3 className="form-title">Send a Public Inquiry (Demonstration Form)</h3>
                <p className="form-subtitle">
                  Use this form to submit questions or test citizen feedback submissions in this prototype environment.
                </p>

                {formSubmitted && (
                  <div className="form-success-banner" role="status">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>Inquiry submitted successfully! A reference number has been generated for your record.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="inquiry-form">
                  <div className="form-group">
                    <label htmlFor="citizen-name" className="form-label">Full Citizen Name</label>
                    <input
                      type="text"
                      id="citizen-name"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="consumer-number" className="form-label">Electricity Consumer Number (Optional)</label>
                    <input
                      type="text"
                      id="consumer-number"
                      placeholder="e.g. 1002938475"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="contact-email"
                      required
                      placeholder="citizen@example.in"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="inquiry-subject" className="form-label">Inquiry Subject</label>
                    <select id="inquiry-subject" className="form-input" defaultValue="subsidy">
                      <option value="subsidy">Electricity Subsidy Scheme Question</option>
                      <option value="solar">Rooftop Solar Feasibility & Metering</option>
                      <option value="billing">Tariff Calculation & Slab Clarification</option>
                      <option value="connection">New Domestic Service Connection</option>
                      <option value="other">General Technical Feedback</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="inquiry-message" className="form-label">Your Message or Feedback</label>
                    <textarea
                      id="inquiry-message"
                      rows={4}
                      required
                      placeholder="Please describe your query with relevant details..."
                      className="form-input form-textarea"
                    />
                  </div>

                  <button type="submit" className="form-submit-btn">
                    <Send size={16} aria-hidden="true" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="faq-section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Common Inquiries</span>
            <h2 id="faq-heading" className="section-title" data-translatable="true">
              Frequently Asked Consumer Questions
            </h2>
            <p className="section-subtitle" data-translatable="true">
              Quick answers regarding electricity procedures, billing disputes, and project scope.
            </p>
          </div>

          <div className="faq-grid">
            {faqList.map((item, idx) => (
              <div key={idx} className="faq-item-card" data-translatable="true">
                <div className="faq-question-row">
                  <HelpCircle size={18} color="#D97706" aria-hidden="true" />
                  <h3 className="faq-question">{item.question}</h3>
                </div>
                <p className="faq-answer">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
