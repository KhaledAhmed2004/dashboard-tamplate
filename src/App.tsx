import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from "@/components/layout/layout"
import { Dashboard } from "@/pages/Dashboard"
import Login from "@/pages/Login"
import UserManagement from "@/pages/UserManagement"

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
        
        {/* Default redirect to user management for direct access */}
        <Route path="/" element={<Navigate to="/users" replace />} />
        
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
