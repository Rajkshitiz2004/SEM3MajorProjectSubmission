import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Award, Layers, Bell, Mail, Menu, X } from 'lucide-react';

/**
 * Navbar Component
 * Navigation items: Home, Schemes, Services, Notices, Contact
 * Supports responsive mobile menu toggle and active state styling.
 */
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Schemes', path: '/schemes', icon: Award },
    { name: 'Services', path: '/services', icon: Layers },
    { name: 'Notices', path: '/notices', icon: Bell },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar-wrapper" aria-label="Main Navigation">
      <div className="container navbar-inner">
        {/* Desktop Links */}
        <ul className="nav-links-desktop">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-link active' : 'nav-item-link'
                  }
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <ul className={`nav-links-mobile ${isMobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'nav-item-link active' : 'nav-item-link'
                }
                onClick={closeMobileMenu}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

