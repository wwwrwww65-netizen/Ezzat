import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  History,
  Trash2,
  Edit,
  Eye,
  Download,
  Printer
} from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [formData, setFormData] = useState({
    name: '', phone: '', mobile: '', email: '', address: '',
    city: 'الرياض', country: 'السعودية', type: 'فرد', idNumber: '',
    workPlace: '', notes: '', status: 'نشط', creditLimit: 0, currentBalance: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!window.electronAPI) return;
    try {
      const cls = await window.electronAPI.queryDb('SELECT * FROM clients ORDER BY id DESC');
      setClients(cls || []);

      // If projects table exists, fetch
      try {
        const prjs = await window.electronAPI.queryDb('SELECT id, client_id FROM projects');
        setProjects(prjs || []);
      } catch(e) {}

      // If invoices table exists, fetch
      try {
        const invs = await window.electronAPI.queryDb('SELECT id, client_id FROM invoices');
        setInvoices(invs || []);
      } catch(e) {}

    } catch (e) {
      console.error(e);
    }
  };

  const filteredClients = clients.filter(client =>
    (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === '' || client.type === filterType)
  );

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!window.electronAPI) return;

    if (editingClient) {
      await window.electronAPI.executeDb(
        `UPDATE clients SET name=?, phone=?, mobile=?, email=?, address=?, city=?, country=?, type=?, idNumber=?, workPlace=?, notes=?, status=?, creditLimit=?, currentBalance=? WHERE id=?`,
        [formData.name, formData.phone, formData.mobile, formData.email, formData.address, formData.city, formData.country, formData.type, formData.idNumber, formData.workPlace, formData.notes, formData.status, formData.creditLimit, formData.currentBalance, editingClient.id]
      );
    } else {
      await window.electronAPI.executeDb(
        `INSERT INTO clients (name, phone, mobile, email, address, city, country, type, idNumber, workPlace, notes, status, creditLimit, currentBalance) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [formData.name, formData.phone, formData.mobile, formData.email, formData.address, formData.city, formData.country, formData.type, formData.idNumber, formData.workPlace, formData.notes, formData.status, formData.creditLimit, formData.currentBalance]
      );
    }

    setShowAddModal(false);
    fetchData();
  };

  const openAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '', phone: '', mobile: '', email: '', address: '',
      city: 'الرياض', country: 'السعودية', type: 'فرد', idNumber: '',
      workPlace: '', notes: '', status: 'نشط', creditLimit: 0, currentBalance: 0
    });
    setShowAddModal(true);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '', phone: client.phone || '', mobile: client.mobile || '',
      email: client.email || '', address: client.address || '', city: client.city || 'الرياض',
      country: client.country || 'السعودية', type: client.type || 'فرد', idNumber: client.idNumber || '',
      workPlace: client.workPlace || '', notes: client.notes || '', status: client.status || 'نشط',
      creditLimit: client.creditLimit || 0, currentBalance: client.currentBalance || 0
    });
    setShowAddModal(true);
  };

  const deleteClient = async (id) => {
    if (await confirmDialog('هل أنت متأكد من حذف هذا العميل؟')) {
      await window.electronAPI.executeDb('DELETE FROM clients WHERE id=?', [id]);
      fetchData();
    }
  };

  const openDetails = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const getClientProjects = (clientId) => projects.filter(p => p.client_id === clientId);
  const getClientInvoices = (clientId) => invoices.filter(i => i.client_id === clientId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            إدارة العملاء
          </h1>
          <p className="text-sm text-gray-500 mt-1">إدارة بيانات العملاء، المشاريع المرتبطة، والوضع المالي</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-200 border-none">
            <Plus className="w-4 h-4 ml-2" />
            إضافة عميل جديد
          </Button>
        </div>
      </div>

      <Card className="p-0 border-none shadow-sm bg-white overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="البحث بالاسم..."
              className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              options={[
                { label: 'جميع الأنواع', value: '' },
                { label: 'أفراد', value: 'فرد' },
                { label: 'شركات', value: 'شركة' },
              ]}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
        </div>

        <Table headers={['العميل', 'التواصل', 'النوع', 'المشاريع', 'الرصيد', 'الحالة', 'إجراءات']}>
          {filteredClients.length === 0 ? (
             <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-bold">لا يوجد عملاء مضافين</td></tr>
          ) : filteredClients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-black shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{client.name}</div>
                    <div className="text-xs text-gray-400">{client.idNumber || 'بدون هوية/سجل'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1 font-mono"><Phone className="w-3 h-3 text-gray-400" /> {client.phone || client.mobile || '—'}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-400"><Mail className="w-3 h-3 text-gray-400" /> {client.email || '—'}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={client.type === 'شركة' ? 'info' : 'neutral'}>{client.type}</Badge>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold">{getClientProjects(client.id).length}</span>
              </td>
              <td className="px-6 py-4 font-bold text-sm">
                <span className={client.currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}>
                  {Number(client.currentBalance || 0).toLocaleString()} <span className="text-[10px]">ر.س</span>
                </span>
              </td>
              <td className="px-6 py-4">
                <Badge variant={client.status === 'نشط' ? 'success' : 'danger'}>{client.status}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button onClick={() => openDetails(client)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="التفاصيل">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(client)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="تعديل">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteClient(client.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingClient ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
        className="max-w-2xl"
      >
        <form className="space-y-4" onSubmit={handleSaveClient}>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">اسم العميل <span className="text-red-500">*</span></label>
               <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">نوع العميل</label>
               <Select
                 options={[{label: 'فرد', value: 'فرد'}, {label: 'شركة', value: 'شركة'}]}
                 value={formData.type}
                 onChange={(e) => setFormData({...formData, type: e.target.value})}
               />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجوال</label>
               <Input value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
               <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهوية / السجل التجاري</label>
               <Input value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">جهة العمل</label>
               <Input value={formData.workPlace} onChange={(e) => setFormData({...formData, workPlace: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">العنوان</label>
            <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات إضافية</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} className="flex-1 text-gray-600 font-bold">إلغاء</Button>
            <Button type="submit" className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-bold border-none shadow-md">
              حفظ بيانات العميل
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      {selectedClient && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`ملف العميل: ${selectedClient.name}`}
          className="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center p-4 border-none shadow-sm bg-blue-50/50">
                <Briefcase className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-bold">إجمالي المشاريع</p>
                <p className="text-2xl font-black text-gray-800">{getClientProjects(selectedClient.id).length}</p>
              </Card>
              <Card className="text-center p-4 border-none shadow-sm bg-purple-50/50">
                <FileText className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-bold">الفواتير</p>
                <p className="text-2xl font-black text-gray-800">{getClientInvoices(selectedClient.id).length}</p>
              </Card>
              <Card className="text-center p-4 border-none shadow-sm bg-emerald-50/50">
                <History className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-bold">الرصيد المالي</p>
                <p className="text-2xl font-black text-gray-800">{Number(selectedClient.currentBalance || 0).toLocaleString()} <span className="text-sm">ر.س</span></p>
              </Card>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
               <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2">بيانات التواصل والملف</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-gray-400 block mb-1 text-xs">رقم الجوال</span><span className="font-mono">{selectedClient.mobile || selectedClient.phone || '—'}</span></div>
                  <div><span className="text-gray-400 block mb-1 text-xs">البريد الإلكتروني</span>{selectedClient.email || '—'}</div>
                  <div><span className="text-gray-400 block mb-1 text-xs">رقم الهوية/السجل</span><span className="font-mono">{selectedClient.idNumber || '—'}</span></div>
                  <div><span className="text-gray-400 block mb-1 text-xs">جهة العمل</span>{selectedClient.workPlace || '—'}</div>
                  <div className="col-span-4"><span className="text-gray-400 block mb-1 text-xs">العنوان</span>{selectedClient.address || '—'}</div>
               </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="font-bold bg-white"><Printer className="w-4 h-4 text-gray-500" /> طباعة الملف</Button>
              </div>
              <Button onClick={() => { setShowDetailsModal(false); deleteClient(selectedClient.id); }} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold border-none shadow-none" size="sm">
                حذف العميل نهائياً
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
