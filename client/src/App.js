import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Homepage from './pages/Homepage';
import EnhancedHome from './pages/EnhancedHome';
import DashboardPage from './pages/DashboardPage';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import { DesignSystemProvider } from './context/DesignSystem';
import './styles/App.css';

const Navigation = () => {
  const location = useLocation();

  // Hide navigation on splash screen
  if (location.pathname === '/') {
    return null;
  }

  const handleLogoClick = () => {
    // Scroll to top when logo is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/home" className="nav-logo" onClick={handleLogoClick}>
          🎬 CineScope AI
        </Link>
        <div className="nav-links">
          <Link 
            to="/home" 
            className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/search" 
            className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}
          >
            Search
          </Link>
          <Link 
            to="/dashboard" 
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <ThemeProvider>
      <DesignSystemProvider>
        <Router>
          <div className="App">
            <Navigation />
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/home" element={<Homepage />} />
              <Route path="/search" element={<EnhancedHome />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </div>
        </Router>
      </DesignSystemProvider>
    </ThemeProvider>
  );
}

export default App;
