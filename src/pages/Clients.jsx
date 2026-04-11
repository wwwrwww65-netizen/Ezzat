import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Users,
  Plus,
  Search,
  Filter,
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
  const { clients, projects, invoices, payments, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    mobile: '',
    email: '',
    address: '',
    city: 'الرياض',
    country: 'السعودية',
    type: 'فرد',
    idNumber: '',
    workPlace: '',
    notes: '',
    status: 'نشط',
    creditLimit: 0,
    currentBalance: 0
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === '' || client.type === filterType)
  );

  const handleAddClient = (e) => {
    e.preventDefault();
    addItem('clients', { ...formData, id: Date.now() });
    setShowAddModal(false);
    setFormData({
      name: '', phone: '', mobile: '', email: '', address: '', city: 'الرياض',
      country: 'السعودية', type: 'فرد', idNumber: '', workPlace: '', notes: '',
      status: 'نشط', creditLimit: 0, currentBalance: 0
    });
  };

  const openDetails = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const getClientProjects = (clientId) => projects.filter(p => p.clientId === clientId);
  const getClientInvoices = (clientId) => invoices.filter(i => i.clientId === clientId);
  const getClientPayments = (clientId) => payments.filter(p => p.entityType === 'client' && p.entityId === clientId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة العملاء</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة بيانات العملاء، المشاريع المرتبطة، والوضع المالي</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            <span>تصدير</span>
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="البحث بالاسم، الهاتف، أو البريد الإلكتروني..."
              className="pr-10"
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
          {filteredClients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{client.name}</div>
                    <div className="text-xs text-gray-500">{client.idNumber}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-400"><Mail className="w-3 h-3" /> {client.email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={client.type === 'شركة' ? 'info' : 'neutral'}>{client.type}</Badge>
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant="neutral">{getClientProjects(client.id).length}</Badge>
              </td>
              <td className="px-6 py-4 font-bold text-sm">
                <span className={client.currentBalance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                  {Number(client.currentBalance).toLocaleString()} ر.س
                </span>
              </td>
              <td className="px-6 py-4">
                <Badge variant={client.status === 'نشط' ? 'success' : 'danger'}>{client.status}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => openDetails(client)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="التفاصيل">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="تعديل">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteItem('clients', client.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Add Client Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إضافة عميل جديد"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary" onClick={handleAddClient}>حفظ البيانات</Button>
          </div>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="اسم العميل" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <Select
              label="نوع العميل"
              options={[{label: 'فرد', value: 'فرد'}, {label: 'شركة', value: 'شركة'}]}
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="رقم الجوال" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
            <Input label="البريد الإلكتروني" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="رقم الهوية / السجل" value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
            <Input label="الحد الائتماني" type="number" value={formData.creditLimit} onChange={(e) => setFormData({...formData, creditLimit: e.target.value})} />
          </div>
          <Input label="العنوان الكامل" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            placeholder="ملاحظات إضافية..."
            rows="3"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </form>
      </Modal>

      {/* Details Modal */}
      {selectedClient && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`تفاصيل العميل: ${selectedClient.name}`}
          className="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <Briefcase className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">المشاريع</p>
                <p className="text-xl font-bold">{getClientProjects(selectedClient.id).length}</p>
              </Card>
              <Card className="text-center p-4">
                <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">الفواتير</p>
                <p className="text-xl font-bold">{getClientInvoices(selectedClient.id).length}</p>
              </Card>
              <Card className="text-center p-4">
                <History className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">الرصيد</p>
                <p className="text-xl font-bold">{Number(selectedClient.currentBalance).toLocaleString()} ر.س</p>
              </Card>
            </div>

            <div className="border-b border-gray-100 flex gap-4 overflow-x-auto pb-px">
              {['البيانات العامة', 'المشاريع', 'الفواتير', 'الدفعات'].map((tab) => (
                <button key={tab} className="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-primary-600 whitespace-nowrap">
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
              <div><span className="text-gray-500 block">رقم الهاتف:</span> {selectedClient.phone || 'غير مسجل'}</div>
              <div><span className="text-gray-500 block">البريد الإلكتروني:</span> {selectedClient.email || 'غير مسجل'}</div>
              <div><span className="text-gray-500 block">العنوان:</span> {selectedClient.address || 'غير مسجل'}</div>
              <div><span className="text-gray-500 block">جهة العمل:</span> {selectedClient.workPlace || 'غير مسجل'}</div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm"><Printer className="w-4 h-4" /> طباعة الملف</Button>
                <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> PDF</Button>
              </div>
              <Button variant="danger" size="sm" onClick={() => deleteItem('clients', selectedClient.id)}>حذف العميل</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
