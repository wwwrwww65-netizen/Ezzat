import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Table, Button, Modal, Input, Badge } from '../components/UI';
import { Scale, Plus, ShieldAlert, Edit, Trash2, Lock } from 'lucide-react';

// القواعد الافتراضية للنظام (لا يمكن حذفها، فقط تعديل قيمتها)
const SYSTEM_RULES = [
  { type: 'absence', reason: 'غياب بدون عذر', is_system: 1 },
  { type: 'delay',   reason: 'تأخير عن الدوام', is_system: 1 },
  { type: 'misc',    reason: 'إهمال أو تلف أدوات', is_system: 1 },
];

export default function StaffPenalties() {
  const [rules, setRules] = useState([]);
  const [history, setHistory] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  // amount is now a NUMBER, reason is text, is_system locks delete
  const [ruleData, setRuleData] = useState({ reason: '', amount: '', type: 'custom' });

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    if (!window.electronAPI) return;

    // Create table if not exists (with all columns from the start)
    await window.electronAPI.executeDb(`
      CREATE TABLE IF NOT EXISTS penalty_rules (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        type      TEXT NOT NULL DEFAULT 'custom',
        reason    TEXT NOT NULL,
        amount    REAL NOT NULL DEFAULT 0,
        is_system INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Safe migrations for existing tables (ignore errors if column exists)
    try { await window.electronAPI.executeDb("ALTER TABLE penalty_rules ADD COLUMN type TEXT DEFAULT 'custom'"); } catch(e){}
    try { await window.electronAPI.executeDb("ALTER TABLE penalty_rules ADD COLUMN amount REAL DEFAULT 0"); } catch(e){}
    try { await window.electronAPI.executeDb("ALTER TABLE penalty_rules ADD COLUMN is_system INTEGER DEFAULT 0"); } catch(e){}

    // Update any NULL type/is_system from old data
    await window.electronAPI.executeDb("UPDATE penalty_rules SET type = 'custom' WHERE type IS NULL");
    await window.electronAPI.executeDb("UPDATE penalty_rules SET is_system = 0 WHERE is_system IS NULL");
    await window.electronAPI.executeDb("UPDATE penalty_rules SET amount = 0 WHERE amount IS NULL");

    // Seed the 3 system rules if they don't exist yet
    const existing = await window.electronAPI.queryDb('SELECT COUNT(*) as cnt FROM penalty_rules WHERE is_system = 1');
    const systemCount = (existing && existing[0]) ? Number(existing[0].cnt) : 0;

    if (systemCount < SYSTEM_RULES.length) {
      // Delete any partial system rules and re-seed cleanly
      await window.electronAPI.executeDb('DELETE FROM penalty_rules WHERE is_system = 1');
      for (const sr of SYSTEM_RULES) {
        await window.electronAPI.executeDb(
          'INSERT INTO penalty_rules (type, reason, amount, is_system) VALUES (?, ?, ?, 1)',
          [sr.type, sr.reason, 0]
        );
      }
    }

    fetchData();
  };

  const fetchData = async () => {
    if (!window.electronAPI) return;

    // System rules first, then custom
    const rulesRows = await window.electronAPI.queryDb(
      'SELECT * FROM penalty_rules ORDER BY is_system DESC, id ASC'
    );
    setRules(rulesRows || []);

    const historyRows = await window.electronAPI.queryDb(`
      SELECT a.id, s.name as staff_name, a.amount, a.reason, a.date as created_at
      FROM staff_advances a
      LEFT JOIN staff s ON CAST(a.staff_id AS INTEGER) = s.id
      WHERE a.reason LIKE '%خصم/جزاء%'
      ORDER BY a.id DESC
    `);
    setHistory(historyRows || []);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!window.electronAPI) return;
    const amt = Number(ruleData.amount);
    if (isNaN(amt) || amt < 0) { alert('يرجى إدخال قيمة رقمية صحيحة.'); return; }

    if (editingRule) {
      // For system rules: only update amount (reason & type are locked)
      if (editingRule.is_system) {
        await window.electronAPI.executeDb(
          'UPDATE penalty_rules SET amount = ? WHERE id = ?',
          [amt, editingRule.id]
        );
      } else {
        await window.electronAPI.executeDb(
          'UPDATE penalty_rules SET reason = ?, amount = ? WHERE id = ?',
          [ruleData.reason, amt, editingRule.id]
        );
      }
    } else {
      await window.electronAPI.executeDb(
        'INSERT INTO penalty_rules (type, reason, amount, is_system) VALUES (?, ?, ?, 0)',
        ['custom', ruleData.reason, amt]
      );
    }
    setShowModal(false);
    fetchData();
  };

  const handleDeleteRule = async (rule) => {
    if (rule.is_system) return; // مقفل
    if (await confirmDialog(`هل أنت متأكد من حذف قاعدة "${rule.reason}"؟`)) {
      await window.electronAPI.executeDb('DELETE FROM penalty_rules WHERE id = ?', [rule.id]);
      fetchData();
    }
  };

  const openAddModal = () => {
    setEditingRule(null);
    setRuleData({ reason: '', amount: '', type: 'custom' });
    setShowModal(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setRuleData({ reason: rule.reason, amount: rule.amount, type: rule.type });
    setShowModal(true);
  };

  const typeLabel = (type) => {
    if (type === 'absence') return 'غياب';
    if (type === 'delay')   return 'تأخير';
    if (type === 'misc')    return 'إهمال';
    return 'مخصص';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <Scale className="w-8 h-8 text-pink-600" />
          قواعد وسجل الخصومات
        </h1>
        <p className="text-sm text-gray-500 mt-1">إدارة قوانين الجزاءات وتعيين قيمها، والقواعد المقفلة لا يمكن حذفها</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Rules */}
        <Card className="p-0 border-none shadow-sm bg-white lg:col-span-1">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Scale className="w-5 h-5 text-pink-500" /> قواعد الجزاءات
            </h3>
            <Button onClick={openAddModal} className="bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold px-3 py-1.5 text-xs shadow-none border-none">
              <Plus className="w-3 h-3 ml-1" /> إضافة قاعدة
            </Button>
          </div>

          <Table headers={['نوع المخالفة', 'الخصم (ر.س)', '']}>
            {rules.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-8 text-gray-400 font-bold">لم يتم إضافة قواعد بعد</td></tr>
            ) : (
              rules.map(rule => (
                <tr key={rule.id} className={rule.is_system ? 'bg-pink-50/40' : ''}>
                  <td className="px-4 py-3 whitespace-normal min-w-[140px]">
                    <div className="font-bold text-gray-800 text-sm">{rule.reason}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold">{typeLabel(rule.type)}</span>
                      {rule.is_system === 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> نظام
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-black text-red-500 whitespace-nowrap text-base">
                    {rule.amount > 0 ? `${Number(rule.amount).toLocaleString()} ر.س` : <span className="text-gray-400 font-bold text-xs">غير محدد</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEditModal(rule)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="تعديل القيمة"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {rule.is_system === 1 ? (
                        <span className="p-1.5 text-gray-300 cursor-not-allowed" title="قاعدة النظام - لا يمكن حذفها">
                          <Lock className="w-4 h-4" />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف القاعدة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>

          <div className="p-4 bg-amber-50/60 border-t border-amber-100">
            <p className="text-xs text-amber-700 font-bold flex items-center gap-2">
              <Lock className="w-3 h-3" />
              القواعد المقفلة لا يمكن حذفها، لكن يمكنك تعديل قيمتها في أي وقت.
            </p>
          </div>
        </Card>

        {/* Column 2: Log History */}
        <Card className="p-0 border border-red-100 shadow-sm bg-white lg:col-span-2">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> السجل الزمني للخصومات المطبقة
            </h3>
          </div>
          <Table headers={['التاريخ', 'الموظف', 'مبلغ الخصم', 'المخالفة / السبب']}>
            {history.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400 font-bold">لم يتم تسجيل أي خصومات مؤخراً.</td>
              </tr>
            ) : (
              history.map(row => (
                <tr key={row.id}>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{row.created_at || '-'}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{row.staff_name || '—'}</td>
                  <td className="px-6 py-4 font-black text-red-600 whitespace-nowrap">{Number(row.amount).toLocaleString()} ر.س</td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-normal">{row.reason}</td>
                </tr>
              ))
            )}
          </Table>
        </Card>
      </div>

      {/* Modal: Add / Edit Rule */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRule ? (editingRule.is_system ? `تعديل قيمة: ${editingRule.reason}` : 'تعديل قاعدة الجزاء') : 'إضافة قاعدة جزاء جديدة'}
        className="max-w-md"
      >
        <form onSubmit={handleSaveRule} className="space-y-4">

          {/* Show reason field only for custom rules */}
          {(!editingRule || !editingRule.is_system) && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نوع المخالفة / السبب</label>
              <Input
                value={ruleData.reason}
                onChange={e => setRuleData({...ruleData, reason: e.target.value})}
                placeholder="مثال: عدم الالتزام بالزي الرسمي"
                required
              />
            </div>
          )}

          {/* System rule: show locked reason */}
          {editingRule && editingRule.is_system === 1 && (
            <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl flex items-center gap-3">
              <Lock className="w-5 h-5 text-pink-500 shrink-0" />
              <div>
                <p className="text-sm font-black text-pink-700">{editingRule.reason}</p>
                <p className="text-xs text-pink-500 mt-0.5">قاعدة نظام — يمكنك فقط تعديل قيمة الخصم</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              قيمة الخصم <span className="text-red-500 font-black">(ر.س)</span> — رقم فقط
            </label>
            <Input
              type="number"
              step="any"
              min="0"
              value={ruleData.amount}
              onChange={e => setRuleData({...ruleData, amount: e.target.value})}
              placeholder="مثال: 150"
              required
              className="text-2xl font-black text-red-500 text-center"
              dir="ltr"
            />
            <p className="text-xs text-gray-400 mt-1 text-center">سيتم استخدام هذا الرقم آلياً عند تطبيق الجزاء على موظف</p>
          </div>

          <div className="pt-4 flex gap-2 border-t border-gray-100">
            <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 font-bold text-gray-600">إلغاء</Button>
            <Button type="submit" className="flex-[2] bg-pink-500 hover:bg-pink-600 text-white font-bold border-none shadow-md shadow-pink-200">
              {editingRule ? 'حفظ التعديلات' : 'إضافة القاعدة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
