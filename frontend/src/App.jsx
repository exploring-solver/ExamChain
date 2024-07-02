import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import NotFound from './views/NotFound';
import Exam from './layouts/Exam';
import About from './views/About';
import Help from './views/Help';
import { SimpleFooter } from './components/Footer/SimpleFooter';
import StandardNavbar from './components/Navbars/SimpleNavbar';

function App() {
  return (
    <>
      <StandardNavbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SimpleFooter />
    </>
  );
}

export default App;
