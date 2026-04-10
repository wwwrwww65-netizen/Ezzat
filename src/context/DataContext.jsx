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
    const savedData = localStorage.getItem('ezzat_erp_data');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return {
      projects: initialData.mockProjects,
      clients: initialData.mockClients,
      employees: initialData.mockEmployees,
      invoices: initialData.mockInvoices,
      expenses: initialData.mockExpenses,
      income: [
        { id: 1, title: 'دفعة أولى - فيلا النرجس', method: 'تحويل بنكي', date: '2023-12-05', amount: '50,000 ر.س', status: 'مؤكد' },
        { id: 2, title: 'مستخلص رقم 3 - برج الملك', method: 'شيك', date: '2023-12-04', amount: '120,000 ر.س', status: 'مؤكد' },
        { id: 3, title: 'تجديد فندق الشاطئ', method: 'نقدًا', date: '2023-12-02', amount: '15,000 ر.س', status: 'قيد التحصيل' },
      ],
      inventory: initialData.mockInventory,
      suppliers: initialData.mockSuppliers,
      activityLog: initialData.mockActivityLog,
      users: initialData.mockUsers,
      stats: initialData.mockStats
    };
  });

  useEffect(() => {
    localStorage.setItem('ezzat_erp_data', JSON.stringify(data));
  }, [data]);

  // Generic CRUD helpers
  const addItem = (key, item) => {
    setData(prev => ({
      ...prev,
      [key]: [item, ...prev[key]]
    }));
    logActivity(`إضافة ${key.slice(0, -1)} جديد: ${item.name || item.id}`);
  };

  const updateItem = (key, id, updatedItem) => {
    setData(prev => ({
      ...prev,
      [key]: prev[key].map(item => item.id === id ? { ...item, ...updatedItem } : item)
    }));
    logActivity(`تحديث ${key.slice(0, -1)}: ${updatedItem.name || id}`);
  };

  const deleteItem = (key, id) => {
    const itemToDelete = data[key].find(item => item.id === id);
    setData(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item.id !== id)
    }));
    logActivity(`حذف ${key.slice(0, -1)}: ${itemToDelete?.name || id}`);
  };

  const logActivity = (action) => {
    const newLog = {
      id: Date.now(),
      user: 'أحمد محمد', // Default for now
      action,
      time: 'الآن',
      ip: '192.168.1.1'
    };
    setData(prev => ({
      ...prev,
      activityLog: [newLog, ...prev.activityLog].slice(0, 50) // Keep last 50
    }));
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
