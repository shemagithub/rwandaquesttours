import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Accordion } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import "../Services/services.css";
import "./car-rental.css";
import { apiUrl, resolveMediaUrl as resolveApiMediaUrl } from "../../utils/backendApi";
import economyImg from "../../assets/images/car-rental/economy.jpg";
import compactSuvImg from "../../assets/images/car-rental/compact-suv.jpg";
import safari4x4Img from "../../assets/images/car-rental/safari-4x4.jpg";
import luxurySuvImg from "../../assets/images/car-rental/luxury-suv.jpg";

/** YYYY-MM-DD in local timezone (avoids UTC shift from toISOString). */
function toLocalYmd(d) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const FALLBACK_IMAGE_BY_SLUG = {
  economy: economyImg,
  suv: compactSuvImg,
  fourbyfour: safari4x4Img,
  luxury: luxurySuvImg,
};

const FALLBACK_FLEET = [
  {
    id: "economy",
    slug: "economy",
    badge: "City & airport",
    title: "Economy",
    priceFrom: 35,
    specs: [
      { icon: "bi-people", text: "4 seats" },
      { icon: "bi-suitcase2", text: "2 bags" },
      { icon: "bi-fuel-pump", text: "Petrol, efficient" },
      { icon: "bi-gear", text: "Manual / Auto" },
    ],
    blurb: "Ideal for Kigali city runs, meetings, and short transfers.",
    imageSrc: economyImg,
  },
  {
    id: "suv",
    slug: "suv",
    badge: "Family & comfort",
    title: "Compact SUV",
    priceFrom: 75,
    specs: [
      { icon: "bi-people", text: "5 seats" },
      { icon: "bi-suitcase2", text: "4 bags" },
      { icon: "bi-moon-stars", text: "A/C, elevated ride" },
      { icon: "bi-shield-check", text: "Full safety kit" },
    ],
    blurb: "Room for family luggage and lake or park drives in comfort.",
    imageSrc: compactSuvImg,
  },
  {
    id: "fourbyfour",
    slug: "fourbyfour",
    badge: "Safari & parks",
    title: "4×4 Safari",
    priceFrom: 120,
    specs: [
      { icon: "bi-people", text: "5–7 seats" },
      { icon: "bi-tree", text: "Wildlife & unpaved roads" },
      { icon: "bi-cloud-rain", text: "All-weather capable" },
      { icon: "bi-wrench-adjustable", text: "Spare & tools included" },
    ],
    blurb: "Built for Volcanoes, Akagera, and Nyungwe access roads.",
    imageSrc: safari4x4Img,
  },
  {
    id: "luxury",
    slug: "luxury",
    badge: "Executive",
    title: "Luxury SUV",
    priceFrom: 180,
    specs: [
      { icon: "bi-people", text: "4–5 seats" },
      { icon: "bi-star", text: "Leather, premium sound" },
      { icon: "bi-person-badge", text: "Chauffeur available" },
      { icon: "bi-airplane", text: "VIP airport meet" },
    ],
    blurb: "Business delegations, VIP airport pickups, and bespoke itineraries.",
    imageSrc: luxurySuvImg,
  },
];

function normalizeCatalogToFleet(apiRows) {
  if (!Array.isArray(apiRows) || apiRows.length === 0) return null;
  return apiRows.map((v) => {
    const slug = String(v.slug || "").trim();
    const rawImg = String(v.imageUrl || "").trim();
    let imageSrc = FALLBACK_IMAGE_BY_SLUG[slug] || economyImg;
    if (rawImg) {
      const resolved = resolveApiMediaUrl(rawImg);
      if (resolved) imageSrc = resolved;
    }
    return {
      id: String(v.id || slug),
      slug,
      badge: String(v.badge || ""),
      title: String(v.title || slug),
      priceFrom: Number(v.dailyPriceUsd ?? 0),
      specs: Array.isArray(v.specs) ? v.specs : [],
      blurb: String(v.blurb || ""),
      imageSrc,
    };
  });
}

const CarRental = () => {
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fleet, setFleet] = useState(FALLBACK_FLEET);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleClass: "economy",
    pickupLocation: "",
    returnLocation: "",
    driverOption: "self-drive",
    extras: {
      childSeat: false,
      rooftopBox: false,
      additionalDriver: false,
    },
    message: "",
  });

  useEffect(() => {
    const ac = new AbortController();
    fetch(apiUrl("/api/car-rental-vehicles/catalog"), { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        const nextFleet = normalizeCatalogToFleet(json);
        if (!nextFleet) return;
        setFleet(nextFleet);
        setForm((prev) => {
          const ok = nextFleet.some((x) => x.slug === prev.vehicleClass);
          return ok ? prev : { ...prev, vehicleClass: nextFleet[0].slug };
        });
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const features = [
    {
      icon: "bi-shield-lock",
      title: "Comprehensive cover",
      text: "Collision and theft options with clear excess amounts. Optional zero-excess upgrade on selected vehicles.",
    },
    {
      icon: "bi-geo-alt",
      title: "GPS & local guidance",
      text: "Add GPS or request route tips for gorilla trekking hubs, border crossings, and park gates.",
    },
    {
      icon: "bi-headset",
      title: "24/7 roadside support",
      text: "Breakdown and incident hotline across Rwanda with coordinated tow or replacement where available.",
    },
    {
      icon: "bi-speedometer2",
      title: "Fair mileage",
      text: "Standard daily allowances with unlimited mileage packages for multi-day safaris and cross-country loops.",
    },
    {
      icon: "bi-person-workspace",
      title: "Professional drivers",
      text: "Licensed chauffeurs for long drives, night arrivals, or when you prefer to focus on the scenery.",
    },
    {
      icon: "bi-passport",
      title: "Cross-border paperwork",
      text: "Assistance with permits and insurance extensions for regional travel (where legally permitted).",
    },
  ];

  const reviews = [
    {
      name: "Sarah M.",
      rating: 5,
      comment:
        "4×4 was spotless and ready at Kigali airport. Drop-off at the hotel was seamless after our trek.",
      date: "2025-11-02",
    },
    {
      name: "Daniel K.",
      rating: 5,
      comment:
        "Clear pricing, no surprises. Added a driver for Akagera — worth every franc.",
      date: "2025-10-18",
    },
    {
      name: "Emma L.",
      rating: 5,
      comment:
        "Booked an SUV for Lake Kivu. Child seat was installed before we arrived.",
      date: "2025-09-30",
    },
  ];

  const faqs = [
    {
      q: "What documents do I need to rent?",
      a: "Valid passport or national ID, a driving licence held for at least 2 years (international permit recommended for visitors), and a credit or debit card for the security hold.",
    },
    {
      q: "Is fuel included?",
      a: "Vehicles are supplied with a documented fuel level and should be returned at the same level unless you purchase a prepaid fuel bundle.",
    },
    {
      q: "Can I drive to Uganda or other neighbours?",
      a: "Cross-border travel requires advance approval, extended insurance, and correct vehicle documentation. Tell us your itinerary so we can prepare permits.",
    },
    {
      q: "What about gravel roads and national parks?",
      a: "4×4 safari vehicles are approved for park access routes. Standard economy cars are not suitable for deep gravel or off-road sectors.",
    },
    {
      q: "Cancellation policy?",
      a: "Free cancellation up to 48 hours before pickup on many rates. Closer to pickup, partial charges may apply — your quote will state the exact terms.",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupDate || !returnDate) {
      alert("Please select both pickup and return dates.");
      return;
    }
    const pickupIso = toLocalYmd(pickupDate);
    const returnIso = toLocalYmd(returnDate);
    if (returnIso < pickupIso) {
      alert("Return date cannot be before pickup date.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/car-rental-requests"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          vehicleClass: form.vehicleClass,
          pickupDate: pickupIso,
          returnDate: returnIso,
          pickupLocation: form.pickupLocation,
          returnLocation: form.returnLocation,
          driverOption: form.driverOption,
          extras: form.extras,
          message: form.message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not submit request. Try again later.");
      }
      alert(
        "Rental request received. Our team will confirm vehicle availability and send a secure payment link."
      );
      setForm({
        name: "",
        email: "",
        phone: "",
        vehicleClass: "economy",
        pickupLocation: "",
        returnLocation: "",
        driverOption: "self-drive",
        extras: { childSeat: false, rooftopBox: false, additionalDriver: false },
        message: "",
      });
      setPickupDate(null);
      setReturnDate(null);
    } catch (err) {
      alert(err?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("extra_")) {
      const key = name.replace("extra_", "");
      setForm((prev) => ({
        ...prev,
        extras: { ...prev.extras, [key]: checked },
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const stars = (n) =>
    [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`bi ${i < n ? "bi-star-fill" : "bi-star"}`}
        style={{ color: i < n ? "#ffc107" : "#ddd" }}
      />
    ));

  return (
    <div className="services-page car-rental-page">
      <section className="service-hero">
        <div className="hero-overlay" />
        <Container>
          <Row>
            <Col md="12">
              <div className="hero-content">
                <h1 className="hero-title">Car Rental in Rwanda</h1>
                <p className="hero-description">
                  Self-drive or chauffeured vehicles from Kigali — economy city cars to
                  4×4 safari rigs for gorilla trekking and national parks. Transparent
                  rates, full paperwork support, and roadside backup.
                </p>
                <div className="hero-buttons">
                  <a href="#rental-booking" className="primaryBtn">
                    Reserve a Vehicle
                  </a>
                  <a
                    href="https://wa.me/250788123456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn"
                  >
                    <i className="bi bi-whatsapp" /> WhatsApp Fleet Desk
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="service-overview py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-4">
              <h2 className="section-title">Why Book With Us</h2>
              <p className="text-muted mb-0">
                Airport handovers, park-ready 4×4s, and drivers who know Rwanda&apos;s
                roads.
              </p>
            </Col>
          </Row>
          <Row>
            <Col md="3" sm="6" className="mb-4">
              <div className="overview-item">
                <i className="bi bi-car-front" />
                <h4>Modern fleet</h4>
                <ul>
                  <li>Regular servicing</li>
                  <li>Deep cleaned between hires</li>
                  <li>Safety checks logged</li>
                </ul>
              </div>
            </Col>
            <Col md="3" sm="6" className="mb-4">
              <div className="overview-item">
                <i className="bi bi-file-earmark-check" />
                <h4>Clear contracts</h4>
                <ul>
                  <li>Insurance tiers explained</li>
                  <li>Mileage in plain language</li>
                  <li>No hidden admin fees</li>
                </ul>
              </div>
            </Col>
            <Col md="3" sm="6" className="mb-4">
              <div className="overview-item">
                <i className="bi bi-lightning-charge" />
                <h4>Fast pickup</h4>
                <ul>
                  <li>KGL airport desk</li>
                  <li>Hotel delivery option</li>
                  <li>After-hours on request</li>
                </ul>
              </div>
            </Col>
            <Col md="3" sm="6" className="mb-4">
              <div className="overview-item">
                <i className="bi bi-people" />
                <h4>Local expertise</h4>
                <ul>
                  <li>Safari routing advice</li>
                  <li>Park gate timings</li>
                  <li>Backup vehicle network</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="fleet-section py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">Choose Your Vehicle</h2>
              <p className="text-muted">
                Sample daily rates from — final quote depends on season, length of hire,
                and add-ons.
              </p>
            </Col>
          </Row>
          <Row>
            {fleet.map((v) => (
              <Col lg="3" md="6" className="mb-4" key={v.id}>
                <div className="fleet-card">
                  <div className="fleet-card-image-wrap">
                    <img
                      src={v.imageSrc}
                      alt={`${v.title} rental — ${v.badge}`}
                      loading="lazy"
                      width="900"
                      height="563"
                    />
                  </div>
                  <div className="fleet-card-body">
                    <span className="fleet-badge">{v.badge}</span>
                    <h3 className="fleet-title">{v.title}</h3>
                    <div className="fleet-price">
                      from ${v.priceFrom}
                      <small> / day</small>
                    </div>
                    <p className="text-muted small mb-3">{v.blurb}</p>
                    <ul className="fleet-specs">
                      {v.specs.map((s, i) => (
                        <li key={`${v.slug}-spec-${i}`}>
                          <i className={`bi ${s.icon}`} />
                          {s.text}
                        </li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      className="primaryBtn w-100"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, vehicleClass: v.slug }));
                        document
                          .getElementById("rental-booking")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Request this class
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="py-5 car-feature-grid">
        <Container>
          <Row className="mb-4">
            <Col md="12" className="text-center">
              <h2 className="section-title">Features &amp; Add-Ons</h2>
            </Col>
          </Row>
          <Row>
            {features.map((f) => (
              <Col md="6" lg="4" className="mb-4" key={f.title}>
                <div className="feature-tile">
                  <i className={`bi ${f.icon}`} />
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.text}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="service-details py-5 bg-light">
        <Container>
          <Row>
            <Col md="12">
              <h2 className="section-title mb-4">Rental Essentials</h2>
            </Col>
            <Col md="8">
              <div className="details-content">
                <h3>How hiring works</h3>
                <ol>
                  <li>
                    <strong>Choose dates &amp; vehicle:</strong> submit the form or
                    WhatsApp your itinerary.
                  </li>
                  <li>
                    <strong>Confirmation:</strong> we confirm availability, insurance
                    tier, and total price.
                  </li>
                  <li>
                    <strong>Pickup:</strong> inspect the car together, note fuel &
                    condition on the sheet.
                  </li>
                  <li>
                    <strong>On the road:</strong> call the hotline for incidents or
                    mechanical issues.
                  </li>
                  <li>
                    <strong>Return:</strong> refuel as agreed, hand back keys, release
                    deposit after inspection.
                  </li>
                </ol>
                <h4 className="mt-4">Driver requirements</h4>
                <ul>
                  <li>Minimum age 23 for compact cars, 25 for 4×4 and luxury.</li>
                  <li>Valid licence and passport copy on file.</li>
                  <li>No off-roading outside permitted routes for non-4×4 vehicles.</li>
                </ul>
              </div>
            </Col>
            <Col md="4">
              <div className="requirements-box">
                <h4>Included with every rental</h4>
                <div className="info-item">
                  <i className="bi bi-tools" />
                  <span>Spare tyre &amp; basic toolkit (4×4)</span>
                </div>
                <div className="info-item">
                  <i className="bi bi-file-medical" />
                  <span>First aid &amp; reflective vest</span>
                </div>
                <div className="info-item">
                  <i className="bi bi-droplet-half" />
                  <span>Windscreen fluid top-up</span>
                </div>
                <div className="info-item">
                  <i className="bi bi-life-preserver" />
                  <span>Roadside number sticker inside cabin</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="pricing-section py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">Protection Packages</h2>
            </Col>
          </Row>
          <Row>
            <Col md="4" className="mb-4">
              <div className="pricing-card">
                <h3>Basic</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">9</span>
                  <span className="period">/day</span>
                </div>
                <ul className="price-features">
                  <li>
                    <i className="bi bi-check" /> Third-party liability
                  </li>
                  <li>
                    <i className="bi bi-check" /> Standard excess applies
                  </li>
                  <li>
                    <i className="bi bi-x" /> Tyre &amp; glass waiver
                  </li>
                </ul>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="pricing-card featured">
                <div className="badge">Recommended</div>
                <h3>Comfort</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">19</span>
                  <span className="period">/day</span>
                </div>
                <ul className="price-features">
                  <li>
                    <i className="bi bi-check" /> Reduced collision excess
                  </li>
                  <li>
                    <i className="bi bi-check" /> Theft cover improvement
                  </li>
                  <li>
                    <i className="bi bi-check" /> Single-vehicle incident support
                  </li>
                </ul>
              </div>
            </Col>
            <Col md="4" className="mb-4">
              <div className="pricing-card">
                <h3>Premium</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">29</span>
                  <span className="period">/day</span>
                </div>
                <ul className="price-features">
                  <li>
                    <i className="bi bi-check" /> Lowest excess tier
                  </li>
                  <li>
                    <i className="bi bi-check" /> Glass &amp; tyre bundle
                  </li>
                  <li>
                    <i className="bi bi-check" /> Priority replacement vehicle
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
          <Row className="mt-2 inclusions-grid">
            <Col md="6" className="mb-4">
              <div className="inc-card">
                <h5>Popular add-ons</h5>
                <ul>
                  <li>Roof rack / cargo box for filming gear</li>
                  <li>Child and booster seats (EU/RWF certified)</li>
                  <li>Extra named driver</li>
                  <li>After-hours airport delivery</li>
                  <li>Unlimited mileage blocks (7+ days)</li>
                </ul>
              </div>
            </Col>
            <Col md="6" className="mb-4">
              <div className="inc-card">
                <h5>Not covered (typical)</h5>
                <ul>
                  <li>Tyres damaged by deliberate off-roading</li>
                  <li>Interior burns, stains, or lost accessories</li>
                  <li>Fines and traffic violations</li>
                  <li>Fuel shortfall on return</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section id="rental-booking" className="booking-section py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-4">
              <h2 className="section-title">Request a Quote</h2>
              <p>We&apos;ll confirm vehicle availability and send a detailed quote.</p>
            </Col>
          </Row>
          <Row>
            <Col md="8" className="mx-auto">
              <Form onSubmit={handleSubmit} className="booking-form">
                <Row>
                  <Col md="6" className="mb-3">
                    <Form.Label>Full name *</Form.Label>
                    <Form.Control
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md="6" className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md="6" className="mb-3">
                    <Form.Label>Phone / WhatsApp *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md="6" className="mb-3">
                    <Form.Label>Vehicle class *</Form.Label>
                    <Form.Select
                      name="vehicleClass"
                      value={form.vehicleClass}
                      onChange={handleChange}
                      required
                    >
                      {fleet.map((v) => (
                        <option key={v.slug} value={v.slug}>
                          {v.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md="6" className="mb-3">
                    <Form.Label>Pickup date *</Form.Label>
                    <DatePicker
                      selected={pickupDate}
                      onChange={setPickupDate}
                      minDate={new Date()}
                      className="form-control"
                      dateFormat="MM/dd/yyyy"
                      placeholderText="Select date"
                    />
                  </Col>
                  <Col md="6" className="mb-3">
                    <Form.Label>Return date *</Form.Label>
                    <DatePicker
                      selected={returnDate}
                      onChange={setReturnDate}
                      minDate={pickupDate || new Date()}
                      className="form-control"
                      dateFormat="MM/dd/yyyy"
                      placeholderText="Select date"
                    />
                  </Col>
                  <Col md="6" className="mb-3">
                    <Form.Label>Pickup location *</Form.Label>
                    <Form.Control
                      name="pickupLocation"
                      value={form.pickupLocation}
                      onChange={handleChange}
                      placeholder="e.g. KGL airport, hotel name"
                      required
                    />
                  </Col>
                  <Col md="6" className="mb-3">
                    <Form.Label>Return location</Form.Label>
                    <Form.Control
                      name="returnLocation"
                      value={form.returnLocation}
                      onChange={handleChange}
                      placeholder="Same as pickup if blank"
                    />
                  </Col>
                  <Col md="12" className="mb-3">
                    <Form.Label>Driving option</Form.Label>
                    <Form.Select
                      name="driverOption"
                      value={form.driverOption}
                      onChange={handleChange}
                    >
                      <option value="self-drive">Self-drive</option>
                      <option value="chauffeur">Professional driver</option>
                      <option value="both">Not sure — advise me</option>
                    </Form.Select>
                  </Col>
                  <Col md="12" className="mb-3">
                    <Form.Label>Extras</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="checkbox"
                        id="extra-child"
                        name="extra_childSeat"
                        checked={form.extras.childSeat}
                        onChange={handleChange}
                        label="Child seat"
                      />
                      <Form.Check
                        inline
                        type="checkbox"
                        id="extra-roof"
                        name="extra_rooftopBox"
                        checked={form.extras.rooftopBox}
                        onChange={handleChange}
                        label="Roof box"
                      />
                      <Form.Check
                        inline
                        type="checkbox"
                        id="extra-driver"
                        name="extra_additionalDriver"
                        checked={form.extras.additionalDriver}
                        onChange={handleChange}
                        label="Additional driver"
                      />
                    </div>
                  </Col>
                  <Col md="12" className="mb-3">
                    <Form.Label>Itinerary notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Parks visited, cross-border plans, flight numbers..."
                    />
                  </Col>
                  <Col md="12" className="text-center">
                    <Button type="submit" className="primaryBtn" disabled={submitting}>
                      {submitting ? "Sending…" : "Submit rental request"}
                    </Button>
                    <p className="mt-3 text-muted">
                      <i className="bi bi-shield-check" /> Secure handling • Reply
                      within one business day
                    </p>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="map-section py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-4">
              <h2 className="section-title">Service Areas</h2>
              <p className="text-muted">
                Kigali hub with deliveries to Musanze, Rubavu, Huye, and park lodges by
                arrangement.
              </p>
            </Col>
            <Col md="12">
              <div className="map-container">
                <iframe
                  title="Rwanda car rental map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.477678563839!2d30.088936314753593!3d-1.9447379985734525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8f6b3%3A0x6e8a1b5a0c9e5c1d!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="reviews-section py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-5">
              <h2 className="section-title">What Drivers Say</h2>
            </Col>
          </Row>
          <Row>
            {reviews.map((r, i) => (
              <Col md="4" key={r.name + i} className="mb-4">
                <div className="review-card">
                  <div className="review-header">
                    <div className="reviewer-name">{r.name}</div>
                    <div className="review-rating">{stars(r.rating)}</div>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  <div className="review-date">{r.date}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="faq-section py-5">
        <Container>
          <Row>
            <Col md="12" className="text-center mb-4">
              <h2 className="section-title">Car Rental FAQs</h2>
            </Col>
            <Col md="10" className="mx-auto">
              <Accordion>
                {faqs.map((item, index) => (
                  <Accordion.Item eventKey={String(index)} key={item.q}>
                    <Accordion.Header>{item.q}</Accordion.Header>
                    <Accordion.Body>{item.a}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="cta-section py-5">
        <div className="cta-overlay" />
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h2 className="cta-title">Need a Full Safari Package?</h2>
              <p className="cta-description">
                Combine your vehicle with permits, lodges, and guided experiences.
              </p>
              <div className="cta-buttons">
                <Link to="/book" className="primaryBtn me-3">
                  Book a tour
                </Link>
                <a href="mailto:info@rwandagorillatrekk.com" className="secondary_btn">
                  Email the team
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default CarRental;
