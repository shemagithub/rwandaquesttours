import React, { useEffect, useState } from "react";
import {
  Container,
  Navbar,
  Offcanvas,
  Nav,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "../Header/header.css";

const Header = () => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen(!open);
  };

  useEffect(() => {
    window.addEventListener("scroll", isSticky);
    return () => {
      window.removeEventListener("scroll", isSticky);
    };
  }, []);

  // sticky Header 
  const isSticky=(e)=>{
    const header = document.querySelector('.header-section');
    const scrollTop = window.scrollY;
    scrollTop >= 120 ? header.classList.add('is-sticky') :
    header.classList.remove('is-sticky')
  }


 

  return (
    <>
      <header className="header-section">
        <Container>
         
            <Navbar expand="lg" className="p-0">
              {/* Logo Section  */}
              <Navbar.Brand>
                <NavLink to="/">Rwandagorillatrekk</NavLink>
              </Navbar.Brand>
              {/* End Logo Section  */}

              {/* Desktop Sidebar - Hidden on small screens */}
              <Navbar.Offcanvas
                id={`offcanvasNavbar-expand-lg`}
                aria-labelledby={`offcanvasNavbarLabel-expand-lg`}
                placement="start"
                show={open}
                className="d-none d-md-block"
              >
                {/*mobile Logo Section  */}
                <Offcanvas.Header>
                  <h1 className="logo">Rwandagorillatrekk</h1>
                  <span className="navbar-toggler ms-auto"  onClick={toggleMenu}>
                    <i className="bi bi-x-lg"></i>
                  </span>
                </Offcanvas.Header>
                {/*end mobile Logo Section  */}

                <Offcanvas.Body>
                  <Nav className="justify-content-end flex-grow-1 pe-3">
                    <NavLink className="nav-link" to="/" >
                      Home
                    </NavLink>
                    <NavLink className="nav-link" to="/about" >
                      About
                    </NavLink>
                    <NavLink className="nav-link" to="/services" >
                      Services
                    </NavLink>
                    <NavLink className="nav-link" to="/car-rental" >
                      Car Rental
                    </NavLink>
                    <NavLink className="nav-link" to="/packages" >
                      Packages
                    </NavLink>
                    <NavLink className="nav-link" to="/destinations" >
                      Destinations
                    </NavLink>
                    <NavLink className="nav-link" to="/gallery" >
                      Gallery
                    </NavLink>
                    <NavLink className="nav-link" to="/blog" >
                      Blog
                    </NavLink>
                    <NavLink className="nav-link" to="/contact" >
                      Contact
                    </NavLink>
                  </Nav>
                </Offcanvas.Body>
              </Navbar.Offcanvas>
              <div className="ms-md-4 ms-2">
                <NavLink className="primaryBtn d-none d-sm-inline-block" to="/book">
                  Book Now
                </NavLink>
                {/* Desktop Menu Toggle - Hidden on small screens */}
                <li className="d-none d-md-inline-block d-lg-none ms-3 toggle_btn">
                  <i className={open ? "bi bi-x-lg" : "bi bi-list"}  onClick={toggleMenu}></i>
                </li>
              </div>
            </Navbar>
      
        </Container>
      </header>
      
      {/* Bottom Navbar for Mobile - Only visible on small screens, outside header */}
      <nav className="bottom-navbar d-md-none">
        <div className="bottom-nav-links">
          <NavLink className="bottom-nav-link" to="/" onClick={() => setOpen(false)}>
            <i className="bi bi-house-door"></i>
            <span>Home</span>
          </NavLink>
          <NavLink className="bottom-nav-link" to="/about" onClick={() => setOpen(false)}>
            <i className="bi bi-info-circle"></i>
            <span>About</span>
          </NavLink>
          <NavLink className="bottom-nav-link" to="/services" onClick={() => setOpen(false)}>
            <i className="bi bi-briefcase"></i>
            <span>Services</span>
          </NavLink>
          <NavLink className="bottom-nav-link" to="/car-rental" onClick={() => setOpen(false)}>
            <i className="bi bi-car-front"></i>
            <span>Rental</span>
          </NavLink>
          <NavLink className="bottom-nav-link" to="/packages" onClick={() => setOpen(false)}>
            <i className="bi bi-suitcase"></i>
            <span>Packages</span>
          </NavLink>
          <NavLink className="bottom-nav-link" to="/destinations" onClick={() => setOpen(false)}>
            <i className="bi bi-geo-alt"></i>
            <span>Destinations</span>
          </NavLink>
          <NavLink className="bottom-nav-link" to="/gallery" onClick={() => setOpen(false)}>
            <i className="bi bi-images"></i>
            <span>Gallery</span>
          </NavLink>
          <NavLink className="bottom-nav-link" to="/blog" onClick={() => setOpen(false)}>
            <i className="bi bi-journal-text"></i>
            <span>Blog</span>
          </NavLink>
          <NavLink className="bottom-nav-link" to="/contact" onClick={() => setOpen(false)}>
            <i className="bi bi-envelope"></i>
            <span>Contact</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default Header;
