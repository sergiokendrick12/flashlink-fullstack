import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Shipments from './pages/Shipments';
import Quotes from './pages/Quotes';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Analytics from './pages/Analytics';
import ChatWidget from './components/ChatWidget';
import Dashboard from './pages/Dashboard';
import GetQuote from './pages/GetQuote';
import Track from './pages/Track';
import Contact from './pages/Contact';
import About from './pages/AboutPage';
import Careers from './pages/Careers';
import Blog from './pages/Blog';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1C3F' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, background: '#F0A500', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#0B1C3F', margin: '0 auto 1rem' }}>FL</div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicLayout = ({ children }) => (
  <div>
    <Navbar />
    {children}
    <Footer />
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/login" element={<><Navbar /><Login /></>} />
      <Route path="/register" element={<><Navbar /><Register /></>} />
      <Route path="/get-quote" element={<PublicLayout><GetQuote /></PublicLayout>} />
      <Route path="/track" element={<PublicLayout><Track /></PublicLayout>} />
      <Route path="/track/:trackingNumber" element={<PublicLayout><Track /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
<Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
<Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
<Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
      <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /></>} />
      <Route path="/reset-password/:token" element={<><Navbar /><ResetPassword /></>} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/profile" element={<ProtectedRoute><><Navbar /><Profile /></></ProtectedRoute>} />
      <Route path="/shipments" element={<ProtectedRoute><><Navbar /><Shipments /></></ProtectedRoute>} />
      <Route path="/quotes" element={<ProtectedRoute><><Navbar /><Quotes /></></ProtectedRoute>} />
<Route path="/settings" element={<ProtectedRoute><><Navbar /><Settings /></></ProtectedRoute>} />
<Route path="/search" element={<ProtectedRoute><><Navbar /><Search /></></ProtectedRoute>} />
<Route path="/analytics" element={<ProtectedRoute><><Navbar /><Analytics /></></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><><Navbar /><Dashboard /></></ProtectedRoute>} />
      <Route path="*" element={
        <PublicLayout>
          <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', paddingTop: 70 }}>
            <div style={{ fontSize: '4rem' }}>🗺️</div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#0B1C3F' }}>Page Not Found</h1>
            <a href="/" style={{ background: '#F0A500', color: '#0B1C3F', padding: '12px 24px', borderRadius: 4, fontWeight: 700 }}>Back to Home</a>
          </div>
        </PublicLayout>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'DM Sans', fontSize: '0.88rem', borderRadius: 8 },
          success: { iconTheme: { primary: '#F0A500', secondary: '#0B1C3F' } },
        }} />
        <AppRoutes />
        <ChatWidget />
      </AuthProvider>
    </BrowserRouter>
  );
}