import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { MealsProvider } from './context/MealsContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <MealsProvider>
            <div className="bg-gray-50 min-h-screen text-gray-900 font-sans">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/profile" element={<Profile />} />
                  {/* Onboarding is also protected but handled slightly differently in Logic if needed */}
                  <Route path="/onboarding" element={<Onboarding />} />
                </Route>
              </Routes>
            </div>
          </MealsProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
