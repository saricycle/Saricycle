import React from 'react';
import { 
  Recycle, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import './HomeFooter.css';

const HomeFooter = () => {
  return (
    <footer className="home-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img className="footer-logo-icon" src={"/images/recycling-icon.svg"} alt="SariCycle Logo" />
              <span className="footer-logo-text">SariCycle</span>
            </div>
            <p className="footer-description2 text-white">
              Making recycling rewarding for everyone. Join us in creating a sustainable future.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-section-title text-white">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/home/about" className="footer-link">About Us</a></li>
              <li><a href="/home/learn-recycling" className="footer-link">How It Works</a></li>
              <li><a href="#" className="footer-link">Locations</a></li>
              <li><a href="#" className="footer-link">Partners</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-section-title text-white">Support</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">FAQ</a></li>
              <li><a href="#" className="footer-link">Contact Us</a></li>
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
              <li><a href="#" className="footer-link">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-section-title text-white">Contact</h3>
            <div className="footer-contact">
              <div className="contact-item">
                <MapPin size={16}/>
                <span>123 Bayani St, Mabalacat City, 2010</span>
              </div>
              <div className="contact-item">
                <Phone size={16}/>
                <span>+63 000-000-0000</span>
              </div>
              <div className="contact-item">
                <Mail size={16}/>
                <span>info@saricycle.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p className="text-white">&copy; 2025 SariCycle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter; 