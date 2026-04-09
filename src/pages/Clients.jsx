import React from 'react';
import { Card, Table, Button, Badge } from '../components/UI';
import { mockClients } from '../data/mockData';
import { Plus, Search, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Clients() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة العملاء</h1>
          <p className="text-sm text-gray-500">إدارة سجلات وبيانات العملاء</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          إضافة عميل جديد
        </Button>
      </div>

      <Card className="p-4" noPadding>
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="البحث عن عميل..."
            />
          </div>
        </div>

        <Table headers={['الاسم', 'التواصل', 'المشاريع المرتبطة', 'الرصيد المستحق', 'الإجراءات']}>
          {mockClients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                    {client.name.split(' ')[0][0]}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{client.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail className="w-3 h-3" />
                    {client.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    {client.phone}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <Badge variant="info" className="px-3">
                  {client.projects} مشاريع
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{client.balance}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                  التفاصيل
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
