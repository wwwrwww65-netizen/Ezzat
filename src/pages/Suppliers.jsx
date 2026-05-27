import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Table, Badge, Modal } from '../components/UI';
import { 
  Users, UserPlus, Wallet, CheckCircle, Search, 
  FileText, Printer, FileDown, Banknote, ArrowRight,
  TrendingDown, TrendingUp, Receipt
} from 'lucide-react';
import { cn } from '../components/UI';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null); // For Profile View
  const [transactions, setTransactions] = useState([]);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  
  // Forms state
  const [newSupplier, setNewSupplier] = useState({ name: '', category: '', phone: '', initialBalance: 0 });
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      fetchTransactions(selectedSupplier.id);
    }
  }, [selectedSupplier]);

  const fetchSuppliers = async () => {
    if (window.electronAPI) {
      const rows = await window.electronAPI.queryDb('SELECT * FROM suppliers ORDER BY id DESC');
      setSuppliers(rows);
    }
  };

  const fetchTransactions = async (supId) => {
    if (!window.electronAPI) return;
    
    // Fetch Purchases
    const purchases = await window.electronAPI.queryDb(
      'SELECT id, invoice_number as ref, total_amount, paid_amount, purchase_date as date FROM purchases WHERE supplier_id = ?',
      [supId]
    );

    // Fetch Payments from Journal
    const payments = await window.electronAPI.queryDb(
      'SELECT id, description as ref, debit as amount, entry_date as date FROM accounting_journal WHERE account_code = ?',
      [`SUP-${supId}`]
    );

    let list = [];
    purchases.forEach(p => {
      list.push({ id: `pur-${p.id}`, date: p.date, desc: `فاتورة مشتريات ${p.ref || ''}`, type: 'مشتريات', debit: p.total_amount || 0, credit: p.paid_amount || 0 });
    });
    payments.forEach(p => {
      list.push({ id: `pay-${p.id}`, date: p.date, desc: p.ref || 'دفعة سداد', type: 'سداد', debit: 0, credit: p.amount || 0 });
    });

    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    setTransactions(list);
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    if (window.electronAPI) {
      await window.electronAPI.executeDb(
        'INSERT INTO suppliers (name, phone, balance) VALUES (?, ?, ?)',
        [newSupplier.name, newSupplier.phone, newSupplier.initialBalance || 0]
      );
      setNewSupplier({ name: '', category: '', phone: '', initialBalance: 0 });
      setIsAddModalOpen(false);
      fetchSuppliers();
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || !selectedSupplier) return;
    
    // In a real app, we would insert into a transactions/payments table.
    // Here we just deduct the balance for demonstration.
    if (window.electronAPI) {
      const newBalance = selectedSupplier.balance - parseFloat(paymentForm.amount);
      await window.electronAPI.executeDb(
        'UPDATE suppliers SET balance = ? WHERE id = ?',
        [newBalance, selectedSupplier.id]
      );
      
      // Log payment in journal
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description, entry_date) VALUES (?, ?, ?, ?, ?)',
        [`SUP-${selectedSupplier.id}`, parseFloat(paymentForm.amount), 0, paymentForm.notes || `دفعة سداد (${paymentForm.method === 'cash' ? 'نقدي' : 'بنكي'})`, paymentForm.date]
      );

      setIsPayModalOpen(false);
      setPaymentForm({ ...paymentForm, amount: '', notes: '' });
      fetchSuppliers();
      // Update selected supplier view
      setSelectedSupplier({ ...selectedSupplier, balance: newBalance });
    }
  };

  // KPIs
  const totalSuppliers = suppliers.length;
  const totalDebt = suppliers.reduce((acc, sup) => acc + (sup.balance > 0 ? sup.balance : 0), 0);
  const zeroBalanceCount = suppliers.filter(sup => sup.balance <= 0).length;

  const filteredSuppliers = suppliers.filter(sup => 
    sup.name.includes(searchQuery) || (sup.phone && sup.phone.includes(searchQuery))
  );

  // Profile View (Statement of Account)
  if (selectedSupplier) {
    const totalDebits = transactions.reduce((acc, t) => acc + t.debit, 0);
    const totalCredits = transactions.reduce((acc, t) => acc + t.credit, 0);
    const netChange = totalDebits - totalCredits;
    const initialBalance = selectedSupplier.balance - netChange;
    let runningBalance = initialBalance;

    return (
      <div className="space-y-6 pb-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedSupplier(null)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              كشف حساب تفصيلي: {selectedSupplier.name}
            </h1>
            <p className="text-gray-500 mt-1">{selectedSupplier.phone}</p>
          </div>
        </div>

        {/* Profile KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-none shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Receipt className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">إجمالي المشتريات</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{totalDebits.toLocaleString()} <span className="text-sm">ر.س</span></h3>
            </div>
          </Card>
          <Card className="p-6 border-none shadow-sm flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <TrendingDown className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">إجمالي المسدد</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{totalCredits.toLocaleString()} <span className="text-sm">ر.س</span></h3>
            </div>
          </Card>
          <Card className="p-6 border-none shadow-sm flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400">الرصيد المتبقي (له)</p>
              <h3 className="text-2xl font-black text-red-600 mt-1">{selectedSupplier.balance.toLocaleString()} <span className="text-sm">ر.س</span></h3>
            </div>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="p-0 border-none shadow-sm overflow-hidden" 
              title="كشف حساب (الأستاذ المساعد)"
              headerAction={
                <div className="flex gap-2">
                  <Button variant="outline" className="border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-bold">
                    <FileDown className="w-4 h-4 ml-2" /> تصدير PDF
                  </Button>
                  <Button variant="outline" className="border-gray-200 bg-white font-bold text-gray-700">
                    <Printer className="w-4 h-4 ml-2" /> طباعة
                  </Button>
                  <Button onClick={() => setIsPayModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200">
                     تسجيل دفعة سداد
                  </Button>
                </div>
              }>
          <Table headers={['التاريخ', 'البيان', 'النوع', 'مدين (له)', 'دائن (عليه)', 'الرصيد المتبقي']}>
             <tr>
               <td className="px-6 py-4 font-bold text-sm text-gray-700">--</td>
               <td className="px-6 py-4 font-bold text-sm text-gray-800">الرصيد الافتتاحي</td>
               <td className="px-6 py-4"><Badge variant="neutral">رصيد</Badge></td>
               <td className="px-6 py-4 font-bold text-sm text-gray-700">-</td>
               <td className="px-6 py-4 font-bold text-sm text-gray-700">-</td>
               <td className="px-6 py-4 font-black text-sm text-gray-800">{initialBalance.toLocaleString()}</td>
             </tr>
             {transactions.map(tx => {
               runningBalance += (tx.debit - tx.credit);
               return (
                 <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4 font-medium text-sm text-gray-600" dir="ltr">{new Date(tx.date).toLocaleDateString()}</td>
                   <td className="px-6 py-4 font-bold text-sm text-gray-800">{tx.desc}</td>
                   <td className="px-6 py-4">
                     <Badge variant={tx.type === 'سداد' ? 'success' : 'danger'}>{tx.type}</Badge>
                   </td>
                   <td className="px-6 py-4 font-black text-sm text-red-600">{tx.debit > 0 ? tx.debit.toLocaleString() : '-'}</td>
                   <td className="px-6 py-4 font-black text-sm text-emerald-600">{tx.credit > 0 ? tx.credit.toLocaleString() : '-'}</td>
                   <td className="px-6 py-4 font-black text-sm text-gray-800">{runningBalance.toLocaleString()}</td>
                 </tr>
               );
             })}
          </Table>
        </Card>

        {/* Payment Modal */}
        <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="تسجيل دفعة سداد للمورد">
           <form onSubmit={handlePayment} className="space-y-4 p-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center mb-6">
                 <p className="text-sm text-emerald-800 font-bold mb-1">الرصيد المستحق الحالي</p>
                 <h2 className="text-3xl font-black text-red-600">{selectedSupplier.balance.toLocaleString()} <span className="text-lg">ر.س</span></h2>
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">مبلغ الدفعة المسددة</label>
                 <Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} required className="text-center text-xl font-black py-4 bg-white" placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">طريقة الدفع</label>
                    <select value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-bold outline-none">
                       <option value="cash">نقدي (من الخزينة)</option>
                       <option value="bank">حوالة بنكية / شبكة</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">التاريخ</label>
                    <Input type="date" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} required className="bg-white" />
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات</label>
                 <Input value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} placeholder="مثلاً: دفعة عن فاتورة رقم..." className="bg-white" />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                 <Button type="button" variant="ghost" onClick={() => setIsPayModalOpen(false)}>إلغاء</Button>
                 <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8">تأكيد السداد</Button>
              </div>
           </form>
        </Modal>
      </div>
    );
  }

  // Main Suppliers List View
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">دليل الموردين والشركات</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">تتبع حسابات ومطالبات الشركات الموردة للمطعم، تسجيل السداد، وفتح حساب جديد.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200">
          <UserPlus className="w-5 h-5 ml-2" /> إضافة مورد جديد
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400">إجمالي الموردين المسجلين</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{totalSuppliers}</h3>
            <p className="text-xs font-bold text-blue-600 mt-1">موردين معتمدين</p>
          </div>
        </Card>
        
        <Card className="p-6 border-none shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400">إجمالي الديون للموردين</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{totalDebt.toLocaleString()}</h3>
            <p className="text-xs font-bold text-red-600 mt-1">ديون واجبة السداد</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400">موردين حسابهم صفر</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{zeroBalanceCount}</h3>
            <p className="text-xs font-bold text-emerald-600 mt-1">خالصة الذمة</p>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="p-0 border-none shadow-sm overflow-hidden" 
            headerAction={
              <div className="relative w-full md:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="ابحث باسم المورد أو رقم الهاتف..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-10 py-2.5 bg-gray-50 border-gray-100 focus:bg-white" 
                />
              </div>
            }>
        <Table headers={['اسم الشركة / المورد', 'نوع النشاط', 'رقم الجوال', 'الرصيد المتبقي', 'الحالة', 'الإجراءات']}>
          {filteredSuppliers.length === 0 ? (
             <tr><td colSpan="6" className="text-center py-8 text-gray-500 font-bold">لا يوجد موردين مضافين حتى الآن</td></tr>
          ) : (
            filteredSuppliers.map(sup => (
              <tr key={sup.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedSupplier(sup)}>
                <td className="px-6 py-4 font-bold text-sm text-gray-800 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Users className="w-5 h-5" />
                   </div>
                   {sup.name}
                </td>
                <td className="px-6 py-4 font-medium text-sm text-gray-500">مورد عام</td>
                <td className="px-6 py-4 font-bold text-sm text-gray-700" dir="ltr">{sup.phone || '-'}</td>
                <td className="px-6 py-4 font-black text-sm text-gray-800">
                   {sup.balance > 0 ? (
                      <span className="text-red-600">{sup.balance.toLocaleString()} ر.س</span>
                   ) : (
                      <span className="text-emerald-600">0.00 ر.س</span>
                   )}
                </td>
                <td className="px-6 py-4">
                  {sup.balance > 0 ? <Badge variant="danger">مديونية</Badge> : <Badge variant="success">خالص</Badge>}
                </td>
                <td className="px-6 py-4">
                   <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedSupplier(sup); }} className="text-blue-600 hover:bg-blue-50 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      كشف الحساب
                   </Button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {/* Add Supplier Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة مورد جديد">
         <form onSubmit={handleAddSupplier} className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اسم الشركة / المورد</label>
                  <Input value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} required className="bg-white" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">نوع النشاط</label>
                  <Input value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})} placeholder="أسمنت، حديد..." className="bg-white" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجوال للتواصل</label>
                  <Input value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className="bg-white" dir="ltr" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الرصيد الافتتاحي (ديون له)</label>
                  <Input type="number" value={newSupplier.initialBalance} onChange={e => setNewSupplier({...newSupplier, initialBalance: e.target.value})} className="bg-white" />
               </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
               <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
               <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">حفظ المورد</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}
