export const mockStats = [
  { label: 'إجمالي المشاريع', value: '24', trend: '+2', trendType: 'up' },
  { label: 'المشاريع النشطة', value: '12', trend: '0', trendType: 'neutral' },
  { label: 'إجمالي العملاء', value: '145', trend: '+12', trendType: 'up' },
  { label: 'صافي الربح', value: '45,200 ر.س', trend: '+15%', trendType: 'up' },
];

export const mockProjects = [
  {
    id: 1,
    name: 'فيلا حي النرجس',
    client: 'أحمد السديري',
    status: 'نشط',
    progress: 65,
    startDate: '2023-10-01',
    endDate: '2024-05-01',
    type: 'فيلا',
    location: 'الرياض - حي النرجس',
    area: 450,
    floors: 2,
    specifications: 'تشطيب فاخر، رخام إيطالي',
    budget: 1200000,
    actualCost: 750000
  },
  {
    id: 2,
    name: 'برج طريق الملك',
    client: 'شركة الراجحي',
    status: 'قيد الانتظار',
    progress: 15,
    startDate: '2023-11-15',
    endDate: '2025-12-15',
    type: 'عمارة',
    location: 'جدة - طريق الملك',
    area: 1200,
    floors: 15,
    specifications: 'تجاري سكني',
    budget: 15000000,
    actualCost: 2000000
  },
  {
    id: 3,
    name: 'مجمع تجاري الخبر',
    client: 'علي القحطاني',
    status: 'مكتمل',
    progress: 100,
    startDate: '2023-05-20',
    endDate: '2023-11-20',
    type: 'عمارة',
    location: 'الخبر - العزيزية',
    area: 800,
    floors: 1,
    specifications: 'محلات تجارية',
    budget: 3000000,
    actualCost: 2850000
  },
];

export const mockProjectStages = [
  { id: 1, projectId: 1, name: 'الحفر', status: 'مكتمل', progress: 100, startDate: '2023-10-01', endDate: '2023-10-10' },
  { id: 2, projectId: 1, name: 'القواعد', status: 'مكتمل', progress: 100, startDate: '2023-10-12', endDate: '2023-10-25' },
  { id: 3, projectId: 1, name: 'الأعمدة', status: 'نشط', progress: 60, startDate: '2023-11-01', endDate: '2023-11-20' },
  { id: 4, projectId: 1, name: 'السقف', status: 'قيد الانتظار', progress: 0, startDate: '2023-11-25', endDate: '2023-12-10' },
];

export const mockProjectFiles = [
  { id: 1, projectId: 1, name: 'المخطط الإنشائي', type: 'DWG', size: '15MB', date: '2023-09-25', version: 'v1.2', stage: 'القواعد' },
  { id: 2, projectId: 1, name: 'توزيع الكهرباء', type: 'PDF', size: '2MB', date: '2023-09-28', version: 'v1.0', stage: 'الكهرباء' },
];

export const mockClients = [
  { id: 1, name: 'أحمد السديري', email: 'ahmed@example.com', phone: '0501234567', projects: 2, balance: '5,000 ر.س' },
  { id: 2, name: 'شركة الراجحي', email: 'info@alrajhi.com', phone: '0114567890', projects: 5, balance: '120,000 ر.س' },
  { id: 3, name: 'علي القحطاني', email: 'ali@example.com', phone: '0555555555', projects: 1, balance: '0 ر.س' },
];

export const mockEmployees = [
  { id: 1, name: 'محمد علي', position: 'مهندس مدني', department: 'المشاريع', salary: '12,000 ر.س', status: 'على رأس العمل', role: 'engineer' },
  { id: 2, name: 'سارة خالد', position: 'محاسبة', department: 'المالية', salary: '9,000 ر.س', status: 'على رأس العمل', role: 'accountant' },
  { id: 3, name: 'ياسر إبراهيم', position: 'مشرف عمال', department: 'الميدان', salary: '7,500 ر.س', status: 'إجازة', role: 'supervisor' },
];

export const mockLaborTeams = [
  { id: 1, name: 'فريق النجارة', leader: 'أبو فهد', members: 5, dailyRate: 1500, status: 'نشط' },
  { id: 2, name: 'فريق الحدادة', leader: 'كومار', members: 4, dailyRate: 1200, status: 'نشط' },
];

export const mockEquipment = [
  { id: 1, name: 'رافعة شوكية', type: 'ثقيل', status: 'متوفر', dailyCost: 500, lastMaintenance: '2023-11-01' },
  { id: 2, name: 'خلاطة أسمنت', type: 'متوسط', status: 'في الموقع', dailyCost: 200, lastMaintenance: '2023-12-05' },
];

export const mockInvoices = [
  { id: 'INV-001', client: 'أحمد السديري', date: '2023-12-01', amount: '15,000 ر.س', status: 'مدفوعة' },
  { id: 'INV-002', client: 'شركة الراجحي', date: '2023-12-05', amount: '45,000 ر.س', status: 'معلقة' },
  { id: 'INV-003', client: 'علي القحطاني', date: '2023-12-10', amount: '12,500 ر.س', status: 'متأخرة' },
];

export const mockExpenses = [
  { id: 1, category: 'مواد بناء', amount: '8,400 ر.س', date: '2023-12-02', recipient: 'مصنع الشرق للرخام' },
  { id: 2, category: 'رواتب', amount: '55,000 ر.س', date: '2023-12-01', recipient: 'الموظفون' },
  { id: 3, category: 'إيجار', amount: '10,000 ر.س', date: '2023-12-01', recipient: 'مكتب العقارات' },
];

export const mockIncome = [
  { id: 1, title: 'دفعة أولى - فيلا النرجس', method: 'تحويل بنكي', date: '2023-12-05', amount: '50,000 ر.س', status: 'مؤكد' },
  { id: 2, title: 'مستخلص رقم 3 - برج الملك', method: 'شيك', date: '2023-12-04', amount: '120,000 ر.س', status: 'مؤكد' },
  { id: 3, title: 'تجديد فندق الشاطئ', method: 'نقدًا', date: '2023-12-02', amount: '15,000 ر.س', status: 'قيد التحصيل' },
];

export const mockInventory = [
  { id: 1, name: 'بلك أسمنتي 20', category: 'بناء', quantity: 5000, unit: 'قطعة', unitPrice: 2.5, waste: 2, supplier: 'مصنع الرياض', status: 'متوفر' },
  { id: 2, name: 'حديد 14 ملم', category: 'حديد', quantity: 15, unit: 'طن', unitPrice: 2800, waste: 3, supplier: 'حديد الراجحي', status: 'متوفر' },
  { id: 3, name: 'أسمنت بورتلاندي', category: 'مواد أساسية', quantity: 200, unit: 'كيس', unitPrice: 15, waste: 1, supplier: 'أسمنت اليمامة', status: 'منخفض' },
];

export const mockSuppliers = [
  { id: 1, name: 'مصنع الشرق للرخام', contact: 'عبدالله العتيبي', phone: '0544444444', category: 'رخام' },
  { id: 2, name: 'شركة الحديد والصلب', contact: 'فهد المصري', phone: '0566666666', category: 'مواد بناء' },
];

export const mockActivityLog = [
  { id: 1, user: 'أحمد محمد', action: 'تسجيل دخول', time: 'منذ 5 دقائق', ip: '192.168.1.1' },
  { id: 2, user: 'سارة خالد', action: 'إضافة فاتورة جديدة #INV-002', time: 'منذ ساعة', ip: '192.168.1.5' },
  { id: 3, user: 'أحمد محمد', action: 'تحديث حالة مشروع فيلا حي النرجس', time: 'منذ ساعتين', ip: '192.168.1.1' },
];

export const mockUsers = [
  { id: 1, name: 'أحمد محمد', email: 'admin@abujawad.com', role: 'مدير النظام', status: 'نشط' },
  { id: 2, name: 'سارة خالد', email: 'sara@abujawad.com', role: 'محاسب', status: 'نشط' },
  { id: 3, name: 'ياسر إبراهيم', email: 'yasser@abujawad.com', role: 'مشرف مشروع', status: 'نشط' },
];
