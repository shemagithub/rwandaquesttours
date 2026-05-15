import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Accordion,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    subject: "",
    message: "",
    contactMethod: "email",
    travelDate: null,
    travelers: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleInquiryShortcut = (inquiryType, subject) => {
    setSelectedInquiry(inquiryType);
    setFormData({
      ...formData,
      subject: subject,
    });
    // Scroll to form
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log("Form submitted:", formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        country: "",
        subject: "",
        message: "",
        contactMethod: "email",
        travelDate: null,
        travelers: "",
      });
      setSelectedInquiry(null);
    }, 3000);
    
    alert("Thank you! Your inquiry has been submitted. We'll contact you soon!");
  };

  const inquiryShortcuts = [
    {
      id: "gorilla",
      title: "Book Gorilla Permit",
      icon: "🦍",
      description: "Get help securing your gorilla trekking permit",
      subject: "Gorilla Trekking",
      color: "#228b22",
    },
    {
      id: "safari",
      title: "Request Safari Quote",
      icon: "🦁",
      description: "Get a customized quote for wildlife safari",
      subject: "Safari Packages",
      color: "#ffc107",
    },
    {
      id: "transfer",
      title: "Airport Transfer",
      icon: "🚗",
      description: "Book airport pickup and drop-off service",
      subject: "Car Hire",
      color: "#007bff",
    },
    {
      id: "hotel",
      title: "Hotel Booking",
      icon: "🏨",
      description: "Find the perfect accommodation for your stay",
      subject: "Hotel Booking",
      color: "#6f42c1",
    },
  ];

  const faqs = [
    {
      question: "How fast do you respond to inquiries?",
      answer:
        "We typically respond within 2-4 hours during business hours (8 AM - 6 PM Kigali time). For urgent inquiries, WhatsApp is the fastest way to reach us. We also offer 24/7 emergency support.",
    },
    {
      question: "Do you help with gorilla permits?",
      answer:
        "Yes! We specialize in securing gorilla trekking permits for our clients. We handle all the paperwork and ensure permits are booked well in advance, as they sell out quickly. Contact us as early as possible for the best availability.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit cards (Visa, Mastercard), bank transfers, mobile money (MTN, Airtel), and PayPal. Payment terms and methods may vary by package - we'll discuss this when you book.",
    },
    {
      question: "Can I contact you on WhatsApp?",
      answer:
        "Absolutely! WhatsApp is one of our preferred contact methods, especially for international clients. You can reach us at +250 788 123 456. We respond quickly via WhatsApp during business hours.",
    },
    {
      question: "What are your working hours?",
      answer:
        "Our office is open Monday - Sunday from 8:00 AM to 6:00 PM (Kigali time). However, we offer 24/7 emergency support for clients who are already on tour with us. For booking inquiries, WhatsApp is monitored during extended hours.",
    },
    {
      question: "Do you offer airport transfers?",
      answer:
        "Yes, we provide 24/7 airport transfer services from Kigali International Airport. Our drivers meet you at arrivals with a name sign. Transfers can be booked as a standalone service or included in tour packages.",
    },
  ];

  return (
    <div className="contact-page">
      {/* 1. Clear Page Header */}
      <section className="contact-hero">
        <div className="hero-overlay"></div>
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h1 className="hero-title">Contact Rwandagorillatrekk</h1>
              <p className="hero-description">
                Get in touch with our Rwanda travel experts. We respond fast and are here to help you plan your perfect adventure.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 7. Inquiry Type Shortcuts */}
      <section className="inquiry-shortcuts py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="mb-4 text-center">
              <h2 className="section-title">Quick Inquiry Options</h2>
              <p className="section-subtitle">
                Choose the type of inquiry to get started faster
              </p>
            </Col>
          </Row>
          <Row>
            {inquiryShortcuts.map((shortcut) => (
              <Col md="3" sm="6" key={shortcut.id} className="mb-4">
                <Card
                  className="inquiry-card"
                  style={{ borderTop: `4px solid ${shortcut.color}` }}
                  onClick={() => handleInquiryShortcut(shortcut.id, shortcut.subject)}
                >
                  <Card.Body className="text-center">
                    <div className="inquiry-icon" style={{ fontSize: "48px", marginBottom: "15px" }}>
                      {shortcut.icon}
                    </div>
                    <h5>{shortcut.title}</h5>
                    <p className="inquiry-description">{shortcut.description}</p>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100"
                    >
                      Get Started
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Main Contact Section */}
      <section className="contact-main py-5">
        <Container>
          <Row>
            {/* 2. Smart Contact Form */}
            <Col lg="7" className="mb-5 mb-lg-0">
              <div id="contact-form">
                <h2 className="section-title mb-4">Send Us a Message</h2>
                {submitted && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle"></i> Thank you! Your message has been sent. We'll contact you soon.
                  </div>
                )}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md="6" className="mb-3">
                      <Form.Label>
                        Full Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </Col>
                    <Col md="6" className="mb-3">
                      <Form.Label>
                        Email Address <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </Col>
                    <Col md="6" className="mb-3">
                      <Form.Label>
                        Phone / WhatsApp <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text>+250</InputGroup.Text>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="788 123 456"
                        />
                      </InputGroup>
                    </Col>
                    <Col md="6" className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      >
                        <option value="">Select your country</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="USA">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Col>
                    <Col md="6" className="mb-3">
                      <Form.Label>
                        Subject <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="Gorilla Trekking">Gorilla Trekking</option>
                        <option value="Safari Packages">Safari Packages</option>
                        <option value="Car Hire">Car Hire</option>
                        <option value="Airport Transfer">Airport Transfer</option>
                        <option value="Hotel Booking">Hotel Booking</option>
                        <option value="Custom Tour">Custom Tour</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </Form.Select>
                    </Col>
                    <Col md="6" className="mb-3">
                      <Form.Label>Preferred Contact Method</Form.Label>
                      <Form.Select
                        name="contactMethod"
                        value={formData.contactMethod}
                        onChange={handleInputChange}
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="call">Phone Call</option>
                      </Form.Select>
                    </Col>
                    <Col md="6" className="mb-3">
                      <Form.Label>Travel Date (Optional)</Form.Label>
                      <DatePicker
                        selected={formData.travelDate}
                        onChange={(date) =>
                          setFormData({ ...formData, travelDate: date })
                        }
                        minDate={new Date()}
                        className="form-control"
                        dateFormat="MM/dd/yyyy"
                        placeholderText="Select travel date"
                      />
                    </Col>
                    <Col md="6" className="mb-3">
                      <Form.Label>Number of Travelers (Optional)</Form.Label>
                      <Form.Select
                        name="travelers"
                        value={formData.travelers}
                        onChange={handleInputChange}
                      >
                        <option value="">Select number</option>
                        {[...Array(20)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? "Person" : "People"}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md="12" className="mb-3">
                      <Form.Label>
                        Message <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Tell us about your travel plans, questions, or special requirements..."
                      />
                    </Col>
                    {selectedInquiry && (
                      <Col md="12" className="mb-3">
                        <div className="inquiry-note">
                          <i className="bi bi-info-circle"></i>
                          <strong>Quick Inquiry:</strong> {inquiryShortcuts.find((s) => s.id === selectedInquiry)?.title}
                        </div>
                      </Col>
                    )}
                    <Col md="12" className="mb-3">
                      <Button type="submit" className="primaryBtn w-100" size="lg">
                        <i className="bi bi-send"></i> Send Message
                      </Button>
                    </Col>
                    <Col md="12">
                      <p className="form-note">
                        <i className="bi bi-shield-check"></i> Your information is secure and will never be shared with third parties. We respect your privacy.
                      </p>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>

            {/* 4. Office & Business Information */}
            <Col lg="5">
              <div className="contact-info-section">
                <h2 className="section-title mb-4">Get in Touch</h2>

                {/* 3. Instant Contact Options */}
                <div className="instant-contact mb-4">
                  <h5>Quick Contact</h5>
                  <div className="contact-buttons">
                    <a
                      href="tel:+250788123456"
                      className="contact-btn call-btn"
                    >
                      <i className="bi bi-telephone-fill"></i>
                      <span>Call Now</span>
                    </a>
                    <a
                      href="https://wa.me/250788123456"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-btn whatsapp-btn"
                    >
                      <i className="bi bi-whatsapp"></i>
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href="mailto:info@rwandagorillatrekk.com"
                      className="contact-btn email-btn"
                    >
                      <i className="bi bi-envelope-fill"></i>
                      <span>Email</span>
                    </a>
                  </div>
                </div>

                {/* Office Information */}
                <div className="office-info mb-4">
                  <h5>Office Information</h5>
                  <div className="info-item">
                    <i className="bi bi-building"></i>
                    <div>
                      <strong>Rwandagorillatrekk</strong>
                      <p>KG 123 St, Kigali, Rwanda</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="bi bi-telephone"></i>
                    <div>
                      <strong>Phone</strong>
                      <p>
                        <a href="tel:+250788123456">+250 788 123 456</a>
                      </p>
                      <p>
                        <a href="tel:+250788123457">+250 788 123 457</a>
                      </p>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="bi bi-whatsapp"></i>
                    <div>
                      <strong>WhatsApp</strong>
                      <p>
                        <a
                          href="https://wa.me/250788123456"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          +250 788 123 456
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="bi bi-envelope"></i>
                    <div>
                      <strong>Email</strong>
                      <p>
                        <a href="mailto:info@rwandagorillatrekk.com">
                          info@rwandagorillatrekk.com
                        </a>
                      </p>
                      <p>
                        <a href="mailto:bookings@rwandagorillatrekk.com">
                          bookings@rwandagorillatrekk.com
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="bi bi-clock"></i>
                    <div>
                      <strong>Working Hours</strong>
                      <p>Monday - Sunday: 8:00 AM - 6:00 PM</p>
                      <p className="text-muted">(Kigali Time - GMT+2)</p>
                    </div>
                  </div>
                  <div className="info-item emergency">
                    <i className="bi bi-exclamation-triangle"></i>
                    <div>
                      <strong>Emergency Support</strong>
                      <p>24/7 for clients on tour</p>
                      <p>
                        <a href="tel:+250788123499">+250 788 123 499</a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 9. Social Media Integration */}
                <div className="social-media mb-4">
                  <h5>Follow Us</h5>
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
                      href="https://tripadvisor.com/rwandagorillatrekk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      title="TripAdvisor"
                    >
                      <i className="bi bi-globe"></i>
                    </a>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 5. Google Map Integration */}
      <section className="map-section py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="mb-4">
              <h2 className="section-title text-center">Find Our Office</h2>
              <p className="section-subtitle text-center">
                Visit us in Kigali, Rwanda
              </p>
            </Col>
            <Col md="12">
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.477678563839!2d30.088936314753593!3d-1.9447379985734525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8f6b3%3A0x6e8a1b5a0c9e5c1d!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="450"
                  style={{ border: 0, borderRadius: "10px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Rwandagorillatrekk Office Location"
                ></iframe>
              </div>
              <div className="map-actions text-center mt-3">
                <a
                  href="https://www.google.com/maps/dir//Kigali,+Rwanda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primaryBtn me-3"
                >
                  <i className="bi bi-geo-alt"></i> Get Directions
                </a>
                <Badge className="map-badge">
                  <i className="bi bi-info-circle"></i> KG 123 St, Kigali, Rwanda
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 10. FAQs (Contact-Related) */}
      <section className="contact-faqs py-5">
        <Container>
          <Row>
            <Col md="12" className="mb-4 text-center">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Quick answers to common contact questions
              </p>
            </Col>
            <Col md="10" className="mx-auto">
              <Accordion>
                {faqs.map((faq, index) => (
                  <Accordion.Item eventKey={index.toString()} key={index}>
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>{faq.answer}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 14. Call-To-Action */}
      <section className="contact-cta py-5">
        <div className="cta-overlay"></div>
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h2 className="cta-title">Ready to Start Your Rwanda Adventure?</h2>
              <p className="cta-description">
                Let our expert team help you plan an unforgettable experience
              </p>
              <div className="cta-buttons">
                <Button className="primaryBtn me-3" as={NavLink} to="/packages">
                  Plan Your Trip
                </Button>
                <a
                  href="https://wa.me/250788123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn me-3"
                >
                  <i className="bi bi-whatsapp"></i> Chat on WhatsApp
                </a>
                <Button
                  variant="outline-light"
                  as={NavLink}
                  to="/packages"
                >
                  Request Custom Tour
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Sticky Contact Buttons (Mobile) */}
      <div className="sticky-contact-buttons">
        <a
          href="tel:+250788123456"
          className="sticky-btn call-btn"
          title="Call Us"
        >
          <i className="bi bi-telephone-fill"></i>
        </a>
        <a
          href="https://wa.me/250788123456"
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-btn whatsapp-btn"
          title="WhatsApp Us"
        >
          <i className="bi bi-whatsapp"></i>
        </a>
      </div>
    </div>
  );
};

export default Contact;
