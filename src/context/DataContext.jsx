import React, { createContext, useContext, useState, useEffect } from 'react';
import * as initialData from '../data/mockData';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const defaultData = {
      projects: initialData.mockProjects || [],
      clients: initialData.mockClients || [],
      employees: initialData.mockEmployees || [],
      invoices: initialData.mockInvoices || [],
      payments: initialData.mockPayments || [],
      bonds: initialData.mockBonds || [],
      expenses: initialData.mockExpenses || [],
      income: initialData.mockIncome || [],
      inventory: initialData.mockInventory || [],
      categories: initialData.mockCategories || [],
      suppliers: initialData.mockSuppliers || [],
      purchaseOrders: initialData.mockPurchaseOrders || [],
      projectStages: initialData.mockProjectStages || [],
      projectFiles: initialData.mockProjectFiles || [],
      laborTeams: initialData.mockLaborTeams || [],
      equipment: initialData.mockEquipment || [],
      tasks: initialData.mockTasks || [],
      notifications: initialData.mockNotifications || [],
      activityLog: initialData.mockActivityLog || [],
      users: initialData.mockUsers || [],
      stats: initialData.mockStats || [],
      currentRole: 'admin'
    };

    const savedData = localStorage.getItem('abujawad_erp_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return { ...defaultData, ...parsed };
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('abujawad_erp_data', JSON.stringify(data));
  }, [data]);

  // Activity Logger
  const logActivity = (action, user = 'أحمد محمد') => {
    const newLog = {
      id: Date.now(),
      user,
      action,
      time: new Date().toLocaleString('ar-SA'),
      ip: '192.168.1.1'
    };
    setData(prev => ({
      ...prev,
      activityLog: [newLog, ...prev.activityLog].slice(0, 100)
    }));
  };

  // Advanced Interconnected CRUD
  const addItem = (key, item) => {
    const newItem = { ...item, id: item.id || Date.now() };
    setData(prev => {
      const newState = { ...prev, [key]: [newItem, ...prev[key]] };

      // Interconnection Logic
      if (key === 'expenses' && item.projectId) {
         newState.projects = prev.projects.map(p =>
          p.id === item.projectId ? { ...p, actualCost: (Number(p.actualCost) || 0) + Number(item.amount) } : p
        );
      }

      if (key === 'payments' && item.entityType === 'client') {
        newState.clients = prev.clients.map(c =>
          c.id === item.entityId ? { ...c, currentBalance: (Number(c.currentBalance) || 0) - Number(item.amount) } : c
        );
      }

      if (key === 'invoices' && item.clientId) {
        newState.clients = prev.clients.map(c =>
          c.id === item.clientId ? { ...c, currentBalance: (Number(c.currentBalance) || 0) + Number(item.total) } : c
        );
      }

      return newState;
    });
    logActivity(`إضافة ${key} جديد: ${item.name || item.id || item.title}`);
  };

  const updateItem = (key, id, updatedItem) => {
    setData(prev => ({
      ...prev,
      [key]: prev[key].map(item => item.id === id ? { ...item, ...updatedItem } : item)
    }));
    logActivity(`تحديث في ${key}: ${updatedItem.name || id}`);
  };

  const deleteItem = (key, id) => {
    const itemToDelete = data[key].find(item => item.id === id);
    setData(prev => {
      const newState = { ...prev, [key]: prev[key].filter(item => item.id !== id) };

      // Reverse Interconnection Logic on Delete
      if (key === 'expenses' && itemToDelete?.projectId) {
        newState.projects = prev.projects.map(p =>
          p.id === itemToDelete.projectId ? { ...p, actualCost: Math.max(0, (Number(p.actualCost) || 0) - Number(itemToDelete.amount)) } : p
        );
      }

      if (key === 'invoices' && itemToDelete?.clientId) {
        newState.clients = prev.clients.map(c =>
          c.id === itemToDelete.clientId ? { ...c, currentBalance: Math.max(0, (Number(c.currentBalance) || 0) - Number(itemToDelete.total)) } : c
        );
      }

      return newState;
    });
    logActivity(`حذف من ${key}: ${itemToDelete?.name || id}`);
  };

  const value = {
    ...data,
    addItem,
    updateItem,
    deleteItem,
    logActivity,
    setData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
