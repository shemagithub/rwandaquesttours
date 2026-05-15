import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Tabs,
  Tab,
  Badge,
  Modal,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import Lightroom from "react-lightbox-gallery";
import "./gallery.css";
import { fetchJson, resolveMediaUrl } from "../../utils/backendApi";

function mapGalleryCategory(cat) {
  const c = String(cat || "general").toLowerCase();
  if (c.includes("gorilla") || c.includes("client")) return "gorillas";
  if (c.includes("wild") || c.includes("safari")) return "wildlife";
  if (c.includes("park") || c.includes("forest")) return "parks";
  if (c.includes("car") || c.includes("vehicle")) return "vehicles";
  if (c.includes("hotel") || c.includes("lodge")) return "hotels";
  if (c.includes("city")) return "city";
  return "parks";
}

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterActivity, setFilterActivity] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false);

  // 1. Smart Category & Tag System
  const categories = [
    { id: "all", name: "All Media", icon: "🖼️", count: 48 },
    { id: "gorillas", name: "Gorillas", icon: "🦍", count: 12 },
    { id: "wildlife", name: "Wildlife Safari", icon: "🦁", count: 15 },
    { id: "parks", name: "National Parks", icon: "🌳", count: 18 },
    { id: "vehicles", name: "Vehicles & Transfers", icon: "🚗", count: 8 },
    { id: "hotels", name: "Hotels & Lodges", icon: "🏨", count: 10 },
    { id: "city", name: "City Tours", icon: "🌆", count: 7 },
    { id: "clients", name: "Happy Clients", icon: "😊", count: 12 },
  ];

  const [allMedia, setAllMedia] = useState(() => [
    // Gorillas Category
    {
      id: 1,
      src: require("../../assets/images/gallery/g1.jpg"),
      desc: "Mountain gorilla in Volcanoes National Park",
      sub: "Volcanoes NP, Rwanda",
      category: "gorillas",
      tags: ["#GorillaTrekking", "#VolcanoesNP"],
      destination: "Volcanoes National Park",
      activity: "Gorilla Trekking",
      season: "Dry",
      package: "3-Day Gorilla Trekking",
      rating: 5,
      popular: true,
      featured: true,
    },
    {
      id: 2,
      src: require("../../assets/images/gallery/g3.jpg"),
      desc: "Silverback gorilla family",
      sub: "Volcanoes NP, Rwanda",
      category: "gorillas",
      tags: ["#GorillaTrekking", "#FamilyTour"],
      destination: "Volcanoes National Park",
      activity: "Gorilla Trekking",
      season: "Dry",
      package: "3-Day Gorilla Trekking",
      rating: 5,
      popular: true,
    },
    {
      id: 3,
      src: require("../../assets/images/gallery/g4.jpg"),
      desc: "Gorilla trekking experience",
      sub: "Volcanoes NP, Rwanda",
      category: "gorillas",
      tags: ["#GorillaTrekking", "#Adventure"],
      destination: "Volcanoes National Park",
      activity: "Gorilla Trekking",
      season: "Dry",
      package: "3-Day Gorilla Trekking",
      rating: 5,
    },
    // Wildlife Safari Category
    {
      id: 4,
      src: require("../../assets/images/tour/bangkok.png"),
      desc: "Lion in Akagera National Park",
      sub: "Akagera NP, Rwanda",
      category: "wildlife",
      tags: ["#AkageraSafari", "#BigFive"],
      destination: "Akagera National Park",
      activity: "Game Drive",
      season: "Dry",
      package: "5-Day Wildlife Safari",
      rating: 5,
      popular: true,
    },
    {
      id: 5,
      src: require("../../assets/images/tour/cancun.png"),
      desc: "Elephant herd in Akagera",
      sub: "Akagera NP, Rwanda",
      category: "wildlife",
      tags: ["#AkageraSafari", "#Wildlife"],
      destination: "Akagera National Park",
      activity: "Game Drive",
      season: "Dry",
      package: "5-Day Wildlife Safari",
      rating: 5,
    },
    {
      id: 6,
      src: require("../../assets/images/tour/malaysia.png"),
      desc: "Zebra in Akagera National Park",
      sub: "Akagera NP, Rwanda",
      category: "wildlife",
      tags: ["#AkageraSafari"],
      destination: "Akagera National Park",
      activity: "Game Drive",
      season: "Dry",
      package: "5-Day Wildlife Safari",
      rating: 4,
    },
    // National Parks Category
    {
      id: 7,
      src: require("../../assets/images/tour/paris.png"),
      desc: "Nyungwe Forest canopy walkway",
      sub: "Nyungwe Forest NP, Rwanda",
      category: "parks",
      tags: ["#NyungweForest", "#CanopyWalk"],
      destination: "Nyungwe Forest",
      activity: "Canopy Walk",
      season: "Dry",
      package: "6-Day Discovery Tour",
      rating: 5,
      popular: true,
    },
    {
      id: 8,
      src: require("../../assets/images/tour/phuket.png"),
      desc: "Chimpanzee in Nyungwe Forest",
      sub: "Nyungwe Forest NP, Rwanda",
      category: "parks",
      tags: ["#NyungweForest", "#Chimpanzee"],
      destination: "Nyungwe Forest",
      activity: "Chimpanzee Tracking",
      season: "Dry",
      package: "6-Day Discovery Tour",
      rating: 5,
    },
    {
      id: 9,
      src: require("../../assets/images/tour/bali-1.png"),
      desc: "Volcanoes National Park landscape",
      sub: "Volcanoes NP, Rwanda",
      category: "parks",
      tags: ["#VolcanoesNP", "#Landscape"],
      destination: "Volcanoes National Park",
      activity: "Hiking",
      season: "Dry",
      package: "3-Day Gorilla Trekking",
      rating: 4,
    },
    // Vehicles & Transfers
    {
      id: 10,
      src: require("../../assets/images/tour/bangkok.png"),
      desc: "4x4 Safari vehicle",
      sub: "Rwanda",
      category: "vehicles",
      tags: ["#SafariVehicle", "#Transport"],
      destination: "Various",
      activity: "Transfer",
      season: "All",
      package: "All Packages",
      rating: 4,
    },
    // Hotels & Lodges
    {
      id: 11,
      src: require("../../assets/images/tour/cancun.png"),
      desc: "Luxury lodge in Volcanoes NP",
      sub: "Volcanoes NP, Rwanda",
      category: "hotels",
      tags: ["#LuxurySafari", "#Lodge"],
      destination: "Volcanoes National Park",
      activity: "Accommodation",
      season: "All",
      package: "3-Day Gorilla Trekking",
      rating: 5,
    },
    // City Tours
    {
      id: 12,
      src: require("../../assets/images/tour/malaysia.png"),
      desc: "Kigali city view",
      sub: "Kigali, Rwanda",
      category: "city",
      tags: ["#KigaliTour", "#CityTour"],
      destination: "Kigali",
      activity: "City Tour",
      season: "All",
      package: "2-Day Kigali Tour",
      rating: 4,
    },
    // Happy Clients
    {
      id: 13,
      src: require("../../assets/images/gallery/g6.jpg"),
      desc: "Happy travelers with gorillas",
      sub: "Volcanoes NP, Rwanda",
      category: "clients",
      tags: ["#HappyClients", "#Testimonial"],
      destination: "Volcanoes National Park",
      activity: "Gorilla Trekking",
      season: "Dry",
      package: "3-Day Gorilla Trekking",
      rating: 5,
      contributor: "Sarah Johnson, USA",
      userGenerated: true,
    },
    {
      id: 14,
      src: require("../../assets/images/gallery/g7.jpg"),
      desc: "Client enjoying Akagera safari",
      sub: "Akagera NP, Rwanda",
      category: "clients",
      tags: ["#HappyClients", "#Testimonial"],
      destination: "Akagera National Park",
      activity: "Game Drive",
      season: "Dry",
      package: "5-Day Wildlife Safari",
      rating: 5,
      contributor: "Michael Chen, Kigali, Rwanda",
      userGenerated: true,
    },
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await fetchJson("/api/gallery");
        if (cancelled || !Array.isArray(items) || !items.length) return;
        const mapped = items.map((g) => ({
          id: `api-${g.id}`,
          src: resolveMediaUrl(g.url) || require("../../assets/images/gallery/g1.jpg"),
          desc: g.caption || "Gallery image",
          sub: "Rwanda",
          category: mapGalleryCategory(g.category),
          tags: ["#Gallery", "#Rwanda"],
          destination: "Rwanda",
          activity: "Tour",
          season: "All",
          package: "",
          rating: 5,
          popular: true,
          featured: true,
        }));
        setAllMedia((prev) => [...mapped, ...prev]);
      } catch {
        /* local assets only */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 5. Story-Based Galleries
  const stories = useMemo(
    () => [
      {
        id: 1,
        title: "A Day with Mountain Gorillas",
        description:
          "Follow our journey through Volcanoes National Park to meet Rwanda's magnificent mountain gorillas.",
        coverImage: require("../../assets/images/gallery/g1.jpg"),
        images: [allMedia[0], allMedia[1], allMedia[2]].filter(Boolean),
        destination: "Volcanoes National Park",
        package: "3-Day Gorilla Trekking",
        date: "March 2024",
      },
      {
        id: 2,
        title: "3 Days in Akagera National Park",
        description:
          "Experience the Big Five and diverse wildlife in Rwanda's largest national park.",
        coverImage: require("../../assets/images/tour/bangkok.png"),
        images: [allMedia[3], allMedia[4], allMedia[5]].filter(Boolean),
        destination: "Akagera National Park",
        package: "5-Day Wildlife Safari",
        date: "February 2024",
      },
      {
        id: 3,
        title: "Kigali City Tour Experience",
        description:
          "Explore Rwanda's vibrant capital city with cultural visits and local markets.",
        coverImage: require("../../assets/images/tour/malaysia.png"),
        images: [allMedia[11]].filter(Boolean),
        destination: "Kigali",
        package: "2-Day Kigali Tour",
        date: "January 2024",
      },
    ],
    [allMedia],
  );

  // Filter media based on active filters
  const getFilteredMedia = () => {
    let filtered = allMedia;

    // Category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.desc.toLowerCase().includes(term) ||
          item.sub.toLowerCase().includes(term) ||
          item.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Destination filter
    if (filterDestination) {
      filtered = filtered.filter(
        (item) => item.destination === filterDestination
      );
    }

    // Activity filter
    if (filterActivity) {
      filtered = filtered.filter((item) => item.activity === filterActivity);
    }

    // Season filter
    if (filterSeason) {
      filtered = filtered.filter((item) => item.season === filterSeason);
    }

    // Sort
    if (sortBy === "popular") {
      filtered = filtered.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return b.rating - a.rating;
      });
    } else if (sortBy === "newest") {
      filtered = filtered.reverse();
    } else if (sortBy === "rated") {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  };

  const filteredMedia = getFilteredMedia();

  // Format images for Lightroom component
  const formattedImages = filteredMedia.map((item) => ({
    src: item.src,
    desc: item.desc,
    sub: item.sub,
  }));

  const gallerySettings = {
    columnCount: {
      default: 4,
      mobile: 2,
      tab: 3,
    },
    mode: "dark",
    enableZoom: true,
  };

  const handleViewStory = (story) => {
    setSelectedStory(story);
    setShowStoryModal(true);
  };

  const destinations = [
    "All Destinations",
    "Volcanoes National Park",
    "Akagera National Park",
    "Nyungwe Forest",
    "Kigali",
  ];

  const activities = [
    "All Activities",
    "Gorilla Trekking",
    "Game Drive",
    "Chimpanzee Tracking",
    "Canopy Walk",
    "City Tour",
  ];

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="hero-overlay"></div>
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h1 className="hero-title">Our Photo & Video Gallery</h1>
              <p className="hero-description">
                Explore Rwanda through our lens. From gorilla encounters to wildlife
                safaris, witness the beauty of the land of a thousand hills.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 1. Smart Category & Tag System */}
      <section className="gallery-categories py-4 bg-light">
        <Container>
          <Row>
            <Col md="12">
              <div className="category-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">({cat.count})</span>
                  </button>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 2. Advanced Filters & Search */}
      <section className="gallery-filters py-4">
        <Container>
          <Row>
            <Col md="12">
              <div className="filter-panel">
                <Row className="align-items-end">
                  <Col md="3" sm="6" className="mb-3">
                    <Form.Label>Search Gallery</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                  <Col md="2" sm="6" className="mb-3">
                    <Form.Label>Destination</Form.Label>
                    <Form.Select
                      value={filterDestination}
                      onChange={(e) => setFilterDestination(e.target.value)}
                    >
                      <option value="">All Destinations</option>
                      <option value="Volcanoes National Park">
                        Volcanoes NP
                      </option>
                      <option value="Akagera National Park">Akagera NP</option>
                      <option value="Nyungwe Forest">Nyungwe Forest</option>
                      <option value="Kigali">Kigali</option>
                    </Form.Select>
                  </Col>
                  <Col md="2" sm="6" className="mb-3">
                    <Form.Label>Activity</Form.Label>
                    <Form.Select
                      value={filterActivity}
                      onChange={(e) => setFilterActivity(e.target.value)}
                    >
                      <option value="">All Activities</option>
                      <option value="Gorilla Trekking">Gorilla Trekking</option>
                      <option value="Game Drive">Game Drive</option>
                      <option value="Chimpanzee Tracking">
                        Chimpanzee Tracking
                      </option>
                      <option value="Canopy Walk">Canopy Walk</option>
                    </Form.Select>
                  </Col>
                  <Col md="2" sm="6" className="mb-3">
                    <Form.Label>Season</Form.Label>
                    <Form.Select
                      value={filterSeason}
                      onChange={(e) => setFilterSeason(e.target.value)}
                    >
                      <option value="">All Seasons</option>
                      <option value="Dry">Dry Season</option>
                      <option value="Rainy">Rainy Season</option>
                    </Form.Select>
                  </Col>
                  <Col md="3" sm="6" className="mb-3">
                    <Form.Label>Sort By</Form.Label>
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest</option>
                      <option value="rated">Best Rated</option>
                    </Form.Select>
                  </Col>
                </Row>
                {(searchTerm ||
                  filterDestination ||
                  filterActivity ||
                  filterSeason) && (
                  <Row>
                    <Col md="12" className="text-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterDestination("");
                          setFilterActivity("");
                          setFilterSeason("");
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 5. Story-Based Galleries */}
      <section className="gallery-stories py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="mb-4">
              <h2 className="section-title">Story-Based Galleries</h2>
              <p className="section-subtitle">
                Experience our tours through curated photo stories
              </p>
            </Col>
          </Row>
          <Row>
            {stories.map((story) => (
              <Col md="4" sm="6" key={story.id} className="mb-4">
                <Card className="story-card" onClick={() => handleViewStory(story)}>
                  <div className="story-image-container">
                    <Card.Img variant="top" src={story.coverImage} />
                    <div className="story-overlay">
                      <Badge className="story-badge">
                        {story.images.length} Photos
                      </Badge>
                    </div>
                  </div>
                  <Card.Body>
                    <h5>{story.title}</h5>
                    <p className="story-description">{story.description}</p>
                    <div className="story-meta">
                      <span>
                        <i className="bi bi-geo-alt"></i> {story.destination}
                      </span>
                      <span>
                        <i className="bi bi-calendar"></i> {story.date}
                      </span>
                    </div>
                    <Button variant="outline-primary" size="sm" className="mt-2">
                      View Story
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Main Gallery Grid */}
      <section className="gallery-grid py-5">
        <Container>
          <Row>
            <Col md="12" className="mb-4">
              <h2 className="section-title">
                All Media ({filteredMedia.length} items)
              </h2>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              {filteredMedia.length > 0 ? (
                <Lightroom images={formattedImages} settings={gallerySettings} />
              ) : (
                <div className="no-results text-center py-5">
                  <i className="bi bi-image" style={{ fontSize: "48px" }}></i>
                  <h4>No media found</h4>
                  <p>Try adjusting your filters or search term</p>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* 8. Client-Contributed Photos */}
      <section className="user-generated py-5 bg-light">
        <Container>
          <Row>
            <Col md="12" className="mb-4">
              <h2 className="section-title">Photos from Our Clients</h2>
              <p className="section-subtitle">
                Real experiences shared by travelers who visited Rwanda with us
              </p>
            </Col>
          </Row>
          <Row>
            {allMedia
              .filter((item) => item.userGenerated)
              .map((item) => (
                <Col md="4" sm="6" key={item.id} className="mb-4">
                  <Card className="ugc-card">
                    <Card.Img variant="top" src={item.src} />
                    <Card.Body>
                      <div className="ugc-header">
                        <Badge className="ugc-badge">
                          <i className="bi bi-camera"></i> Client Photo
                        </Badge>
                        <div className="ugc-rating">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`bi ${
                                i < item.rating ? "bi-star-fill" : "bi-star"
                              }`}
                              style={{
                                color: i < item.rating ? "#ffc107" : "#ddd",
                              }}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="ugc-caption">{item.desc}</p>
                      <p className="ugc-contributor">
                        <i className="bi bi-person-circle"></i>{" "}
                        {item.contributor}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </Container>
      </section>

      {/* Story Modal */}
      <Modal
        show={showStoryModal}
        onHide={() => setShowStoryModal(false)}
        size="lg"
        className="story-modal"
      >
        {selectedStory && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedStory.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{selectedStory.description}</p>
              <div className="story-info mb-3">
                <Badge className="me-2">
                  <i className="bi bi-geo-alt"></i> {selectedStory.destination}
                </Badge>
                <Badge className="me-2">
                  <i className="bi bi-calendar"></i> {selectedStory.date}
                </Badge>
                <Badge>
                  <i className="bi bi-briefcase"></i> {selectedStory.package}
                </Badge>
              </div>
              <Lightroom
                images={selectedStory.images.map((img) => ({
                  src: img.src,
                  desc: img.desc,
                  sub: img.sub,
                }))}
                settings={gallerySettings}
              />
              <div className="story-cta mt-4 text-center">
                <Button
                  className="primaryBtn me-2"
                  as={NavLink}
                  to="/packages"
                  onClick={() => setShowStoryModal(false)}
                >
                  Book This Experience
                </Button>
                <Button
                  variant="outline-primary"
                  as={NavLink}
                  to="/destinations"
                  onClick={() => setShowStoryModal(false)}
                >
                  View Destination
                </Button>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>

      {/* 18. CTA Section */}
      <section className="gallery-cta py-5">
        <div className="cta-overlay"></div>
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h2 className="cta-title">Ready to Experience Rwanda?</h2>
              <p className="cta-description">
                Let these photos inspire your next adventure
              </p>
              <div className="cta-buttons">
                <Button className="primaryBtn me-3" as={NavLink} to="/packages">
                  Explore Packages
                </Button>
                <Button
                  variant="outline-light"
                  className="me-3"
                  as={NavLink}
                  to="/contact"
                >
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
    </div>
  );
};

export default Gallery;
