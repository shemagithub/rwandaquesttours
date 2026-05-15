import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Home";
import Services from "./pages/Services/Services";
import About from "./pages/About/About";
import Packages from "./pages/Packages/Packages";
import Destinations from "./pages/Destinations/Destinations";
import Gallery from "./pages/Gallery/Gallery";
import Blog from "./pages/Blog/Blog";
import Contact from "./pages/Contact/Contact";
import Book from "./pages/Book/Book";
import CarRental from "./pages/CarRental/CarRental";
import Header from "./components/Common/Header/Header";
import Footer from "./components/Common/Footer/Footer";


function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/car-rental" element={<CarRental />} />
        <Route path="/about" element={<About />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book" element={<Book />} />

      </Routes>
      <Footer />
    </>
  );
}

export default App;
