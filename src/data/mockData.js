export const mockStats = [
  { label: 'إجمالي المشاريع', value: '24', trend: '+2', trendType: 'up' },
  { label: 'المشاريع النشطة', value: '12', trend: '0', trendType: 'neutral' },
  { label: 'إجمالي العملاء', value: '145', trend: '+12', trendType: 'up' },
  { label: 'صافي الربح', value: '45200', trend: '+15%', trendType: 'up' },
  { label: 'إجمالي الموردين', value: '18', trend: '+1', trendType: 'up' },
  { label: 'إجمالي الإيرادات', value: '1250000', trend: '+8%', trendType: 'up' },
  { label: 'إجمالي المصروفات', value: '850000', trend: '+5%', trendType: 'down' },
  { label: 'قيمة العقود', value: '15000000', trend: '+10%', trendType: 'up' },
];

export const mockProjects = [
  {
    id: 1,
    projectNumber: 'PRJ-2023-001',
    name: 'فيلا حي النرجس',
    clientId: 1,
    clientName: 'أحمد السديري',
    status: 'نشط',
    progress: 65,
    startDate: '2023-10-01',
    endDate: '2024-05-01',
    actualDeliveryDate: null,
    type: 'فيلا',
    location: 'الرياض - حي النرجس',
    city: 'الرياض',
    country: 'السعودية',
    area: 450,
    floors: 2,
    constructionType: 'خرسانة مسلحة',
    specifications: 'تشطيب فاخر، رخام إيطالي',
    description: 'بناء فيلا سكنية دورين وملحق مع مسبح وتنسيق حدائق.',
    budget: 1200000,
    contractValue: 1350000,
    profitMargin: 15,
    actualCost: 750000,
    projectManager: 'محمد علي',
    engineerInCharge: 'خالد إبراهيم',
    supervisor: 'ياسر إبراهيم',
    notes: 'المشروع يسير وفق الجدول الزمني المخطط له.',
    attachments: []
  },
  {
    id: 2,
    projectNumber: 'PRJ-2023-002',
    name: 'برج طريق الملك',
    clientId: 2,
    clientName: 'شركة الراجحي',
    status: 'قيد الانتظار',
    progress: 15,
    startDate: '2023-11-15',
    endDate: '2025-12-15',
    actualDeliveryDate: null,
    type: 'عمارة',
    location: 'جدة - طريق الملك',
    city: 'جدة',
    country: 'السعودية',
    area: 1200,
    floors: 15,
    constructionType: 'هيكل حديدي وخرسانة',
    specifications: 'تجاري سكني فاخر',
    description: 'برج سكني تجاري يضم مكاتب وشقق فندقية.',
    budget: 15000000,
    contractValue: 18000000,
    profitMargin: 20,
    actualCost: 2000000,
    projectManager: 'فهد المصري',
    engineerInCharge: 'عمر سليمان',
    supervisor: 'سالم الدوسري',
    notes: 'في انتظار اعتماد مخططات الدفاع المدني.',
    attachments: []
  },
];

export const mockProjectStages = [
  { id: 1, projectId: 1, name: 'الحفر والردم', status: 'مكتمل', progress: 100, startDate: '2023-10-01', endDate: '2023-10-10' },
  { id: 2, projectId: 1, name: 'القواعد المسلحة', status: 'مكتمل', progress: 100, startDate: '2023-10-12', endDate: '2023-10-25' },
  { id: 3, projectId: 1, name: 'أعمدة الدور الأرضي', status: 'نشط', progress: 60, startDate: '2023-11-01', endDate: '2023-11-20' },
  { id: 4, projectId: 1, name: 'سقف الدور الأرضي', status: 'قيد الانتظار', progress: 0, startDate: '2023-11-25', endDate: '2023-12-10' },
];

export const mockProjectFiles = [
  { id: 1, projectId: 1, name: 'المخطط الإنشائي المعتمد', type: 'DWG', size: '15MB', date: '2023-09-25', version: 'v1.2', stage: 'القواعد', category: 'مخططات' },
  { id: 2, projectId: 1, name: 'توزيع الكهرباء والإنارة', type: 'PDF', size: '2MB', date: '2023-09-28', version: 'v1.0', stage: 'الكهرباء', category: 'مخططات' },
];

export const mockClients = [
  {
    id: 1,
    name: 'أحمد السديري',
    phone: '0501234567',
    mobile: '0500000001',
    email: 'ahmed@example.com',
    address: 'حي الملقا، شارع الأمل',
    city: 'الرياض',
    country: 'السعودية',
    type: 'فرد',
    idNumber: '1023456789',
    workPlace: 'وزارة التعليم',
    notes: 'عميل مميز، يفضل التواصل عبر الواتساب.',
    status: 'نشط',
    avatar: null,
    preferredContact: 'WhatsApp',
    creditLimit: 500000,
    currentBalance: 5000
  },
  {
    id: 2,
    name: 'شركة الراجحي العقارية',
    phone: '0114567890',
    mobile: '0555555552',
    email: 'info@alrajhi.com',
    address: 'حي المروج، طريق الملك فهد',
    city: 'الرياض',
    country: 'السعودية',
    type: 'شركة',
    idNumber: '7001234567',
    workPlace: 'المقر الرئيسي',
    notes: 'عقد مشاريع متعددة.',
    status: 'نشط',
    avatar: null,
    preferredContact: 'Email',
    creditLimit: 2000000,
    currentBalance: 120000
  },
];

export const mockCategories = [
  { id: 1, name: 'الأسمنت', code: 'CEM', description: 'جميع أنواع الأسمنت والبورتلاندي', color: '#1e3a8a', status: 'نشط' },
  { id: 2, name: 'البلك', code: 'BLK', description: 'بلك أسمني، بركاني، معزول', color: '#3b82f6', status: 'نشط' },
  { id: 3, name: 'الحديد', code: 'STEL', description: 'حديد تسليح بمختلف المقاسات', color: '#ef4444', status: 'نشط' },
  { id: 4, name: 'الكهرباء', code: 'ELEC', description: 'أسلاك، أفياش، طبلونات', color: '#f59e0b', status: 'نشط' },
];

export const mockInventory = [
  {
    id: 1,
    name: 'بلك أسمنتي 20',
    categoryId: 2,
    type: 'مخزني',
    unit: 'قطعة',
    dimensions: { width: 20, height: 20, length: 40 },
    thickness: 20,
    quantity: 5000,
    minQuantity: 1000,
    maxQuantity: 20000,
    buyPrice: 2.2,
    sellPrice: 3.0,
    unitCost: 2.5,
    wastePercentage: 2,
    defaultSupplier: 1,
    defaultWarehouse: 'مستودع السلي',
    isStorable: true,
    isPurchasable: true,
    isInstallable: true,
    isConsumable: true,
    status: 'متوفر'
  },
  {
    id: 2,
    name: 'حديد 14 ملم - الراجحي',
    categoryId: 3,
    type: 'مخزني',
    unit: 'طن',
    quantity: 15,
    minQuantity: 5,
    maxQuantity: 50,
    buyPrice: 2800,
    sellPrice: 3200,
    unitCost: 2900,
    wastePercentage: 3,
    defaultSupplier: 2,
    defaultWarehouse: 'موقع نرجس',
    status: 'متوفر'
  },
];

export const mockSuppliers = [
  {
    id: 1,
    name: 'مصنع الشرق للرخام والخرسانة',
    contactName: 'عبدالله العتيبي',
    phone: '0544444444',
    email: 'info@sharq.com',
    address: 'المنطقة الصناعية الثانية',
    city: 'الرياض',
    country: 'السعودية',
    category: 'رخام وخرسانة',
    paymentTerms: '30 يوم',
    deliveryTime: '3 أيام',
    status: 'نشط',
    rating: 4.5
  },
  {
    id: 2,
    name: 'شركة الحديد والصلب الوطنية',
    contactName: 'فهد المصري',
    phone: '0566666666',
    email: 'sales@nsc.com',
    address: 'ميناء جدة الإسلامي',
    city: 'جدة',
    country: 'السعودية',
    category: 'حديد تسليح',
    paymentTerms: 'نقداً',
    deliveryTime: '7 أيام',
    status: 'نشط',
    rating: 4.8
  },
];

export const mockPurchaseOrders = [
  {
    id: 'PO-2023-001',
    supplierId: 2,
    projectId: 1,
    orderDate: '2023-12-01',
    expectedDeliveryDate: '2023-12-08',
    items: [
      { itemId: 2, name: 'حديد 14 ملم', quantity: 5, unitPrice: 2850, total: 14250 }
    ],
    subTotal: 14250,
    tax: 2137.5,
    totalAmount: 16387.5,
    status: 'تم الاستلام',
    notes: 'يرجى التأكد من الجودة عند التوريد.'
  }
];

export const mockInvoices = [
  { id: 'INV-2023-001', clientId: 1, clientName: 'أحمد السديري', projectId: 1, date: '2023-12-01', amount: 15000, tax: 2250, total: 17250, paidAmount: 17250, status: 'مدفوعة', notes: 'دفعة أعمال الحفر' },
  { id: 'INV-2023-002', clientId: 2, clientName: 'شركة الراجحي', projectId: 2, date: '2023-12-05', amount: 45000, tax: 6750, total: 51750, paidAmount: 0, status: 'معلقة', notes: 'مستخلص مرحلة التأسيس' },
];

export const mockPayments = [
  { id: 'PAY-001', entityType: 'client', entityId: 1, projectId: 1, amount: 17250, date: '2023-12-02', paymentMethod: 'تحويل بنكي', reference: 'TRX9988', status: 'مؤكد', notes: 'سداد فاتورة INV-001' }
];

export const mockBonds = [
  { id: 'BND-001', type: 'قبض', entityName: 'أحمد السديري', amount: 50000, date: '2023-12-05', paymentMethod: 'شيك', project: 'فيلا حي النرجس', account: 'البنك الأهلي', status: 'معتمد', notes: 'دفعة مقدمة' }
];

export const mockExpenses = [
  { id: 1, category: 'مواد بناء', projectId: 1, amount: 8400, date: '2023-12-02', recipient: 'مصنع الشرق للرخام', status: 'معتمد' },
  { id: 2, category: 'رواتب', projectId: null, amount: 55000, date: '2023-12-01', recipient: 'الموظفون', status: 'معتمد' },
];

export const mockEmployees = [
  {
    id: 1,
    name: 'محمد علي',
    phone: '0501112223',
    profession: 'مهندس مدني',
    nationality: 'سعودي',
    idNumber: '1088877766',
    salary: 12000,
    dailyRate: 400,
    joinDate: '2020-01-15',
    status: 'على رأس العمل',
    role: 'engineer',
    projectId: 1
  },
  {
    id: 2,
    name: 'سارة خالد',
    phone: '0502223334',
    profession: 'محاسبة',
    nationality: 'سعودية',
    idNumber: '1077766655',
    salary: 9000,
    dailyRate: 300,
    joinDate: '2021-03-10',
    status: 'على رأس العمل',
    role: 'accountant',
    projectId: null
  },
];

export const mockEquipment = [
  { id: 1, name: 'رافعة شوكية تويوتا', type: 'ثقيل', serialNumber: 'FG-500-2022', status: 'متوفر', dailyCost: 500, monthlyCost: 12000, lastMaintenance: '2023-11-01', projectId: null },
  { id: 2, name: 'خلاطة أسمنت سيميكس', type: 'متوسط', serialNumber: 'MX-200', status: 'في الموقع', dailyCost: 200, monthlyCost: 5000, lastMaintenance: '2023-12-05', projectId: 1 },
];

export const mockActivityLog = [
  { id: 1, user: 'أحمد محمد', action: 'تسجيل دخول للنظام', time: '2023-12-10 09:00', ip: '192.168.1.1' },
  { id: 2, user: 'سارة خالد', action: 'إصدار فاتورة جديدة #INV-2023-002', time: '2023-12-10 10:30', ip: '192.168.1.5' },
];

export const mockUsers = [
  { id: 1, name: 'أحمد محمد', email: 'admin@abujawad.com', role: 'admin', status: 'نشط' },
  { id: 2, name: 'سارة خالد', email: 'sara@abujawad.com', role: 'accountant', status: 'نشط' },
];

export const mockTasks = [
  { id: 1, title: 'مراجعة مخططات السباكة', projectId: 1, assignedTo: 1, dueDate: '2023-12-15', priority: 'عالية', status: 'قيد التنفيذ' },
  { id: 2, title: 'طلب عرض سعر حديد', projectId: 2, assignedTo: 2, dueDate: '2023-12-12', priority: 'متوسطة', status: 'لم تبدأ' },
];

export const mockNotifications = [
  { id: 1, title: 'تنبيه مخزون', message: 'نقص في كمية الأسمنت البورتلاندي', time: 'منذ ساعة', read: false, type: 'warning' },
  { id: 2, title: 'موعد تسليم', message: 'غداً موعد تسليم مرحلة العظم لفيلا النرجس', time: 'منذ ساعتين', read: true, type: 'info' },
];

export const mockIncome = [
  { id: 1, title: 'دفعة أولى - فيلا النرجس', method: 'تحويل بنكي', date: '2023-12-05', amount: 50000, status: 'مؤكد' },
];

export const mockLaborTeams = [
  { id: 1, name: 'فريق النجارة', leader: 'أبو فهد', members: 5, dailyRate: 1500, status: 'نشط' },
];
