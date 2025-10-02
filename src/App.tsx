import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from "@/components/layout/layout"
import { Dashboard } from "@/pages/Dashboard"
import Login from "@/pages/Login"
import UserManagement from "@/pages/UserManagement"
import UserDetails from "@/pages/UserDetails"
import FaqManagement from "@/pages/FaqManagement"
import PrivacyPolicy from "@/pages/PrivacyPolicy"
import TermsAndConditions from "@/pages/TermsAndConditions"
import LegalEditPage from "@/pages/LegalEditPage"

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication routes - no layout */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard route - with layout */}
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        
        {/* User Management routes - with layout */}
        <Route path="/users" element={
          <Layout>
            <UserManagement />
          </Layout>
        } />

        {/* User Details route - with layout */}
        <Route path="/users/:id" element={
          <Layout>
            <UserDetails />
          </Layout>
        } />
        
        {/* FAQ Management route - with layout */}
        <Route path="/faqs" element={
          <Layout>
            <FaqManagement />
          </Layout>
        } />

        {/* Legal routes - with layout */}
        <Route path="/privacy" element={
          <Layout>
            <PrivacyPolicy />
          </Layout>
        } />
        <Route path="/terms" element={
          <Layout>
            <TermsAndConditions />
          </Layout>
        } />
        <Route path="/legal/:slug/edit" element={
          <Layout>
            <LegalEditPage />
          </Layout>
        } />
        
        {/* Default redirect to user management for direct access */}
        <Route path="/" element={<Navigate to="/users" replace />} />
        
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
