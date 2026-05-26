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
  { id: 5, name: 'الحفر والأساسات', code: 'EXC', description: 'أعمال الدفان والحفر والعزل', color: '#8b4513', status: 'نشط' },
  { id: 6, name: 'العظم والخرسانة', code: 'CONC', description: 'الخرسانة الجاهزة والرمل والكنكري', color: '#64748b', status: 'نشط' },
  { id: 7, name: 'التشطيبات والأرضيات', code: 'FIN', description: 'البلاط، الدهانات، والأسقف', color: '#10b981', status: 'نشط' },
  { id: 8, name: 'السباكة', code: 'PLUM', description: 'الأنابيب والمواسير والأطقم', color: '#0ea5e9', status: 'نشط' },
  { id: 9, name: 'الأبواب والنوافذ', code: 'DOOR', description: 'الأبواب الخشبية وشتر الألمنيوم', color: '#8b5cf6', status: 'نشط' },
  { id: 10, name: 'الأعمال التشغيلية والخدمات', code: 'OPS', description: 'أعمال الحفر، النقل، والخدمات اللوجستية', color: '#f59e0b', status: 'نشط' }
];

export const mockInventory = [
  // 1: الأسمنت
  { id: 1, name: 'أسمنت بورتلاندي عادي', categoryId: 1, type: 'مخزني', unit: 'كيس', quantity: 1000, buyPrice: 15, sellPrice: 18, status: 'متوفر', customSpecs: [{id: 101, name: 'الوزن (كجم)', value: '50'}, {id: 102, name: 'معدل التغطية / الاستهلاك', value: '1.2'}] },
  { id: 2, name: 'أسمنت مقاوم للأملاح', categoryId: 1, type: 'مخزني', unit: 'كيس', quantity: 500, buyPrice: 16, sellPrice: 19, status: 'متوفر', customSpecs: [{id: 201, name: 'الوزن (كجم)', value: '50'}, {id: 202, name: 'معدل التغطية / الاستهلاك', value: '1.2'}] },
  { id: 3, name: 'أسمنت أبيض', categoryId: 1, type: 'مخزني', unit: 'كيس', quantity: 200, buyPrice: 25, sellPrice: 30, status: 'متوفر', customSpecs: [{id: 301, name: 'الوزن (كجم)', value: '50'}, {id: 302, name: 'معدل التغطية / الاستهلاك', value: '1.5'}] },

  // 2: البلك
  { id: 4, name: 'بلك أسمنتي مصمت', categoryId: 2, type: 'مخزني', unit: 'حبة', quantity: 5000, buyPrice: 2, sellPrice: 2.5, status: 'متوفر', customSpecs: [{id: 401, name: 'الطول (م)', value: '0.40'}, {id: 402, name: 'العرض (م)', value: '0.20'}, {id: 403, name: 'الارتفاع (م)', value: '0.20'}] },
  { id: 5, name: 'بلك أسمنتي مفرغ 20', categoryId: 2, type: 'مخزني', unit: 'حبة', quantity: 10000, buyPrice: 1.8, sellPrice: 2.2, status: 'متوفر', customSpecs: [{id: 501, name: 'الطول (م)', value: '0.40'}, {id: 502, name: 'العرض (م)', value: '0.20'}, {id: 503, name: 'الارتفاع (م)', value: '0.20'}] },
  { id: 6, name: 'بلك أسمنتي مفرغ 15', categoryId: 2, type: 'مخزني', unit: 'حبة', quantity: 3000, buyPrice: 1.5, sellPrice: 1.8, status: 'متوفر', customSpecs: [{id: 601, name: 'الطول (م)', value: '0.40'}, {id: 602, name: 'العرض (م)', value: '0.15'}, {id: 603, name: 'الارتفاع (م)', value: '0.20'}] },
  { id: 7, name: 'بلك بركاني عازل', categoryId: 2, type: 'مخزني', unit: 'حبة', quantity: 5000, buyPrice: 3.5, sellPrice: 4.5, status: 'متوفر', customSpecs: [{id: 701, name: 'الطول (م)', value: '0.40'}, {id: 702, name: 'العرض (م)', value: '0.20'}, {id: 703, name: 'الارتفاع (م)', value: '0.20'}, {id: 704, name: 'الكثافة (كجم/م3)', value: '1200'}] },
  { id: 8, name: 'طوب أحمر فخاري', categoryId: 2, type: 'مخزني', unit: 'حبة', quantity: 2000, buyPrice: 2.2, sellPrice: 2.8, status: 'متوفر', customSpecs: [{id: 801, name: 'الطول (م)', value: '0.40'}, {id: 802, name: 'العرض (م)', value: '0.20'}, {id: 803, name: 'الارتفاع (م)', value: '0.20'}] },
  { id: 9, name: 'طابوق أبيض عازل AAC', categoryId: 2, type: 'مخزني', unit: 'حبة', quantity: 1500, buyPrice: 4.5, sellPrice: 5.5, status: 'متوفر', customSpecs: [{id: 901, name: 'الطول (م)', value: '0.60'}, {id: 902, name: 'العرض (م)', value: '0.20'}, {id: 903, name: 'الارتفاع (م)', value: '0.20'}] },

  // 3: الحديد
  { id: 10, name: 'حديد تسليح 8 ملم', categoryId: 3, type: 'مخزني', unit: 'طن', quantity: 10, buyPrice: 2700, sellPrice: 3100, status: 'متوفر', customSpecs: [{id: 1001, name: 'القطر (ملم)', value: '8'}, {id: 1002, name: 'وزن المتر الطولي (كجم/م)', value: '0.395'}] },
  { id: 11, name: 'حديد تسليح 12 ملم', categoryId: 3, type: 'مخزني', unit: 'طن', quantity: 15, buyPrice: 2800, sellPrice: 3200, status: 'متوفر', customSpecs: [{id: 1101, name: 'القطر (ملم)', value: '12'}, {id: 1102, name: 'وزن المتر الطولي (كجم/م)', value: '0.888'}] },
  { id: 12, name: 'حديد تسليح 14 ملم - الراجحي', categoryId: 3, type: 'مخزني', unit: 'طن', quantity: 20, buyPrice: 2800, sellPrice: 3200, status: 'متوفر', customSpecs: [{id: 1201, name: 'القطر (ملم)', value: '14'}, {id: 1202, name: 'وزن المتر الطولي (كجم/م)', value: '1.21'}] },
  { id: 13, name: 'حديد تسليح 16 ملم', categoryId: 3, type: 'مخزني', unit: 'طن', quantity: 25, buyPrice: 2800, sellPrice: 3200, status: 'متوفر', customSpecs: [{id: 1301, name: 'القطر (ملم)', value: '16'}, {id: 1302, name: 'وزن المتر الطولي (كجم/م)', value: '1.58'}] },
  { id: 14, name: 'سلك رباط', categoryId: 3, type: 'مخزني', unit: 'لفة', quantity: 100, buyPrice: 50, sellPrice: 65, status: 'متوفر', customSpecs: [{id: 1401, name: 'الوزن (كجم)', value: '10'}] },
  { id: 15, name: 'شبك أرضيات حديد', categoryId: 3, type: 'مخزني', unit: 'حبة', quantity: 300, buyPrice: 35, sellPrice: 45, status: 'متوفر', customSpecs: [{id: 1501, name: 'الطول (م)', value: '2.0'}, {id: 1502, name: 'العرض (م)', value: '1.0'}] },

  // 4: الكهرباء
  { id: 16, name: 'أسلاك كهرباء 2.5 ملم', categoryId: 4, type: 'مخزني', unit: 'لفة', quantity: 200, buyPrice: 85, sellPrice: 105, status: 'متوفر', customSpecs: [{id: 1601, name: 'القطر (ملم)', value: '2.5'}, {id: 1602, name: 'الطول للفة (م)', value: '91.4'}] },
  { id: 17, name: 'أسلاك كهرباء 4 ملم الفنار', categoryId: 4, type: 'مخزني', unit: 'لفة', quantity: 150, buyPrice: 110, sellPrice: 135, status: 'متوفر', customSpecs: [{id: 1701, name: 'القطر (ملم)', value: '4'}, {id: 1702, name: 'الطول للفة (م)', value: '91.4'}] },
  { id: 18, name: 'أسلاك كهرباء 6 ملم', categoryId: 4, type: 'مخزني', unit: 'لفة', quantity: 100, buyPrice: 160, sellPrice: 190, status: 'متوفر', customSpecs: [{id: 1801, name: 'القطر (ملم)', value: '6'}, {id: 1802, name: 'الطول للفة (م)', value: '91.4'}] },
  { id: 19, name: 'كيبل رئيسي مسلح', categoryId: 4, type: 'مخزني', unit: 'متر', quantity: 500, buyPrice: 35, sellPrice: 45, status: 'متوفر', customSpecs: [{id: 1901, name: 'القطر (ملم)', value: '25'}] },
  { id: 20, name: 'أفياش ومفاتيح باناسونيك', categoryId: 4, type: 'مخزني', unit: 'حبة', quantity: 1000, buyPrice: 15, sellPrice: 22, status: 'متوفر', customSpecs: [{id: 2001, name: 'الجهد (فولت)', value: '220'}, {id: 2002, name: 'التيار (أمبير)', value: '13'}] },
  { id: 21, name: 'طبلون كهرباء رئيسي الترا', categoryId: 4, type: 'مخزني', unit: 'حبة', quantity: 5, buyPrice: 350, sellPrice: 450, status: 'متوفر', customSpecs: [{id: 2101, name: 'عدد الخطوط', value: '24'}] },
  { id: 22, name: 'لمبات ليد سبوت لايت', categoryId: 4, type: 'مخزني', unit: 'حبة', quantity: 500, buyPrice: 12, sellPrice: 18, status: 'متوفر', customSpecs: [{id: 2201, name: 'القدرة (واط)', value: '7'}] },
  { id: 23, name: 'إضاءة مخفية شريط ليد', categoryId: 4, type: 'مخزني', unit: 'لفة', quantity: 100, buyPrice: 45, sellPrice: 60, status: 'متوفر', customSpecs: [{id: 2301, name: 'الطول للفة (م)', value: '50'}] },
  { id: 24, name: 'مواسير كهرباء بلاستيك', categoryId: 4, type: 'مخزني', unit: 'حبة', quantity: 1000, buyPrice: 4, sellPrice: 6, status: 'متوفر', customSpecs: [{id: 2401, name: 'القطر (ملم)', value: '25'}, {id: 2402, name: 'الطول (م)', value: '3'}] },
  { id: 25, name: 'علب كهرباء جدارية', categoryId: 4, type: 'مخزني', unit: 'حبة', quantity: 2000, buyPrice: 1.5, sellPrice: 2.5, status: 'متوفر', customSpecs: [{id: 2501, name: 'الطول (سم)', value: '7'}, {id: 2502, name: 'العرض (سم)', value: '7'}] },

  // 5: الأساسات والمواد العازلة
  { id: 28, name: 'صبة نظافة', categoryId: 5, type: 'مخزني', unit: 'م3', quantity: 0, buyPrice: 200, sellPrice: 230, status: 'متوفر', customSpecs: [{id: 2801, name: 'السماكة (م)', value: '0.10'}, {id: 2802, name: 'جهد الخرسانة', value: '250'}] },
  { id: 29, name: 'عزل مائي رولات بيتومين', categoryId: 5, type: 'مخزني', unit: 'م2', quantity: 1000, buyPrice: 18, sellPrice: 25, status: 'متوفر', customSpecs: [{id: 2901, name: 'السماكة (ملم)', value: '4'}, {id: 2902, name: 'الطول (م)', value: '10'}, {id: 2903, name: 'العرض (م)', value: '1'}] },
  { id: 30, name: 'برايمر أساس عازل', categoryId: 5, type: 'مخزني', unit: 'برميل', quantity: 20, buyPrice: 90, sellPrice: 120, status: 'متوفر', customSpecs: [{id: 3001, name: 'معدل التغطية (م2/لتر)', value: '4'}, {id: 3002, name: 'حجم البرميل (لتر)', value: '20'}] },
  { id: 31, name: 'مبيدات حشرية للتربة', categoryId: 5, type: 'مخزني', unit: 'لتر', quantity: 50, buyPrice: 45, sellPrice: 60, status: 'متوفر', customSpecs: [{id: 3101, name: 'معدل التغطية (م2/لتر)', value: '5'}] },
  { id: 32, name: 'نايلون حماية تحت القواعد', categoryId: 5, type: 'مخزني', unit: 'رول', quantity: 30, buyPrice: 65, sellPrice: 85, status: 'متوفر', customSpecs: [{id: 3201, name: 'السماكة (ميكرون)', value: '500'}, {id: 3202, name: 'معدل التغطية (م2)', value: '50'}] },

  // 6: العظم والخرسانة
  { id: 33, name: 'خرسانة جاهزة عيار 250', categoryId: 6, type: 'مخزني', unit: 'م3', quantity: 0, buyPrice: 210, sellPrice: 240, status: 'متوفر', customSpecs: [{id: 3301, name: 'جهد الخرسانة', value: '250'}, {id: 3302, name: 'الكثافة (كجم/م3)', value: '2400'}] },
  { id: 34, name: 'خرسانة جاهزة عيار 350', categoryId: 6, type: 'مخزني', unit: 'م3', quantity: 0, buyPrice: 230, sellPrice: 260, status: 'متوفر', customSpecs: [{id: 3401, name: 'جهد الخرسانة', value: '350'}, {id: 3402, name: 'الكثافة (كجم/م3)', value: '2400'}] },
  { id: 35, name: 'خرسانة جاهزة عيار 400', categoryId: 6, type: 'مخزني', unit: 'م3', quantity: 0, buyPrice: 250, sellPrice: 280, status: 'متوفر', customSpecs: [{id: 3501, name: 'جهد الخرسانة', value: '400'}, {id: 3502, name: 'الكثافة (كجم/م3)', value: '2400'}] },
  { id: 36, name: 'رمل أبيض / نيسة', categoryId: 6, type: 'مخزني', unit: 'قلاب', quantity: 0, buyPrice: 300, sellPrice: 400, status: 'متوفر', customSpecs: [{id: 3601, name: 'سعة النقل (م3)', value: '16'}] },
  { id: 37, name: 'رمل أسود للبطحاء', categoryId: 6, type: 'مخزني', unit: 'قلاب', quantity: 0, buyPrice: 350, sellPrice: 450, status: 'متوفر', customSpecs: [{id: 3701, name: 'سعة النقل (م3)', value: '16'}] },
  { id: 38, name: 'كنكري / زلط', categoryId: 6, type: 'مخزني', unit: 'قلاب', quantity: 0, buyPrice: 400, sellPrice: 500, status: 'متوفر', customSpecs: [{id: 3801, name: 'سعة النقل (م3)', value: '16'}, {id: 3802, name: 'القطر (ملم)', value: '20'}] },
  { id: 39, name: 'أخشاب نجارة للشدات', categoryId: 6, type: 'مخزني', unit: 'م3', quantity: 50, buyPrice: 1200, sellPrice: 1500, status: 'متوفر', customSpecs: [{id: 3901, name: 'النوع', value: 'خشب لاتيزانا'}, {id: 3902, name: 'معدل الهالك (%)', value: '15'}] },
  { id: 40, name: 'مسامير نجارة', categoryId: 6, type: 'مخزني', unit: 'كرتون', quantity: 200, buyPrice: 35, sellPrice: 50, status: 'متوفر', customSpecs: [{id: 4001, name: 'الوزن (كجم)', value: '5'}] },

  // 7: التشطيبات والأرضيات
  { id: 41, name: 'سيراميك أرضيات 60x60', categoryId: 7, type: 'مخزني', unit: 'م2', quantity: 1000, buyPrice: 35, sellPrice: 45, status: 'متوفر', customSpecs: [{id: 4101, name: 'الطول (م)', value: '0.60'}, {id: 4102, name: 'العرض (م)', value: '0.60'}, {id: 4103, name: 'معدل التغطية للكرتون (م2)', value: '1.44'}] },
  { id: 42, name: 'بورسلان أرضيات 80x80', categoryId: 7, type: 'مخزني', unit: 'م2', quantity: 800, buyPrice: 45, sellPrice: 65, status: 'متوفر', customSpecs: [{id: 4201, name: 'الطول (م)', value: '0.80'}, {id: 4202, name: 'العرض (م)', value: '0.80'}, {id: 4203, name: 'معدل التغطية للكرتون (م2)', value: '1.92'}] },
  { id: 43, name: 'سيراميك جدران حمامات', categoryId: 7, type: 'مخزني', unit: 'م2', quantity: 1500, buyPrice: 30, sellPrice: 42, status: 'متوفر', customSpecs: [{id: 4301, name: 'الطول (م)', value: '0.60'}, {id: 4302, name: 'العرض (م)', value: '0.30'}, {id: 4303, name: 'معدل التغطية للكرتون (م2)', value: '1.44'}] },
  { id: 44, name: 'رخام طبيعي روزا', categoryId: 7, type: 'مخزني', unit: 'م2', quantity: 300, buyPrice: 150, sellPrice: 220, status: 'متوفر', customSpecs: [{id: 4401, name: 'السماكة (ملم)', value: '20'}] },
  { id: 45, name: 'رخام درج وجرانيت', categoryId: 7, type: 'مخزني', unit: 'م طولي', quantity: 200, buyPrice: 120, sellPrice: 180, status: 'متوفر', customSpecs: [{id: 4501, name: 'السماكة (ملم)', value: '30'}, {id: 4502, name: 'العرض (م)', value: '0.33'}] },
  { id: 46, name: 'باركيه ألماني HDF', categoryId: 7, type: 'مخزني', unit: 'م2', quantity: 500, buyPrice: 55, sellPrice: 75, status: 'متوفر', customSpecs: [{id: 4601, name: 'السماكة (ملم)', value: '8'}, {id: 4602, name: 'معدل التغطية للكرتون (م2)', value: '2.4'}] },
  { id: 47, name: 'دهانات أساس / برايمر', categoryId: 7, type: 'مخزني', unit: 'برميل', quantity: 100, buyPrice: 85, sellPrice: 110, status: 'متوفر', customSpecs: [{id: 4701, name: 'معدل التغطية (م2/برميل)', value: '100'}, {id: 4702, name: 'الحجم (لتر)', value: '18'}] },
  { id: 48, name: 'دهانات جوتن نصف لمعة داخلي', categoryId: 7, type: 'مخزني', unit: 'برميل', quantity: 200, buyPrice: 120, sellPrice: 150, status: 'متوفر', customSpecs: [{id: 4801, name: 'معدل التغطية (م2/برميل)', value: '80'}, {id: 4802, name: 'الحجم (لتر)', value: '18'}] },
  { id: 49, name: 'معجون جدران', categoryId: 7, type: 'مخزني', unit: 'كيس', quantity: 500, buyPrice: 25, sellPrice: 35, status: 'متوفر', customSpecs: [{id: 4901, name: 'معدل التغطية (م2)', value: '30'}, {id: 4902, name: 'الوزن (كجم)', value: '25'}] },
  { id: 50, name: 'دهانات بروفايل خارجي للواجهات', categoryId: 7, type: 'مخزني', unit: 'برميل', quantity: 80, buyPrice: 140, sellPrice: 180, status: 'متوفر', customSpecs: [{id: 5001, name: 'معدل التغطية (م2/برميل)', value: '15'}, {id: 5002, name: 'الحجم (لتر)', value: '25'}] },
  { id: 51, name: 'حجر طبيعي واجهات', categoryId: 7, type: 'مخزني', unit: 'م2', quantity: 400, buyPrice: 80, sellPrice: 130, status: 'متوفر', customSpecs: [{id: 5101, name: 'السماكة (ملم)', value: '30'}, {id: 5102, name: 'الوزن للمتر المربع (كجم)', value: '60'}] },
  { id: 52, name: 'غراء بلاط', categoryId: 7, type: 'مخزني', unit: 'كيس', quantity: 1000, buyPrice: 18, sellPrice: 25, status: 'متوفر', customSpecs: [{id: 5201, name: 'معدل التغطية (م2)', value: '4'}, {id: 5202, name: 'الوزن (كجم)', value: '20'}] },
  { id: 53, name: 'ترويبة بلاط', categoryId: 7, type: 'مخزني', unit: 'كيس', quantity: 500, buyPrice: 15, sellPrice: 22, status: 'متوفر', customSpecs: [{id: 5301, name: 'معدل التغطية (م2)', value: '15'}, {id: 5302, name: 'الوزن (كجم)', value: '10'}] },

  // 8: السباكة
  { id: 54, name: 'مواسير تغذية حرارية PPR 3/4', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 500, buyPrice: 25, sellPrice: 35, status: 'متوفر', customSpecs: [{id: 5401, name: 'القطر (بوصة)', value: '0.75'}, {id: 5402, name: 'الطول (م)', value: '4'}] },
  { id: 55, name: 'مواسير صرف صحي PVC 4 بوصة', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 300, buyPrice: 45, sellPrice: 60, status: 'متوفر', customSpecs: [{id: 5501, name: 'القطر (بوصة)', value: '4'}, {id: 5502, name: 'الطول (م)', value: '6'}] },
  { id: 56, name: 'مواسير صرف صحي PVC 6 بوصة', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 200, buyPrice: 75, sellPrice: 95, status: 'متوفر', customSpecs: [{id: 5601, name: 'القطر (بوصة)', value: '6'}, {id: 5602, name: 'الطول (م)', value: '6'}] },
  { id: 57, name: 'أكواع وتوصيلات PPR', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 2000, buyPrice: 5, sellPrice: 8, status: 'متوفر', customSpecs: [{id: 5701, name: 'القطر (بوصة)', value: '0.75'}] },
  { id: 58, name: 'غراء سباكة', categoryId: 8, type: 'مخزني', unit: 'علبة', quantity: 100, buyPrice: 15, sellPrice: 22, status: 'متوفر', customSpecs: [{id: 5801, name: 'الوزن (جرام)', value: '500'}] },
  { id: 59, name: 'محابس وزوايا جروهي', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 150, buyPrice: 35, sellPrice: 50, status: 'متوفر', customSpecs: [{id: 5901, name: 'المقاس (بوصة)', value: '0.5'}] },
  { id: 60, name: 'مغاسل خزف سعودي', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 50, buyPrice: 150, sellPrice: 220, status: 'متوفر', customSpecs: [{id: 6001, name: 'الطول (م)', value: '0.60'}, {id: 6002, name: 'العرض (م)', value: '0.45'}] },
  { id: 61, name: 'مغاسل رخام تفصيل', categoryId: 8, type: 'مخزني', unit: 'م طولي', quantity: 20, buyPrice: 800, sellPrice: 1200, status: 'متوفر', customSpecs: [{id: 6101, name: 'السماكة (ملم)', value: '20'}] },
  { id: 62, name: 'كراسي إفرنجي معلق', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 40, buyPrice: 650, sellPrice: 900, status: 'متوفر', customSpecs: [{id: 6201, name: 'صرف الجدار (سم)', value: '22'}] },
  { id: 63, name: 'كراسي بلدي', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 30, buyPrice: 120, sellPrice: 180, status: 'متوفر', customSpecs: [{id: 6301, name: 'صرف أرضي (بوصة)', value: '4'}] },
  { id: 64, name: 'خلاطات مياه مغاسل', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 100, buyPrice: 180, sellPrice: 260, status: 'متوفر', customSpecs: [{id: 6401, name: 'النوع', value: 'خلاط حار بارد'}] },
  { id: 65, name: 'دش استحمام كامل', categoryId: 8, type: 'مخزني', unit: 'طقم', quantity: 50, buyPrice: 350, sellPrice: 500, status: 'متوفر', customSpecs: [{id: 6501, name: 'النوع', value: 'دش مطري'}] },
  { id: 66, name: 'سخانات مياه الخزف 50 لتر', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 40, buyPrice: 320, sellPrice: 420, status: 'متوفر', customSpecs: [{id: 6601, name: 'السعة (لتر)', value: '50'}] },
  { id: 67, name: 'خزان مياه علوي 2000 لتر', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 10, buyPrice: 800, sellPrice: 1100, status: 'متوفر', customSpecs: [{id: 6701, name: 'السعة (لتر)', value: '2000'}] },
  { id: 68, name: 'غطاس ماء', categoryId: 8, type: 'مخزني', unit: 'حبة', quantity: 15, buyPrice: 450, sellPrice: 600, status: 'متوفر', customSpecs: [{id: 6801, name: 'القدرة (حصان)', value: '1'}] },

  // 9: الأبواب والنوافذ
  { id: 69, name: 'أبواب خشب سنديان غرف', categoryId: 9, type: 'مخزني', unit: 'حبة', quantity: 50, buyPrice: 800, sellPrice: 1200, status: 'متوفر', customSpecs: [{id: 6901, name: 'الطول (م)', value: '2.20'}, {id: 6902, name: 'العرض (م)', value: '1.00'}, {id: 6903, name: 'السماكة (ملم)', value: '45'}] },
  { id: 70, name: 'أبواب WPC للحمامات', categoryId: 9, type: 'مخزني', unit: 'حبة', quantity: 40, buyPrice: 600, sellPrice: 850, status: 'متوفر', customSpecs: [{id: 7001, name: 'الطول (م)', value: '2.20'}, {id: 7002, name: 'العرض (م)', value: '0.80'}] },
  { id: 71, name: 'أبواب حديد قص ليزر مداخل', categoryId: 9, type: 'مخزني', unit: 'حبة', quantity: 10, buyPrice: 1500, sellPrice: 2200, status: 'متوفر', customSpecs: [{id: 7101, name: 'الطول (م)', value: '2.40'}, {id: 7102, name: 'العرض (م)', value: '1.50'}] },
  { id: 72, name: 'أبواب كراجات أوتوماتيكية', categoryId: 9, type: 'مخزني', unit: 'حبة', quantity: 5, buyPrice: 3500, sellPrice: 4500, status: 'متوفر', customSpecs: [{id: 7201, name: 'الطول (م)', value: '3.00'}, {id: 7202, name: 'العرض (م)', value: '4.00'}] },
  { id: 73, name: 'نوافذ ألمنيوم دبل جلاس سرايا', categoryId: 9, type: 'مخزني', unit: 'م2', quantity: 100, buyPrice: 350, sellPrice: 480, status: 'متوفر', customSpecs: [{id: 7301, name: 'الطول (م)', value: '1.20'}, {id: 7302, name: 'العرض (م)', value: '1.20'}, {id: 7303, name: 'السماكة (ملم)', value: '10'}] },
  { id: 74, name: 'شتر ألمنيوم كهربائي', categoryId: 9, type: 'مخزني', unit: 'م2', quantity: 50, buyPrice: 450, sellPrice: 600, status: 'متوفر', customSpecs: [{id: 7401, name: 'الطول (م)', value: '1.20'}, {id: 7402, name: 'العرض (م)', value: '1.20'}, {id: 7403, name: 'النوع', value: 'فوم معزول'}, {id: 7404, name: 'المحرك', value: 'سومفي فرنسي'}] },
  { id: 75, name: 'مسكات وأقفال أبواب', categoryId: 9, type: 'مخزني', unit: 'حبة', quantity: 200, buyPrice: 45, sellPrice: 75, status: 'متوفر', customSpecs: [{id: 7501, name: 'الخامة', value: 'ستانلس ستيل'}] },

  // 10: الأعمال التشغيلية والخدمات
  { id: 26, name: 'حفر وترحيل أساسات', categoryId: 10, type: 'خدمي', unit: 'م3', quantity: 0, buyPrice: 15, sellPrice: 25, status: 'متوفر', customSpecs: [{id: 2601, name: 'العمق الافتراضي للحفر (م)', value: '1.5'}, {id: 2602, name: 'معامل الانتفاش', value: '1.2'}] },
  { id: 27, name: 'ردم ورص بيسكورس', categoryId: 10, type: 'خدمي', unit: 'م3', quantity: 0, buyPrice: 25, sellPrice: 35, status: 'متوفر', customSpecs: [{id: 2701, name: 'الكثافة', value: '1.8'}] },
  { id: 76, name: 'نقل مخلفات بناء (رد دينة)', categoryId: 10, type: 'خدمي', unit: 'رد', quantity: 0, buyPrice: 150, sellPrice: 200, status: 'متوفر', customSpecs: [{id: 7601, name: 'سعة النقل (م3)', value: '4'}] },
  { id: 77, name: 'نقل مخلفات (قلاب كبير)', categoryId: 10, type: 'خدمي', unit: 'رد', quantity: 0, buyPrice: 300, sellPrice: 400, status: 'متوفر', customSpecs: [{id: 7701, name: 'سعة النقل (م3)', value: '16'}] },
  { id: 78, name: 'توريد مياه للموقع (وايت)', categoryId: 10, type: 'خدمي', unit: 'رد', quantity: 0, buyPrice: 100, sellPrice: 150, status: 'متوفر', customSpecs: [{id: 7801, name: 'سعة النقل (لتر)', value: '12000'}] },
  { id: 79, name: 'تسوية وتخطيط الموقع (مساح)', categoryId: 10, type: 'خدمي', unit: 'مقطوعية', quantity: 0, buyPrice: 1500, sellPrice: 2000, status: 'متوفر', customSpecs: [{id: 7901, name: 'النوع', value: 'مساحة وتخطيط بالنقاط'}] },
  { id: 80, name: 'حراسة أمنية للموقع', categoryId: 10, type: 'خدمي', unit: 'شهر', quantity: 0, buyPrice: 2500, sellPrice: 3000, status: 'متوفر', customSpecs: [{id: 8001, name: 'العدد', value: '1 حارس'}] },
  { id: 81, name: 'رسوم وتصاريح بلدية', categoryId: 10, type: 'خدمي', unit: 'مقطوعية', quantity: 0, buyPrice: 5000, sellPrice: 5500, status: 'متوفر', customSpecs: [{id: 8101, name: 'النوع', value: 'رخصة بناء ومخططات'}] },
  { id: 82, name: 'تأجير سقالات معدنية', categoryId: 10, type: 'خدمي', unit: 'شهر', quantity: 0, buyPrice: 1000, sellPrice: 1500, status: 'متوفر', customSpecs: [{id: 8201, name: 'معدل التغطية (م2)', value: '10'}] }
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
  // الإدارة
  { id: 1, name: 'محمد علي', phone: '0501112223', profession: 'مهندس مدني', nationality: 'سعودي', idNumber: '1088877766', salary: 12000, dailyRate: 400, joinDate: '2020-01-15', status: 'على رأس العمل', role: 'engineer', projectId: 1 },
  { id: 2, name: 'سارة خالد', phone: '0502223334', profession: 'محاسبة', nationality: 'سعودية', idNumber: '1077766655', salary: 9000, dailyRate: 300, joinDate: '2021-03-10', status: 'على رأس العمل', role: 'accountant', projectId: null },
  { id: 3, name: 'خالد إبراهيم', phone: '0503334445', profession: 'مهندس موقع', nationality: 'سعودي', idNumber: '1066655544', salary: 10000, dailyRate: 333, joinDate: '2022-05-20', status: 'على رأس العمل', role: 'supervisor', projectId: 1 },
  { id: 4, name: 'ياسر إبراهيم', phone: '0504445556', profession: 'مراقب عمال', nationality: 'سعودي', idNumber: '1055544433', salary: 6000, dailyRate: 200, joinDate: '2021-08-01', status: 'على رأس العمل', role: 'supervisor', projectId: 2 },

  // العمالة التشغيلية (Labor)
  { id: 5, name: 'عبدالرحمن معلم', phone: '0551112222', profession: 'بناء بلك', nationality: 'مصري', idNumber: '2011122233', salary: 4500, dailyRate: 150, joinDate: '2023-01-10', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 6, name: 'أحمد النجار', phone: '0552223333', profession: 'نجار مسلح', nationality: 'مصري', idNumber: '2022233344', salary: 5000, dailyRate: 160, joinDate: '2022-11-05', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 7, name: 'سيد محمود', phone: '0553334444', profession: 'حداد مسلح', nationality: 'مصري', idNumber: '2033344455', salary: 5000, dailyRate: 160, joinDate: '2022-12-15', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 8, name: 'رفيق أحمد', phone: '0554445555', profession: 'مبلط سيراميك ورخام', nationality: 'هندي', idNumber: '2044455566', salary: 4000, dailyRate: 130, joinDate: '2023-02-20', status: 'على رأس العمل', role: 'labor', projectId: 2 },
  { id: 9, name: 'عبدالله السباك', phone: '0555556666', profession: 'معلم سباكة', nationality: 'يمني', idNumber: '2055566677', salary: 4500, dailyRate: 150, joinDate: '2023-03-01', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 10, name: 'عثمان الكهربائي', phone: '0556667777', profession: 'كهربائي تأسيس وتشطيب', nationality: 'باكستاني', idNumber: '2066677788', salary: 4500, dailyRate: 150, joinDate: '2023-04-10', status: 'على رأس العمل', role: 'labor', projectId: 2 },
  { id: 11, name: 'علي مليس', phone: '0557778888', profession: 'معلم لياسة', nationality: 'يمني', idNumber: '2077788899', salary: 4200, dailyRate: 140, joinDate: '2023-05-15', status: 'مجاز', role: 'labor', projectId: null },
  { id: 12, name: 'فاروق الدهان', phone: '0558889999', profession: 'دهان وصباغ', nationality: 'هندي', idNumber: '2088899900', salary: 3900, dailyRate: 130, joinDate: '2023-06-01', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 13, name: 'كمال جبس', phone: '0559990000', profession: 'فني جبس بورد وديكور', nationality: 'فلبيني', idNumber: '2099900011', salary: 5000, dailyRate: 160, joinDate: '2023-07-20', status: 'على رأس العمل', role: 'labor', projectId: 2 },
  { id: 14, name: 'محمود ألمنيوم', phone: '0561112222', profession: 'فني ألمنيوم ونوافذ', nationality: 'مصري', idNumber: '2100011122', salary: 4800, dailyRate: 160, joinDate: '2023-08-10', status: 'على رأس العمل', role: 'labor', projectId: null },
  { id: 15, name: 'جافيد تكييف', phone: '0562223333', profession: 'فني تكييف', nationality: 'باكستاني', idNumber: '2111122233', salary: 4500, dailyRate: 150, joinDate: '2023-09-05', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  
  // الإضافات الشاملة (حسب الطلب)
  { id: 16, name: 'راجو كومار', phone: '0563334444', profession: 'مساعد بناء (عامل عادي)', nationality: 'هندي', idNumber: '2122233344', salary: 2500, dailyRate: 90, joinDate: '2023-10-01', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 17, name: 'صالح الحجري', phone: '0564445555', profession: 'بناء حجر (معلم واجهات)', nationality: 'يمني', idNumber: '2133344455', salary: 6000, dailyRate: 200, joinDate: '2023-10-15', status: 'على رأس العمل', role: 'labor', projectId: null },
  { id: 18, name: 'إبراهيم صباب', phone: '0565556666', profession: 'عامل خرسانة وأسمنت', nationality: 'مصري', idNumber: '2144455566', salary: 3500, dailyRate: 120, joinDate: '2023-10-20', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 19, name: 'شاهيد إقبال', phone: '0566667777', profession: 'مساعد سباك', nationality: 'باكستاني', idNumber: '2155566677', salary: 3000, dailyRate: 100, joinDate: '2023-11-01', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 20, name: 'فضل الرحمن', phone: '0567778888', profession: 'مساعد كهربائي', nationality: 'بنغلاديشي', idNumber: '2166677788', salary: 3000, dailyRate: 100, joinDate: '2023-11-05', status: 'على رأس العمل', role: 'labor', projectId: 2 },
  { id: 21, name: 'حسان العازل', phone: '0568889999', profession: 'فني عزل (مائي وحراري)', nationality: 'سوري', idNumber: '2177788899', salary: 5000, dailyRate: 170, joinDate: '2023-11-10', status: 'على رأس العمل', role: 'labor', projectId: null },
  { id: 22, name: 'عمر حداد', phone: '0569990000', profession: 'حداد أبواب وشبابيك', nationality: 'مصري', idNumber: '2188899900', salary: 4500, dailyRate: 150, joinDate: '2023-11-15', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 23, name: 'طارق نظافة', phone: '0571112222', profession: 'عامل نظافة موقع', nationality: 'بنغلاديشي', idNumber: '2199900011', salary: 2000, dailyRate: 70, joinDate: '2023-11-20', status: 'على رأس العمل', role: 'labor', projectId: 1 },
  { id: 24, name: 'سعد السائق', phone: '0572223333', profession: 'سائق معدات ثقيلة', nationality: 'سعودي', idNumber: '1199900022', salary: 7000, dailyRate: 230, joinDate: '2023-12-01', status: 'على رأس العمل', role: 'labor', projectId: null },
  { id: 25, name: 'أبو شجاع', phone: '0573334444', profession: 'حارس موقع', nationality: 'سوداني', idNumber: '2200011122', salary: 2500, dailyRate: 85, joinDate: '2023-12-05', status: 'على رأس العمل', role: 'labor', projectId: 1 }
];

export const mockEquipment = [
  { id: 1, name: 'حفارة (بوكلين)', type: 'ثقيل', serialNumber: 'EXC-100', status: 'في الموقع', dailyCost: 1200, monthlyCost: 30000, lastMaintenance: '2023-11-01', projectId: 1 },
  { id: 2, name: 'شيول (Loader)', type: 'ثقيل', serialNumber: 'LDR-200', status: 'متوفر', dailyCost: 1000, monthlyCost: 25000, lastMaintenance: '2023-12-05', projectId: null },
  { id: 3, name: 'بوبكات (Bobcat)', type: 'متوسط', serialNumber: 'BOB-300', status: 'في الموقع', dailyCost: 500, monthlyCost: 12000, lastMaintenance: '2023-10-15', projectId: 2 },
  { id: 4, name: 'كرين (رافعة) 50 طن', type: 'ثقيل', serialNumber: 'CRN-400', status: 'صيانة', dailyCost: 2000, monthlyCost: 50000, lastMaintenance: '2023-12-01', projectId: null },
  { id: 5, name: 'رافعة شوكية تويوتا', type: 'متوسط', serialNumber: 'FG-500', status: 'متوفر', dailyCost: 300, monthlyCost: 7500, lastMaintenance: '2023-11-20', projectId: null },
  { id: 6, name: 'خلاطة أسمنت مركزية', type: 'ثقيل', serialNumber: 'MIX-600', status: 'في الموقع', dailyCost: 800, monthlyCost: 20000, lastMaintenance: '2023-12-05', projectId: 1 },
  { id: 7, name: 'مضخة خرسانة (بامب)', type: 'ثقيل', serialNumber: 'PMP-700', status: 'متوفر', dailyCost: 1500, monthlyCost: 35000, lastMaintenance: '2023-11-10', projectId: null },
  { id: 8, name: 'رصاصة (دكاكة) للردم', type: 'ثقيل', serialNumber: 'CMP-800', status: 'في الموقع', dailyCost: 900, monthlyCost: 22000, lastMaintenance: '2023-10-25', projectId: 1 },
  { id: 9, name: 'ماطور هواء (كمبريسور)', type: 'خفيف', serialNumber: 'AIR-900', status: 'متوفر', dailyCost: 150, monthlyCost: 3500, lastMaintenance: '2023-12-08', projectId: null },
  { id: 10, name: 'مولد كهربائي 100KVA', type: 'متوسط', serialNumber: 'GEN-1000', status: 'في الموقع', dailyCost: 400, monthlyCost: 10000, lastMaintenance: '2023-11-30', projectId: 2 },
  { id: 11, name: 'سقالات معدنية (مجموعة)', type: 'أصول', serialNumber: 'SCAF-1100', status: 'في الموقع', dailyCost: 100, monthlyCost: 2500, lastMaintenance: '2023-01-01', projectId: 1 },
  { id: 12, name: 'سيارة نقل (دينا)', type: 'مركبات', serialNumber: 'TRK-1200', status: 'متوفر', dailyCost: 350, monthlyCost: 8000, lastMaintenance: '2023-12-10', projectId: null }
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
