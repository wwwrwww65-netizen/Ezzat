import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Employees from './pages/Employees';
import Finance from './pages/Finance';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import ActivityLog from './pages/ActivityLog';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  // Simple auth simulation (all routes accessible for demo)
  const isAuthenticated = true;

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard Routes */}
        <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users" element={<Users />} />
          <Route path="/activity-log" element={<ActivityLog />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
