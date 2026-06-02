import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Table, Button, Modal, Input, Badge } from '../components/UI';
import { Briefcase, Plus, Edit, Trash2, Shield, ShieldCheck, ShieldOff, Lock, Users, CheckCircle } from 'lucide-react';

// تعريف الصلاحيات المتاحة في النظام
const PERMISSION_MODULES = [
  { key: 'all',        label: 'صلاحية كاملة (كل شيء)',    icon: '👑', danger: true },
  { key: 'hr',         label: 'شؤون الموظفين',              icon: '👤' },
  { key: 'finance',    label: 'الإدارة المالية',             icon: '💰' },
  { key: 'projects',   label: 'المشاريع والمتابعة',          icon: '🏗️' },
  { key: 'inventory',  label: 'المخزون والمشتريات',          icon: '📦' },
  { key: 'reports',    label: 'التقارير والإحصاءات',         icon: '📊' },
  { key: 'clients',    label: 'إدارة العملاء',               icon: '🤝' },
  { key: 'settings',   label: 'إعدادات النظام',              icon: '⚙️' },
  { key: 'boq',        label: 'جداول الكميات (BOQ)',          icon: '📋' },
  { key: 'users',      label: 'إدارة المستخدمين',            icon: '🔑' },
];

const emptyPerms = () => Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, false]));

export default function JobRoles() {
  const [roles, setRoles] = useState([]);
  const [staffCount, setStaffCount] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', permissions: emptyPerms() });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    if (!window.electronAPI) return;
    const rows = await window.electronAPI.queryDb('SELECT * FROM job_roles ORDER BY id ASC');
    setRoles(rows || []);

    // Count staff per role
    const counts = {};
    for (const r of (rows || [])) {
      const c = await window.electronAPI.queryDb(
        "SELECT COUNT(*) as cnt FROM staff WHERE role = ?", [r.name]
      );
      counts[r.name] = (c && c[0]) ? Number(c[0].cnt) : 0;
    }
    setStaffCount(counts);
  };

  const openAdd = () => {
    setEditingRole(null);
    setForm({ name: '', description: '', permissions: emptyPerms() });
    setShowModal(true);
  };

  const openEdit = (role) => {
    let perms = emptyPerms();
    try { const p = JSON.parse(role.permissions || '{}'); Object.assign(perms, p); } catch(e){}
    setEditingRole(role);
    setForm({ name: role.name, description: role.description || '', permissions: perms });
    setShowModal(true);
  };

  const togglePerm = (key) => {
    if (key === 'all') {
      const newVal = !form.permissions.all;
      const allTrue = Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, newVal]));
      setForm({ ...form, permissions: allTrue });
    } else {
      const updated = { ...form.permissions, [key]: !form.permissions[key], all: false };
      setForm({ ...form, permissions: updated });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!window.electronAPI || !form.name.trim()) return;
    const permsJson = JSON.stringify(form.permissions);

    if (editingRole) {
      await window.electronAPI.executeDb(
        'UPDATE job_roles SET name=?, description=?, permissions=? WHERE id=?',
        [form.name.trim(), form.description, permsJson, editingRole.id]
      );
    } else {
      await window.electronAPI.executeDb(
        'INSERT INTO job_roles (name, description, permissions) VALUES (?,?,?)',
        [form.name.trim(), form.description, permsJson]
      );
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (role) => {
    const count = staffCount[role.name] || 0;
    if (count > 0) {
      alert(`لا يمكن حذف "${role.name}" لأنه مُعيّن لـ ${count} موظف. قم بتغيير وظيفتهم أولاً.`);
      return;
    }
    if (await confirmDialog(`هل تريد حذف وظيفة "${role.name}"؟`)) {
      await window.electronAPI.executeDb('DELETE FROM job_roles WHERE id=?', [role.id]);
      fetchData();
    }
  };

  const getPermsArray = (permStr) => {
    try {
      const p = JSON.parse(permStr || '{}');
      if (p.all) return ['جميع الصلاحيات 👑'];
      return PERMISSION_MODULES.filter(m => m.key !== 'all' && p[m.key]).map(m => m.label);
    } catch { return []; }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            الوظائف وأدوار النظام
          </h1>
          <p className="text-sm text-gray-500 mt-1">تعريف المسميات الوظيفية وتحديد الصلاحيات لكل دور</p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 border-none">
          <Plus className="w-4 h-4 ml-2" /> إضافة وظيفة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <Briefcase className="w-7 h-7 mb-2 opacity-70" />
          <p className="text-3xl font-black">{roles.length}</p>
          <p className="text-sm opacity-80 font-bold">إجمالي الوظائف</p>
        </Card>
        <Card className="p-5 border-none shadow-sm bg-white">
          <ShieldCheck className="w-7 h-7 mb-2 text-emerald-500" />
          <p className="text-3xl font-black text-gray-800">{roles.filter(r => { try { return JSON.parse(r.permissions||'{}').all; } catch{ return false; }}).length}</p>
          <p className="text-sm text-gray-500 font-bold">صلاحية كاملة</p>
        </Card>
        <Card className="p-5 border-none shadow-sm bg-white">
          <Users className="w-7 h-7 mb-2 text-purple-500" />
          <p className="text-3xl font-black text-gray-800">{Object.values(staffCount).reduce((a,b)=>a+b,0)}</p>
          <p className="text-sm text-gray-500 font-bold">إجمالي الموظفين</p>
        </Card>
        <Card className="p-5 border-none shadow-sm bg-white">
          <ShieldOff className="w-7 h-7 mb-2 text-amber-500" />
          <p className="text-3xl font-black text-gray-800">{roles.filter(r => { try { const p=JSON.parse(r.permissions||'{}'); return !p.all && Object.values(p).every(v=>!v); } catch{ return true; }}).length}</p>
          <p className="text-sm text-gray-500 font-bold">بدون صلاحيات</p>
        </Card>
      </div>

      {/* Roles Table */}
      <Card className="p-0 border-none shadow-sm overflow-hidden bg-white">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" /> قائمة الوظائف والصلاحيات
          </h3>
        </div>
        <Table headers={['المسمى الوظيفي', 'الوصف', 'الصلاحيات الممنوحة', 'الموظفون', 'إجراءات']}>
          {roles.length === 0 ? (
            <tr><td colSpan="5" className="text-center py-10 text-gray-400 font-bold">لا توجد وظائف مسجلة</td></tr>
          ) : (
            roles.map(role => {
              const perms = getPermsArray(role.permissions);
              const count = staffCount[role.name] || 0;
              let isAll = false;
              try { isAll = JSON.parse(role.permissions||'{}').all; } catch{}

              return (
                <tr key={role.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">
                        {role.name.charAt(0)}
                      </div>
                      <span className="font-black text-gray-800">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{role.description || '—'}</td>
                  <td className="px-6 py-4">
                    {perms.length === 0 ? (
                      <span className="text-xs text-gray-400 font-bold">بدون صلاحيات</span>
                    ) : isAll ? (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <Lock className="w-3 h-3" /> جميع الصلاحيات
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {perms.slice(0,3).map((p,i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{p}</span>
                        ))}
                        {perms.length > 3 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">+{perms.length-3}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-black text-lg ${count > 0 ? 'text-blue-600' : 'text-gray-300'}`}>{count}</span>
                    <span className="text-xs text-gray-400 mr-1">موظف</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(role)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="تعديل">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(role)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRole ? `تعديل وظيفة: ${editingRole.name}` : 'إضافة وظيفة جديدة'} className="max-w-lg">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المسمى الوظيفي <span className="text-red-500">*</span></label>
              <Input
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="مثال: مدير المشاريع، محاسب، مشرف..."
                required
                className="font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">وصف الوظيفة (اختياري)</label>
              <Input
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="وصف مختصر لمهام هذه الوظيفة..."
              />
            </div>
          </div>

          {/* Permissions Matrix */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" /> الصلاحيات الممنوحة
            </label>
            <div className="space-y-2 border border-gray-100 rounded-xl overflow-hidden">
              {PERMISSION_MODULES.map(mod => (
                <label
                  key={mod.key}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${form.permissions[mod.key] ? (mod.danger ? 'bg-red-50 border-b border-red-100' : 'bg-blue-50 border-b border-blue-100') : 'bg-white border-b border-gray-50 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{mod.icon}</span>
                    <span className={`text-sm font-bold ${mod.danger ? 'text-red-700' : 'text-gray-700'}`}>{mod.label}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={!!form.permissions[mod.key]}
                      onChange={() => togglePerm(mod.key)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${form.permissions[mod.key] ? (mod.danger ? 'bg-red-500' : 'bg-blue-500') : 'bg-gray-200'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${form.permissions[mod.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 font-bold text-gray-600">إلغاء</Button>
            <Button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-md shadow-blue-200">
              <CheckCircle className="w-4 h-4 ml-2" />
              {editingRole ? 'حفظ التعديلات' : 'إنشاء الوظيفة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
