import React, { useState, useEffect } from 'react';
import { Card } from '../components/UI';
import { Package, Search, AlertCircle } from 'lucide-react';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    if (window.electronAPI) {
      const rows = await window.electronAPI.queryDb(`
        SELECT i.*, m.name as material_name, m.unit 
        FROM inventory_stock i
        JOIN materials_catalog m ON i.material_id = m.id
        ORDER BY i.quantity DESC
      `);
      setInventory(rows);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-600" />
            المستودعات والمخازن
          </h1>
          <p className="text-gray-500 mt-2">متابعة الأرصدة المتوفرة من مواد البناء الموردة للمشروع.</p>
        </div>
      </div>

      <Card className="p-6 shadow-sm bg-white">
        {inventory.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-bold">المستودع فارغ.</p>
            <p className="text-sm text-gray-400">قم بإنشاء فاتورة مشتريات جديدة ليتم إضافة المواد هنا تلقائياً.</p>
          </div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold">المادة</th>
                <th className="p-4 font-bold">المستودع / الموقع</th>
                <th className="p-4 font-bold">الكمية المتوفرة</th>
                <th className="p-4 font-bold">تاريخ التحديث</th>
                <th className="p-4 font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-800 text-base">{item.material_name}</td>
                  <td className="p-4 text-gray-600">{item.warehouse_name}</td>
                  <td className="p-4 font-black text-primary-600 text-lg">{item.quantity} <span className="text-xs">{item.unit}</span></td>
                  <td className="p-4 text-gray-500 text-xs">{new Date(item.last_updated).toLocaleString('ar-SA')}</td>
                  <td className="p-4">
                    {item.quantity < 10 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">مستوى منخفض</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">متوفر</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
