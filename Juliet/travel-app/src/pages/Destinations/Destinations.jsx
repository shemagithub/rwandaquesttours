import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Tabs,
  Tab,
  Accordion,
  Badge,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./destinations.css";
import { fetchJson, resolveMediaUrl } from "../../utils/backendApi";

function inferDestinationCategory(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("kigali")) return "cities";
  if (n.includes("lake") || n.includes("kivu")) return "lakes";
  return "parks";
}

function mapDestinationFromApi(d) {
  const firstImg =
    Array.isArray(d.imageUrls) && d.imageUrls.length
      ? resolveMediaUrl(d.imageUrls[0])
      : "";
  const name = d.name || "Destination";
  const desc = d.description || "";
  const permitGuess = /\bgorilla|trek|volcanoes|nyungwe|chimpanzee|park\b/i.test(
    `${name} ${desc}`,
  );
  return {
    id: d.id,
    name,
    category: inferDestinationCategory(name),
    image: firstImg || require("../../assets/images/tour/bali-1.png"),
    location: "Rwanda",
    description:
      desc ||
      "Discover this area with our team — day trips, permits, and lodges on request.",
    attractions: [],
    distance: "Distance on request",
    permitRequired: permitGuess,
    permitPrice: permitGuess ? 1500 : undefined,
    highlights: desc
      ? [desc.length > 320 ? `${desc.slice(0, 320)}…` : desc]
      : [`Explore ${name} with local guides and vetted vehicles.`],
    activities: [],
    bestTime: "Year-round (dry seasons are often June–Sept & Dec–Feb)",
    weather:
      "Mountain and lake microclimates vary; we share a packing list after booking.",
    accommodations: [],
    reviews: [],
    fromApi: true,
  };
}

const STATIC_DESTINATIONS = [
    {
      id: 1,
      name: "Volcanoes National Park",
      category: "parks",
      image: require("../../assets/images/tour/bali-1.png"),
      location: "Northern Province, Rwanda",
      description:
        "Home to the magnificent mountain gorillas. Experience once-in-a-lifetime gorilla trekking in their natural habitat.",
      attractions: ["gorilla", "hiking", "bird"],
      distance: "2.5 hours from Kigali",
      permitRequired: true,
      permitPrice: 1500,
      highlights: [
        "Mountain gorilla trekking",
        "Golden monkey tracking",
        "Dian Fossey grave visit",
        "Iby'iwacu Cultural Village",
      ],
      activities: [
        {
          name: "Gorilla Trekking",
          icon: "🦍",
          description: "One-hour interaction with mountain gorillas in the wild",
        },
        {
          name: "Golden Monkey Tracking",
          icon: "🐵",
          description: "Track and observe playful golden monkeys",
        },
        {
          name: "Mountain Hiking",
          icon: "⛰️",
          description: "Hike the Virunga Volcanoes including Mount Bisoke",
        },
        {
          name: "Cultural Village Visit",
          icon: "🏛️",
          description: "Experience traditional Rwandan culture at Iby'iwacu",
        },
      ],
      bestTime: "June-September (Dry season), December-February",
      weather: "Mountain climate: 10-20°C. Rainy season: March-May & October-November",
      accommodations: [
        { type: "Luxury", name: "Bisate Lodge", distance: "5 km", price: "$600/night" },
        { type: "Mid-range", name: "Mountain Gorilla View Lodge", distance: "3 km", price: "$200/night" },
        { type: "Budget", name: "Kinigi Guesthouse", distance: "2 km", price: "$50/night" },
      ],
      reviews: [
        { name: "Sarah K.", rating: 5, comment: "Unforgettable gorilla experience!" },
        { name: "Mike T.", rating: 5, comment: "Best wildlife encounter ever." },
      ],
    },
    {
      id: 2,
      name: "Akagera National Park",
      category: "parks",
      image: require("../../assets/images/tour/bangkok.png"),
      location: "Eastern Province, Rwanda",
      description:
        "Rwanda's largest national park, home to the Big Five and diverse wildlife. Perfect for game drives and boat safaris.",
      attractions: ["big-five", "boat", "bird"],
      distance: "2.5 hours from Kigali",
      permitRequired: false,
      entranceFee: 100,
      highlights: [
        "Big Five safari (Lions, Elephants, Rhinos, Leopards, Buffalo)",
        "Boat rides on Lake Ihema",
        "Bird watching (500+ species)",
        "Game drives",
      ],
      activities: [
        {
          name: "Game Drives",
          icon: "🦁",
          description: "Spot the Big Five and other wildlife on safari drives",
        },
        {
          name: "Boat Safari",
          icon: "🚤",
          description: "Cruise Lake Ihema to see hippos and crocodiles",
        },
        {
          name: "Bird Watching",
          icon: "🦅",
          description: "Observe over 500 bird species including the rare shoebill",
        },
        {
          name: "Nature Walks",
          icon: "🚶",
          description: "Guided nature walks to explore the park",
        },
      ],
      bestTime: "June-September (Dry season), best for wildlife viewing",
      weather: "Warm climate: 20-30°C. Wet season: October-May",
      accommodations: [
        { type: "Luxury", name: "Ruzizi Tented Lodge", distance: "Inside park", price: "$350/night" },
        { type: "Mid-range", name: "Akagera Game Lodge", distance: "2 km", price: "$150/night" },
        { type: "Budget", name: "Karenge Bush Camp", distance: "5 km", price: "$80/night" },
      ],
      reviews: [
        { name: "Emma L.", rating: 5, comment: "Saw all Big Five! Amazing experience." },
        { name: "David R.", rating: 4, comment: "Great safari, excellent guides." },
      ],
    },
    {
      id: 3,
      name: "Nyungwe Forest National Park",
      category: "parks",
      image: require("../../assets/images/tour/cancun.png"),
      location: "Southwestern Rwanda",
      description:
        "Ancient montane rainforest with 13 primate species, canopy walkway, and diverse birdlife. One of Africa's oldest forests.",
      attractions: ["chimpanzee", "canopy", "hiking"],
      distance: "5 hours from Kigali",
      permitRequired: true,
      permitPrice: 90,
      highlights: [
        "Chimpanzee tracking",
        "Canopy walkway (160m high)",
        "Waterfall hikes",
        "Colobus monkey tracking",
      ],
      activities: [
        {
          name: "Chimpanzee Tracking",
          icon: "🐵",
          description: "Track and observe chimpanzees in their natural habitat",
        },
        {
          name: "Canopy Walk",
          icon: "🌉",
          description: "Walk 160m above the forest floor on Africa's longest canopy walkway",
        },
        {
          name: "Waterfall Hikes",
          icon: "💧",
          description: "Hike through ancient forest to beautiful waterfalls",
        },
        {
          name: "Bird Watching",
          icon: "🦅",
          description: "Spot endemic bird species in the pristine forest",
        },
      ],
      bestTime: "June-September (Dry season), easier hiking conditions",
      weather: "Cool and humid: 10-18°C. Rainy throughout the year, driest June-September",
      accommodations: [
        { type: "Luxury", name: "One&Only Nyungwe House", distance: "Adjacent", price: "$500/night" },
        { type: "Mid-range", name: "Nyungwe Top View Hill Hotel", distance: "10 km", price: "$120/night" },
        { type: "Budget", name: "Gisakura Guesthouse", distance: "5 km", price: "$40/night" },
      ],
      reviews: [
        { name: "Jennifer W.", rating: 5, comment: "Canopy walk was breathtaking!" },
        { name: "Robert M.", rating: 5, comment: "Saw chimpanzees up close. Incredible!" },
      ],
    },
    {
      id: 4,
      name: "Kigali City",
      category: "cities",
      image: require("../../assets/images/tour/malaysia.png"),
      location: "Central Rwanda",
      description:
        "Rwanda's clean and vibrant capital city. Rich history, culture, and modern development. Gateway to all Rwandan destinations.",
      attractions: ["culture", "history", "shopping"],
      distance: "0 km (Capital city)",
      permitRequired: false,
      highlights: [
        "Kigali Genocide Memorial",
        "Inema Arts Center",
        "Nyamirambo Cultural Center",
        "Local markets and restaurants",
      ],
      activities: [
        {
          name: "Genocide Memorial Visit",
          icon: "🏛️",
          description: "Learn about Rwanda's history at the Kigali Genocide Memorial",
        },
        {
          name: "Art & Culture Tour",
          icon: "🎨",
          description: "Visit galleries and cultural centers showcasing Rwandan art",
        },
        {
          name: "City Market Tour",
          icon: "🛍️",
          description: "Explore local markets and taste Rwandan cuisine",
        },
        {
          name: "Nightlife Experience",
          icon: "🌃",
          description: "Enjoy restaurants, cafes, and Rwandan music",
        },
      ],
      bestTime: "Year-round. Dry season: June-September, December-February",
      weather: "Pleasant climate: 18-27°C. Two rainy seasons: March-May & October-November",
      accommodations: [
        { type: "Luxury", name: "The Retreat by Heaven", distance: "City center", price: "$400/night" },
        { type: "Mid-range", name: "Hotel des Mille Collines", distance: "City center", price: "$150/night" },
        { type: "Budget", name: "Step Town Motel", distance: "City center", price: "$60/night" },
      ],
      reviews: [
        { name: "Lisa B.", rating: 5, comment: "Beautiful, clean city with rich culture." },
        { name: "Tom H.", rating: 4, comment: "Great food and friendly people." },
      ],
    },
    {
      id: 5,
      name: "Lake Kivu",
      category: "lakes",
      image: require("../../assets/images/tour/paris.png"),
      location: "Western Rwanda",
      description:
        "Rwanda's largest lake, nestled between mountains. Perfect for relaxation, water sports, and lakeside resorts.",
      attractions: ["boat", "beach", "hiking"],
      distance: "3-4 hours from Kigali",
      permitRequired: false,
      highlights: [
        "Lakeside resorts and beaches",
        "Boat tours and water sports",
        "Hot springs",
        "Coffee plantations",
      ],
      activities: [
        {
          name: "Boat Tours",
          icon: "🚤",
          description: "Cruise on Lake Kivu and visit islands",
        },
        {
          name: "Water Sports",
          icon: "🏄",
          description: "Swimming, kayaking, and water activities",
        },
        {
          name: "Hot Springs Visit",
          icon: "♨️",
          description: "Relax in natural hot springs near the lake",
        },
        {
          name: "Coffee Plantation Tour",
          icon: "☕",
          description: "Learn about Rwanda's coffee production",
        },
      ],
      bestTime: "Year-round. June-September for best weather",
      weather: "Mild climate: 18-25°C. Pleasant year-round with minimal temperature variation",
      accommodations: [
        { type: "Luxury", name: "Lake Kivu Serena Hotel", distance: "Lakeside", price: "$300/night" },
        { type: "Mid-range", name: "Paradise Malahide", distance: "Lakeside", price: "$100/night" },
        { type: "Budget", name: "Lake Kivu Beach Resort", distance: "Lakeside", price: "$50/night" },
      ],
      reviews: [
        { name: "Anna S.", rating: 5, comment: "Perfect place to relax after gorilla trekking." },
        { name: "Chris P.", rating: 5, comment: "Beautiful lake views and great resorts." },
      ],
    },
    {
      id: 6,
      name: "Gishwati-Mukura National Park",
      category: "parks",
      image: require("../../assets/images/tour/phuket.png"),
      location: "Western Rwanda",
      description:
        "Rwanda's newest national park, part of the Gishwati-Mukura landscape. Forest conservation and chimpanzee habitat.",
      attractions: ["chimpanzee", "hiking", "bird"],
      distance: "3 hours from Kigali",
      permitRequired: true,
      permitPrice: 90,
      highlights: [
        "Chimpanzee habituation experience",
        "Forest hiking trails",
        "Bird watching",
        "Conservation education",
      ],
      activities: [
        {
          name: "Chimpanzee Habituation",
          icon: "🐵",
          description: "Experience chimpanzee habituation process",
        },
        {
          name: "Forest Hiking",
          icon: "🚶",
          description: "Explore the forest on guided hiking trails",
        },
        {
          name: "Bird Watching",
          icon: "🦅",
          description: "Spot various bird species in the forest",
        },
      ],
      bestTime: "June-September (Dry season)",
      weather: "Cool mountain climate: 12-20°C",
      accommodations: [
        { type: "Mid-range", name: "Gishwati Lodge", distance: "10 km", price: "$120/night" },
        { type: "Budget", name: "Rusizi Guesthouse", distance: "15 km", price: "$40/night" },
      ],
      reviews: [
        { name: "Mark D.", rating: 4, comment: "Great for nature lovers and conservation enthusiasts." },
      ],
    },
];

const Destinations = () => {
  const [destinations, setDestinations] = useState(STATIC_DESTINATIONS);

  const [activeTab, setActiveTab] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchJson("/api/destinations");
        if (
          cancelled ||
          !Array.isArray(rows) ||
          rows.length === 0
        ) {
          return;
        }
        setDestinations(rows.map(mapDestinationFromApi));
      } catch {
        /* keep local showcase list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDestinations = destinations.filter((dest) => {
    if (activeTab === "all") return true;
    return dest.category === activeTab;
  });

  const handleViewDetails = (destination) => {
    setSelectedDestination(destination);
    setShowModal(true);
  };

  const getAttractionIcon = (attraction) => {
    const icons = {
      gorilla: "🦍",
      "big-five": "🦁",
      canopy: "🌉",
      boat: "🚤",
      hiking: "⛰️",
      bird: "🦅",
      chimpanzee: "🐵",
      culture: "🏛️",
      history: "📚",
      shopping: "🛍️",
      beach: "🏖️",
    };
    return icons[attraction] || "📍";
  };

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
    <div className="destinations-page">
      {/* 1. Destinations Overview */}
      <section className="destinations-hero">
        <div className="hero-overlay"></div>
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h1 className="hero-title">Our Destinations in Rwanda</h1>
              <p className="hero-description">
                Discover Rwanda's national parks, cultural sites, and vibrant cities
                with Rwandagorillatrekk. From mountain gorillas to Big Five safaris,
                explore the land of a thousand hills.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 2. Destination Categories */}
      <section className="destinations-filters py-4 bg-light">
        <Container>
          <Row>
            <Col md="12">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="category-tabs"
              >
                <Tab eventKey="all" title="All Destinations">
                  <span className="tab-count">({destinations.length})</span>
                </Tab>
                <Tab
                  eventKey="parks"
                  title={
                    <>
                      🌳 National Parks{" "}
                      <span className="tab-count">
                        ({destinations.filter((d) => d.category === "parks").length})
                      </span>
                    </>
                  }
                ></Tab>
                <Tab
                  eventKey="cities"
                  title={
                    <>
                      🌆 Cities & Towns{" "}
                      <span className="tab-count">
                        ({destinations.filter((d) => d.category === "cities").length})
                      </span>
                    </>
                  }
                ></Tab>
                <Tab
                  eventKey="lakes"
                  title={
                    <>
                      🌊 Lakes & Nature{" "}
                      <span className="tab-count">
                        ({destinations.filter((d) => d.category === "lakes").length})
                      </span>
                    </>
                  }
                ></Tab>
              </Tabs>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 3. Destination Cards */}
      <section className="destinations-list py-5">
        <Container>
          <Row>
            {filteredDestinations.map((destination) => (
              <Col md="4" sm="6" key={destination.id} className="mb-4">
                <Card className="destination-card">
                  <div className="destination-image-container">
                    <Card.Img variant="top" src={destination.image} />
                    {destination.permitRequired && (
                      <Badge className="badge-permit">Permit Required</Badge>
                    )}
                  </div>
                  <Card.Body>
                    <h5 className="destination-name">{destination.name}</h5>
                    <p className="destination-location">
                      <i className="bi bi-geo-alt"></i> {destination.location}
                    </p>
                    <p className="destination-description">{destination.description}</p>
                    <div className="destination-attractions mb-3">
                      {destination.attractions.map((attr, idx) => (
                        <span key={idx} className="attraction-icon" title={attr}>
                          {getAttractionIcon(attr)}
                        </span>
                      ))}
                    </div>
                    <div className="destination-meta mb-3">
                      <span>
                        <i className="bi bi-signpost"></i> {destination.distance}
                      </span>
                    </div>
                    <div className="destination-footer">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewDetails(destination)}
                        className="me-2"
                      >
                        View Details
                      </Button>
                      <Button
                        className="primaryBtn"
                        size="sm"
                        as={NavLink}
                        to="/packages"
                      >
                        View Packages
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 4. Destination Detail Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        className="destination-details-modal"
      >
        {selectedDestination && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedDestination.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md="12">
                  <img
                    src={selectedDestination.image}
                    alt={selectedDestination.name}
                    className="w-100 mb-3 rounded"
                  />
                </Col>
                <Col md="12">
                  <h4>🗺️ Overview</h4>
                  <p>{selectedDestination.description}</p>
                  <div className="destination-info">
                    <p>
                      <strong>Location:</strong> {selectedDestination.location}
                    </p>
                    <p>
                      <strong>Distance from Kigali:</strong> {selectedDestination.distance}
                    </p>
                    {selectedDestination.permitRequired && (
                      <p>
                        <strong>Permit Required:</strong> Yes
                        {selectedDestination.permitPrice && (
                          <span> - ${selectedDestination.permitPrice} per person</span>
                        )}
                      </p>
                    )}
                    {selectedDestination.entranceFee && (
                      <p>
                        <strong>Entrance Fee:</strong> ${selectedDestination.entranceFee} per person
                      </p>
                    )}
                  </div>
                </Col>

                {/* 5. Things to Do */}
                <Col md="12" className="mt-4">
                  <h5>Activities & Things to Do</h5>
                  {selectedDestination.activities?.length ? (
                    <Row>
                      {selectedDestination.activities.map((activity, idx) => (
                        <Col md="6" key={idx} className="mb-3">
                          <div className="activity-item">
                            <div className="activity-icon">{activity.icon}</div>
                            <div className="activity-content">
                              <h6>{activity.name}</h6>
                              <p>{activity.description}</p>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <p className="text-muted">
                      Share your dates and interests — we&apos;ll propose activities,
                      permits, and pacing for {selectedDestination.name}.
                    </p>
                  )}
                </Col>

                {/* 6. Best Time to Visit */}
                <Col md="6" className="mt-4">
                  <h5>🕐 Best Time to Visit</h5>
                  <p>{selectedDestination.bestTime}</p>
                  <p className="text-muted">{selectedDestination.weather}</p>
                </Col>

                {/* 7. Parks & Permit Information */}
                {selectedDestination.permitRequired && (
                  <Col md="6" className="mt-4">
                    <h5>🎫 Permit Information</h5>
                    <div className="permit-info">
                      <p>
                        <strong>Permit Price:</strong> ${selectedDestination.permitPrice} per person
                      </p>
                      <p>
                        <strong>Age Limit:</strong> 15 years and above
                      </p>
                      <p>
                        <strong>Daily Limit:</strong> 96 visitors per day (8 groups of 12)
                      </p>
                      <p>
                        <strong>Booking:</strong> Book in advance, permits sell out quickly
                      </p>
                    </div>
                  </Col>
                )}

                {/* 8. Accommodation Options */}
                <Col md="12" className="mt-4">
                  <h5>🏨 Accommodation Options</h5>
                  {selectedDestination.accommodations?.length ? (
                    <>
                      <Row>
                        {selectedDestination.accommodations.map((acc, idx) => (
                          <Col md="4" key={idx} className="mb-3">
                            <div className="accommodation-item">
                              <Badge className={`badge-${acc.type.toLowerCase()}`}>
                                {acc.type}
                              </Badge>
                              <h6>{acc.name}</h6>
                              <p>
                                <i className="bi bi-signpost"></i> {acc.distance}
                              </p>
                              <p className="price">{acc.price}</p>
                            </div>
                          </Col>
                        ))}
                      </Row>
                      <div className="accommodation-actions mt-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          as={NavLink}
                          to="/services"
                        >
                          Book Hotel
                        </Button>
                        <Button variant="outline-secondary" size="sm" as={NavLink} to="/packages">
                          View Lodges Near This Destination
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted mb-3">
                      We shortlist vetted lodges and camps for every budget — request a
                      quote and we&apos;ll match you to the right stay.
                    </p>
                  )}
                </Col>

                {/* 10. Map & Location */}
                <Col md="12" className="mt-4">
                  <h5>📍 Map & Location</h5>
                  <div className="map-container">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.477678563839!2d30.088936314753593!3d-1.9447379985734525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8f6b3%3A0x6e8a1b5a0c9e5c1d!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2s!4v1234567890"
                      width="100%"
                      height="300"
                      style={{ border: 0, borderRadius: "10px" }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${selectedDestination.name} Location`}
                    ></iframe>
                  </div>
                  <div className="location-details mt-3">
                    <p>
                      <strong>Distance from Kigali:</strong> {selectedDestination.distance}
                    </p>
                    <p>
                      <strong>Estimated Driving Time:</strong>{" "}
                      {selectedDestination.distance.includes("hours")
                        ? selectedDestination.distance
                        : "N/A"}
                    </p>
                  </div>
                </Col>

                {/* 12. Travel Tips */}
                <Col md="6" className="mt-4">
                  <h5>💡 Travel Tips</h5>
                  <ul className="travel-tips">
                    <li>Pack warm clothing (mountain destinations are cold)</li>
                    <li>Bring waterproof gear for rainy seasons</li>
                    <li>Respect wildlife and maintain distance</li>
                    <li>Follow guide instructions during treks</li>
                    <li>Book permits well in advance</li>
                  </ul>
                </Col>

                {/* 13. Reviews & Experiences */}
                <Col md="6" className="mt-4">
                  <h5>⭐ Reviews & Experiences</h5>
                  {selectedDestination.reviews?.length ? (
                    selectedDestination.reviews.map((review, idx) => (
                      <div key={idx} className="review-item">
                        <div className="review-header">
                          <strong>{review.name}</strong>
                          <div className="review-rating">{renderStars(review.rating)}</div>
                        </div>
                        <p className="review-comment">&quot;{review.comment}&quot;</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">
                      Read latest guest feedback on our packages page, or ask for recent
                      references for {selectedDestination.name}.
                    </p>
                  )}
                </Col>

                {/* 14. FAQs */}
                <Col md="12" className="mt-4">
                  <h5>❓ Frequently Asked Questions</h5>
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        {selectedDestination.category === "parks"
                          ? "Is gorilla trekking safe?"
                          : "Is this destination safe to visit?"}
                      </Accordion.Header>
                      <Accordion.Body>
                        Yes, all our tours are conducted with experienced guides who
                        prioritize visitor safety. We follow all park regulations and
                        safety protocols.
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>
                        {selectedDestination.category === "parks"
                          ? "How long is the trek?"
                          : "How much time should I spend here?"}
                      </Accordion.Header>
                      <Accordion.Body>
                        {selectedDestination.category === "parks"
                          ? "Gorilla trekking typically takes 1-8 hours depending on gorilla location. You get one hour with the gorillas once found."
                          : "We recommend 2-3 days to fully experience this destination and its activities."}
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                      <Accordion.Header>Can children visit?</Accordion.Header>
                      <Accordion.Body>
                        For gorilla trekking, children must be 15 years or older. Other
                        activities may have different age restrictions. Please check with
                        us for specific requirements.
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button
                className="primaryBtn"
                as={NavLink}
                to="/packages"
                onClick={() => setShowModal(false)}
              >
                View Packages
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* 15. CTA Section */}
      <section className="cta-section py-5">
        <div className="cta-overlay"></div>
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h2 className="cta-title">Ready to Explore Rwanda?</h2>
              <p className="cta-description">
                Choose your destination and let us create an unforgettable experience
                for you
              </p>
              <div className="cta-buttons">
                <Button className="primaryBtn me-3" as={NavLink} to="/packages">
                  Book a Tour
                </Button>
                <a
                  href="https://wa.me/250788123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn me-3"
                >
                  <i className="bi bi-whatsapp"></i> Request Gorilla Permit
                </a>
                <Button
                  variant="outline-light"
                  as={NavLink}
                  to="/contact"
                  className="me-3"
                >
                  Customize Trip
                </Button>
                <a
                  href="https://wa.me/250788123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <i className="bi bi-chat-dots"></i> Chat on WhatsApp
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Destinations;
