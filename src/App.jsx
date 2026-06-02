import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Clients from './pages/Clients';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import EmployeesHistory from './pages/EmployeesHistory';
import StaffVouchers from './pages/StaffVouchers';
import StaffPenalties from './pages/StaffPenalties';
import JobRoles from './pages/JobRoles';
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
import Subcontractors from './pages/Subcontractors';
import BOQ from './pages/BOQ';
import Valuations from './pages/Valuations';
import DailyLogs from './pages/DailyLogs';
import DigitalTakeoff from './pages/DigitalTakeoff';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);
  const [user, setUser] = React.useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData, rememberMe) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    if (rememberMe) {
      localStorage.setItem('auth_token', 'true');
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('auth_token', 'true');
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/payroll" element={<Payroll />} />
          <Route path="/employees/history" element={<EmployeesHistory />} />
          <Route path="/employees/vouchers" element={<StaffVouchers />} />
          <Route path="/employees/penalties" element={<StaffPenalties />} />
          <Route path="/employees/job-roles" element={<JobRoles />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/settings" element={<Navigate to="/settings/info" />} />
          <Route path="/settings/:tab" element={<Settings />} />
          <Route path="/subcontractors" element={<Subcontractors />} />
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
          <Route path="/users" element={<Users />} />
          <Route path="/activity-log" element={<ActivityLog />} />
          <Route path="/files" element={<ProjectFiles />} />
          <Route path="/client-panel" element={<ClientPanel />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/documents" element={<DocumentCenter />} />
          <Route path="/boq" element={<BOQ />} />
          <Route path="/valuations" element={<Valuations />} />
          <Route path="/daily-logs" element={<DailyLogs />} />
          <Route path="/digital-takeoff" element={<DigitalTakeoff />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
