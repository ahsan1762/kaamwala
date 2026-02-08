import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import Services from './components/Services';
import BecomeWorker from './components/BecomeWorker';
import WorkerProfile from './components/WorkerProfile';
import PublicWorkerProfile from './components/PublicWorkerProfile';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Booking from './components/Booking';

import WorkerDashboard from './components/WorkerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminUserDetails from './components/AdminUserDetails';
import UserProfile from './components/UserProfile';
import SupportPage from './components/SupportPage';
import NotFound from './components/NotFound';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';

import ChatbotWidget from './components/ChatbotWidget';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Public or Protected based on logic, but Become Worker usually for customers */}
            <Route path="/become-worker" element={<BecomeWorker />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Customer Protected Routes */}
            <Route
              path="/booking"
              element={
                <PrivateRoute allowedRoles={['customer']}>
                  <Booking />
                </PrivateRoute>
              }
            />

            {/* Worker Protected Routes */}
            <Route
              path="/worker-dashboard"
              element={
                <PrivateRoute allowedRoles={['worker']}>
                  <WorkerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/worker-profile"
              element={
                <PrivateRoute allowedRoles={['worker']}>
                  <WorkerProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/worker/:id"
              element={
                <PrivateRoute>
                  <PublicWorkerProfile />
                </PrivateRoute>
              }
            />

            {/* Shared Protected Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/support"
              element={
                <PrivateRoute>
                  <SupportPage />
                </PrivateRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/user/:id"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminUserDetails />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatbotWidget />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider >
  );
}

export default App;
