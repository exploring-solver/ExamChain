import React from 'react';
import { Routes, Route ,Link} from 'react-router-dom';
import AppNavbar from './components/standard/NavbarOut';
import Footer from './components/standard/Footer';
import Home from './components/standard/Home';
import About from './components/standard/About';
import Contact from './components/standard/Contact';

const App = () => {
  return (
      <div className="flex flex-col min-h-screen">
        <AppNavbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
  );
};

export default App;
