import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import './App.css'
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import AuthDetails from './components/AuthDetails';

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState(null)
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log(`authentication: ${isAuthenticated}`)
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated])

  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={<SignIn setIsAuthenticated={setIsAuthenticated} authUser={authUser} setAuthUser={setAuthUser} />}
      />
      <Route 
        path="/signup" 
        element={<SignUp />}
      />
      <Route 
        path="/signout" 
        element={<AuthDetails setIsAuthenticated={setIsAuthenticated} authUser={authUser} setAuthUser={setAuthUser} />}
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard authUser={authUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App