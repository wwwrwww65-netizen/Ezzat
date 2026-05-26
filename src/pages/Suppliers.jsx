import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/UI';
import { Users, UserPlus, Save, Wallet } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '' });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    if (window.electronAPI) {
      const rows = await window.electronAPI.queryDb('SELECT * FROM suppliers ORDER BY id DESC');
      setSuppliers(rows);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name) return;
    if (window.electronAPI) {
      await window.electronAPI.executeDb(
        'INSERT INTO suppliers (name, phone, balance) VALUES (?, ?, 0)',
        [newSupplier.name, newSupplier.phone]
      );
      setNewSupplier({ name: '', phone: '' });
      fetchSuppliers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            إدارة الموردين
          </h1>
          <p className="text-gray-500 mt-2">إضافة الموردين ومتابعة الديون والأرصدة المستحقة لهم.</p>
        </div>
      </div>

      <Card className="p-6 border-t-4 border-t-primary-500 shadow-sm bg-white">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary-600" /> إضافة مورد جديد
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اسم المورد / الشركة</label>
            <Input value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} placeholder="مثال: شركة الراجحي للحديد" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">رقم التواصل</label>
            <Input value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} placeholder="0500000000" />
          </div>
          <Button onClick={handleAddSupplier} variant="primary" className="w-full">
            <Save className="w-4 h-4 ml-2" /> حفظ المورد
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suppliers.map(sup => (
          <Card key={sup.id} className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-800 text-lg">{sup.name}</h3>
              <div className="p-2 bg-gray-50 rounded-lg"><Users className="w-5 h-5 text-gray-400" /></div>
            </div>
            <p className="text-sm text-gray-500 mb-4 font-medium">{sup.phone || 'لا يوجد رقم'}</p>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Wallet className="w-3 h-3"/> المديونية</span>
              <span className={`font-black text-lg ${sup.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {sup.balance.toLocaleString()} ر.س
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
