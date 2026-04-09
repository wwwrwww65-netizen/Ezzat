import React from 'react';
import { Card, Badge, Table, Button, Input } from '../components/UI';
import { mockProjects } from '../data/mockData';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

export default function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المشاريع</h1>
          <p className="text-sm text-gray-500">إدارة وتتبع جميع مشاريع الشركة</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          إضافة مشروع جديد
        </Button>
      </div>

      <Card className="p-4 overflow-hidden" noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="البحث عن مشروع..."
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="secondary" size="sm" className="flex-1 md:flex-none">
              <Filter className="w-4 h-4" />
              تصفية
            </Button>
          </div>
        </div>

        <Table headers={['اسم المشروع', 'العميل', 'الحالة', 'تاريخ البدء', 'الإنجاز', 'الإجراءات']}>
          {mockProjects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{project.name}</span>
                  <span className="text-xs text-gray-500">ID: PRJ-{project.id.toString().padStart(3, '0')}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{project.client}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={project.status === 'نشط' ? 'success' : project.status === 'مكتمل' ? 'info' : project.status === 'متأخر' ? 'danger' : 'warning'}>
                  {project.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{project.startDate}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{project.progress}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:text-primary-600 transition-colors" title="عرض"><Eye className="w-4 h-4" /></button>
                  <button className="p-1 hover:text-amber-600 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></button>
                  <button className="p-1 hover:text-red-600 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">عرض 5 من أصل 24 مشروع</p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled>السابق</Button>
            <Button variant="secondary" size="sm">التالي</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
