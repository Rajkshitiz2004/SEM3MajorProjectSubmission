import React from 'react';
import { PhoneCall } from 'lucide-react';

/**
 * Header Component
 * Contains:
 * - Tricolor decorative stripe
 * - Top Government of India / Ministry of Power demo utility bar
 * - Mandatory College Project Demonstration banner
 * - Main portal header with non-deceptive government-style demonstration emblem & 24x7 helpline
 */
export default function Header() {
  return (
    <header>
      {/* Indian National Tricolor Top Stripe */}
      <div className="gov-tricolor-stripe" aria-hidden="true" />

      {/* College Project Disclaimer Bar */}
      <div className="demo-disclaimer-bar">
        <span className="demo-disclaimer-pill">Notice</span>
        <span>
          College Project Demonstration — Not an Official Government Website | RajBhasha AI Translation Prototype
        </span>
      </div>

      {/* Top Government Information Bar */}
      <div className="top-gov-bar">
        <div className="container top-gov-inner">
          <div className="gov-affiliations">
            <span className="gov-flag-icon" aria-hidden="true" />
            <span>भारत सरकार | Government of India</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>विद्युत मंत्रालय | Ministry of Power — Demo Portal</span>
          </div>

          <div className="top-gov-actions">
            <div className="accessibility-tools">
              <span>Text Size:</span>
              <button type="button" className="text-resize-btn" aria-label="Decrease text size">A-</button>
              <button type="button" className="text-resize-btn" aria-label="Normal text size">A</button>
              <button type="button" className="text-resize-btn" aria-label="Increase text size">A+</button>
            </div>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              English / हिन्दी (Widget Demo Ready)
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Branding Area */}
      <div className="main-header">
        <div className="container header-inner">
          <div className="header-branding">
            {/* Non-deceptive Demonstration State Emblem SVG */}
            <div className="emblem-wrapper" title="Academic Demonstration Emblem">
              <svg
                className="emblem-svg"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Academic Demo Emblem"
              >
                {/* Outer Circular Ring with decorative nodes */}
                <circle cx="50" cy="50" r="46" stroke="#0B2545" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="41" stroke="#FF9933" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="28" stroke="#138808" strokeWidth="1.5" />

                {/* 24-spoke inspired stylized wheel spokes */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1="50"
                    y1="50"
                    x2={50 + 26 * Math.cos((deg * Math.PI) / 180)}
                    y2={50 + 26 * Math.sin((deg * Math.PI) / 180)}
                    stroke="#0B2545"
                    strokeWidth="1.2"
                  />
                ))}

                {/* Central Power/Energy Icon */}
                <circle cx="50" cy="50" r="8" fill="#FF9933" />
                <path
                  d="M50 38 L45 49 L50 49 L48 60 L56 47 L51 47 Z"
                  fill="#FFFFFF"
                />

                {/* Banner Label at base */}
                <rect x="22" y="80" width="56" height="12" rx="3" fill="#0B2545" />
                <text
                  x="50"
                  y="88"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="6.5"
                  fontWeight="bold"
                  letterSpacing="0.5"
                >
                  DEMO PORTAL
                </text>
              </svg>
            </div>

            <div className="brand-text">
              <span className="brand-hierarchy">विद्युत मंत्रालय | Ministry of Power</span>
              <h1 className="brand-title">National Electricity Services Portal</h1>
              <span className="brand-subtitle">
                Centralized Electricity Services & Citizen Redressal — Government of India (Demo)
              </span>
            </div>
          </div>

          {/* 24x7 Citizen Helpline Badge */}
          <div className="header-support">
            <div className="helpline-box">
              <div className="helpline-icon-wrap">
                <PhoneCall size={18} />
              </div>
              <div>
                <div className="helpline-label">Toll-Free Electricity Helpline</div>
                <div className="helpline-number">1912</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
