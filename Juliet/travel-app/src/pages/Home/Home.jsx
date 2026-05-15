import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./home.css";
import { destinationsData } from "../../utils/data";
import {
  fetchJson,
  resolveMediaUrl,
} from "../../utils/backendApi";
import fallbackDestImg from "../../assets/images/tour/bali-1.png";
import blogImgA from "../../assets/images/tour/paris.png";
import blogImgB from "../../assets/images/tour/phuket.png";
import blogImgC from "../../assets/images/tour/bali-1.png";
import testimonial1 from "../../assets/images/gallery/g1.jpg";
import testimonial2 from "../../assets/images/gallery/g3.jpg";
import testimonial3 from "../../assets/images/gallery/g4.jpg";

const STATIC_HOME_BLOG = [
  {
    id: "s1",
    title: "Best Time for Gorilla Trekking",
    text: "Discover the optimal seasons for gorilla trekking in Rwanda",
    image: blogImgA,
  },
  {
    id: "s2",
    title: "Rwanda Travel Tips",
    text: "Essential tips for first-time visitors to Rwanda",
    image: blogImgB,
  },
  {
    id: "s3",
    title: "Packing Guide for Safari",
    text: "Complete packing checklist for your Rwanda safari adventure",
    image: blogImgC,
  },
];

const STATIC_TESTIMONIALS = [
  {
    id: "t1",
    name: "Sarah Johnson",
    type: "Gorilla Trekking Experience",
    text: `"Unforgettable experience! The gorilla encounter was magical."`,
    image: testimonial1,
  },
  {
    id: "t2",
    name: "Michael Chen",
    type: "Wildlife Safari",
    text: `"Saw all Big Five! Professional guides and excellent service."`,
    image: testimonial2,
  },
  {
    id: "t3",
    name: "Emma Williams",
    type: "Complete Rwanda Tour",
    text: `"Best travel experience! Highly recommend to everyone."`,
    image: testimonial3,
  },
];

function mapDestinationsSlider(destinations) {
  return destinations.map((d) => {
    const first =
      Array.isArray(d.imageUrls) && d.imageUrls.length
        ? resolveMediaUrl(d.imageUrls[0])
        : "";
    const nPkgs = Array.isArray(d.linkedPackageIds) ? d.linkedPackageIds.length : 0;
    return {
      id: d.id,
      name: d.name,
      tours: `${nPkgs} package${nPkgs === 1 ? "" : "s"}`,
      image: first || fallbackDestImg,
      link: "packages",
    };
  });
}

const Home = () => {
  const [sliderDestinations, setSliderDestinations] = useState(destinationsData);
  const [homeBlogPosts, setHomeBlogPosts] = useState(null);
  const [homeTestimonials, setHomeTestimonials] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [quickBooking, setQuickBooking] = useState({
    serviceType: "",
    travelers: "",
    budget: "",
  });

  // 5. Live Gorilla Permit Status
  const [permitStatus, setPermitStatus] = useState({
    available: true,
    count: 12,
    nextDate: "2024-04-15",
    price: 1500,
  });

  // Countdown timer for permit
  useEffect(() => {
    const timer = setInterval(() => {
      // Update countdown logic here
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dests, posts, reviews] = await Promise.all([
          fetchJson("/api/destinations"),
          fetchJson("/api/blog/posts"),
          fetchJson("/api/reviews"),
        ]);
        if (cancelled) return;
        if (Array.isArray(dests) && dests.length > 0) {
          setSliderDestinations(mapDestinationsSlider(dests));
        }
        if (Array.isArray(posts) && posts.length > 0) {
          const published = posts.filter((p) => p && p.published !== false).slice(0, 8);
          if (published.length) {
            const mapped = published.slice(0, 3).map((p, idx) => {
              const cov = resolveMediaUrl(p.coverImageUrl);
              return {
                id: p.id,
                title: p.title,
                text: (p.excerpt || "").slice(0, 120) || "Read more on our blog",
                image:
                  cov ||
                  [blogImgA, blogImgB, blogImgC][idx % 3],
              };
            });
            setHomeBlogPosts(mapped);
          }
        }
        if (Array.isArray(reviews) && reviews.length > 0) {
          const ok = reviews.filter((r) => r.status === "approved").slice(0, 8);
          if (ok.length) {
            const shots = [testimonial1, testimonial2, testimonial3];
            setHomeTestimonials(
              ok.slice(0, 3).map((r, i) => ({
                id: r.id,
                name: "Verified traveler",
                type: `${r.rating}-star tour review`,
                text: `"${(r.comment || "").slice(0, 220)}${(r.comment || "").length > 220 ? "…" : ""}"`,
                image: shots[i % shots.length],
              })),
            );
          }
        }
      } catch {
        /* keep static slides */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleQuickBooking = (e) => {
    e.preventDefault();
    // Redirect to packages with filters
    window.location.href = `/packages?service=${quickBooking.serviceType}&travelers=${quickBooking.travelers}`;
  };

  return (
    <div className="home-page">
      {/* 1. Immersive Hero Section */}
      <section className="hero-section">
        <div className="hero-video-overlay"></div>
        <div className="hero-content">
          <Container>
            <Row>
              <Col md="12" className="text-center">
                <h1 className="hero-title animated-headline">
                  Experience Rwanda Like Never Before
                </h1>
                <p className="hero-subtitle">
                  Gorilla trekking, wildlife safaris, car hire & airport transfers
                </p>
                <div className="hero-ctas">
                  <Button className="primaryBtn hero-btn" as={NavLink} to="/packages">
                    Book a Tour
                  </Button>
                  <Button
                    variant="outline-light"
                    className="hero-btn"
                    as={NavLink}
                    to="/packages"
                  >
                    Check Gorilla Permits
                  </Button>
                  <a
                    href="https://wa.me/250788123456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-hero-btn hero-btn"
                  >
                    <i className="bi bi-whatsapp"></i> Chat on WhatsApp
                  </a>
                </div>
                <div className="scroll-indicator">
                  <i className="bi bi-chevron-down"></i>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* 2. Smart Quick-Booking Widget */}
      <section className="quick-booking-widget">
        <Container>
          <Row>
            <Col md="12">
              <Card className="booking-card">
                <Card.Body>
                  <h3 className="booking-title">Get Instant Quote</h3>
                  <Form onSubmit={handleQuickBooking}>
                    <Row className="align-items-end">
                      <Col md="3" sm="6" className="mb-3">
                        <Form.Label>Service Type</Form.Label>
                        <Form.Select
                          value={quickBooking.serviceType}
                          onChange={(e) =>
                            setQuickBooking({
                              ...quickBooking,
                              serviceType: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Service</option>
                          <option value="gorilla">Gorilla Trekking</option>
                          <option value="safari">Wildlife Safari</option>
                          <option value="car-hire">Car Hire</option>
                          <option value="airport">Airport Transfer</option>
                        </Form.Select>
                      </Col>
                      <Col md="3" sm="6" className="mb-3">
                        <Form.Label>Travel Date</Form.Label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={setSelectedDate}
                          minDate={new Date()}
                          className="form-control"
                          dateFormat="MM/dd/yyyy"
                          placeholderText="Select date"
                          required
                        />
                      </Col>
                      <Col md="2" sm="6" className="mb-3">
                        <Form.Label>Travelers</Form.Label>
                        <Form.Select
                          value={quickBooking.travelers}
                          onChange={(e) =>
                            setQuickBooking({
                              ...quickBooking,
                              travelers: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">People</option>
                          {[...Array(20)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md="2" sm="6" className="mb-3">
                        <Form.Label>Budget Range</Form.Label>
                        <Form.Select
                          value={quickBooking.budget}
                          onChange={(e) =>
                            setQuickBooking({
                              ...quickBooking,
                              budget: e.target.value,
                            })
                          }
                        >
                          <option value="">Any Budget</option>
                          <option value="0-1000">Under $1,000</option>
                          <option value="1000-2000">$1,000 - $2,000</option>
                          <option value="2000-3000">$2,000 - $3,000</option>
                          <option value="3000+">$3,000+</option>
                        </Form.Select>
                      </Col>
                      <Col md="2" className="mb-3">
                        <Button type="submit" className="primaryBtn w-100">
                          Get Quote
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 3. Trust Signals */}
      <section className="trust-signals py-4">
        <Container>
          <Row className="align-items-center">
            <Col md="2" sm="4" className="text-center mb-3">
              <div className="trust-item">
                <i className="bi bi-shield-check"></i>
                <p>RDB Licensed</p>
              </div>
            </Col>
            <Col md="2" sm="4" className="text-center mb-3">
              <div className="trust-item">
                <i className="bi bi-credit-card"></i>
                <p>Secure Payment</p>
              </div>
            </Col>
            <Col md="2" sm="4" className="text-center mb-3">
              <div className="trust-item">
                <i className="bi bi-star-fill"></i>
                <p>4.9/5 Rating</p>
              </div>
            </Col>
            <Col md="2" sm="4" className="text-center mb-3">
              <div className="trust-item">
                <i className="bi bi-geo-alt"></i>
                <p>Based in Rwanda 🇷🇼</p>
              </div>
            </Col>
            <Col md="2" sm="4" className="text-center mb-3">
              <div className="trust-item">
                <i className="bi bi-calendar-check"></i>
                <p>10+ Years Experience</p>
              </div>
            </Col>
            <Col md="2" sm="4" className="text-center mb-3">
              <div className="trust-item">
                <i className="bi bi-people"></i>
                <p>1,000+ Happy Travelers</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 5. Live Gorilla Permit Status */}
      <section className="permit-status-section py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-4">
              <h2 className="section-title">🦍 Live Gorilla Permit Status</h2>
            </Col>
            <Col md="8" className="mx-auto">
              <Card className="permit-status-card">
                <Card.Body className="text-center">
                  <div className="permit-status-indicator">
                    {permitStatus.available ? (
                      <Badge className="badge-available">
                        <i className="bi bi-check-circle"></i> Available Today
                      </Badge>
                    ) : (
                      <Badge className="badge-unavailable">
                        <i className="bi bi-x-circle"></i> Limited Availability
                      </Badge>
                    )}
                  </div>
                  <h3 className="permit-count">{permitStatus.count} Permits Available</h3>
                  <p className="permit-info">
                    Next available date: <strong>{permitStatus.nextDate}</strong>
                  </p>
                  <p className="permit-price">${permitStatus.price} per person</p>
                  <Button
                    className="primaryBtn mt-3"
                    as={NavLink}
                    to="/contact"
                  >
                    <i className="bi bi-ticket-perforated"></i> Reserve Permit Now
                  </Button>
                  <p className="permit-note mt-3">
                    <i className="bi bi-exclamation-triangle"></i> Permits sell out quickly. Book in advance!
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 4. Featured Experiences */}
      <section className="featured-experiences py-5">
        <Container>
          <Row>
            <Col md="12" className="mb-4 text-center">
              <h2 className="section-title">Featured Experiences</h2>
              <p className="section-subtitle">
                Discover Rwanda's most unforgettable adventures
              </p>
            </Col>
          </Row>
          <Row>
            <Col md="3" sm="6" className="mb-4">
              <Card className="experience-card gorilla-card">
                <Card.Img
                  variant="top"
                  src={require("../../assets/images/tour/bali-1.png")}
                />
                <Card.Body>
                  <div className="experience-icon">🦍</div>
                  <Card.Title>Gorilla Trekking</Card.Title>
                  <Card.Text>
                    Meet mountain gorillas in their natural habitat at Volcanoes
                    National Park
                  </Card.Text>
                  <div className="experience-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as={NavLink}
                      to="/destinations"
                    >
                      View Experience
                    </Button>
                    <Button
                      className="primaryBtn"
                      size="sm"
                      as={NavLink}
                      to="/packages"
                    >
                      Book Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md="3" sm="6" className="mb-4">
              <Card className="experience-card safari-card">
                <Card.Img
                  variant="top"
                  src={require("../../assets/images/tour/bangkok.png")}
                />
                <Card.Body>
                  <div className="experience-icon">🦁</div>
                  <Card.Title>Akagera Big Five Safari</Card.Title>
                  <Card.Text>
                    Spot lions, elephants, rhinos, leopards, and buffalo in
                    Akagera National Park
                  </Card.Text>
                  <div className="experience-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as={NavLink}
                      to="/destinations"
                    >
                      View Experience
                    </Button>
                    <Button
                      className="primaryBtn"
                      size="sm"
                      as={NavLink}
                      to="/packages"
                    >
                      Book Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md="3" sm="6" className="mb-4">
              <Card className="experience-card canopy-card">
                <Card.Img
                  variant="top"
                  src={require("../../assets/images/tour/cancun.png")}
                />
                <Card.Body>
                  <div className="experience-icon">🌉</div>
                  <Card.Title>Nyungwe Canopy Walk</Card.Title>
                  <Card.Text>
                    Walk 160m above the forest floor on Africa's longest canopy
                    walkway
                  </Card.Text>
                  <div className="experience-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as={NavLink}
                      to="/destinations"
                    >
                      View Experience
                    </Button>
                    <Button
                      className="primaryBtn"
                      size="sm"
                      as={NavLink}
                      to="/packages"
                    >
                      Book Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md="3" sm="6" className="mb-4">
              <Card className="experience-card city-card">
                <Card.Img
                  variant="top"
                  src={require("../../assets/images/tour/malaysia.png")}
                />
                <Card.Body>
                  <div className="experience-icon">🌆</div>
                  <Card.Title>Kigali City Tour</Card.Title>
                  <Card.Text>
                    Explore Rwanda's vibrant capital with cultural visits and
                    local markets
                  </Card.Text>
                  <div className="experience-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as={NavLink}
                      to="/destinations"
                    >
                      View Experience
                    </Button>
                    <Button
                      className="primaryBtn"
                      size="sm"
                      as={NavLink}
                      to="/packages"
                    >
                      Book Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 6. Interactive Rwanda Map */}
      <section className="interactive-map py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="mb-4 text-center">
              <h2 className="section-title">Explore Rwanda</h2>
              <p className="section-subtitle">
                Click on destinations to discover tours and experiences
              </p>
            </Col>
            <Col md="12">
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.477678563839!2d30.088936314753593!3d-1.9447379985734525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8f6b3%3A0x6e8a1b5a0c9e5c1d!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="500"
                  style={{ border: 0, borderRadius: "10px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Rwanda Interactive Map"
                ></iframe>
              </div>
              <div className="map-destinations mt-4">
                <Row>
                  <Col md="3" sm="6" className="mb-3">
                    <div className="map-destination-item" onClick={() => window.location.href = '/destinations'}>
                      <i className="bi bi-geo-alt-fill"></i>
                      <h5>Volcanoes NP</h5>
                      <p>Gorilla Trekking</p>
                    </div>
                  </Col>
                  <Col md="3" sm="6" className="mb-3">
                    <div className="map-destination-item" onClick={() => window.location.href = '/destinations'}>
                      <i className="bi bi-geo-alt-fill"></i>
                      <h5>Akagera NP</h5>
                      <p>Big Five Safari</p>
                    </div>
                  </Col>
                  <Col md="3" sm="6" className="mb-3">
                    <div className="map-destination-item" onClick={() => window.location.href = '/destinations'}>
                      <i className="bi bi-geo-alt-fill"></i>
                      <h5>Nyungwe Forest</h5>
                      <p>Canopy Walk</p>
                    </div>
                  </Col>
                  <Col md="3" sm="6" className="mb-3">
                    <div className="map-destination-item" onClick={() => window.location.href = '/destinations'}>
                      <i className="bi bi-geo-alt-fill"></i>
                      <h5>Kigali</h5>
                      <p>City Tours</p>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 7. Best-Selling Packages Carousel */}
      <section className="best-selling py-5">
        <Container>
          <Row>
            <Col md="12" className="mb-4">
              <div className="main_heading">
                <h1>Best-Selling Packages</h1>
                <p className="section-subtitle">
                  Most popular tours chosen by travelers
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Slider {...sliderSettings}>
                {sliderDestinations.map((destination, idx) => (
                  <div key={destination.id || idx}>
                    <Card className="package-card">
                      <Card.Img
                        variant="top"
                        src={destination.image}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <Badge className="package-badge">Best Seller</Badge>
                      <Card.Body>
                        <Card.Title>{destination.name}</Card.Title>
                        <div className="package-rating mb-2">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className="bi bi-star-fill"
                              style={{ color: "#ffc107" }}
                            ></i>
                          ))}
                          <span className="ms-2">(4.9)</span>
                        </div>
                        <div className="package-price mb-3">
                          <span className="price">$1,500</span>
                          <span className="period">/person</span>
                        </div>
                        <Button
                          className="primaryBtn w-100"
                          as={NavLink}
                          to="/packages"
                        >
                          Book Now
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </Slider>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 8. Personalized Recommendations */}
      <section className="recommendations py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="mb-4 text-center">
              <h2 className="section-title">Recommended For You</h2>
              <p className="section-subtitle">
                Based on popular choices from travelers like you
              </p>
            </Col>
            <Col md="6" className="mb-4">
              <Card className="recommendation-card">
                <Card.Body>
                  <Badge className="recommendation-badge">
                    <i className="bi bi-globe"></i> Popular in Rwanda
                  </Badge>
                  <h4>3-Day Gorilla Trekking Adventure</h4>
                  <p>
                    Visitors often choose this package for its
                    perfect balance of adventure and comfort in Rwanda.
                  </p>
                  <Button className="primaryBtn" as={NavLink} to="/packages">
                    View Package
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md="6" className="mb-4">
              <Card className="recommendation-card">
                <Card.Body>
                  <Badge className="recommendation-badge">
                    <i className="bi bi-clock"></i> Quick Decision
                  </Badge>
                  <h4>5-Day Wildlife Safari Package</h4>
                  <p>
                    Perfect for travelers who want to experience the Big Five
                    in a comprehensive safari experience.
                  </p>
                  <Button className="primaryBtn" as={NavLink} to="/packages">
                    View Package
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 9. Video Testimonials */}
      <section className="video-testimonials py-5">
        <Container>
          <Row>
            <Col md="12" className="mb-4 text-center">
              <h2 className="section-title">What Our Travelers Say</h2>
            </Col>
          </Row>
          <Row>
            {(homeTestimonials?.length ? homeTestimonials : STATIC_TESTIMONIALS).map(
              (t) => (
                <Col md="4" className="mb-4" key={t.id}>
                  <Card className="testimonial-card">
                    <div className="testimonial-video">
                      <img src={t.image} alt="Testimonial" className="w-100" />
                      <div className="play-button">
                        <i className="bi bi-play-circle"></i>
                      </div>
                      <Badge className="country-badge">🇷🇼 Rwanda</Badge>
                    </div>
                    <Card.Body>
                      <h5>{t.name}</h5>
                      <p className="testimonial-type">{t.type}</p>
                      <p className="testimonial-text">{t.text}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ),
            )}
          </Row>
        </Container>
      </section>

      {/* 11. Sustainability & Local Impact */}
      <section className="sustainability py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="mb-4 text-center">
              <h2 className="section-title">Our Commitment to Rwanda</h2>
            </Col>
          </Row>
          <Row>
            <Col md="3" sm="6" className="mb-4 text-center">
              <div className="sustainability-item">
                <i className="bi bi-tree"></i>
                <h5>Gorilla Conservation</h5>
                <p>Supporting wildlife protection through responsible tourism</p>
              </div>
            </Col>
            <Col md="3" sm="6" className="mb-4 text-center">
              <div className="sustainability-item">
                <i className="bi bi-people"></i>
                <h5>Local Guides</h5>
                <p>100% Rwandan team with deep local knowledge</p>
              </div>
            </Col>
            <Col md="3" sm="6" className="mb-4 text-center">
              <div className="sustainability-item">
                <i className="bi bi-house-heart"></i>
                <h5>Community Support</h5>
                <p>Empowering local communities through tourism</p>
              </div>
            </Col>
            <Col md="3" sm="6" className="mb-4 text-center">
              <div className="sustainability-item">
                <i className="bi bi-leaf"></i>
                <h5>Eco-Friendly</h5>
                <p>Sustainable travel practices for future generations</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 13. Travel Inspiration Blog Preview */}
      <section className="blog-preview py-5">
        <Container>
          <Row>
            <Col md="12" className="mb-4">
              <div className="main_heading">
                <h1>Travel Inspiration</h1>
                <p className="section-subtitle">
                  Latest tips and guides for your Rwanda adventure
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            {(homeBlogPosts?.length ? homeBlogPosts : STATIC_HOME_BLOG).map((post) => (
              <Col md="4" className="mb-4" key={post.id}>
                <Card className="blog-preview-card">
                  <Card.Img variant="top" src={post.image} />
                  <Card.Body>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.text}</Card.Text>
                    <Button variant="outline-primary" size="sm" as={NavLink} to="/blog">
                      Read More
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 14. Strong Conversion CTA Section */}
      <section className="final-cta py-5">
        <div className="cta-overlay"></div>
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h2 className="cta-title">Ready to Explore Rwanda?</h2>
              <p className="cta-description">
                Let our expert team create an unforgettable adventure for you
              </p>
              <div className="cta-buttons">
                <Button className="primaryBtn me-3" as={NavLink} to="/packages">
                  Plan My Trip
                </Button>
                <Button
                  variant="outline-light"
                  className="me-3"
                  as={NavLink}
                  to="/contact"
                >
                  Request Custom Tour
                </Button>
                <a
                  href="https://wa.me/250788123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <i className="bi bi-whatsapp"></i> Chat Now
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 10. Instant Communication Hub (Sticky) */}
      <div className="instant-communication-hub">
        <a
          href="https://wa.me/250788123456?text=Hello, I'd like to plan a Rwanda safari."
          target="_blank"
          rel="noopener noreferrer"
          className="comm-btn whatsapp-btn"
          title="WhatsApp"
        >
          <i className="bi bi-whatsapp"></i>
        </a>
        <a
          href="tel:+250788123456"
          className="comm-btn call-btn"
          title="Call Now"
        >
          <i className="bi bi-telephone-fill"></i>
        </a>
        <a
          href="mailto:info@rwandagorillatrekk.com"
          className="comm-btn email-btn"
          title="Email"
        >
          <i className="bi bi-envelope-fill"></i>
        </a>
      </div>
    </div>
  );
};

export default Home;