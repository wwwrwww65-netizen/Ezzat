import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI';
import { BookOpen, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

export default function Finance() {
  const [journal, setJournal] = useState([]);

  useEffect(() => {
    fetchJournal();
  }, []);

  const fetchJournal = async () => {
    if (window.electronAPI) {
      const rows = await window.electronAPI.queryDb('SELECT * FROM accounting_journal ORDER BY id DESC');
      setJournal(rows);
    }
  };

  const totalDebit = journal.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = journal.reduce((acc, curr) => acc + curr.credit, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-600" />
          النظام المالي (دفتر اليومية)
        </h1>
        <p className="text-gray-500 mt-2">مراقبة القيود المحاسبية المزدوجة التي يتم توليدها آلياً من النظام.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-l from-green-50 to-white border-green-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">إجمالي المدين (Debit)</p>
            <p className="text-3xl font-black text-green-700 mt-1">{totalDebit.toLocaleString()} ر.س</p>
          </div>
          <div className="p-4 bg-green-100 rounded-2xl"><TrendingUp className="w-8 h-8 text-green-600" /></div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-l from-rose-50 to-white border-rose-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">إجمالي الدائن (Credit)</p>
            <p className="text-3xl font-black text-rose-700 mt-1">{totalCredit.toLocaleString()} ر.س</p>
          </div>
          <div className="p-4 bg-rose-100 rounded-2xl"><TrendingDown className="w-8 h-8 text-rose-600" /></div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm bg-white">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">دفتر القيود المحاسبية (Journal Entries)</h3>
          {totalDebit === totalCredit ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-black flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> الميزان متطابق
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-black flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> الميزان غير متطابق
            </span>
          )}
        </div>
        
        <table className="w-full text-right text-sm">
          <thead className="bg-white text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold w-24">رقم القيد</th>
              <th className="p-4 font-bold">التاريخ</th>
              <th className="p-4 font-bold">كود الحساب</th>
              <th className="p-4 font-bold">البيان</th>
              <th className="p-4 font-bold text-green-600">مدين (Debit)</th>
              <th className="p-4 font-bold text-rose-600">دائن (Credit)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {journal.map((entry, idx) => (
              <tr key={entry.id} className={`${idx % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
                <td className="p-4 font-black text-gray-400">#{entry.id}</td>
                <td className="p-4 text-gray-500 text-xs">{new Date(entry.entry_date).toLocaleString('ar-SA')}</td>
                <td className="p-4 font-bold text-indigo-600 text-xs tracking-wider">{entry.account_code}</td>
                <td className="p-4 font-bold text-gray-700">{entry.description}</td>
                <td className="p-4 font-black text-green-600">{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td>
                <td className="p-4 font-black text-rose-600">{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td>
              </tr>
            ))}
            {journal.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">لا توجد قيود محاسبية مسجلة.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
