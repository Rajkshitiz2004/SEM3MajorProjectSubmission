import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Schemes from './pages/Schemes';
import Services from './pages/Services';
import Notices from './pages/Notices';
import Contact from './pages/Contact';
import TranslationWidget from './components/TranslationWidget';

function App() {
  return (
    <div className="app-container">
      {/* Top Header with branding, emblem, and academic notice */}
      <Header />

      {/* Responsive Navigation Bar */}
      <Navbar />

      {/* Main Page Routing */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/services" element={<Services />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Routes>

      {/* Comprehensive Government-style Footer */}
      <Footer />

      {/* Floating English ↔ Hindi Translation Widget */}
      <TranslationWidget />
    </div>
  );
}

export default App;
