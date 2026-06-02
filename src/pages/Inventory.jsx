import { Card, Button, Input, Table, Badge, Modal, SearchableSelect } from '../components/UI';
import {
  Package, Search, AlertTriangle, ArrowDownLeft, ArrowUpRight,
  FileDown, Printer, CheckCircle, Coins, TrendingUp, X, Eye
} from 'lucide-react';
import { cn } from '../components/UI';
import { useState, useEffect } from 'react';

const LOW_STOCK_THRESHOLD = 10;

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowOnly, setFilterLowOnly] = useState(false);

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState('in'); // 'in' or 'out'
  const [txForm, setTxForm] = useState({ material_id: '', quantity: '', notes: '' });
  const [txTarget, setTxTarget] = useState(null); // pre-selected item for quick action

  useEffect(() => {
    fetchInventory();
    fetchPendingPurchases();
  }, []);

  const fetchInventory = async () => {
    if (window.electronAPI) {
      const rows = await window.electronAPI.queryDb(`
        SELECT 
          i.*, 
          m.name as material_name, 
          m.unit, 
          COALESCE(
            (SELECT SUM(pi.total) / SUM(pi.quantity) 
             FROM purchase_items pi 
             JOIN purchases p ON p.id = pi.purchase_id 
             WHERE pi.material_id = m.id AND p.delivery_status = 'received' AND pi.quantity > 0), 
            m.cost_per_unit
          ) as cost_per_unit
        FROM inventory_stock i
        JOIN materials_catalog m ON i.material_id = m.id
        ORDER BY i.quantity ASC
      `);
      setInventory(rows);
    }
  };

  const fetchPendingPurchases = async () => {
    if (window.electronAPI) {
      const rows = await window.electronAPI.queryDb(`
        SELECT p.*, s.name as supplier_name
        FROM purchases p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.delivery_status = 'delivered'
        ORDER BY p.delivery_date DESC
        LIMIT 10
      `);
      setPendingPurchases(rows);
    }
  };

  const openTxModal = (type, item = null) => {
    setTxType(type);
    setTxForm({ material_id: item ? String(item.material_id) : '', quantity: '', notes: '' });
    setTxTarget(item);
    setIsTxModalOpen(true);
  };

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    if (!txForm.material_id || !txForm.quantity || parseFloat(txForm.quantity) <= 0) return;

    if (window.electronAPI) {
      const qty = parseFloat(txForm.quantity);
      if (txType === 'in') {
        const exists = await window.electronAPI.queryDb('SELECT * FROM inventory_stock WHERE material_id = ?', [txForm.material_id]);
        if (exists.length > 0) {
          await window.electronAPI.executeDb('UPDATE inventory_stock SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP WHERE material_id = ?', [qty, txForm.material_id]);
        } else {
          await window.electronAPI.executeDb('INSERT INTO inventory_stock (material_id, warehouse_name, quantity) VALUES (?, ?, ?)', [txForm.material_id, 'المستودع الرئيسي', qty]);
        }
      } else {
        await window.electronAPI.executeDb('UPDATE inventory_stock SET quantity = MAX(0, quantity - ?), last_updated = CURRENT_TIMESTAMP WHERE material_id = ?', [qty, txForm.material_id]);
      }
      setIsTxModalOpen(false);
      fetchInventory();
    }
  };

  // Accept delivery from purchasing
  const handleAcceptDelivery = async (purchase) => {
    if (!window.electronAPI) return;
    // 1. Get the purchase items
    const items = await window.electronAPI.queryDb(
      'SELECT pi.*, m.name as material_name, m.unit FROM purchase_items pi JOIN materials_catalog m ON pi.material_id = m.id WHERE pi.purchase_id = ?',
      [purchase.id]
    );
    // 2. Update inventory stock for each item
    for (const item of items) {
      const exists = await window.electronAPI.queryDb('SELECT * FROM inventory_stock WHERE material_id = ?', [item.material_id]);
      if (exists.length > 0) {
        await window.electronAPI.executeDb('UPDATE inventory_stock SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP WHERE material_id = ?', [item.quantity, item.material_id]);
      } else {
        await window.electronAPI.executeDb('INSERT INTO inventory_stock (material_id, warehouse_name, quantity) VALUES (?, ?, ?)', [item.material_id, 'المستودع الرئيسي', item.quantity]);
      }
    }
    // 3. Mark purchase as received
    await window.electronAPI.executeDb(
      "UPDATE purchases SET delivery_status = 'received', received_at = CURRENT_TIMESTAMP WHERE id = ?",
      [purchase.id]
    );
    await fetchInventory();
    await fetchPendingPurchases();
    // 4. Print receipt
    handlePrintReceipt(purchase, items);
  };

  // Reject delivery
  const handleRejectDelivery = async (purchaseId) => {
    if (!window.electronAPI) return;
    await window.electronAPI.executeDb(
      "UPDATE purchases SET delivery_status = 'rejected' WHERE id = ?",
      [purchaseId]
    );
    fetchPendingPurchases();
  };

  // Print warehouse receipt
  const handlePrintReceipt = (purchase, items) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>سند استلام بضاعة</title>
    <style>body{font-family:'Segoe UI',Tahoma,Arial;direction:rtl;padding:30px;color:#1e293b} h1{font-size:22px;color:#1e3a8a;margin-bottom:4px} .sub{color:#64748b;font-size:12px} .header{display:flex;justify-content:space-between;border-bottom:2px solid #e2e8f0;padding-bottom:16px;margin-bottom:20px} .info{display:flex;gap:30px;margin-bottom:16px;background:#f8fafc;padding:14px;border-radius:8px} .info-item label{font-size:10px;color:#94a3b8;font-weight:700;display:block;text-transform:uppercase} .info-item span{font-size:13px;font-weight:900;color:#1e293b} table{width:100%;border-collapse:collapse;margin-top:16px} thead tr{background:#166534;color:white} th,td{padding:10px 12px;text-align:right;font-size:12px;border-bottom:1px solid #e2e8f0} .grand{background:#f0fdf4;font-weight:900;font-size:14px} .sigs{margin-top:30px;display:flex;justify-content:space-between} .sig-box{border:2px dashed #cbd5e1;border-radius:8px;padding:16px;text-align:center;color:#94a3b8;font-size:11px;width:160px;height:80px;display:flex;align-items:center;justify-content:center} @media print{body{padding:10px}}</style></head>
    <body><div class="header"><div><h1>سند استلام بضاعة - المستودع الرئيسي</h1><p class="sub">نظام إدارة المقاولات</p></div><div style="text-align:left"><div style="font-size:16px;font-weight:900;color:#166534">سند رقم: INV-${purchase.id}</div><div style="color:#64748b;font-size:11px">${new Date().toLocaleDateString('ar-SA')}</div></div></div>
    <div class="info"><div class="info-item"><label>المورد</label><span>${purchase.supplier_name || '-'}</span></div><div class="info-item"><label>رقم فاتورة المشتريات</label><span>${purchase.invoice_number || 'INV-' + purchase.id}</span></div><div class="info-item"><label>تاريخ التسليم</label><span>${new Date().toLocaleDateString('ar-SA')}</span></div></div>
    <table><thead><tr><th>#</th><th>اسم المادة</th><th>الوحدة</th><th>الكمية المستلمة</th></tr></thead><tbody>
    ${items.map((item, i) => `<tr><td>${i+1}</td><td>${item.material_name}</td><td>${item.unit}</td><td style="font-weight:900;color:#166534">${item.quantity}</td></tr>`).join('')}
    <tr class="grand"><td colspan="3" style="text-align:center">إجمالي قيمة البضاعة المستلمة</td><td>${(purchase.total_amount||0).toLocaleString()} ر.س</td></tr>
    </tbody></table>
    <div class="sigs"><div class="sig-box">توقيع مسلّم البضاعة (المشتريات)</div><div class="sig-box">توقيع أمين المستودع (المستلم)</div><div class="sig-box">ختم الشركة</div></div>
    <script>window.onload=function(){window.print()}</script></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // KPIs
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(i => (i.quantity || 0) < LOW_STOCK_THRESHOLD).length;
  const totalValue = inventory.reduce((acc, i) => acc + ((i.quantity || 0) * (i.cost_per_unit || 0)), 0);
  const totalQty = inventory.reduce((acc, i) => acc + (i.quantity || 0), 0);

  const filtered = inventory.filter(i => {
    const matchSearch = (i.material_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchLow = filterLowOnly ? (i.quantity || 0) < LOW_STOCK_THRESHOLD : true;
    return matchSearch && matchLow;
  });

  const materialOptions = inventory.map(i => ({ label: i.material_name + ' (' + i.unit + ')', value: String(i.material_id) }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            إدارة المخازن والمستودعات
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">مراقبة الدخول والخروج والكميات المتبقية في المستودع الرئيسي.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => openTxModal('in')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200">
            <ArrowDownLeft className="w-5 h-5 ml-1" /> استلام (دخول)
          </Button>
          <Button onClick={() => openTxModal('out')} className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200">
            <ArrowUpRight className="w-5 h-5 ml-1" /> أمر صرف (خروج)
          </Button>
        </div>
      </div>

      {/* Pending Deliveries Banner from Purchasing */}
      {pendingPurchases.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl border border-amber-200">📦</div>
              <div>
                <h3 className="font-black text-amber-900 text-base flex items-center gap-2">
                  بضاعة في الطريق — بانتظار تأكيد الاستلام
                  <span className="bg-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                    {pendingPurchases.length} جديد
                  </span>
                </h3>
                <p className="text-amber-700 text-xs font-medium mt-0.5">أرسل قسم المشتريات هذه الفواتير — راجعها وأكّد الاستلام الفعلي للبضاعة</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {pendingPurchases.map(p => (
              <div key={p.id} className="bg-white border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">{p.invoice_number || ('INV-' + p.id)}</span>
                  <div>
                    <p className="font-black text-gray-800 text-sm">{p.supplier_name || 'مورد غير معروف'}</p>
                    <p className="text-xs text-gray-400 font-medium">{new Date(p.purchase_date).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-gray-700 text-sm">{(p.total_amount || 0).toLocaleString()} ر.س</span>
                  <button
                    onClick={() => handleRejectDelivery(p.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> رفض
                  </button>
                  <button
                    onClick={() => handleAcceptDelivery(p)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> تأكيد الاستلام + طباعة سند
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warehouse Card (single warehouse) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-200/50 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Package className="w-9 h-9 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black">المستودع الرئيسي</h2>
          <p className="text-blue-200 text-sm mt-1 font-medium">مواد البناء الأساسية والتخزين العام</p>
        </div>
        <div className="text-left">
          <p className="text-blue-200 text-xs font-bold">القيمة التقديرية</p>
          <h3 className="text-2xl font-black">{totalValue.toLocaleString()} <span className="text-sm font-medium">ر.س</span></h3>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-none shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Coins className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">قيمة المخزون</p>
            <h3 className="text-lg font-black text-gray-800">{totalValue.toLocaleString()} <span className="text-xs">ر.س</span></h3>
          </div>
        </Card>

        <Card className="p-5 border-none shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">إجمالي الأصناف</p>
            <h3 className="text-lg font-black text-gray-800">{totalItems} <span className="text-xs">صنف</span></h3>
          </div>
        </Card>

        <Card className="p-5 border-none shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">إجمالي الكميات</p>
            <h3 className="text-lg font-black text-gray-800">{totalQty.toLocaleString()} <span className="text-xs">وحدة</span></h3>
          </div>
        </Card>

        <Card className={cn('p-5 border-none shadow-sm flex items-center gap-4', lowStockItems > 0 && 'ring-2 ring-red-200')}>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">تنبيهات النواقص</p>
            <h3 className={cn('text-lg font-black', lowStockItems > 0 ? 'text-red-600' : 'text-gray-800')}>
              {lowStockItems} <span className="text-xs">أصناف</span>
            </h3>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card
        className="p-0 border-none shadow-sm overflow-hidden"
        title="مراقبة أرصدة الأصناف (المستودع الرئيسي)"
        headerAction={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterLowOnly(!filterLowOnly)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all',
                filterLowOnly
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600'
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              نواقص فقط
            </button>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ابحث باسم المادة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-4 pr-9 py-2 bg-gray-50 border-gray-100 focus:bg-white text-sm w-52"
              />
            </div>
            <Button variant="outline" className="border-gray-200 bg-white font-bold text-gray-700 hidden md:flex py-2">
              <FileDown className="w-4 h-4 ml-1" /> تصدير
            </Button>
            <Button variant="outline" className="border-gray-200 bg-white font-bold text-gray-700 hidden md:flex py-2">
              <Printer className="w-4 h-4 ml-1" /> جرد
            </Button>
          </div>
        }
      >
        <Table headers={['رمز', 'اسم المادة / الخامة', 'وحدة القياس', 'الكمية الحالية', 'تكلفة الوحدة', 'قيمة المخزون', 'حالة المخزون', 'إجراءات']}>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-16">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Package className="w-14 h-14 text-gray-200" />
                  <p className="font-bold text-gray-500">المستودع فارغ</p>
                  <p className="text-sm">قم بإنشاء فاتورة مشتريات ليتم إضافة المواد هنا تلقائياً.</p>
                </div>
              </td>
            </tr>
          ) : (
            filtered.map((item, idx) => {
              const qty = item.quantity || 0;
              const cost = item.cost_per_unit || 0;
              const value = qty * cost;
              const isLow = qty < LOW_STOCK_THRESHOLD;
              return (
                <tr key={item.id} className={cn('hover:bg-gray-50 transition-colors group', isLow && 'bg-red-50/30 hover:bg-red-50')}>
                  <td className="px-6 py-4 text-xs font-black text-gray-400">MAT-{String(item.material_id).padStart(3, '0')}</td>
                  <td className="px-6 py-4 font-bold text-sm text-gray-800">{item.material_name}</td>
                  <td className="px-6 py-4 font-medium text-sm text-gray-500">{item.unit}</td>
                  <td className="px-6 py-4">
                    <span className={cn('text-xl font-black', isLow ? 'text-red-600' : 'text-gray-800')}>
                      {qty.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 mr-1">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-gray-600">{cost > 0 ? cost.toLocaleString() + ' ر.س' : '-'}</td>
                  <td className="px-6 py-4 font-black text-sm text-indigo-600">{value > 0 ? value.toLocaleString() + ' ر.س' : '-'}</td>
                  <td className="px-6 py-4">
                    {qty === 0 ? (
                      <Badge variant="danger">نفذ من المخزن</Badge>
                    ) : isLow ? (
                      <Badge variant="warning">مستوى منخفض</Badge>
                    ) : (
                      <Badge variant="success">متوفر</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openTxModal('in', item)}
                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                        title="استلام"
                      >
                        <ArrowDownLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openTxModal('out', item)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="صرف"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </Card>

      {/* Transaction Modal */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title={txType === 'in' ? '📦 استلام بضاعة (دخول مستودع)' : '📤 أمر صرف (خروج للتشغيل)'}
      >
        <form onSubmit={handleTxSubmit} className="space-y-5 p-2">
          <div className={cn(
            'p-4 rounded-2xl border text-sm font-bold flex items-center gap-3',
            txType === 'in'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          )}>
            {txType === 'in'
              ? <><ArrowDownLeft className="w-5 h-5" /> سيتم إضافة الكمية المدخلة للمستودع الرئيسي</>
              : <><ArrowUpRight className="w-5 h-5" /> سيتم خصم الكمية من رصيد المستودع فوراً</>
            }
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الصنف المطلوب</label>
            <SearchableSelect
              value={txForm.material_id}
              onChange={e => setTxForm({ ...txForm, material_id: e.target.value })}
              options={materialOptions}
              placeholder="اختر المادة..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الكمية</label>
            <Input
              type="number"
              step="any"
              min="0.001"
              value={txForm.quantity}
              onChange={e => setTxForm({ ...txForm, quantity: e.target.value })}
              placeholder="أدخل الكمية..."
              required
              className="text-center text-xl font-black py-4 bg-white"
            />
            {txForm.material_id && inventory.find(i => String(i.material_id) === txForm.material_id) && (
              <p className="text-xs text-gray-400 font-bold mt-2 text-center">
                الرصيد الحالي: <span className="text-gray-700">{(inventory.find(i => String(i.material_id) === txForm.material_id)?.quantity || 0).toLocaleString()} {inventory.find(i => String(i.material_id) === txForm.material_id)?.unit}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات <span className="text-gray-400 font-medium">(اختياري)</span></label>
            <Input
              value={txForm.notes}
              onChange={e => setTxForm({ ...txForm, notes: e.target.value })}
              placeholder="مثال: للتحضير اليومي، طلب عاجل..."
              className="bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsTxModalOpen(false)}>إلغاء</Button>
            <Button
              type="submit"
              className={cn(
                'font-bold px-8 shadow-lg',
                txType === 'in'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
              )}
            >
              <CheckCircle className="w-5 h-5 ml-2" />
              {txType === 'in' ? 'تأكيد الاستلام' : 'تأكيد الصرف'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
