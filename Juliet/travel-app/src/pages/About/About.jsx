import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./about.css";

const About = () => {
  const [counters, setCounters] = useState({
    travelers: 0,
    permits: 0,
    packages: 0,
    experience: 0,
  });

  const statsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Animated counter effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isVisible]);

  const animateCounters = () => {
    const targets = { travelers: 1000, permits: 100, packages: 50, experience: 10 };
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounters({
        travelers: Math.floor(targets.travelers * progress),
        permits: Math.floor(targets.permits * progress),
        packages: Math.floor(targets.packages * progress),
        experience: Math.floor(targets.experience * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, increment);
  };

  const teamMembers = [
    {
      name: "Jean Baptiste",
      role: "Founder & Director",
      experience: "15 years",
      photo: require("../../assets/images/about/aboutimg.png"),
      bio: "Passionate about Rwanda tourism and wildlife conservation. Started Rwandagorillatrekk to share the beauty of Rwanda with the world.",
    },
    {
      name: "Marie Uwimana",
      role: "Senior Tour Guide",
      experience: "10 years",
      photo: require("../../assets/images/about/aboutimg.png"),
      bio: "Expert in gorilla trekking and wildlife safaris. Fluent in English, French, and Kinyarwanda.",
    },
    {
      name: "David Mutabazi",
      role: "Professional Driver",
      experience: "8 years",
      photo: require("../../assets/images/about/aboutimg.png"),
      bio: "Experienced 4x4 driver specialized in mountain terrain and park tours. Safety certified.",
    },
    {
      name: "Grace Mukamana",
      role: "Customer Support",
      experience: "5 years",
      photo: require("../../assets/images/about/aboutimg.png"),
      bio: "Available 24/7 to assist with bookings, permits, and travel inquiries.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      country: "USA",
      comment:
        "Rwandagorillatrekk made our gorilla trekking dream come true. Professional, safe, and unforgettable experience!",
      rating: 5,
      date: "March 2024",
    },
    {
      name: "Michael Chen",
      country: "Singapore",
      comment:
        "Excellent service from start to finish. The team was knowledgeable and the gorilla permit process was seamless.",
      rating: 5,
      date: "February 2024",
    },
    {
      name: "Emma Williams",
      country: "UK",
      comment:
        "Best travel experience in Rwanda. Highly recommend for anyone visiting the country. Truly professional!",
      rating: 5,
      date: "January 2024",
    },
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`bi ${i < rating ? "bi-star-fill" : "bi-star"}`}
        style={{ color: i < rating ? "#ffc107" : "#ddd" }}
      ></i>
    ));
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h1 className="hero-title">About Rwandagorillatrekk</h1>
              <p className="hero-subtitle">
                Your Trusted Partner for Unforgettable Rwanda Adventures
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 1. Company Introduction */}
      <section className="company-intro py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-4">
              <h2 className="section-title">Who We Are</h2>
            </Col>
            <Col md="10" className="mx-auto text-center">
              <p className="intro-text">
                <strong>Rwandagorillatrekk</strong> is a Rwanda-based tour company
                offering car hire, airport transfers, wildlife safaris, gorilla
                trekking permits, hotel bookings, and city tours across Rwanda.
              </p>
              <p className="intro-text">
                Established in 2014, we are 100% Rwandan-owned and locally operated,
                bringing you authentic experiences while supporting local communities
                and wildlife conservation.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 2. Our Story */}
      <section className="our-story py-5 bg-light">
        <Container>
          <Row>
            <Col md="6" className="mb-4 mb-md-0">
              <img
                src={require("../../assets/images/about/aboutimg.png")}
                alt="Rwanda Gorilla Trekking"
                className="story-image"
              />
            </Col>
            <Col md="6">
              <h2 className="section-title mb-4">Our Story</h2>
              <div className="story-content">
                <p>
                  Rwandagorillatrekk was born from a deep passion for Rwanda's
                  incredible wildlife, especially our majestic mountain gorillas. What
                  started as a small local tour service has grown into a trusted name
                  in Rwanda tourism.
                </p>
                <p>
                  Our founder, having spent years in the tourism industry, recognized
                  the need for a company that combines professionalism with genuine
                  care for both travelers and Rwanda's natural heritage. We believe
                  that tourism can and should benefit local communities while
                  protecting our precious wildlife.
                </p>
                <p>
                  Today, we've helped thousands of travelers experience the magic of
                  Rwanda - from up-close gorilla encounters to thrilling wildlife
                  safaris and cultural city tours. Our commitment to safety,
                  sustainability, and exceptional service remains unchanged.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 3. Mission, Vision & Values */}
      <section className="mission-vision py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">Mission, Vision & Values</h2>
            </Col>
          </Row>
          <Row>
            <Col md="4" className="mb-4">
              <div className="mission-card">
                <div className="card-icon">
                  <i className="bi bi-bullseye"></i>
                </div>
                <h3>Our Mission</h3>
                <p>
                  To provide exceptional, safe, and sustainable tour experiences in
                  Rwanda while supporting wildlife conservation and local communities.
                  We aim to make Rwanda's natural beauty accessible to travelers
                  worldwide through professional service and authentic local expertise.
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="mission-card">
                <div className="card-icon">
                  <i className="bi bi-eye"></i>
                </div>
                <h3>Our Vision</h3>
                <p>
                  To become Rwanda's leading tour operator, recognized internationally
                  for our commitment to conservation, community empowerment, and
                  world-class travel experiences. We envision a future where tourism
                  and wildlife protection go hand in hand.
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="mission-card">
                <div className="card-icon">
                  <i className="bi bi-heart"></i>
                </div>
                <h3>Core Values</h3>
                <ul className="values-list">
                  <li>
                    <i className="bi bi-check-circle"></i> Customer Safety First
                  </li>
                  <li>
                    <i className="bi bi-check-circle"></i> Transparency & Integrity
                  </li>
                  <li>
                    <i className="bi bi-check-circle"></i> Conservation &
                    Sustainability
                  </li>
                  <li>
                    <i className="bi bi-check-circle"></i> Professional Excellence
                  </li>
                  <li>
                    <i className="bi bi-check-circle"></i> Local Community Support
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 4. Why Choose Rwandagorillatrekk */}
      <section className="why-choose-us py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">Why Choose Rwandagorillatrekk</h2>
            </Col>
          </Row>
          <Row>
            <Col md="4" sm="6" className="mb-4">
              <div className="feature-item">
                <i className="bi bi-shield-check"></i>
                <h4>Licensed & Registered</h4>
                <p>Fully licensed tour operator registered with Rwanda Development Board (RDB)</p>
              </div>
            </Col>
            <Col md="4" sm="6" className="mb-4">
              <div className="feature-item">
                <i className="bi bi-people"></i>
                <h4>Experienced Local Guides</h4>
                <p>Certified guides with years of experience in gorilla trekking and wildlife safaris</p>
              </div>
            </Col>
            <Col md="4" sm="6" className="mb-4">
              <div className="feature-item">
                <i className="bi bi-truck"></i>
                <h4>Reliable 4x4 Vehicles</h4>
                <p>Well-maintained safari vehicles perfect for mountain terrain and park tours</p>
              </div>
            </Col>
            <Col md="4" sm="6" className="mb-4">
              <div className="feature-item">
                <i className="bi bi-ticket-perforated"></i>
                <h4>Gorilla Permit Assistance</h4>
                <p>Expert help securing gorilla permits - we handle all the paperwork</p>
              </div>
            </Col>
            <Col md="4" sm="6" className="mb-4">
              <div className="feature-item">
                <i className="bi bi-headset"></i>
                <h4>24/7 Customer Support</h4>
                <p>Round-the-clock assistance via phone, WhatsApp, and email</p>
              </div>
            </Col>
            <Col md="4" sm="6" className="mb-4">
              <div className="feature-item">
                <i className="bi bi-sliders"></i>
                <h4>Flexible Itineraries</h4>
                <p>Customizable tours tailored to your preferences and schedule</p>
              </div>
            </Col>
            <Col md="4" sm="6" className="mb-4">
              <div className="feature-item">
                <i className="bi bi-cash-coin"></i>
                <h4>Competitive Pricing</h4>
                <p>Fair and transparent pricing with no hidden fees</p>
              </div>
            </Col>
            <Col md="4" sm="6" className="mb-4">
              <div className="feature-item">
                <i className="bi bi-award"></i>
                <h4>10+ Years Experience</h4>
                <p>Proven track record with 1000+ satisfied travelers</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 5. Our Team */}
      <section className="our-team py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">Meet Our Team</h2>
              <p className="section-subtitle">
                Experienced professionals dedicated to making your Rwanda adventure
                unforgettable
              </p>
            </Col>
          </Row>
          <Row>
            {teamMembers.map((member, index) => (
              <Col md="3" sm="6" key={index} className="mb-4">
                <Card className="team-card">
                  <div className="team-photo">
                    <img src={member.photo} alt={member.name} />
                  </div>
                  <Card.Body className="text-center">
                    <h4>{member.name}</h4>
                    <p className="team-role">{member.role}</p>
                    <p className="team-experience">
                      <i className="bi bi-calendar-check"></i> {member.experience}
                    </p>
                    <p className="team-bio">{member.bio}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 6. Licenses, Certifications & Memberships */}
      <section className="licenses-section py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">
                Licenses, Certifications & Memberships
              </h2>
              <p className="section-subtitle">
                Fully authorized and recognized by Rwanda's tourism authorities
              </p>
            </Col>
          </Row>
          <Row>
            <Col md="4" className="mb-4">
              <div className="license-card">
                <i className="bi bi-file-earmark-check"></i>
                <h4>RDB Registration</h4>
                <p>
                  Registered with Rwanda Development Board (RDB) as an official tour
                  operator
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="license-card">
                <i className="bi bi-passport"></i>
                <h4>Tourism Operating License</h4>
                <p>
                  Licensed to operate tours, safaris, and travel services across
                  Rwanda
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="license-card">
                <i className="bi bi-ticket-perforated"></i>
                <h4>Park Permits Authorization</h4>
                <p>
                  Authorized to arrange and manage gorilla permits and national park
                  entry permits
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="license-card">
                <i className="bi bi-building"></i>
                <h4>Tourism Association Member</h4>
                <p>
                  Active member of Rwanda Tourism Chamber (RTC) and local tourism
                  associations
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="license-card">
                <i className="bi bi-shield-check"></i>
                <h4>Insurance & Safety Certified</h4>
                <p>
                  Fully insured operations with certified safety protocols for all
                  tours
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 7. Sustainability & Conservation */}
      <section className="sustainability-section py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">Sustainability & Conservation</h2>
              <p className="section-subtitle">
                Committed to protecting Rwanda's wildlife and supporting local
                communities
              </p>
            </Col>
          </Row>
          <Row>
            <Col md="6" className="mb-4">
              <div className="sustainability-item">
                <i className="bi bi-tree"></i>
                <h4>Gorilla Conservation Support</h4>
                <p>
                  We contribute to gorilla conservation efforts through permit fees
                  and donations. A portion of every tour goes directly to protecting
                  these magnificent creatures and their habitats.
                </p>
              </div>
            </Col>
            <Col md="6" className="mb-4">
              <div className="sustainability-item">
                <i className="bi bi-leaf"></i>
                <h4>Eco-Friendly Tourism</h4>
                <p>
                  We practice responsible tourism with minimal environmental impact.
                  Our vehicles are regularly maintained for fuel efficiency, and we
                  follow strict park regulations to preserve Rwanda's natural beauty.
                </p>
              </div>
            </Col>
            <Col md="6" className="mb-4">
              <div className="sustainability-item">
                <i className="bi bi-people"></i>
                <h4>Local Community Support</h4>
                <p>
                  We employ local guides, drivers, and staff, ensuring tourism
                  benefits stay within Rwanda. We partner with local hotels, shops,
                  and restaurants to support the economy.
                </p>
              </div>
            </Col>
            <Col md="6" className="mb-4">
              <div className="sustainability-item">
                <i className="bi bi-recycle"></i>
                <h4>Responsible Travel Policy</h4>
                <p>
                  We educate our clients on responsible travel practices, respect for
                  wildlife, and cultural sensitivity. We follow the "Leave No Trace"
                  principles in all our tours.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 8. Safety & Customer Care */}
      <section className="safety-section py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">Safety & Customer Care</h2>
              <p className="section-subtitle">
                Your safety and satisfaction are our top priorities
              </p>
            </Col>
          </Row>
          <Row>
            <Col md="4" className="mb-4">
              <div className="safety-item">
                <i className="bi bi-person-badge"></i>
                <h4>Trained Drivers</h4>
                <p>
                  All our drivers are professionally trained and certified for
                  mountain terrain and off-road driving. Regular safety assessments
                  ensure the highest standards.
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="safety-item">
                <i className="bi bi-shield-check"></i>
                <h4>Insured Vehicles</h4>
                <p>
                  All vehicles are fully insured and regularly serviced. We use
                  reliable 4x4 vehicles equipped for Rwanda's challenging terrain.
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="safety-item">
                <i className="bi bi-telephone"></i>
                <h4>Emergency Support</h4>
                <p>
                  24/7 emergency hotline available during all tours. We have
                  established relationships with local medical facilities and
                  emergency services.
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="safety-item">
                <i className="bi bi-heart-pulse"></i>
                <h4>First Aid Trained Guides</h4>
                <p>
                  All tour guides are certified in first aid and emergency response.
                  They carry first aid kits on every tour.
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="safety-item">
                <i className="bi bi-virus"></i>
                <h4>Health & Safety Protocols</h4>
                <p>
                  We follow strict health and safety protocols, including vehicle
                  sanitization, health checks, and park regulations compliance.
                </p>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="safety-item">
                <i className="bi bi-chat-dots"></i>
                <h4>Customer Care Excellence</h4>
                <p>
                  From initial inquiry to post-tour follow-up, we ensure exceptional
                  customer service. Your feedback helps us continuously improve.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 9. Company Statistics */}
      <section ref={statsRef} className="statistics-section py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">Our Achievements</h2>
            </Col>
          </Row>
          <Row>
            <Col md="3" sm="6" className="mb-4">
              <div className="stat-card">
                <i className="bi bi-people"></i>
                <h3 className="counter">{counters.travelers}+</h3>
                <p>Happy Travelers</p>
              </div>
            </Col>
            <Col md="3" sm="6" className="mb-4">
              <div className="stat-card">
                <i className="bi bi-ticket-perforated"></i>
                <h3 className="counter">{counters.permits}+</h3>
                <p>Gorilla Permits Arranged</p>
              </div>
            </Col>
            <Col md="3" sm="6" className="mb-4">
              <div className="stat-card">
                <i className="bi bi-briefcase"></i>
                <h3 className="counter">{counters.packages}+</h3>
                <p>Safari Packages</p>
              </div>
            </Col>
            <Col md="3" sm="6" className="mb-4">
              <div className="stat-card">
                <i className="bi bi-calendar-event"></i>
                <h3 className="counter">{counters.experience}+</h3>
                <p>Years Experience</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 10. Testimonials Preview */}
      <section className="testimonials-section py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">What Our Customers Say</h2>
              <p className="section-subtitle">Trusted by travelers from around the world</p>
            </Col>
          </Row>
          <Row>
            {testimonials.map((testimonial, index) => (
              <Col md="4" key={index} className="mb-4">
                <Card className="testimonial-card">
                  <Card.Body>
                    <div className="testimonial-rating mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="testimonial-comment">"{testimonial.comment}"</p>
                    <div className="testimonial-author">
                      <strong>{testimonial.name}</strong>
                      <span className="testimonial-country">
                        {testimonial.country} • {testimonial.date}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Row className="mt-4">
            <Col md="12" className="text-center">
              <div className="review-badges">
                <div className="badge-item">
                  <i className="bi bi-star-fill"></i>
                  <span>TripAdvisor Certificate of Excellence</span>
                </div>
                <div className="badge-item">
                  <i className="bi bi-google"></i>
                  <span>4.9/5 Google Reviews</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 11. Office Location & Contact Info */}
      <section className="location-section py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">Visit Our Office</h2>
            </Col>
          </Row>
          <Row>
            <Col md="6" className="mb-4">
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.477678563839!2d30.088936314753593!3d-1.9447379985734525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8f6b3%3A0x6e8a1b5a0c9e5c1d!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="400"
                  style={{ border: 0, borderRadius: "10px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Rwandagorillatrekk Office Location"
                ></iframe>
              </div>
            </Col>
            <Col md="6">
              <div className="contact-info">
                <h3>Contact Information</h3>
                <div className="contact-item">
                  <i className="bi bi-geo-alt-fill"></i>
                  <div>
                    <h5>Office Address</h5>
                    <p>KG 123 St, Kigali, Rwanda</p>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="bi bi-telephone-fill"></i>
                  <div>
                    <h5>Phone</h5>
                    <p>
                      <a href="tel:+250788123456">+250 788 123 456</a>
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="bi bi-whatsapp"></i>
                  <div>
                    <h5>WhatsApp</h5>
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
                <div className="contact-item">
                  <i className="bi bi-envelope-fill"></i>
                  <div>
                    <h5>Email</h5>
                    <p>
                      <a href="mailto:info@rwandagorillatrekk.com">
                        info@rwandagorillatrekk.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="bi bi-clock"></i>
                  <div>
                    <h5>Office Hours</h5>
                    <p>Monday - Sunday: 8:00 AM - 6:00 PM</p>
                    <p>Emergency Support: 24/7</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 12. Call To Action */}
      <section className="cta-section py-5">
        <div className="cta-overlay"></div>
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h2 className="cta-title">Ready to Experience Rwanda?</h2>
              <p className="cta-description">
                Join thousands of travelers who have trusted Rwandagorillatrekk for
                their Rwanda adventure
              </p>
              <div className="cta-buttons">
                <NavLink to="/services" className="primaryBtn me-3">
                  Book a Tour
                </NavLink>
                <NavLink to="/contact" className="secondary_btn me-3">
                  Contact Us
                </NavLink>
                <a
                  href="https://wa.me/250788123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <i className="bi bi-whatsapp"></i> Request Gorilla Permit
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default About;
