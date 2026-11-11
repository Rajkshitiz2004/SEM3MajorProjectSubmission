import React from 'react';
import { 
  Zap, 
  CreditCard, 
  SunMedium, 
  AlertTriangle, 
  Cpu, 
  FileCheck, 
  Bell, 
  Award, 
  ArrowRight,
  PhoneCall 
} from 'lucide-react';
import Hero from '../components/Hero';
import ServiceCard from '../components/ServiceCard';

/**
 * Home Page Component
 * Showcases:
 * - Electricity Hero with stats
 * - Real-time announcement ticker
 * - Grid of core electricity services
 * - Flagship Schemes and Public Notices panel
 * - National 1912 Helpline callout banner
 */
export default function Home() {
  const electricityServices = [
    {
      id: 'srv-1',
      title: 'New Connection & Load Extension',
      description: 'Apply online for new domestic, commercial, or agricultural electricity connections. Track application stage and fee estimation in real time.',
      icon: <Zap size={24} />,
      badgeText: 'New Applicant',
      isFeatured: true,
      actionLabel: 'Apply Online',
    },
    {
      id: 'srv-2',
      title: 'Instant Bill Payment & Tariff Rates',
      description: 'Download verified duplicate energy bills, view current slab-wise electricity tariff rates, and inspect monthly consumption history.',
      icon: <CreditCard size={24} />,
      badgeText: 'Bill Services',
      isFeatured: false,
      actionLabel: 'View Tariff',
    },
    {
      id: 'srv-3',
      title: 'PM Surya Ghar: Solar Rooftop Subsidy',
      description: 'Register for central rooftop solar installation, estimate solar generation capacity, and track government subsidy disbursements directly into bank accounts.',
      icon: <SunMedium size={24} />,
      badgeText: 'Central Subsidy',
      isFeatured: true,
      actionLabel: 'Register Scheme',
    },
    {
      id: 'srv-4',
      title: 'Feeder Outage & Fault Reporting',
      description: 'Check scheduled maintenance shutdowns in your area or lodge an emergency complaint regarding transformer failures and line breakdowns.',
      icon: <AlertTriangle size={24} />,
      badgeText: 'Emergency Redressal',
      isFeatured: false,
      actionLabel: 'Report Outage',
    },
    {
      id: 'srv-5',
      title: 'Smart Prepaid Meter Management',
      description: 'Monitor daily real-time power consumption, verify smart meter readings, recharge prepaid balance, and configure low-balance notifications.',
      icon: <Cpu size={24} />,
      badgeText: 'Smart Grid',
      isFeatured: false,
      actionLabel: 'Open Dashboard',
    },
    {
      id: 'srv-6',
      title: 'Consumer Rights & Charter Dispute',
      description: 'Lodge consumer grievances before the Internal Grievance Cell or Electricity Ombudsman for unjustified billing, delays, and metering disputes.',
      icon: <FileCheck size={24} />,
      badgeText: 'Statutory Rights',
      isFeatured: false,
      actionLabel: 'File Grievance',
    },
  ];

  const publicNotices = [
    {
      id: 'n1',
      date: '10 Nov 2026',
      text: 'Advisory on Phase-II Implementation of PM Surya Ghar: Free Electricity Scheme across all State DISCOMs.',
    },
    {
      id: 'n2',
      date: '04 Nov 2026',
      text: 'Mandatory smart prepaid metering rollout guidelines for urban commercial and industrial consumers.',
    },
    {
      id: 'n3',
      date: '28 Oct 2026',
      text: 'Draft National Electricity Policy 2026 released for stakeholder and public comments.',
    },
    {
      id: 'n4',
      date: '15 Oct 2026',
      text: 'Standard Operating Procedure (SOP) on feeder line maintenance and scheduled holiday restoration.',
    },
  ];

  const flagshipSchemes = [
    {
      id: 'sch1',
      name: 'PM Surya Ghar: Muft Bijli Yojana',
      tag: 'Solar Rooftop',
      desc: 'Provides free electricity up to 300 units per month through rooftop solar systems with substantial central financial assistance.',
    },
    {
      id: 'sch2',
      name: 'Revamped Distribution Sector Scheme (RDSS)',
      tag: 'Distribution Reforms',
      desc: 'Operational efficiency and financial sustainability for DISCOMs, modernizing grid infrastructure and feeder automation.',
    },
    {
      id: 'sch3',
      name: 'PM-KUSUM Scheme',
      tag: 'Agricultural Energy',
      desc: 'De-dieselization of farm sector through solar agricultural pumps and solarization of dedicated rural power feeders.',
    },
  ];

  return (
    <main id="main-content">
      {/* Hero Section */}
      <Hero />

      {/* Public Announcement Ticker */}
      <section className="announcement-ticker" aria-label="Official Announcements">
        <div className="container ticker-inner">
          <span className="ticker-label">
            <Bell size={13} />
            Public Notice
          </span>
          <div className="ticker-content">
            <a href="#notice" className="ticker-link">
              New: Subsidies under PM Surya Ghar Yojana updated for FY 2026-27 | Consumer grievance portal 1912 operates 24x7 across all states.
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="services-section" id="services" aria-labelledby="services-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Citizen Utilities</span>
            <h2 id="services-heading" className="section-title">
              National Electricity Services
            </h2>
            <p className="section-subtitle">
              Single-window digital gateway providing transparent, accountable, and accessible electricity services for citizens, farmers, and commercial consumers.
            </p>
          </div>

          <div className="services-grid">
            {electricityServices.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                icon={service.icon}
                badgeText={service.badgeText}
                isFeatured={service.isFeatured}
                actionLabel={service.actionLabel}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Combined Schemes and Public Notices Section */}
      <section className="info-panels-section" id="schemes" aria-label="Schemes and Announcements">
        <div className="container">
          <div className="panels-grid">
            {/* Panel 1: Flagship Schemes */}
            <div className="panel-card">
              <div className="panel-title-bar">
                <h3 className="panel-heading">
                  <Award size={20} color="#D97706" />
                  National Power Schemes
                </h3>
                <a href="#schemes-archive" className="service-action-link" style={{ fontSize: '0.8rem' }}>
                  All Schemes <ArrowRight size={12} />
                </a>
              </div>
              <div className="panel-list">
                {flagshipSchemes.map((scheme) => (
                  <div key={scheme.id} className="scheme-item">
                    <div className="scheme-header">
                      <span className="scheme-name">{scheme.name}</span>
                      <span className="scheme-tag">{scheme.tag}</span>
                    </div>
                    <p className="scheme-desc">{scheme.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Public Notices & Circulars */}
            <div className="panel-card" id="notices">
              <div className="panel-title-bar">
                <h3 className="panel-heading">
                  <Bell size={20} color="#0B2545" />
                  Official Circulars & Notices
                </h3>
                <a href="#notices-archive" className="service-action-link" style={{ fontSize: '0.8rem' }}>
                  Notice Board <ArrowRight size={12} />
                </a>
              </div>
              <ul className="panel-list">
                {publicNotices.map((notice) => (
                  <li key={notice.id} className="notice-item">
                    <div className="notice-date">{notice.date}</div>
                    <div className="notice-text">{notice.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 24x7 Helpline Callout Banner */}
      <section className="helpline-callout-banner" id="contact" aria-label="Helpline Support">
        <div className="container callout-inner">
          <div className="callout-text">
            <h3>Facing Unscheduled Power Cuts or Voltage Issues?</h3>
            <p>
              Lodge instant feeder complaints or reach out to your local DISCOM nodal officer directly.
            </p>
          </div>
          <div className="callout-action-group">
            <div className="callout-phone-pill">
              <PhoneCall size={20} />
              <span>Dial 1912 (Toll Free)</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

