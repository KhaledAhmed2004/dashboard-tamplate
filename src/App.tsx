import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from "@/components/layout/Layout"
import AuthGuard from "@/components/AuthGuard"
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
          <AuthGuard>
            <Layout>
              <Dashboard />
            </Layout>
          </AuthGuard>
        } />
        
        {/* User Management routes - with layout */}
        <Route path="/users" element={
          <AuthGuard>
            <Layout>
              <UserManagement />
            </Layout>
          </AuthGuard>
        } />

        {/* User Details route - with layout */}
        <Route path="/users/:id" element={
          <AuthGuard>
            <Layout>
              <UserDetails />
            </Layout>
          </AuthGuard>
        } />
        
        {/* FAQ Management route - with layout */}
        <Route path="/faqs" element={
          <AuthGuard>
            <Layout>
              <FaqManagement />
            </Layout>
          </AuthGuard>
        } />

        {/* Legal routes - with layout */}
        <Route path="/privacy" element={
          <AuthGuard>
            <Layout>
              <PrivacyPolicy />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/terms" element={
          <AuthGuard>
            <Layout>
              <TermsAndConditions />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/legal/:slug/edit" element={
          <AuthGuard>
            <Layout>
              <LegalEditPage />
            </Layout>
          </AuthGuard>
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
