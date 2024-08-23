import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  

  return (
    <Router>
      <Routes>
        <Route exact path="/" Component={LandingPage}/>
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App