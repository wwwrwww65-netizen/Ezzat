import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!window.electronAPI) return;

    const newNotifications = [];

    try {
      // 1. Low Stock Alerts
      const lowStock = await window.electronAPI.queryDb(`
        SELECT i.*, m.name as material_name, m.unit
        FROM inventory_stock i
        JOIN materials_catalog m ON i.material_id = m.id
        WHERE i.quantity < 10
        ORDER BY i.quantity ASC
      `);

      lowStock.forEach(item => {
        newNotifications.push({
          id: 'low-stock-' + item.material_id,
          type: 'warning',
          category: 'inventory',
          title: 'مستوى منخفض في المخزون',
          message: item.material_name + ' - الكمية المتبقية: ' + (item.quantity || 0) + ' ' + item.unit,
          timestamp: new Date().toISOString(),
          read: false,
          icon: '📦',
          link: '/inventory'
        });
      });

      // 2. Out of Stock Alerts
      const outOfStock = await window.electronAPI.queryDb(`
        SELECT i.*, m.name as material_name, m.unit
        FROM inventory_stock i
        JOIN materials_catalog m ON i.material_id = m.id
        WHERE i.quantity <= 0
      `);

      outOfStock.forEach(item => {
        const idx = newNotifications.findIndex(n => n.id === 'low-stock-' + item.material_id);
        if (idx !== -1) {
          newNotifications[idx] = {
            ...newNotifications[idx],
            id: 'out-stock-' + item.material_id,
            type: 'danger',
            title: 'نفذ من المخزون!',
            message: item.material_name + ' - نفدت الكمية تماماً',
            icon: '🚨',
          };
        }
      });

      // 3. Unpaid Purchases (credit invoices pending payment)
      const unpaidPurchases = await window.electronAPI.queryDb(`
        SELECT p.*, s.name as supplier_name
        FROM purchases p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.paid_amount < p.total_amount
        ORDER BY p.purchase_date DESC
        LIMIT 5
      `);

      unpaidPurchases.forEach(p => {
        const remaining = (p.total_amount || 0) - (p.paid_amount || 0);
        newNotifications.push({
          id: 'unpaid-' + p.id,
          type: 'info',
          category: 'purchases',
          title: 'فاتورة مشتريات آجلة غير مسددة',
          message: (p.supplier_name || 'مورد') + ' - متبقي: ' + remaining.toLocaleString() + ' ر.س',
          timestamp: p.purchase_date,
          read: false,
          icon: '🧾',
          link: '/purchase-orders'
        });
      });

      // 4. Suppliers with high debt
      const highDebtSuppliers = await window.electronAPI.queryDb(`
        SELECT * FROM suppliers WHERE balance > 5000 ORDER BY balance DESC LIMIT 3
      `);

      highDebtSuppliers.forEach(sup => {
        newNotifications.push({
          id: 'debt-sup-' + sup.id,
          type: 'warning',
          category: 'suppliers',
          title: 'مديونية عالية للمورد',
          message: sup.name + ' - الرصيد المستحق: ' + (sup.balance || 0).toLocaleString() + ' ر.س',
          timestamp: new Date().toISOString(),
          read: false,
          icon: '💰',
          link: '/suppliers'
        });
      });

    } catch (err) {
      console.error('Notification fetch error:', err);
    }

    // Preserve read state from previous notifications
    setNotifications(prev => {
      const readIds = new Set(prev.filter(n => n.read).map(n => n.id));
      return newNotifications.map(n => ({ ...n, read: readIds.has(n.id) }));
    });
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, fetchNotifications, lastChecked }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
