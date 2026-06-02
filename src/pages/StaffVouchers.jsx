import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Badge } from '../components/UI';
import { Receipt, Search } from 'lucide-react';

export default function StaffVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    if (window.electronAPI) {
      const rows = await window.electronAPI.queryDb(`
        SELECT a.id, a.staff_id, s.name as staff_name, a.amount, a.reason, a.date as created_at
        FROM staff_advances a
        LEFT JOIN staff s ON CAST(a.staff_id AS INTEGER) = s.id
        ORDER BY a.id DESC
      `);
      setVouchers(rows || []);
    }
    setLoading(false);
  };

  const filtered = vouchers.filter(item => {
    if (searchQuery && !item.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.reason.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
        <Receipt className="w-8 h-8 text-pink-600" />
        سجل أرشيف السندات المنجزة
      </h1>
      
      <Card className="p-6 border-none shadow-sm bg-white">
        <div className="relative w-full md:w-96 mb-6">
           <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
           <Input 
             placeholder="البحث برقم السند أو الموظف أو البيان..." 
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             className="pl-4 pr-10"
           />
        </div>
        
        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <Table headers={['رقم السند', 'التاريخ', 'الموظف', 'النوع', 'المبلغ', 'السبب']}>
            {loading ? (
               <tr><td colSpan="6" className="text-center py-8">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
               <tr><td colSpan="6" className="text-center py-8 text-gray-400 font-bold">لا توجد سندات</td></tr>
            ) : (
              filtered.map(row => (
                <tr key={row.id}>
                  <td className="px-6 py-4 font-bold text-gray-900">#{row.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.created_at?.split(' ')[0] || '-'}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{row.staff_name}</td>
                  <td className="px-6 py-4">
                    <Badge variant="warning">سلفة نقدية</Badge>
                  </td>
                  <td className="px-6 py-4 font-black text-red-600">{row.amount.toLocaleString()} ر.س</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{row.reason}</td>
                </tr>
              ))
            )}
          </Table>
        </div>
      </Card>
    </div>
  );
}
