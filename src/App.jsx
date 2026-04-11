import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Clients from './pages/Clients';
import Employees from './pages/Employees';
import Finance from './pages/Finance';
import Invoices from './pages/Finance/Invoices';
import Payments from './pages/Finance/Payments';
import Bonds from './pages/Finance/Bonds';
import Expenses from './pages/Finance/Expenses';
import Income from './pages/Finance/Income';
import Inventory from './pages/Inventory';
import Materials from './pages/Materials';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import Labor from './pages/Labor';
import Equipment from './pages/Equipment';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import ActivityLog from './pages/ActivityLog';
import ProjectFiles from './pages/ProjectFiles';
import ClientPanel from './pages/ClientPanel';
import Tasks from './pages/Tasks';
import Requests from './pages/Requests';
import DocumentCenter from './pages/DocumentCenter';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  const isAuthenticated = true;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/bonds" element={<Bonds />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/labor" element={<Labor />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users" element={<Users />} />
          <Route path="/activity-log" element={<ActivityLog />} />
          <Route path="/files" element={<ProjectFiles />} />
          <Route path="/client-panel" element={<ClientPanel />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/documents" element={<DocumentCenter />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
