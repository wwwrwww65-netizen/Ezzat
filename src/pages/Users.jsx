import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Table, Button, Input, Modal, Select, Badge } from '../components/UI';
import {
  Users as UsersIcon, Plus, Shield, Key, Edit, Trash2,
  ShieldCheck, ShieldOff, Search, User, Link, CheckCircle,
  Eye, EyeOff, Lock, Unlock, UserCheck
} from 'lucide-react';

// Map job_role permissions to readable list
const PERM_LABELS = {
  all:       'جميع الصلاحيات 👑',
  hr:        'شؤون الموظفين',
  finance:   'الإدارة المالية',
  projects:  'المشاريع',
  inventory: 'المخزون',
  reports:   'التقارير',
  clients:   'العملاء',
  settings:  'الإعدادات',
  boq:       'جداول الكميات',
  users:     'إدارة المستخدمين',
};

const defaultForm = {
  name: '', username: '', password: '', role: '',
  email: '', phone: '', status: 'نشط', staff_id: '', client_id: ''
};

export default function Users() {
  const [users, setUsers]       = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [staffList, setStaff]   = useState([]);
  const [clientList, setClients] = useState([]);
  const [search, setSearch]     = useState('');

  const [showModal, setShowModal]     = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm]               = useState(defaultForm);
  const [showPass, setShowPass]       = useState(false);

  useEffect(() => { initAndFetch(); }, []);

  const initAndFetch = async () => {
    if (!window.electronAPI) return;

    // Ensure users table exists with all needed columns
    await window.electronAPI.executeDb(`
      CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        username   TEXT UNIQUE,
        password   TEXT,
        role       TEXT,
        email      TEXT,
        phone      TEXT,
        status     TEXT DEFAULT 'نشط',
        staff_id   INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    try { await window.electronAPI.executeDb('ALTER TABLE users ADD COLUMN staff_id INTEGER'); } catch(e){}
    try { await window.electronAPI.executeDb('ALTER TABLE users ADD COLUMN phone TEXT'); } catch(e){}
    try { await window.electronAPI.executeDb('ALTER TABLE users ADD COLUMN email TEXT'); } catch(e){}

    // Seed admin if no users exist
    const uc = await window.electronAPI.queryDb('SELECT COUNT(*) as c FROM users');
    if ((uc && uc[0]) ? Number(uc[0].c) === 0 : true) {
      await window.electronAPI.executeDb(
        "INSERT INTO users (name, username, password, role, status) VALUES (?,?,?,?,?)",
        ['مدير النظام', 'admin', '123456', 'مدير النظام', 'نشط']
      );
    }

    fetchAll();
  };

  const fetchAll = async () => {
    if (!window.electronAPI) return;

    const u = await window.electronAPI.queryDb(`
      SELECT u.*, s.name as staff_name, s.role as staff_role, c.name as client_name
      FROM users u
      LEFT JOIN staff s ON u.staff_id = s.id
      LEFT JOIN clients c ON u.client_id = c.id
      ORDER BY u.id ASC
    `);
    setUsers(u || []);

    const jr = await window.electronAPI.queryDb('SELECT * FROM job_roles ORDER BY id ASC');
    setJobRoles(jr || []);

    const st = await window.electronAPI.queryDb('SELECT id, name, role FROM staff ORDER BY name ASC');
    setStaff(st || []);

    const cls = await window.electronAPI.queryDb('SELECT id, name FROM clients ORDER BY name ASC');
    setClients(cls || []);
  };

  // Get permissions array for a role name
  const getPermissions = (roleName) => {
    const jr = jobRoles.find(r => r.name === roleName);
    if (!jr) return [];
    try {
      const p = JSON.parse(jr.permissions || '{}');
      if (p.all) return ['جميع الصلاحيات 👑'];
      return Object.entries(PERM_LABELS)
        .filter(([k]) => k !== 'all' && p[k])
        .map(([, label]) => label);
    } catch { return []; }
  };

  const openAdd = () => {
    setEditingUser(null);
    setForm(defaultForm);
    setShowPass(false);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({
      name: u.name || '', username: u.username || '',
      password: '', // don't show existing password
      role: u.role || '', email: u.email || '',
      phone: u.phone || '', status: u.status || 'نشط',
      staff_id: u.staff_id ? String(u.staff_id) : '',
      client_id: u.client_id ? String(u.client_id) : ''
    });
    setShowPass(false);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!window.electronAPI) return;

    const staffId = form.staff_id ? Number(form.staff_id) : null;
    const clientId = form.client_id ? Number(form.client_id) : null;

    if (editingUser) {
      // Update — only update password if provided
      if (form.password.trim()) {
        await window.electronAPI.executeDb(
          'UPDATE users SET name=?,username=?,password=?,role=?,email=?,phone=?,status=?,staff_id=?,client_id=? WHERE id=?',
          [form.name, form.username, form.password, form.role, form.email, form.phone, form.status, staffId, clientId, editingUser.id]
        );
      } else {
        await window.electronAPI.executeDb(
          'UPDATE users SET name=?,username=?,role=?,email=?,phone=?,status=?,staff_id=?,client_id=? WHERE id=?',
          [form.name, form.username, form.role, form.email, form.phone, form.status, staffId, clientId, editingUser.id]
        );
      }
    } else {
      await window.electronAPI.executeDb(
        'INSERT INTO users (name,username,password,role,email,phone,status,staff_id,client_id) VALUES (?,?,?,?,?,?,?,?,?)',
        [form.name, form.username, form.password, form.role, form.email, form.phone, form.status, staffId, clientId]
      );
    }

    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (user) => {
    if (user.username === 'admin') { alert('لا يمكن حذف حساب المدير الرئيسي.'); return; }
    if (await confirmDialog(`هل تريد حذف حساب "${user.name}"؟`)) {
      await window.electronAPI.executeDb('DELETE FROM users WHERE id=?', [user.id]);
      fetchAll();
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'نشط' ? 'معطل' : 'نشط';
    await window.electronAPI.executeDb('UPDATE users SET status=? WHERE id=?', [newStatus, user.id]);
    fetchAll();
  };

  const filtered = users.filter(u =>
    !search || u.name?.includes(search) || u.username?.includes(search) || u.role?.includes(search)
  );

  const activeCount   = users.filter(u => u.status === 'نشط').length;
  const linkedCount   = users.filter(u => u.staff_id).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
            المستخدمون والصلاحيات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة حسابات الدخول، ربط المستخدمين بالموظفين، وتعيين أدوار النظام
          </p>
        </div>
        <Button onClick={openAdd} className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-200 border-none">
          <Plus className="w-4 h-4 ml-2" /> إضافة مستخدم جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-none shadow-sm bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <UsersIcon className="w-7 h-7 mb-2 opacity-70" />
          <p className="text-3xl font-black">{users.length}</p>
          <p className="text-sm opacity-80 font-bold">إجمالي الحسابات</p>
        </Card>
        <Card className="p-5 border-none shadow-sm bg-white">
          <ShieldCheck className="w-7 h-7 mb-2 text-emerald-500" />
          <p className="text-3xl font-black text-gray-800">{activeCount}</p>
          <p className="text-sm text-gray-500 font-bold">حسابات نشطة</p>
        </Card>
        <Card className="p-5 border-none shadow-sm bg-white">
          <ShieldOff className="w-7 h-7 mb-2 text-red-400" />
          <p className="text-3xl font-black text-gray-800">{users.length - activeCount}</p>
          <p className="text-sm text-gray-500 font-bold">حسابات معطلة</p>
        </Card>
        <Card className="p-5 border-none shadow-sm bg-white">
          <Link className="w-7 h-7 mb-2 text-blue-500" />
          <p className="text-3xl font-black text-gray-800">{linkedCount}</p>
          <p className="text-sm text-gray-500 font-bold">مربوط بموظف</p>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-0 border-none shadow-sm overflow-hidden bg-white">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary-500" /> قائمة المستخدمين
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              placeholder="البحث بالاسم أو اسم المستخدم..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table headers={['المستخدم', 'اسم الدخول', 'الوظيفة / الدور', 'الصلاحيات', 'الربط', 'الحالة', 'إجراءات']}>
          {filtered.length === 0 ? (
            <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-bold">لا يوجد مستخدمون</td></tr>
          ) : (
            filtered.map(user => {
              const perms = getPermissions(user.role);
              return (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center font-black text-primary-700 text-sm shrink-0">
                        {(user.name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                        {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
                      </div>
                    </div>
                  </td>
                  {/* Username */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded-lg text-gray-700">{user.username || '—'}</span>
                  </td>
                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold">
                      {user.role || 'غير محدد'}
                    </span>
                  </td>
                  {/* Permissions */}
                  <td className="px-6 py-4">
                    {perms.length === 0 ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {perms.slice(0,2).map((p,i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{p}</span>
                        ))}
                        {perms.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">+{perms.length-2}</span>
                        )}
                      </div>
                    )}
                  </td>
                  {/* Linked Staff/Client */}
                  <td className="px-6 py-4">
                    {user.staff_name ? (
                      <div className="flex items-center gap-1.5" title="مرتبط بموظف">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-emerald-700">{user.staff_name}</span>
                      </div>
                    ) : user.client_name ? (
                      <div className="flex items-center gap-1.5" title="مرتبط بعميل">
                        <UsersIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="text-xs font-bold text-purple-700">{user.client_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Link className="w-3 h-3" /> غير مرتبط
                      </span>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'نشط' ? 'success' : 'danger'}>{user.status}</Badge>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleStatus(user)}
                        className={`p-1.5 rounded-lg transition-colors ${user.status === 'نشط' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={user.status === 'نشط' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      >
                        {user.status === 'نشط' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(user)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={user.username === 'admin'}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="حذف"
                      >
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? `تعديل: ${editingUser.name}` : 'إضافة مستخدم جديد'}
        className="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="مثال: أحمد محمد" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم <span className="text-red-500">*</span></label>
              <Input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="مثال: ahmed99" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {editingUser ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}
              </label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  required={!editingUser}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الدور / الوظيفة <span className="text-red-500">*</span></label>
              <Select
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value})}
                required
                options={[
                  { value: '', label: '— اختر الدور —' },
                  ...jobRoles.map(r => ({ value: r.name, label: r.name }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
              <Select
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                options={[
                  { value: 'نشط', label: 'نشط' },
                  { value: 'معطل', label: 'معطل' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="example@mail.com" dir="ltr" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="05xxxxxxxx" />
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> ربط بموظف
                </label>
                <Select
                  value={form.staff_id}
                  onChange={e => setForm({...form, staff_id: e.target.value, client_id: ''})}
                  options={[
                    { value: '', label: '— لا يرتبط بموظف —' },
                    ...staffList.map(s => ({ value: String(s.id), label: `${s.name} — ${s.role || ''}` }))
                  ]}
                  disabled={!!form.client_id}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <UsersIcon className="w-3.5 h-3.5" /> أو ربط بعميل
                </label>
                <Select
                  value={form.client_id}
                  onChange={e => setForm({...form, client_id: e.target.value, staff_id: ''})}
                  options={[
                    { value: '', label: '— لا يرتبط بعميل —' },
                    ...clientList.map(c => ({ value: String(c.id), label: c.name }))
                  ]}
                  disabled={!!form.staff_id}
                />
              </div>
            </div>
            
            <div className="col-span-2">
               <p className="text-xs text-gray-400 text-center">يمكنك ربط الحساب إما بموظف لدخول الإدارة، أو بعميل لدخول لوحة العميل (لوحة العميل تتطلب دور مخصص للعملاء)</p>
            </div>
          </div>

          {/* Show permissions preview for selected role */}
          {form.role && (() => {
            const perms = getPermissions(form.role);
            return perms.length > 0 ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> صلاحيات هذا الدور:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {perms.map((p,i) => (
                    <span key={i} className="px-2 py-0.5 bg-white text-blue-700 border border-blue-200 rounded-full text-xs font-bold">{p}</span>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 font-bold text-gray-600">إلغاء</Button>
            <Button type="submit" className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-bold border-none shadow-md">
              <CheckCircle className="w-4 h-4 ml-2" />
              {editingUser ? 'حفظ التعديلات' : 'إنشاء الحساب'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
