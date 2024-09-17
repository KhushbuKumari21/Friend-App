import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute'; // Make sure PrivateRoute is correctly implemented
import Navbar from './components/Navbar'; // Optional
import './App.css';


function App() {
  return (
    <Router>
      <div className="App">
        {/* Optional Navbar */}
        <Navbar />
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Assuming PrivateRoute is a component that handles authentication */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          {/* Catch-all route for 404 page */}
          <Route path="*" element={<h2>404 Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
