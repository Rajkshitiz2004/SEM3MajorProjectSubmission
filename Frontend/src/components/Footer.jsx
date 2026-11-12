import React from 'react';
import { ShieldAlert, ExternalLink } from 'lucide-react';

/**
 * Footer Component
 * Indian Government style footer with:
 * - Ministry background & overview
 * - Major Power Schemes & DISCOMs links
 * - Citizen Help & Grievances
 * - Project Demonstration and Academic Disclaimer
 * - Standard web compliance links
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Column 1: Ministry Info */}
        <div className="footer-col">
          <h4 className="footer-col-title">Ministry of Power</h4>
          <p className="footer-desc">
            The Ministry of Power is primarily responsible for the development of electrical energy in the country. This portal serves as a mock consumer services interface for the demonstration of our AI-assisted language translation system.
          </p>
          <div className="footer-project-badge">
            <strong>Project:</strong> RajBhasha AI Translator (Sem-3 Major Project)
          </div>
        </div>

        {/* Column 2: Flagship Schemes */}
        <div className="footer-col">
          <h4 className="footer-col-title">Flagship Schemes</h4>
          <ul className="footer-links">
            <li className="footer-link-item">
              <a href="#schemes">PM Surya Ghar: Muft Bijli Yojana</a>
            </li>
            <li className="footer-link-item">
              <a href="#schemes">Revamped Distribution Sector Scheme (RDSS)</a>
            </li>
            <li className="footer-link-item">
              <a href="#schemes">PM-KUSUM Solar Agriculture</a>
            </li>
            <li className="footer-link-item">
              <a href="#schemes">National Smart Grid Mission (NSGM)</a>
            </li>
            <li className="footer-link-item">
              <a href="#schemes">UJALA LED Distribution Program</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Citizen Services */}
        <div className="footer-col">
          <h4 className="footer-col-title">Citizen Redressal</h4>
          <ul className="footer-links">
            <li className="footer-link-item">
              <a href="#services">Consumer Grievance Forum (CGRF)</a>
            </li>
            <li className="footer-link-item">
              <a href="#services">Electricity Ombudsman</a>
            </li>
            <li className="footer-link-item">
              <a href="#services">Electricity Rights of Consumers (2020)</a>
            </li>
            <li className="footer-link-item">
              <a href="#services">National Power Portal (NPP)</a>
            </li>
            <li className="footer-link-item">
              <a href="#contact">Contact Central Electricity Authority</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Project Info & Disclaimer */}
        <div className="footer-col">
          <h4 className="footer-col-title">About RajBhasha AI</h4>
          <p className="footer-desc">
            An English-to-Hindi bilingual transformation engine designed to make Indian public sector digital services accessible in India's official language (राजभाषा हिन्दी).
          </p>
          <ul className="footer-links">
            <li className="footer-link-item">
              <a href="#about-project">
                Technical Architecture <ExternalLink size={12} />
              </a>
            </li>
            <li className="footer-link-item">
              <a href="#about-project">
                Translation Widget Integration Docs <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Compliance & Policy Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <ul className="footer-policies-list">
            <li><a href="#terms">Terms of Use</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#copyright">Copyright Policy</a></li>
            <li><a href="#hyperlink">Hyperlinking Policy</a></li>
            <li><a href="#accessibility">Accessibility Statement</a></li>
            <li><a href="#help">Help & FAQs</a></li>
          </ul>

          <div className="footer-academic-alert">
            <ShieldAlert size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            <strong>Legal Notice:</strong> This website is an educational college project demonstration developed for the "RajBhasha AI" third-semester major project. It is strictly not an official government website and does not collect actual financial or consumer data.
          </div>

          <div>
            Portal Content Managed by Academic Project Team | Last Reviewed: November 2026
          </div>
        </div>
      </div>
    </footer>
  );
}

