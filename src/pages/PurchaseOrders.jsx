import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, SearchableSelect, Table, Badge, Modal } from '../components/UI';
import { cn } from '../components/UI';
import { 
  ShoppingCart, Plus, Receipt, Search, Printer, 
  FileDown, Banknote, Truck, Trash2, CheckCircle, Clock, Send, Eye, X
} from 'lucide-react';

export default function PurchaseOrders() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewInvoice, setViewInvoice] = useState(null);
  const [viewItems, setViewItems] = useState([]);
  
  // Modal & Form State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    supplier_id: '',
    invoice_number: '',
    purchase_date: new Date().toISOString().split('T')[0],
    payment_method: 'credit', // 'cash' or 'credit'
    items: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    if (window.electronAPI) {
      const p = await window.electronAPI.queryDb(`
        SELECT p.*, s.name as supplier_name 
        FROM purchases p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id 
        ORDER BY p.purchase_date DESC, p.id DESC
      `);
      setPurchases(p);
      
      const s = await window.electronAPI.queryDb('SELECT * FROM suppliers ORDER BY name ASC');
      setSuppliers(s);
      
      const m = await window.electronAPI.queryDb('SELECT * FROM materials_catalog ORDER BY name ASC');
      setMaterials(m);
    }
  };

  // Deliver purchase to warehouse
  const handleDeliver = async (purchaseId) => {
    if (!window.electronAPI) return;
    if (!confirm('هل تريد تأكيد إرسال هذه الفاتورة لمدير المخازن للموافقة على الاستلام؟')) return;
    await window.electronAPI.executeDb(
      "UPDATE purchases SET delivery_status = 'delivered', delivery_date = CURRENT_TIMESTAMP WHERE id = ?",
      [purchaseId]
    );
    fetchInitialData();
    alert('تم إرسال طلب التسليم لمدير المخازن! سيظهر الإشعار في شاشة المخازن.');
  };

  // View Invoice Details
  const handleViewInvoice = async (purchase) => {
    setViewInvoice(purchase);
    if (window.electronAPI) {
      const items = await window.electronAPI.queryDb(`
        SELECT pi.*, m.name as material_name, m.unit
        FROM purchase_items pi
        JOIN materials_catalog m ON pi.material_id = m.id
        WHERE pi.purchase_id = ?
      `, [purchase.id]);
      setViewItems(items);
    }
  };

  // Print Invoice
  const handlePrintInvoice = (purchase, items) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة مشتريات ${purchase.invoice_number || 'INV-' + purchase.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial; direction: rtl; padding: 30px; color: #1e293b; }
          h1 { font-size: 24px; margin-bottom: 5px; color: #1e3a8a; }
          .subtitle { color: #64748b; font-size: 13px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
          .info-row { display: flex; gap: 40px; margin-bottom: 16px; }
          .info-item label { font-size: 11px; color: #94a3b8; font-weight: bold; text-transform: uppercase; display: block; }
          .info-item span { font-size: 14px; font-weight: bold; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          thead tr { background: #1e3a8a; color: white; }
          th, td { padding: 10px 14px; text-align: right; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
          tbody tr:nth-child(even) { background: #f8fafc; }
          .total-row { background: #eff6ff; font-weight: bold; font-size: 15px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
          .stamp { border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; width: 150px; height: 80px; display: flex; align-items: center; justify-content: center; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>فاتورة مشتريات</h1>
            <p class="subtitle">نظام إدارة المقاولات</p>
          </div>
          <div style="text-align:left">
            <div style="font-size:18px; font-weight:900; color:#1e3a8a">${purchase.invoice_number || 'INV-' + purchase.id}</div>
            <div style="color:#64748b; font-size:12px">تاريخ: ${new Date(purchase.purchase_date).toLocaleDateString('ar-SA')}</div>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item"><label>المورد</label><span>${purchase.supplier_name || '-'}</span></div>
          <div class="info-item"><label>حالة الدفع</label><span>${(purchase.paid_amount || 0) >= (purchase.total_amount || 0) ? 'مدفوعة نقداً' : 'آجلة'}</span></div>
          <div class="info-item"><label>حالة التسليم</label><span>${purchase.delivery_status === 'received' ? 'تم الاستلام' : purchase.delivery_status === 'delivered' ? 'في انتظار الاستلام' : 'معلقة'}</span></div>
        </div>
        <table>
          <thead><tr><th>#</th><th>اسم المادة</th><th>الوحدة</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
          <tbody>
            ${items.map((item, i) => `<tr><td>${i+1}</td><td>${item.material_name}</td><td>${item.unit}</td><td>${item.quantity}</td><td>${(item.unit_price||0).toLocaleString()} ر.س</td><td>${(item.total||0).toLocaleString()} ر.س</td></tr>`).join('')}
            <tr class="total-row"><td colspan="5" style="text-align:center">الإجمالي النهائي</td><td>${(purchase.total_amount||0).toLocaleString()} ر.س</td></tr>
          </tbody>
        </table>
        <div class="footer">
          <div>
            <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-SA')}</p>
            <p style="margin-top:4px">نظام إدارة المقاولات</p>
          </div>
          <div style="display:flex; gap:20px">
            <div class="stamp">توقيع مدير المشتريات</div>
            <div class="stamp">ختم أمين المستودع</div>
          </div>
        </div>
        <script>window.onload = function(){ window.print(); }</script>
      </body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Form Handlers
  const addEmptyRow = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { material_id: '', quantity: '', unit_price: '', total: 0, id: Date.now() }]
    }));
  };

  const removeRow = (idToRemove) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== idToRemove)
    }));
  };

  const updateRow = (id, field, value) => {
    setNewInvoice(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unit_price') {
            updated.total = (parseFloat(updated.quantity) || 0) * (parseFloat(updated.unit_price) || 0);
          }
          return updated;
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoice.supplier_id) return alert('يرجى اختيار المورد');
    
    const validItems = newInvoice.items.filter(i => i.material_id && i.quantity > 0 && i.unit_price > 0);
    if (validItems.length === 0) return alert('يرجى إضافة صنف واحد على الأقل ببيانات صحيحة');

    if (window.electronAPI) {
      const totalAmount = validItems.reduce((acc, item) => acc + item.total, 0);
      const paidAmount = newInvoice.payment_method === 'cash' ? totalAmount : 0;
      
      // 1. Insert Purchase
      const invNum = newInvoice.invoice_number || ('INV-' + Date.now());
      await window.electronAPI.executeDb(
        'INSERT INTO purchases (supplier_id, invoice_number, total_amount, paid_amount, purchase_date) VALUES (?, ?, ?, ?, ?)',
        [newInvoice.supplier_id, invNum, totalAmount, paidAmount, newInvoice.purchase_date]
      );
      
      // Fetch the inserted purchase ID
      const lastPurchase = await window.electronAPI.queryDb('SELECT id FROM purchases ORDER BY id DESC LIMIT 1');
      const purchaseId = lastPurchase[0].id;

      for (const item of validItems) {
        // 2. Insert Items
        await window.electronAPI.executeDb(
          'INSERT INTO purchase_items (purchase_id, material_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)',
          [purchaseId, item.material_id, item.quantity, item.unit_price, item.total]
        );
      }

      // 3. Update Supplier Balance (المديونية) if not fully paid in cash
      const addedToDebt = totalAmount - paidAmount;
      if (addedToDebt > 0) {
        await window.electronAPI.executeDb('UPDATE suppliers SET balance = balance + ? WHERE id = ?', [addedToDebt, newInvoice.supplier_id]);
      } else {
        // If paid in cash, log the payment in accounting journal directly
        const journalCode = 'SUP-' + newInvoice.supplier_id;
        const journalDesc = 'مشتريات نقدية فاتورة رقم ' + (newInvoice.invoice_number || purchaseId);
        await window.electronAPI.executeDb(
          'INSERT INTO accounting_journal (account_code, debit, credit, description, entry_date) VALUES (?, ?, ?, ?, ?)',
          [journalCode, totalAmount, totalAmount, journalDesc, newInvoice.purchase_date]
        );
      }

      setIsInvoiceModalOpen(false);
      setNewInvoice({ supplier_id: '', invoice_number: '', purchase_date: new Date().toISOString().split('T')[0], payment_method: 'credit', items: [] });
      fetchInitialData();
    }
  };

  // KPIs calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthPurchases = purchases.filter(p => {
    const d = new Date(p.purchase_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalInvoicesMonth = thisMonthPurchases.length;
  const totalPaidCash = purchases.filter(p => (p.paid_amount || 0) >= (p.total_amount || 0)).reduce((acc, p) => acc + (p.total_amount || 0), 0);
  const totalCredit = purchases.filter(p => (p.paid_amount || 0) < (p.total_amount || 0)).reduce((acc, p) => acc + ((p.total_amount || 0) - (p.paid_amount || 0)), 0);
  
  // Top supplier
  const supplierCounts = purchases.reduce((acc, p) => {
    acc[p.supplier_name] = (acc[p.supplier_name] || 0) + 1;
    return acc;
  }, {});
  const topSupplier = Object.keys(supplierCounts).sort((a, b) => supplierCounts[b] - supplierCounts[a])[0] || '-';

  const filteredPurchases = purchases.filter(p => 
    (p.invoice_number || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.supplier_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateGrandTotal = () => {
    return newInvoice.items.reduce((acc, item) => acc + item.total, 0);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
             <ShoppingCart className="w-8 h-8 text-blue-600" />
             المشتريات وفواتير الموردين
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">سجل المشتريات الذي يغذي المخازن ويرتبط بحسابات الموردين المباشرة.</p>
        </div>
        <Button onClick={() => { setIsInvoiceModalOpen(true); addEmptyRow(); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200">
          <Plus className="w-5 h-5 ml-2" /> إنشاء فاتورة مشتريات
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Receipt className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">فواتير هذا الشهر</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">{totalInvoicesMonth} <span className="text-xs font-medium text-gray-500">فاتورة</span></h3>
          </div>
        </Card>
        
        <Card className="p-6 border-none shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Banknote className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">مشتريات مدفوعة (نقداً)</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalPaidCash.toLocaleString()} <span className="text-xs font-medium text-gray-500">ر.س</span></h3>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <Clock className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">مشتريات آجلة (على الحساب)</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">{totalCredit.toLocaleString()} <span className="text-xs font-medium text-gray-500">ر.س</span></h3>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Truck className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">أكثر مورد هذا الشهر</p>
            <h3 className="text-lg font-black text-gray-800 mt-1 truncate max-w-[120px]" title={topSupplier}>{topSupplier}</h3>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="p-0 border-none shadow-sm overflow-hidden" 
            headerAction={
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="ابحث برقم الفاتورة أو المورد..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4 pr-10 py-2.5 bg-gray-50 border-gray-100 focus:bg-white" 
                  />
                </div>
                <Button variant="outline" className="border-gray-200 bg-white font-bold text-gray-700 hidden md:flex">
                  <FileDown className="w-4 h-4 ml-2" /> تصدير
                </Button>
              </div>
            }>
        <Table headers={['رقم الفاتورة', 'المورد', 'التاريخ', 'الإجمالي', 'الدفع', 'حالة التسليم للمخازن', 'الإجراءات']}>
          {filteredPurchases.length === 0 ? (
             <tr><td colSpan="7" className="text-center py-8 text-gray-500 font-bold">لا توجد فواتير مطابقة للبحث</td></tr>
          ) : (
            filteredPurchases.map(p => {
              const deliveryStatus = p.delivery_status || 'pending';
              return (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-black text-sm text-blue-600">{p.invoice_number || ('INV-' + p.id)}</td>
                <td className="px-6 py-4 font-bold text-sm text-gray-800">{p.supplier_name || 'غير معروف'}</td>
                <td className="px-6 py-4 font-medium text-sm text-gray-500" dir="ltr">{new Date(p.purchase_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-black text-sm text-gray-800">{(p.total_amount || 0).toLocaleString()} ر.س</td>
                <td className="px-6 py-4">
                  {(p.paid_amount || 0) >= (p.total_amount || 0) ? (
                    <Badge variant="success">نقداً</Badge>
                  ) : (
                    <Badge variant="warning">آجل</Badge>
                  )}
                </td>
                <td className="px-6 py-4">
                  {deliveryStatus === 'received' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" /> تم الاستلام
                    </span>
                  )}
                  {deliveryStatus === 'delivered' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 animate-pulse">
                      <Clock className="w-3.5 h-3.5" /> بانتظار الموافقة
                    </span>
                  )}
                  {deliveryStatus === 'rejected' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                      <X className="w-3.5 h-3.5" /> رفض الاستلام
                    </span>
                  )}
                  {deliveryStatus === 'pending' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                      <Clock className="w-3.5 h-3.5" /> لم ترسل بعد
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 items-center">
                    <button onClick={() => handleViewInvoice(p)} title="عرض الفاتورة" className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    {deliveryStatus === 'pending' && (
                      <button
                        onClick={() => handleDeliver(p.id)}
                        title="تسليم للمخازن"
                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              );
            })
          )}
        </Table>
      </Card>

      {/* New Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="إصدار فاتورة مشتريات وتوريد بضاعة" className="max-w-4xl">
        <form onSubmit={handleSaveInvoice} className="space-y-6">
          
          {/* Header Info */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">المورد (الشركة)</label>
               <Select 
                  value={newInvoice.supplier_id} 
                  onChange={(e) => setNewInvoice({...newInvoice, supplier_id: e.target.value})}
                  options={suppliers.map(s => ({label: s.name, value: s.id}))}
                  required
                  className="bg-white"
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">رقم الفاتورة المرجعي</label>
               <Input 
                  value={newInvoice.invoice_number} 
                  onChange={(e) => setNewInvoice({...newInvoice, invoice_number: e.target.value})}
                  placeholder="اختياري: فا-992"
                  className="bg-white"
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الفاتورة</label>
               <Input 
                  type="date"
                  value={newInvoice.purchase_date} 
                  onChange={(e) => setNewInvoice({...newInvoice, purchase_date: e.target.value})}
                  required
                  className="bg-white"
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">طريقة الدفع</label>
               <select 
                  value={newInvoice.payment_method} 
                  onChange={(e) => setNewInvoice({...newInvoice, payment_method: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
               >
                  <option value="cash">نقداً (من الخزينة)</option>
                  <option value="credit">آجل (يضاف لمديونية المورد)</option>
               </select>
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-bold text-gray-700 mb-2">المستودع الوجهة</label>
               <select disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 outline-none cursor-not-allowed">
                  <option>المستودع الرئيسي (الافتراضي)</option>
               </select>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
               <label className="text-sm font-bold text-gray-700">أصناف الفاتورة:</label>
            </div>
            
            <div className="space-y-3">
              {newInvoice.items.map((item, index) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm relative group">
                  <div className="w-full md:w-1/3">
                    <SearchableSelect
                      value={item.material_id}
                      onChange={(e) => updateRow(item.id, 'material_id', e.target.value)}
                      options={materials.map(m => ({label: m.name + ' (' + m.unit + ')', value: m.id}))}
                      placeholder="اختر المادة..."
                      className=""
                    />
                  </div>
                  <div className="w-full md:w-1/6">
                    <Input 
                      type="number" 
                      placeholder="الكمية" 
                      value={item.quantity} 
                      onChange={(e) => updateRow(item.id, 'quantity', e.target.value)}
                      className="bg-gray-50 border-transparent m-0"
                    />
                  </div>
                  <div className="w-full md:w-1/4">
                    <Input 
                      type="number" 
                      placeholder="سعر الوحدة" 
                      value={item.unit_price} 
                      onChange={(e) => updateRow(item.id, 'unit_price', e.target.value)}
                      className="bg-gray-50 border-transparent m-0"
                    />
                  </div>
                  <div className="w-full md:w-1/4 px-4 py-3 bg-gray-900 rounded-xl text-emerald-400 font-black text-center flex items-center justify-between">
                    <span>الإجمالي:</span>
                    <span>{item.total.toLocaleString()} ر.س</span>
                  </div>
                  <button type="button" onClick={() => removeRow(item.id)} className="absolute -top-2 -left-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white shadow-sm">
                     <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <Button type="button" onClick={addEmptyRow} variant="outline" className="w-full mt-3 border-dashed border-2 border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 py-4">
              <Plus className="w-5 h-5 mr-2" /> إضافة صنف جديد
            </Button>
          </div>

          {/* Totals & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-end pt-6 border-t border-gray-100 mt-6">
             <div className="w-full md:w-1/2 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-gray-500 font-bold">الإجمالي الفرعي:</span>
                   <span className="text-gray-800 font-bold">{calculateGrandTotal().toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-xl font-black mt-4 pt-4 border-t border-gray-200">
                   <span className="text-gray-800">الإجمالي النهائي:</span>
                   <span className="text-primary-600">{calculateGrandTotal().toLocaleString()} ر.س</span>
                </div>
             </div>
             
             <div className="flex gap-3 w-full md:w-auto mt-6 md:mt-0">
               <Button type="button" variant="ghost" onClick={() => setIsInvoiceModalOpen(false)} className="px-8 font-bold">إلغاء</Button>
               <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-200">
                 <CheckCircle className="w-5 h-5 ml-2" /> حفظ الفاتورة وإدخال البضاعة
               </Button>
             </div>
          </div>

        </form>
      </Modal>

      {/* Invoice View Modal */}
      {viewInvoice && (
        <Modal
          isOpen={!!viewInvoice}
          onClose={() => setViewInvoice(null)}
          title={'فاتورة مشتريات: ' + (viewInvoice.invoice_number || 'INV-' + viewInvoice.id)}
          className="max-w-3xl"
        >
          <div className="space-y-5 p-1">
            {/* Invoice Header Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 mb-1">المورد</p>
                <p className="font-black text-gray-800">{viewInvoice.supplier_name || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 mb-1">تاريخ الفاتورة</p>
                <p className="font-black text-gray-800">{new Date(viewInvoice.purchase_date).toLocaleDateString('ar-SA')}</p>
              </div>
              <div className={cn('rounded-xl p-4', 
                (viewInvoice.delivery_status || 'pending') === 'received' ? 'bg-emerald-50' :
                (viewInvoice.delivery_status || 'pending') === 'delivered' ? 'bg-amber-50' :
                (viewInvoice.delivery_status || 'pending') === 'rejected' ? 'bg-red-50' : 'bg-gray-50'
              )}>
                <p className="text-xs font-bold text-gray-400 mb-1">حالة التسليم</p>
                <p className={cn('font-black',
                  (viewInvoice.delivery_status || 'pending') === 'received' ? 'text-emerald-700' :
                  (viewInvoice.delivery_status || 'pending') === 'delivered' ? 'text-amber-700' :
                  (viewInvoice.delivery_status || 'pending') === 'rejected' ? 'text-red-700' : 'text-gray-500'
                )}>
                  {(viewInvoice.delivery_status || 'pending') === 'received' ? '✅ تم الاستلام' :
                   (viewInvoice.delivery_status || 'pending') === 'delivered' ? '⏳ بانتظار موافقة المخازن' :
                   (viewInvoice.delivery_status || 'pending') === 'rejected' ? '❌ رُفض الاستلام' : '⬜ لم تُرسل بعد'}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">#</th>
                    <th className="px-4 py-3 font-bold">اسم المادة</th>
                    <th className="px-4 py-3 font-bold">الوحدة</th>
                    <th className="px-4 py-3 font-bold">الكمية</th>
                    <th className="px-4 py-3 font-bold">سعر الوحدة</th>
                    <th className="px-4 py-3 font-bold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {viewItems.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-6 text-gray-400">لا توجد أصناف مسجلة لهذه الفاتورة</td></tr>
                  ) : (
                    viewItems.map((item, i) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 font-bold">{i + 1}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{item.material_name}</td>
                        <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                        <td className="px-4 py-3 font-black text-blue-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-600">{(item.unit_price || 0).toLocaleString()} ر.س</td>
                        <td className="px-4 py-3 font-black text-gray-800">{(item.total || 0).toLocaleString()} ر.س</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 font-black text-blue-800 text-right">الإجمالي النهائي للفاتورة</td>
                    <td className="px-4 py-3 font-black text-blue-700 text-lg">{(viewInvoice.total_amount || 0).toLocaleString()} ر.س</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <Button
                type="button"
                onClick={() => handlePrintInvoice(viewInvoice, viewItems)}
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold shadow-lg"
              >
                <Printer className="w-4 h-4 ml-2" /> طباعة الفاتورة
              </Button>
              <div className="flex gap-3">
                {(viewInvoice.delivery_status || 'pending') === 'pending' && (
                  <Button
                    type="button"
                    onClick={() => { handleDeliver(viewInvoice.id); setViewInvoice(null); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200"
                  >
                    <Send className="w-4 h-4 ml-2" /> إرسال للمخازن للاستلام
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={() => setViewInvoice(null)}>إغلاق</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
