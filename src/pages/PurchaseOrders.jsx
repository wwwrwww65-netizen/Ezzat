import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '../components/UI';
import { Plus, Save, ShoppingCart, Truck, Receipt, ListChecks } from 'lucide-react';

export default function PurchaseOrders() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ supplier_id: '', invoice_number: '', items: [] });
  const [currentItem, setCurrentItem] = useState({ material_id: '', quantity: '', unit_price: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    if (window.electronAPI) {
      const p = await window.electronAPI.queryDb(`
        SELECT p.*, s.name as supplier_name 
        FROM purchases p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id 
        ORDER BY p.id DESC
      `);
      setPurchases(p);
      
      const s = await window.electronAPI.queryDb('SELECT * FROM suppliers');
      setSuppliers(s);
      
      const m = await window.electronAPI.queryDb('SELECT * FROM materials_catalog');
      setMaterials(m);
    }
  };

  const addItemToInvoice = () => {
    if (!currentItem.material_id || !currentItem.quantity || !currentItem.unit_price) return;
    const material = materials.find(m => m.id === Number(currentItem.material_id));
    
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, {
        ...currentItem,
        material_name: material?.name,
        unit: material?.unit,
        total: Number(currentItem.quantity) * Number(currentItem.unit_price)
      }]
    }));
    setCurrentItem({ material_id: '', quantity: '', unit_price: '' });
  };

  const handleSaveInvoice = async () => {
    if (!newInvoice.supplier_id || newInvoice.items.length === 0) {
      alert('يرجى اختيار المورد وإضافة مواد للفاتورة');
      return;
    }

    if (window.electronAPI) {
      const totalAmount = newInvoice.items.reduce((acc, item) => acc + item.total, 0);
      
      // 1. Insert Purchase
      await window.electronAPI.executeDb(
        'INSERT INTO purchases (supplier_id, invoice_number, total_amount, paid_amount) VALUES (?, ?, ?, ?)',
        [newInvoice.supplier_id, newInvoice.invoice_number || `INV-${Date.now()}`, totalAmount, 0] // 0 paid = آجلة
      );
      
      // Fetch the inserted purchase ID (simplification for demo)
      const lastPurchase = await window.electronAPI.queryDb('SELECT id FROM purchases ORDER BY id DESC LIMIT 1');
      const purchaseId = lastPurchase[0].id;

      for (const item of newInvoice.items) {
        // 2. Insert Items
        await window.electronAPI.executeDb(
          'INSERT INTO purchase_items (purchase_id, material_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
          [purchaseId, item.material_id, item.quantity, item.unit_price, item.total]
        );
        
        // 3. Update Inventory Stock (ترصيد المخازن)
        const checkStock = await window.electronAPI.queryDb('SELECT * FROM inventory_stock WHERE material_id = ?', [item.material_id]);
        if (checkStock.length > 0) {
          await window.electronAPI.executeDb('UPDATE inventory_stock SET quantity = quantity + ? WHERE material_id = ?', [item.quantity, item.material_id]);
        } else {
          await window.electronAPI.executeDb('INSERT INTO inventory_stock (material_id, warehouse_name, quantity) VALUES (?, ?, ?)', [item.material_id, 'المستودع الرئيسي', item.quantity]);
        }
      }

      // 4. Update Supplier Balance (المديونية)
      await window.electronAPI.executeDb('UPDATE suppliers SET balance = balance + ? WHERE id = ?', [totalAmount, newInvoice.supplier_id]);

      setShowNewInvoice(false);
      setNewInvoice({ supplier_id: '', invoice_number: '', items: [] });
      fetchInitialData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary-600" />
            فواتير المشتريات
          </h1>
          <p className="text-gray-500 mt-2">إدارة مشتريات مواد البناء، الموردين، وإدخالها للمستودع تلقائياً.</p>
        </div>
        <Button onClick={() => setShowNewInvoice(!showNewInvoice)} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
          <Plus className="w-5 h-5 ml-2" /> فاتورة شراء جديدة
        </Button>
      </div>

      {showNewInvoice && (
        <Card className="p-6 border-t-4 border-t-primary-500 shadow-xl bg-white animate-fade-in">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary-600" />
            إنشاء فاتورة مشتريات جديدة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المورد</label>
              <Select 
                value={newInvoice.supplier_id} 
                onChange={(e) => setNewInvoice({...newInvoice, supplier_id: e.target.value})}
                options={[{label: 'اختر المورد...', value: ''}, ...suppliers.map(s => ({label: s.name, value: s.id}))]}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الفاتورة (اختياري)</label>
              <Input 
                value={newInvoice.invoice_number} 
                onChange={(e) => setNewInvoice({...newInvoice, invoice_number: e.target.value})}
                placeholder="مثال: INV-2026-001"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" /> إضافة مواد للفاتورة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">المادة</label>
                <Select 
                  value={currentItem.material_id} 
                  onChange={(e) => setCurrentItem({...currentItem, material_id: e.target.value})}
                  options={[{label: 'اختر...', value: ''}, ...materials.map(m => ({label: `${m.name} (${m.unit})`, value: m.id}))]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الكمية</label>
                <Input type="number" value={currentItem.quantity} onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})} placeholder="الكمية الموردة" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">سعر الوحدة (ر.س)</label>
                <Input type="number" value={currentItem.unit_price} onChange={(e) => setCurrentItem({...currentItem, unit_price: e.target.value})} placeholder="السعر" />
              </div>
              <Button onClick={addItemToInvoice} variant="secondary" className="w-full bg-white border-gray-300">إضافة للبند</Button>
            </div>
          </div>

          {newInvoice.items.length > 0 && (
            <div className="mb-6">
              <table className="w-full text-right text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3">المادة</th>
                    <th className="p-3">الكمية</th>
                    <th className="p-3">سعر الوحدة</th>
                    <th className="p-3">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {newInvoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-bold">{item.material_name} <span className="text-xs text-gray-400">({item.unit})</span></td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">{item.unit_price} ر.س</td>
                      <td className="p-3 font-black text-primary-600">{item.total} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-left mt-4">
                <p className="text-xl font-black text-gray-800">الإجمالي: {newInvoice.items.reduce((acc, item) => acc + item.total, 0)} ر.س</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8">
            <Button onClick={() => setShowNewInvoice(false)} variant="outline">إلغاء</Button>
            <Button onClick={handleSaveInvoice} variant="primary" className="shadow-lg shadow-primary-200">
              <Save className="w-4 h-4 ml-2" /> حفظ واعتماد الفاتورة
            </Button>
          </div>
        </Card>
      )}

      {/* قائمة الفواتير السابقة */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-gray-500" />
          سجل المشتريات
        </h2>
        {purchases.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-medium">لا توجد فواتير مشتريات حتى الآن.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold">رقم الفاتورة</th>
                  <th className="p-4 font-bold">المورد</th>
                  <th className="p-4 font-bold">تاريخ الشراء</th>
                  <th className="p-4 font-bold">إجمالي الفاتورة</th>
                  <th className="p-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-primary-600">{p.invoice_number}</td>
                    <td className="p-4 font-bold text-gray-800">{p.supplier_name || 'غير معروف'}</td>
                    <td className="p-4 text-gray-500">{new Date(p.purchase_date).toLocaleDateString('ar-SA')}</td>
                    <td className="p-4 font-black">{p.total_amount.toLocaleString()} ر.س</td>
                    <td className="p-4">
                      {p.paid_amount >= p.total_amount ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">مدفوعة</span>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">آجلة (غير مدفوعة)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
