import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, Accordion, Alert } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./book.css";

const Book = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    // Step 1: Service Selection
    serviceType: "",
    
    // Step 2: Travel Details
    travelDate: null,
    returnDate: null,
    duration: "",
    adults: 1,
    children: 0,
    country: "",
    language: "English",
    pickupLocation: "",
    
    // Gorilla Permit (Conditional)
    needPermit: false,
    permitDate: null,
    passportFile: null,
    
    // Accommodation
    accommodation: "",
    roomType: "",
    nights: 0,
    
    // Add-ons
    addOns: {
      airportTransfer: false,
      extraSafariDay: false,
      culturalVisit: false,
      photographer: false,
      porterService: false,
      travelInsurance: false,
    },
    
    // Step 3: Personal Information
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    emergencyContact: "",
    specialRequests: "",
    
    // Step 4: Payment
    paymentMethod: "",
    currency: "USD",
    paymentOption: "full", // full or deposit
    agreeToTerms: false,
  });

  const [permitAvailability, setPermitAvailability] = useState({
    available: true,
    count: 12,
    price: 1500,
  });

  const services = [
    { id: "gorilla", name: "Gorilla Trekking", icon: "🦍", permitRequired: true },
    { id: "safari", name: "Wildlife Safari", icon: "🦁", permitRequired: false },
    { id: "car-hire", name: "Car Hire", icon: "🚗", permitRequired: false },
    { id: "airport", name: "Airport Transfer", icon: "✈️", permitRequired: false },
    { id: "hotel", name: "Hotel Booking", icon: "🏨", permitRequired: false },
    { id: "package", name: "Tour Package", icon: "🎒", permitRequired: false },
    { id: "custom", name: "Custom Tour", icon: "🧩", permitRequired: false },
  ];

  const accommodationOptions = [
    { id: "luxury", name: "Luxury Lodge", price: 400, image: require("../../assets/images/tour/bali-1.png") },
    { id: "mid-range", name: "Mid-Range Hotel", price: 150, image: require("../../assets/images/tour/bangkok.png") },
    { id: "budget", name: "Budget Lodge", price: 60, image: require("../../assets/images/tour/cancun.png") },
  ];

  const addOnsPricing = {
    airportTransfer: 50,
    extraSafariDay: 200,
    culturalVisit: 80,
    photographer: 300,
    porterService: 30,
    travelInsurance: 45,
  };

  const [bookingReference, setBookingReference] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Save progress to localStorage
  useEffect(() => {
    if (currentStep > 1) {
      localStorage.setItem("bookingProgress", JSON.stringify({ currentStep, bookingData }));
    }
  }, [currentStep, bookingData]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bookingProgress");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentStep(parsed.currentStep);
      setBookingData(parsed.bookingData);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setBookingData((prev) => ({
        ...prev,
        addOns: {
          ...prev.addOns,
          [name]: checked,
        },
      }));
    } else {
      setBookingData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    setBookingData((prev) => ({
      ...prev,
      passportFile: e.target.files[0],
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    
    // Base service pricing (example)
    const servicePrices = {
      gorilla: 1500,
      safari: 800,
      "car-hire": 100,
      airport: 50,
      hotel: bookingData.nights * (accommodationOptions.find(a => a.id === bookingData.accommodation)?.price || 0),
      package: 1200,
      custom: 1000,
    };
    
    total += servicePrices[bookingData.serviceType] || 0;
    
    // Add permit cost
    if (bookingData.needPermit && bookingData.serviceType === "gorilla") {
      total += permitAvailability.price;
    }
    
    // Add accommodation if hotel booking
    if (bookingData.serviceType === "hotel" && bookingData.accommodation) {
      total += bookingData.nights * (accommodationOptions.find(a => a.id === bookingData.accommodation)?.price || 0);
    }
    
    // Add-ons
    Object.keys(bookingData.addOns).forEach((addon) => {
      if (bookingData.addOns[addon]) {
        total += addOnsPricing[addon];
      }
    });
    
    return total;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return bookingData.serviceType !== "";
      case 2:
        return bookingData.travelDate !== null && bookingData.adults > 0;
      case 3:
        return (
          bookingData.fullName !== "" &&
          bookingData.email !== "" &&
          bookingData.phone !== ""
        );
      case 4:
        return (
          bookingData.paymentMethod !== "" &&
          bookingData.agreeToTerms
        );
      default:
        return true;
    }
  };

  const generateBookingReference = () => {
    return "RWGT-" + Date.now().toString().slice(-8).toUpperCase();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      const reference = generateBookingReference();
      setBookingReference(reference);
      setIsSubmitted(true);
      setCurrentStep(5);
      localStorage.removeItem("bookingProgress");
      
      // Here you would send data to backend
      console.log("Booking submitted:", { ...bookingData, reference });
    }
  };

  const steps = [
    { number: 1, title: "Select Service" },
    { number: 2, title: "Travel Details" },
    { number: 3, title: "Personal Info" },
    { number: 4, title: "Payment" },
    { number: 5, title: "Confirmation" },
  ];

  return (
    <div className="book-page">
      {/* 1. Clear Booking Header */}
      <section className="book-header">
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <h1 className="book-title">Book Your Rwanda Experience</h1>
              <p className="book-subtitle">
                Secure booking • Local experts • Fast confirmation
              </p>
              <div className="trust-badges mb-4">
                <Badge className="trust-badge">
                  <i className="bi bi-shield-check"></i> RDB Licensed
                </Badge>
                <Badge className="trust-badge">
                  <i className="bi bi-lock"></i> SSL Secure
                </Badge>
                <Badge className="trust-badge">
                  <i className="bi bi-star-fill"></i> Trusted Operator
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 12. Progress Indicator */}
      <section className="progress-section py-3">
        <Container>
          <div className="progress-steps">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`progress-step ${currentStep >= step.number ? "active" : ""} ${
                  currentStep === step.number ? "current" : ""
                }`}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-title">{step.title}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <Row>
          <Col lg="8">
            <Form onSubmit={handleSubmit}>
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <Card className="booking-card mb-4">
                  <Card.Header>
                    <h3>Step 1: Select Your Service</h3>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {services.map((service) => (
                        <Col md="6" className="mb-3" key={service.id}>
                          <div
                            className={`service-option ${
                              bookingData.serviceType === service.id ? "selected" : ""
                            }`}
                            onClick={() => setBookingData((prev) => ({ ...prev, serviceType: service.id }))}
                          >
                            <div className="service-icon">{service.icon}</div>
                            <div className="service-name">{service.name}</div>
                            {service.permitRequired && (
                              <Badge className="permit-badge">Permit Required</Badge>
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <div className="text-end mt-4">
                      <Button
                        className="primaryBtn"
                        onClick={handleNextStep}
                        disabled={!bookingData.serviceType}
                      >
                        Continue <i className="bi bi-arrow-right"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Step 2: Travel Details */}
              {currentStep === 2 && (
                <Card className="booking-card mb-4">
                  <Card.Header>
                    <h3>Step 2: Travel Details</h3>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md="6" className="mb-3">
                        <Form.Label>
                          Travel Date <span className="text-danger">*</span>
                        </Form.Label>
                        <DatePicker
                          selected={bookingData.travelDate}
                          onChange={(date) =>
                            setBookingData((prev) => ({ ...prev, travelDate: date }))
                          }
                          className="form-control"
                          dateFormat="dd/MM/yyyy"
                          minDate={new Date()}
                          required
                        />
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>Return Date (if applicable)</Form.Label>
                        <DatePicker
                          selected={bookingData.returnDate}
                          onChange={(date) =>
                            setBookingData((prev) => ({ ...prev, returnDate: date }))
                          }
                          className="form-control"
                          dateFormat="dd/MM/yyyy"
                          minDate={bookingData.travelDate || new Date()}
                        />
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>Duration</Form.Label>
                        <Form.Select
                          name="duration"
                          value={bookingData.duration}
                          onChange={handleInputChange}
                        >
                          <option value="">Select duration</option>
                          <option value="1-day">1 Day</option>
                          <option value="2-3-days">2-3 Days</option>
                          <option value="4-5-days">4-5 Days</option>
                          <option value="6-7-days">6-7 Days</option>
                          <option value="8+days">8+ Days</option>
                        </Form.Select>
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>
                          Number of Adults <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="adults"
                          value={bookingData.adults}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>Number of Children</Form.Label>
                        <Form.Control
                          type="number"
                          name="children"
                          value={bookingData.children}
                          onChange={handleInputChange}
                          min="0"
                        />
                        <Form.Text className="text-muted">
                          Children under 15 may have restrictions for gorilla trekking
                        </Form.Text>
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>Country of Residence</Form.Label>
                        <Form.Select
                          name="country"
                          value={bookingData.country}
                          onChange={handleInputChange}
                        >
                          <option value="">Select country</option>
                          <option value="Rwanda">Rwanda</option>
                          <option value="USA">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>Preferred Language</Form.Label>
                        <Form.Select
                          name="language"
                          value={bookingData.language}
                          onChange={handleInputChange}
                        >
                          <option value="English">English</option>
                          <option value="French">Français</option>
                          <option value="Kinyarwanda">Kinyarwanda</option>
                        </Form.Select>
                      </Col>
                      {bookingData.serviceType === "airport" && (
                        <Col md="6" className="mb-3">
                          <Form.Label>Pick-up Location</Form.Label>
                          <Form.Control
                            type="text"
                            name="pickupLocation"
                            value={bookingData.pickupLocation}
                            onChange={handleInputChange}
                            placeholder="Kigali International Airport"
                          />
                        </Col>
                      )}
                    </Row>

                    {/* 5. Gorilla Permit Section (Conditional) */}
                    {bookingData.serviceType === "gorilla" && (
                      <Card className="permit-card mt-4">
                        <Card.Body>
                          <h5>
                            <i className="bi bi-shield-check"></i> Gorilla Permit Information
                          </h5>
                          <Alert variant={permitAvailability.available ? "success" : "warning"}>
                            <strong>
                              {permitAvailability.available
                                ? `✅ Permits Available: ${permitAvailability.count} slots`
                                : "⚠️ Limited Permits Available"}
                            </strong>
                            <br />
                            Permit Price: ${permitAvailability.price} per person
                          </Alert>
                          <Form.Check
                            type="checkbox"
                            label="I need a gorilla trekking permit"
                            checked={bookingData.needPermit}
                            onChange={(e) =>
                              setBookingData((prev) => ({
                                ...prev,
                                needPermit: e.target.checked,
                              }))
                            }
                          />
                          {bookingData.needPermit && (
                            <>
                              <Row className="mt-3">
                                <Col md="6">
                                  <Form.Label>Preferred Trekking Date</Form.Label>
                                  <DatePicker
                                    selected={bookingData.permitDate}
                                    onChange={(date) =>
                                      setBookingData((prev) => ({ ...prev, permitDate: date }))
                                    }
                                    className="form-control"
                                    dateFormat="dd/MM/yyyy"
                                    minDate={new Date()}
                                  />
                                </Col>
                                <Col md="6">
                                  <Form.Label>Upload Passport Copy</Form.Label>
                                  <Form.Control
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                  />
                                  <Form.Text className="text-muted">
                                    Required for permit booking
                                  </Form.Text>
                                </Col>
                              </Row>
                              <Alert variant="info" className="mt-3">
                                <strong>Important:</strong>
                                <ul className="mb-0 mt-2">
                                  <li>Minimum age: 15 years</li>
                                  <li>Permits are non-refundable</li>
                                  <li>Health requirements apply</li>
                                </ul>
                              </Alert>
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    )}

                    {/* 6. Accommodation Selection (If Applicable) */}
                    {bookingData.serviceType === "hotel" && (
                      <Card className="accommodation-card mt-4">
                        <Card.Body>
                          <h5>Select Accommodation</h5>
                          <Row>
                            {accommodationOptions.map((acc) => (
                              <Col md="4" className="mb-3" key={acc.id}>
                                <div
                                  className={`accommodation-option ${
                                    bookingData.accommodation === acc.id ? "selected" : ""
                                  }`}
                                  onClick={() =>
                                    setBookingData((prev) => ({ ...prev, accommodation: acc.id }))
                                  }
                                >
                                  <img src={acc.image} alt={acc.name} />
                                  <div className="acc-name">{acc.name}</div>
                                  <div className="acc-price">${acc.price}/night</div>
                                </div>
                              </Col>
                            ))}
                          </Row>
                          {bookingData.accommodation && (
                            <Row className="mt-3">
                              <Col md="6">
                                <Form.Label>Number of Nights</Form.Label>
                                <Form.Control
                                  type="number"
                                  name="nights"
                                  value={bookingData.nights}
                                  onChange={handleInputChange}
                                  min="1"
                                />
                              </Col>
                              <Col md="6">
                                <Form.Label>Room Type</Form.Label>
                                <Form.Select
                                  name="roomType"
                                  value={bookingData.roomType}
                                  onChange={handleInputChange}
                                >
                                  <option value="">Select room type</option>
                                  <option value="single">Single</option>
                                  <option value="double">Double</option>
                                  <option value="twin">Twin</option>
                                  <option value="suite">Suite</option>
                                </Form.Select>
                              </Col>
                            </Row>
                          )}
                        </Card.Body>
                      </Card>
                    )}

                    {/* 7. Transport & Add-ons */}
                    {bookingData.serviceType !== "car-hire" && bookingData.serviceType !== "airport" && (
                      <Card className="addons-card mt-4">
                        <Card.Body>
                          <h5>Add-ons & Extras</h5>
                          <Row>
                            {Object.keys(addOnsPricing).map((addon) => (
                              <Col md="6" className="mb-3" key={addon}>
                                <Form.Check
                                  type="checkbox"
                                  name={addon}
                                  label={
                                    <>
                                      {addon
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) => str.toUpperCase())}
                                      {" "}
                                      <Badge>+${addOnsPricing[addon]}</Badge>
                                    </>
                                  }
                                  checked={bookingData.addOns[addon]}
                                  onChange={handleInputChange}
                                />
                              </Col>
                            ))}
                          </Row>
                        </Card.Body>
                      </Card>
                    )}

                    <div className="d-flex justify-content-between mt-4">
                      <Button variant="outline-secondary" onClick={handlePreviousStep}>
                        <i className="bi bi-arrow-left"></i> Previous
                      </Button>
                      <Button className="primaryBtn" onClick={handleNextStep}>
                        Continue <i className="bi bi-arrow-right"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Step 3: Personal Information */}
              {currentStep === 3 && (
                <Card className="booking-card mb-4">
                  <Card.Header>
                    <h3>Step 3: Personal Information</h3>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md="6" className="mb-3">
                        <Form.Label>
                          Full Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={bookingData.fullName}
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>
                          Email Address <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={bookingData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>
                          Phone Number <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={bookingData.phone}
                          onChange={handleInputChange}
                          placeholder="+250 788 123 456"
                          required
                        />
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>WhatsApp Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="whatsapp"
                          value={bookingData.whatsapp}
                          onChange={handleInputChange}
                          placeholder="+250 788 123 456"
                        />
                      </Col>
                      <Col md="6" className="mb-3">
                        <Form.Label>Emergency Contact</Form.Label>
                        <Form.Control
                          type="text"
                          name="emergencyContact"
                          value={bookingData.emergencyContact}
                          onChange={handleInputChange}
                          placeholder="Name and phone number"
                        />
                      </Col>
                      <Col md="12" className="mb-3">
                        <Form.Label>Special Requests</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="specialRequests"
                          value={bookingData.specialRequests}
                          onChange={handleInputChange}
                          placeholder="Dietary requirements, health notes, accessibility needs..."
                        />
                      </Col>
                    </Row>
                    <Alert variant="info">
                      <i className="bi bi-shield-lock"></i> Your information is secure and will
                      only be used for booking purposes.
                    </Alert>
                    <div className="d-flex justify-content-between mt-4">
                      <Button variant="outline-secondary" onClick={handlePreviousStep}>
                        <i className="bi bi-arrow-left"></i> Previous
                      </Button>
                      <Button className="primaryBtn" onClick={handleNextStep}>
                        Continue <i className="bi bi-arrow-right"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <Card className="booking-card mb-4">
                  <Card.Header>
                    <h3>Step 4: Payment & Confirmation</h3>
                  </Card.Header>
                  <Card.Body>
                    {/* 9. Pricing & Payment Summary */}
                    <Card className="pricing-summary mb-4">
                      <Card.Header>
                        <h5>Price Summary</h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="price-row">
                          <span>Base Price</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        {bookingData.needPermit && (
                          <div className="price-row">
                            <span>Gorilla Permit</span>
                            <span>${permitAvailability.price}</span>
                          </div>
                        )}
                        <div className="price-row total">
                          <span>
                            <strong>Total ({bookingData.currency})</strong>
                          </span>
                          <span>
                            <strong>${calculateTotal().toFixed(2)}</strong>
                          </span>
                        </div>
                        <Row className="mt-3">
                          <Col md="6">
                            <Form.Label>Currency</Form.Label>
                            <Form.Select
                              name="currency"
                              value={bookingData.currency}
                              onChange={handleInputChange}
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="RWF">RWF (Frw)</option>
                            </Form.Select>
                          </Col>
                          <Col md="6">
                            <Form.Label>Payment Option</Form.Label>
                            <Form.Select
                              name="paymentOption"
                              value={bookingData.paymentOption}
                              onChange={handleInputChange}
                            >
                              <option value="full">Pay Full Amount</option>
                              <option value="deposit">Pay Deposit (30%)</option>
                            </Form.Select>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    {/* 10. Secure Payment Options */}
                    <Card className="payment-methods mb-4">
                      <Card.Header>
                        <h5>
                          <i className="bi bi-shield-lock"></i> Secure Payment Method
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            label={
                              <>
                                <i className="bi bi-credit-card"></i> Credit/Debit Card (Visa,
                                MasterCard)
                              </>
                            }
                            checked={bookingData.paymentMethod === "card"}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="radio"
                            name="paymentMethod"
                            value="mobile-money"
                            label={
                              <>
                                <i className="bi bi-phone"></i> Mobile Money (MTN / Airtel)
                              </>
                            }
                            checked={bookingData.paymentMethod === "mobile-money"}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="radio"
                            name="paymentMethod"
                            value="bank-transfer"
                            label={
                              <>
                                <i className="bi bi-bank"></i> Bank Transfer
                              </>
                            }
                            checked={bookingData.paymentMethod === "bank-transfer"}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="radio"
                            name="paymentMethod"
                            value="pay-later"
                            label={
                              <>
                                <i className="bi bi-clock"></i> Pay Later (Request Invoice)
                              </>
                            }
                            checked={bookingData.paymentMethod === "pay-later"}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>

                    {/* 14. Policies & Agreements */}
                    <Card className="policies-card mb-4">
                      <Card.Body>
                        <Accordion>
                          <Accordion.Item eventKey="0">
                            <Accordion.Header>Cancellation Policy</Accordion.Header>
                            <Accordion.Body>
                              Cancellations made 30+ days before travel: Full refund. 15-30 days:
                              50% refund. Less than 15 days: No refund. Permit fees are
                              non-refundable.
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="1">
                            <Accordion.Header>Refund Policy</Accordion.Header>
                            <Accordion.Body>
                              Refunds processed within 5-10 business days to the original payment
                              method.
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="2">
                            <Accordion.Header>Gorilla Permit Rules</Accordion.Header>
                            <Accordion.Body>
                              Permits are non-refundable and non-transferable. Minimum age 15
                              years. Health certificate may be required.
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                        <Form.Check
                          type="checkbox"
                          label="I have read and agree to the Terms & Conditions"
                          checked={bookingData.agreeToTerms}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              agreeToTerms: e.target.checked,
                            }))
                          }
                          className="mt-3"
                          required
                        />
                      </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-between mt-4">
                      <Button variant="outline-secondary" onClick={handlePreviousStep}>
                        <i className="bi bi-arrow-left"></i> Previous
                      </Button>
                      <Button
                        className="primaryBtn"
                        type="submit"
                        disabled={!bookingData.paymentMethod || !bookingData.agreeToTerms}
                      >
                        <i className="bi bi-check-circle"></i> Confirm Booking
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 5 && isSubmitted && (
                <Card className="booking-card mb-4">
                  <Card.Body className="text-center">
                    <div className="success-icon mb-4">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h2 className="success-title">Booking Confirmed!</h2>
                    <p className="booking-reference">
                      Your Booking Reference: <strong>{bookingReference}</strong>
                    </p>
                    <Alert variant="success" className="mt-4">
                      <h5>What's Next?</h5>
                      <ul className="text-start">
                        <li>Check your email for booking confirmation</li>
                        <li>WhatsApp confirmation sent to {bookingData.whatsapp || bookingData.phone}</li>
                        <li>Download your invoice/receipt</li>
                        <li>Our team will contact you within 24 hours</li>
                      </ul>
                    </Alert>
                    <div className="confirmation-actions mt-4">
                      <Button className="primaryBtn me-3" onClick={() => window.print()}>
                        <i className="bi bi-download"></i> Download Receipt
                      </Button>
                      <Button
                        variant="outline-primary"
                        as={NavLink}
                        to="/packages"
                      >
                        <i className="bi bi-calendar"></i> View More Packages
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Form>
          </Col>

          {/* Sidebar: Summary & Live Assistance */}
          <Col lg="4">
            {/* 4. Package / Experience Summary */}
            <Card className="summary-card sticky-top mb-4">
              <Card.Header>
                <h5>Booking Summary</h5>
              </Card.Header>
              <Card.Body>
                {bookingData.serviceType && (
                  <div className="summary-item">
                    <strong>Service:</strong>{" "}
                    {services.find((s) => s.id === bookingData.serviceType)?.name}
                  </div>
                )}
                {bookingData.travelDate && (
                  <div className="summary-item">
                    <strong>Date:</strong>{" "}
                    {bookingData.travelDate?.toLocaleDateString()}
                  </div>
                )}
                {bookingData.adults > 0 && (
                  <div className="summary-item">
                    <strong>Travelers:</strong> {bookingData.adults} adult(s)
                    {bookingData.children > 0 && `, ${bookingData.children} child(ren)`}
                  </div>
                )}
                <div className="summary-total mt-3 pt-3 border-top">
                  <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                </div>
              </Card.Body>
            </Card>

            {/* 13. Live Assistance Panel */}
            <Card className="assistance-card sticky-top">
              <Card.Header>
                <h5>Need Help?</h5>
              </Card.Header>
              <Card.Body>
                <p className="assistance-text">Our team is here to assist you!</p>
                <Button
                  className="primaryBtn w-100 mb-2"
                  href="https://wa.me/250788123456"
                  target="_blank"
                >
                  <i className="bi bi-whatsapp"></i> Chat on WhatsApp
                </Button>
                <Button
                  variant="outline-primary"
                  className="w-100 mb-2"
                  href="tel:+250788123456"
                >
                  <i className="bi bi-telephone"></i> Call Now
                </Button>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  as={NavLink}
                  to="/contact"
                >
                  <i className="bi bi-envelope"></i> Send Email
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Book;

