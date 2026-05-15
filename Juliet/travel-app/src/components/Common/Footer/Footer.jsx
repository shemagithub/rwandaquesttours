import React, { useState } from "react";
import { Col, Container, Row, ListGroup, Form, Button, Badge } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "../Footer/footer.css";

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for subscribing! You'll receive Rwanda travel tips & deals.");
    setNewsletterEmail("");
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="footer-section pt-5">
        <Container>
          {/* Main Footer Content */}
          <Row className="footer-main pb-4">
            {/* 1. Company Identity & Trust */}
            <Col lg="3" md="6" sm="12" className="mb-4 mb-lg-0">
              <div className="footer-company">
                <h4 className="footer-logo">Rwandagorillatrekk</h4>
                <p className="company-description">
                  Rwandagorillatrekk is a Rwanda-based tour operator offering gorilla trekking, wildlife safaris, car hire, airport transfers, and hotel bookings.
                </p>
                <div className="company-badge">
                  <Badge className="location-badge">
                    <i className="bi bi-geo-alt"></i> Based in Rwanda 🇷🇼
                  </Badge>
                  <p className="experience-text">
                    <i className="bi bi-calendar-check"></i> 10+ Years Experience
                  </p>
                </div>
              </div>
            </Col>

            {/* 2. Quick Navigation Links */}
            <Col lg="2" md="6" sm="12" className="mb-4 mb-lg-0">
              <h5 className="footer-heading">Quick Links</h5>
              <ListGroup variant="flush" className="footer-links">
                <ListGroup.Item>
                  <NavLink to="/">Home</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/about">About Us</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/destinations">Destinations</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/packages">Tour Packages</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/gallery">Gallery</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/blog">Blog</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/contact">Contact Us</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/contact">FAQs</NavLink>
                </ListGroup.Item>
              </ListGroup>
            </Col>

            {/* 3. Services Links */}
            <Col lg="2" md="6" sm="12" className="mb-4 mb-lg-0">
              <h5 className="footer-heading">Services</h5>
              <ListGroup variant="flush" className="footer-links">
                <ListGroup.Item>
                  <NavLink to="/services">Gorilla Trekking 🦍</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/packages">Gorilla Permits</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/packages">Wildlife Safaris</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/car-rental">Car Hire</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/services">Airport Transfers</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/services">Hotel Bookings</NavLink>
                </ListGroup.Item>
                <ListGroup.Item>
                  <NavLink to="/services">City Tours</NavLink>
                </ListGroup.Item>
              </ListGroup>
            </Col>

            {/* 4. Contact Information */}
            <Col lg="2" md="6" sm="12" className="mb-4 mb-lg-0">
              <h5 className="footer-heading">Contact</h5>
              <div className="footer-contact">
                <div className="contact-item">
                  <i className="bi bi-telephone"></i>
                  <a href="tel:+250788123456">+250 788 123 456</a>
                </div>
                <div className="contact-item">
                  <i className="bi bi-whatsapp"></i>
                  <a
                    href="https://wa.me/250788123456"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </div>
                <div className="contact-item">
                  <i className="bi bi-envelope"></i>
                  <a href="mailto:info@rwandagorillatrekk.com">
                    info@rwandagorillatrekk.com
                  </a>
                </div>
                <div className="contact-item">
                  <i className="bi bi-geo-alt"></i>
                  <span>KG 123 St, Kigali, Rwanda</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-clock"></i>
                  <span>Mon-Sun: 8 AM - 6 PM</span>
                </div>
                <div className="contact-item emergency">
                  <i className="bi bi-exclamation-triangle"></i>
                  <a href="tel:+250788123499">Emergency: +250 788 123 499</a>
                </div>
              </div>
            </Col>

            {/* 7. Newsletter Subscription + 11. Language & Currency */}
            <Col lg="3" md="6" sm="12" className="mb-4 mb-lg-0">
              <h5 className="footer-heading">Stay Updated</h5>
              <Form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" className="primaryBtn w-100 mb-3">
                  <i className="bi bi-envelope-check"></i> Subscribe
                </Button>
                <p className="newsletter-note">
                  Get Rwanda travel tips & deals
                </p>
                <p className="privacy-note">
                  <i className="bi bi-shield-check"></i> We respect your privacy
                </p>
              </Form>

              {/* Language & Currency Selector */}
              <div className="language-currency mt-4">
                <Form.Group className="mb-2">
                  <Form.Select size="sm">
                    <option>🇬🇧 English (EN)</option>
                    <option>🇫🇷 Français (FR)</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Select size="sm">
                    <option>💵 USD</option>
                    <option>💶 EUR</option>
                    <option>🇷🇼 RWF</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </Col>
          </Row>

          {/* 9. Popular Destinations & 10. Popular Packages */}
          <Row className="footer-popular py-4 border-top">
            <Col md="6" className="mb-3 mb-md-0">
              <h6 className="popular-heading">Popular Destinations</h6>
              <div className="popular-links">
                <NavLink to="/destinations">Volcanoes National Park</NavLink>
                <NavLink to="/destinations">Akagera National Park</NavLink>
                <NavLink to="/destinations">Nyungwe Forest</NavLink>
                <NavLink to="/destinations">Lake Kivu</NavLink>
                <NavLink to="/destinations">Kigali City</NavLink>
              </div>
            </Col>
            <Col md="6">
              <h6 className="popular-heading">Popular Packages</h6>
              <div className="popular-links">
                <NavLink to="/packages">3-Day Gorilla Trekking</NavLink>
                <NavLink to="/packages">5-Day Wildlife Safari</NavLink>
                <NavLink to="/packages">2-Day Kigali Tour</NavLink>
                <NavLink to="/packages">6-Day Discovery Tour</NavLink>
              </div>
            </Col>
          </Row>

          {/* 5. Social Media Links & 6. Trust Badges */}
          <Row className="footer-social-trust py-4 border-top">
            <Col md="6" className="mb-3 mb-md-0">
              <h6 className="social-heading">Follow Us</h6>
              <div className="social-links">
                <a
                  href="https://facebook.com/rwandagorillatrekk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="Facebook"
                >
                  <i className="bi bi-facebook"></i>
                </a>
                <a
                  href="https://instagram.com/rwandagorillatrekk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="Instagram"
                >
                  <i className="bi bi-instagram"></i>
                </a>
                <a
                  href="https://twitter.com/rwandagorillatrekk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="Twitter"
                >
                  <i className="bi bi-twitter"></i>
                </a>
                <a
                  href="https://youtube.com/rwandagorillatrekk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="YouTube"
                >
                  <i className="bi bi-youtube"></i>
                </a>
                <a
                  href="https://tripadvisor.com/rwandagorillatrekk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="TripAdvisor"
                >
                  <i className="bi bi-star"></i>
                </a>
                <a
                  href="https://maps.google.com/rwandagorillatrekk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="Google Business"
                >
                  <i className="bi bi-google"></i>
                </a>
              </div>
            </Col>
            <Col md="6">
              <h6 className="trust-heading">Trusted & Certified</h6>
              <div className="trust-badges">
                <div className="trust-badge-item">
                  <i className="bi bi-shield-check"></i>
                  <span>RDB Licensed</span>
                </div>
                <div className="trust-badge-item">
                  <i className="bi bi-lock"></i>
                  <span>SSL Secure</span>
                </div>
                <div className="trust-badge-item">
                  <i className="bi bi-star-fill"></i>
                  <span>TripAdvisor 4.9/5</span>
                </div>
                <div className="payment-icons">
                  <i className="bi bi-credit-card" title="Visa"></i>
                  <i className="bi bi-credit-card-2-front" title="MasterCard"></i>
                  <i className="bi bi-phone" title="Mobile Money"></i>
                </div>
              </div>
            </Col>
          </Row>

          {/* 12. Call-To-Action Buttons */}
          <Row className="footer-cta py-4 border-top">
            <Col md="12" className="text-center">
              <div className="footer-cta-buttons">
                <Button className="primaryBtn me-3 mb-2 mb-md-0" as={NavLink} to="/packages">
                  <i className="bi bi-calendar-check"></i> Book a Tour
                </Button>
                <Button
                  variant="outline-light"
                  className="me-3 mb-2 mb-md-0"
                  as={NavLink}
                  to="/contact"
                >
                  <i className="bi bi-gear"></i> Request Custom Trip
                </Button>
                <a
                  href="https://wa.me/250788123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-footer-btn"
                >
                  <i className="bi bi-whatsapp"></i> Chat on WhatsApp
                </a>
              </div>
            </Col>
          </Row>

          {/* 8. Legal & Policy Links & 13. Copyright */}
          <Row className="footer-bottom py-3 border-top">
            <Col md="6" className="mb-2 mb-md-0">
              <div className="legal-links">
                <NavLink to="/privacy">Privacy Policy</NavLink>
                <span>|</span>
                <NavLink to="/terms">Terms & Conditions</NavLink>
                <span>|</span>
                <NavLink to="/cancellation">Cancellation Policy</NavLink>
                <span>|</span>
                <NavLink to="/cookies">Cookie Policy</NavLink>
                <span>|</span>
                <NavLink to="/sitemap">Sitemap</NavLink>
              </div>
            </Col>
            <Col md="6" className="text-md-end">
              <p className="copyright">
                © {currentYear} Rwandagorillatrekk. All rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};

export default Footer;