import React from 'react';
import { Card, Button } from '../components/UI';
import { BarChart3, FileText, Download, TrendingUp, Users, Package, Wallet } from 'lucide-react';

const reportTypes = [
  { title: 'تقرير المشاريع السنوي', icon: BarChart3, description: 'ملخص أداء المشاريع، نسب الإنجاز، والتأخيرات.', color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'كشف الأرباح والخسائر', icon: Wallet, description: 'تحليل مالي شامل للإيرادات والمصروفات وصافي الربح.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'تقرير أداء الموظفين', icon: Users, description: 'إحصائيات الحضور، الرواتب، وتقييم الأداء العام.', color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'حركة المخزون والمواد', icon: Package, description: 'سجل الصادر والوارد وتوقعات النقص في المواد.', color: 'text-purple-600', bg: 'bg-purple-50' },
  { title: 'تقرير ضريبة القيمة المضافة', icon: FileText, description: 'الفواتير الضريبية والإقرارات الدورية.', color: 'text-red-600', bg: 'bg-red-50' },
  { title: 'تحليل نمو المبيعات', icon: TrendingUp, description: 'مقارنة المبيعات بين الفترات الزمنية المختلفة.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

export default function Reports() {
  const handleDownload = (title) => {
    alert(`جاري تجهيز ${title} وتحميله بصيغة PDF...`);
    // Simulated delay
    setTimeout(() => {
      alert(`تم تحميل ${title} بنجاح.`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">التقارير والإحصائيات</h1>
          <p className="text-sm text-gray-500">استخراج وتحليل بيانات الشركة بدقة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer group border-transparent hover:border-gray-200">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${report.bg} ${report.color} group-hover:scale-110 transition-transform`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{report.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{report.description}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
              <span className="text-xs font-medium text-gray-400">آخر تحديث: اليوم</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600"
                onClick={() => handleDownload(report.title)}
              >
                <Download className="w-4 h-4" />
                تحميل PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
