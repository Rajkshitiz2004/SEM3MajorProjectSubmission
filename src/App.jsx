import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

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
        <Route path="/schemes" element={<Home />} />
        <Route path="/services" element={<Home />} />
        <Route path="/notices" element={<Home />} />
        <Route path="/contact" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>

      {/* Comprehensive Government-style Footer */}
      <Footer />
    </div>
  );
}

export default App;
