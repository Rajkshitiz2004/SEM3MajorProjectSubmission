import React from 'react';
import { Zap, ShieldCheck, ChevronRight } from 'lucide-react';

/**
 * Hero Component
 * Displays the mission statement, 24x7 electricity supply initiatives,
 * key national statistics, and direct citizen access links.
 */
export default function Hero() {
  const quickLinks = [
    { title: 'Apply for New Connection (Domestic / Commercial)', id: 'q1' },
    { title: 'PM Surya Ghar: Free Electricity Solar Rooftop', id: 'q2' },
    { title: 'Check Smart Prepaid Meter Balance & Recharge', id: 'q3' },
    { title: 'Download Citizen Rights & Consumer Charter', id: 'q4' },
  ];

  return (
    <section className="hero-section" aria-label="Electricity Portal Highlights">
      <div className="hero-overlay-pattern" aria-hidden="true" />
      <div className="container hero-content">
        <div className="hero-text-block">
          <div className="hero-badge">
            <Zap size={14} />
            <span>Powering India's Growth | 24x7 Clean & Reliable Power</span>
          </div>

          <h2 className="hero-title">
            Empowering Every Household with <span>24x7 Reliable</span> Electricity Services
          </h2>

          <p className="hero-description">
            Access unified consumer services across State Distribution Companies (DISCOMs), apply for domestic or agricultural connections, register for rooftop solar subsidies, and monitor grievance resolutions on a unified national gateway.
          </p>

          <div className="hero-stats-row">
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Village Electrification</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">2.86 Cr+</span>
              <span className="stat-label">Households Energized</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">24x7</span>
              <span className="stat-label">National Helpline 1912</span>
            </div>
          </div>
        </div>

        {/* Quick Citizen Gateway Box */}
        <div className="hero-card-side">
          <h3>
            <ShieldCheck size={20} color="#FF9933" />
            Citizen Quick Access
          </h3>
          <div className="hero-quick-list">
            {quickLinks.map((link) => (
              <div key={link.id} className="quick-link-item" role="button" tabIndex={0}>
                <span>{link.title}</span>
                <ChevronRight size={16} color="#CBD5E1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
