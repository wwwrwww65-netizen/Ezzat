import { app, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ==========================================
// قاعدة البيانات - sql.js (WebAssembly)
// ==========================================
let db = null;
const dbPath = path.join(app.getPath('userData'), 'construction_erp.db');

const saveDb = () => {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
};

const initDatabase = async () => {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    db = new SQL.Database();
  }

  // ==========================================
  // إنشاء الجداول (CREATE TABLE IF NOT EXISTS)
  // ==========================================

  // المشاريع
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT NOT NULL,
    project_number TEXT,
    client_id      INTEGER,
    client_name    TEXT,
    type           TEXT DEFAULT 'فيلا',
    location       TEXT,
    city           TEXT DEFAULT 'الرياض',
    budget         REAL DEFAULT 0,
    contract_value REAL DEFAULT 0,
    start_date     DATE,
    end_date       DATE,
    status         TEXT DEFAULT 'نشط',
    description    TEXT,
    progress       INTEGER DEFAULT 0,
    actual_cost    REAL DEFAULT 0,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ملفات المشاريع
  db.run(`CREATE TABLE IF NOT EXISTS project_files (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    name       TEXT NOT NULL,
    type       TEXT NOT NULL,
    size       TEXT,
    uploader   TEXT,
    file_path  TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  // بنود الكميات (BOQ)
  db.run(`CREATE TABLE IF NOT EXISTS boq_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER,
    description TEXT NOT NULL,
    unit        TEXT NOT NULL,
    qty         REAL DEFAULT 0,
    est_rate    REAL DEFAULT 0,
    act_rate    REAL DEFAULT 0,
    is_header   BOOLEAN DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  // اليوميات الميدانية
  db.run(`CREATE TABLE IF NOT EXISTS daily_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    log_date   DATE,
    weather    TEXT,
    temp       TEXT,
    workers    INTEGER DEFAULT 0,
    equipment  INTEGER DEFAULT 0,
    progress   TEXT,
    status     TEXT DEFAULT 'قيد الاعتماد',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  // المهام
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    project_id  INTEGER,
    assigned_to INTEGER,
    start_date  DATE,
    end_date    DATE,
    priority    TEXT DEFAULT 'متوسطة',
    status      TEXT DEFAULT 'لم تبدأ',
    progress    INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  // الطلبات والموافقات
  db.run(`CREATE TABLE IF NOT EXISTS requests (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    req_type   TEXT,
    applicant  TEXT,
    project_id INTEGER,
    req_date   DATE,
    status     TEXT DEFAULT 'قيد الانتظار',
    amount     TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  // المخططات
  db.run(`CREATE TABLE IF NOT EXISTS blueprints (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id   INTEGER,
    file_path    TEXT,
    scale_factor REAL DEFAULT 100,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  // مركز المستندات
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT,
    type         TEXT,
    size         TEXT,
    date         DATE,
    folder       TEXT,
    project      TEXT,
    uploader     TEXT
  )`);

  // الحصر الرقمي
  db.run(`CREATE TABLE IF NOT EXISTS takeoff_measurements (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id     INTEGER,
    element_name   TEXT,
    geometry_type  TEXT,
    raw_value      REAL,
    unit           TEXT,
    estimated_cost REAL,
    estimated_days REAL,
    category       TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  // فئات المواد
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    code        TEXT,
    description TEXT,
    color       TEXT,
    status      TEXT DEFAULT 'نشط'
  )`);

  // كتالوج المواد
  db.run(`CREATE TABLE IF NOT EXISTS materials_catalog (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    category_id   INTEGER,
    unit          TEXT,
    buy_price     REAL DEFAULT 0,
    sell_price    REAL DEFAULT 0,
    waste_factor  REAL DEFAULT 0,
    status        TEXT DEFAULT 'نشط',
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
  )`);

  // كتالوج العمالة
  db.run(`CREATE TABLE IF NOT EXISTS labor_catalog (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_type        TEXT,
    daily_rate       REAL,
    daily_production REAL
  )`);

  // أسطول المعدات والآليات
  db.run(`CREATE TABLE IF NOT EXISTS equipment (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT NOT NULL,
    type             TEXT,
    serial_number    TEXT,
    daily_cost       REAL DEFAULT 0,
    monthly_cost     REAL DEFAULT 0,
    last_maintenance DATE,
    status           TEXT DEFAULT 'متوفر',
    project_id       INTEGER,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`);

  // الموردون ومقاولو الباطن
  db.run(`CREATE TABLE IF NOT EXISTS suppliers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    category     TEXT,
    contact_name TEXT,
    phone        TEXT,
    email        TEXT,
    city         TEXT,
    status       TEXT DEFAULT 'نشط',
    contact_info TEXT,
    balance      REAL DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // أوامر الشراء
  db.run(`CREATE TABLE IF NOT EXISTS purchases (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id     INTEGER,
    invoice_number  TEXT,
    total_amount    REAL,
    paid_amount     REAL DEFAULT 0,
    delivery_status TEXT DEFAULT 'pending',
    purchase_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_date   DATETIME,
    received_at     DATETIME,
    notes           TEXT,
    FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
  )`);

  // بنود الشراء
  db.run(`CREATE TABLE IF NOT EXISTS purchase_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER,
    material_id INTEGER,
    quantity    REAL,
    unit_price  REAL,
    total       REAL,
    FOREIGN KEY(purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY(material_id) REFERENCES materials_catalog(id)
  )`);

  // المخزون
  db.run(`CREATE TABLE IF NOT EXISTS inventory_stock (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id    INTEGER,
    warehouse_name TEXT,
    quantity       REAL DEFAULT 0,
    last_updated   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(material_id) REFERENCES materials_catalog(id)
  )`);

  // الموظفون والعمال
  db.run(`CREATE TABLE IF NOT EXISTS staff (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    phone        TEXT,
    profession   TEXT,
    nationality  TEXT,
    id_number    TEXT,
    salary       REAL DEFAULT 0,
    daily_rate   REAL DEFAULT 0,
    join_date    DATE,
    status       TEXT DEFAULT 'على رأس العمل',
    role         TEXT,
    project_id   INTEGER,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`);

  // السلف
  db.run(`CREATE TABLE IF NOT EXISTS staff_advances (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER,
    amount   REAL,
    reason   TEXT,
    date     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(staff_id) REFERENCES staff(id)
  )`);

  // الحضور والانصراف
  db.run(`CREATE TABLE IF NOT EXISTS staff_attendance (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id   INTEGER,
    date       TEXT,
    time       TEXT,
    status     TEXT,
    created_by TEXT DEFAULT 'مدير النظام'
  )`);

  // المصروفات
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id   INTEGER,
    category     TEXT,
    amount       REAL,
    description  TEXT,
    expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // دفتر اليومية المحاسبي
  db.run(`CREATE TABLE IF NOT EXISTS accounting_journal (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    account_code TEXT,
    debit        REAL DEFAULT 0,
    credit       REAL DEFAULT 0,
    description  TEXT,
    entry_date   DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // المستخدمون
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT 'user',
    name       TEXT DEFAULT '',
    email      TEXT,
    phone      TEXT,
    status     TEXT DEFAULT 'نشط',
    staff_id   INTEGER,
    client_id  INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // العملاء
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT NOT NULL,
    phone          TEXT,
    mobile         TEXT,
    email          TEXT,
    address        TEXT,
    city           TEXT,
    country        TEXT,
    type           TEXT,
    idNumber       TEXT,
    workPlace      TEXT,
    notes          TEXT,
    status         TEXT DEFAULT 'نشط',
    creditLimit    REAL DEFAULT 0,
    currentBalance REAL DEFAULT 0,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // الإعدادات
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  )`);

  // الفواتير
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id          TEXT PRIMARY KEY,
    client_id   INTEGER,
    client_name TEXT,
    project_id  INTEGER,
    date        DATE,
    amount      REAL,
    tax         REAL,
    total       REAL,
    paid_amount REAL,
    status      TEXT,
    notes       TEXT
  )`);

  // الإيرادات
  db.run(`CREATE TABLE IF NOT EXISTS income (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    title   TEXT,
    method  TEXT,
    date    DATE,
    amount  REAL,
    status  TEXT
  )`);

  // الدفعات
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id             TEXT PRIMARY KEY,
    entity_type    TEXT,
    entity_id      INTEGER,
    project_id     INTEGER,
    amount         REAL,
    date           DATE,
    payment_method TEXT,
    reference      TEXT,
    status         TEXT,
    notes          TEXT
  )`);

  // السندات
  db.run(`CREATE TABLE IF NOT EXISTS bonds (
    id             TEXT PRIMARY KEY,
    type           TEXT,
    entity_name    TEXT,
    amount         REAL,
    date           DATE,
    payment_method TEXT,
    project        TEXT,
    account        TEXT,
    status         TEXT,
    notes          TEXT
  )`);

  // المهام
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT,
    project_id  INTEGER,
    assigned_to INTEGER,
    due_date    DATE,
    priority    TEXT,
    status      TEXT
  )`);

  // الإشعارات
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    title   TEXT,
    message TEXT,
    time    TEXT,
    read    BOOLEAN,
    type    TEXT
  )`);

  // سجل النشاط
  db.run(`CREATE TABLE IF NOT EXISTS activity_log (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    user   TEXT,
    action TEXT,
    time   TEXT,
    ip     TEXT
  )`);

  // التقييمات (المستخلصات)
  db.run(`CREATE TABLE IF NOT EXISTS valuations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER,
    title       TEXT,
    amount      REAL,
    date        DATE,
    status      TEXT
  )`);


  // قواعد الجزاءات
  db.run(`CREATE TABLE IF NOT EXISTS penalty_rules (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    type      TEXT NOT NULL DEFAULT 'custom',
    reason    TEXT NOT NULL,
    amount    REAL NOT NULL DEFAULT 0,
    is_system INTEGER NOT NULL DEFAULT 0
  )`);

  // أدوار الوظائف
  db.run(`CREATE TABLE IF NOT EXISTS job_roles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT DEFAULT '{}',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ==========================================
  // Migrations - إضافة أعمدة ناقصة لجداول قديمة
  // ==========================================
  const migrate = (sql) => { try { db.run(sql); } catch(e) {} };

  migrate("ALTER TABLE projects ADD COLUMN project_number TEXT");
  migrate("ALTER TABLE projects ADD COLUMN client_id INTEGER");
  migrate("ALTER TABLE projects ADD COLUMN client_name TEXT");
  migrate("ALTER TABLE projects ADD COLUMN type TEXT DEFAULT 'فيلا'");
  migrate("ALTER TABLE projects ADD COLUMN location TEXT");
  migrate("ALTER TABLE projects ADD COLUMN city TEXT DEFAULT 'الرياض'");
  migrate("ALTER TABLE projects ADD COLUMN contract_value REAL DEFAULT 0");
  migrate("ALTER TABLE projects ADD COLUMN start_date DATE");
  migrate("ALTER TABLE projects ADD COLUMN end_date DATE");
  migrate("ALTER TABLE projects ADD COLUMN description TEXT");
  migrate("ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0");
  migrate("ALTER TABLE projects ADD COLUMN actual_cost REAL DEFAULT 0");
  migrate("ALTER TABLE users ADD COLUMN name TEXT DEFAULT ''");
  migrate("ALTER TABLE users ADD COLUMN email TEXT");
  migrate("ALTER TABLE users ADD COLUMN phone TEXT");
  migrate("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'نشط'");
  migrate("ALTER TABLE users ADD COLUMN staff_id INTEGER");
  migrate("ALTER TABLE users ADD COLUMN client_id INTEGER");
  migrate("ALTER TABLE staff ADD COLUMN basic_salary REAL DEFAULT 0");
  migrate("ALTER TABLE penalty_rules ADD COLUMN type TEXT DEFAULT 'custom'");
  migrate("ALTER TABLE penalty_rules ADD COLUMN amount REAL DEFAULT 0");
  migrate("ALTER TABLE penalty_rules ADD COLUMN is_system INTEGER DEFAULT 0");
  migrate("ALTER TABLE purchases ADD COLUMN delivery_status TEXT DEFAULT 'pending'");
  migrate("ALTER TABLE purchases ADD COLUMN delivery_date DATETIME");
  migrate("ALTER TABLE purchases ADD COLUMN received_at DATETIME");
  migrate("ALTER TABLE purchases ADD COLUMN notes TEXT");
  migrate("ALTER TABLE materials_catalog ADD COLUMN cost_per_unit REAL DEFAULT 0");
  migrate("ALTER TABLE materials_catalog ADD COLUMN waste_factor REAL DEFAULT 0");
  migrate("ALTER TABLE suppliers ADD COLUMN phone TEXT");
  migrate("ALTER TABLE suppliers ADD COLUMN balance REAL DEFAULT 0");

  // Fix NULL values after migrations
  db.run("UPDATE penalty_rules SET type='custom' WHERE type IS NULL");
  db.run("UPDATE penalty_rules SET amount=0 WHERE amount IS NULL");
  db.run("UPDATE penalty_rules SET is_system=0 WHERE is_system IS NULL");

  // ==========================================
  // Seed Data - البيانات الأساسية الافتراضية
  // ==========================================
  const count = (table) => {
    try {
      const s = db.prepare(`SELECT COUNT(*) as c FROM ${table}`);
      s.step(); const r = s.getAsObject(); s.free();
      return Number(r.c || 0);
    } catch(e) { return 0; }
  };

  if (count('invoices') === 0) {
    const mockInvoices = [
      ['INV-2023-001', 1, 'أحمد السديري', 1, '2023-12-01', 15000, 2250, 17250, 17250, 'مدفوعة', 'دفعة أعمال الحفر'],
      ['INV-2023-002', 2, 'شركة الراجحي', 2, '2023-12-05', 45000, 6750, 51750, 0, 'معلقة', 'مستخلص مرحلة التأسيس']
    ];
    mockInvoices.forEach(i => db.run("INSERT INTO invoices (id, client_id, client_name, project_id, date, amount, tax, total, paid_amount, status, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)", i));
  }

  if (count('income') === 0) {
    db.run("INSERT INTO income (title, method, date, amount, status) VALUES ('دفعة أولى - فيلا النرجس', 'تحويل بنكي', '2023-12-05', 50000, 'مؤكد')");
  }

  if (count('payments') === 0) {
    db.run("INSERT INTO payments (id, entity_type, entity_id, project_id, amount, date, payment_method, reference, status, notes) VALUES ('PAY-001', 'client', 1, 1, 17250, '2023-12-02', 'تحويل بنكي', 'TRX9988', 'مؤكد', 'سداد فاتورة INV-001')");
  }

  if (count('bonds') === 0) {
    db.run("INSERT INTO bonds (id, type, entity_name, amount, date, payment_method, project, account, status, notes) VALUES ('BND-001', 'قبض', 'أحمد السديري', 50000, '2023-12-05', 'شيك', 'فيلا حي النرجس', 'البنك الأهلي', 'معتمد', 'دفعة مقدمة')");
  }

  if (count('tasks') === 0) {
    const mockTasks = [
      ['مراجعة مخططات السباكة', 1, 1, '2023-12-15', 'عالية', 'قيد التنفيذ'],
      ['طلب عرض سعر حديد', 2, 2, '2023-12-12', 'متوسطة', 'لم تبدأ']
    ];
    mockTasks.forEach(t => db.run("INSERT INTO tasks (title, project_id, assigned_to, due_date, priority, status) VALUES (?,?,?,?,?,?)", t));
  }

  if (count('notifications') === 0) {
    const mockNotes = [
      ['تنبيه مخزون', 'نقص في كمية الأسمنت البورتلاندي', 'منذ ساعة', 0, 'warning'],
      ['موعد تسليم', 'غداً موعد تسليم مرحلة العظم لفيلا النرجس', 'منذ ساعتين', 1, 'info']
    ];
    mockNotes.forEach(n => db.run("INSERT INTO notifications (title, message, time, read, type) VALUES (?,?,?,?,?)", n));
  }

  if (count('activity_log') === 0) {
    const mockLog = [
      ['أحمد محمد', 'تسجيل دخول للنظام', '2023-12-10 09:00', '192.168.1.1'],
      ['سارة خالد', 'إصدار فاتورة جديدة #INV-2023-002', '2023-12-10 10:30', '192.168.1.5']
    ];
    mockLog.forEach(l => db.run("INSERT INTO activity_log (user, action, time, ip) VALUES (?,?,?,?)", l));
  }

  if (count('documents') === 0) {
    const mockDocs = [
      ['عقد مشروع فيلا النرجس', 'pdf', '2.5 MB', '2023-10-01', 'العقود والاتفاقيات', 'فيلا حي النرجس', 'مدير النظام'],
      ['المخطط الإنشائي المعتمد', 'image', '15 MB', '2023-09-25', 'المخططات الهندسية', 'فيلا حي النرجس', 'المهندس'],
      ['مستخلص رقم 1', 'excel', '1 MB', '2023-11-01', 'الفواتير والمستخلصات', 'برج طريق الملك', 'محاسب']
    ];
    mockDocs.forEach(d => db.run("INSERT INTO documents (name, type, size, date, folder, project, uploader) VALUES (?,?,?,?,?,?,?)", d));
  }

  // مستخدم افتراضي
  if (count('users') === 0) {
    db.run("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)", ['admin', 'admin123', 'admin', 'مدير النظام']);
  }

  // أدوار الوظائف الافتراضية
  if (count('job_roles') === 0) {
    const roles = [
      ['مدير النظام',       '{"all":true}',                     'صلاحية كاملة على جميع أجزاء النظام'],
      ['محاسب',             '{"finance":true,"reports":true}',  'إدارة المالية والتقارير'],
      ['مهندس',             '{"projects":true,"boq":true}',     'إدارة المشاريع والجداول'],
      ['مشرف',              '{"projects":true}',                'متابعة المشاريع ميدانياً'],
      ['مدير موارد بشرية',  '{"hr":true}',                      'إدارة شؤون الموظفين'],
      ['عامل',              '{}',                               'صلاحيات محدودة'],
      ['عميل',              '{}',                               'دخول لوحة العميل فقط'],
    ];
    for (const [name, permissions, description] of roles) {
      db.run("INSERT OR IGNORE INTO job_roles (name, permissions, description) VALUES (?,?,?)", [name, permissions, description]);
    }
  }

  // قواعد الجزاءات الافتراضية
  if (count('penalty_rules') === 0) {
    const rules = [
      ['absence', 'غياب بدون عذر',      0, 1],
      ['delay',   'تأخير عن الدوام',    0, 1],
      ['misc',    'إهمال أو تلف أدوات', 0, 1],
    ];
    for (const [type, reason, amount, is_system] of rules) {
      db.run("INSERT INTO penalty_rules (type, reason, amount, is_system) VALUES (?,?,?,?)", [type, reason, amount, is_system]);
    }
  }

  // فئات المواد (Seed)
  if (count('categories') === 0) {
    const cats = [
      ['الأسمنت', 'CEM', 'جميع أنواع الأسمنت والبورتلاندي', '#1e3a8a'],
      ['البلك', 'BLK', 'بلك أسمني، بركاني، معزول', '#3b82f6'],
      ['الحديد', 'STEL', 'حديد تسليح بمختلف المقاسات', '#ef4444'],
      ['الكهرباء', 'ELEC', 'أسلاك، أفياش، طبلونات', '#f59e0b'],
      ['الحفر والأساسات', 'EXC', 'أعمال الدفان والحفر والعزل', '#8b4513'],
      ['العظم والخرسانة', 'CONC', 'الخرسانة الجاهزة والرمل والكنكري', '#64748b'],
      ['التشطيبات والأرضيات', 'FIN', 'البلاط، الدهانات، والأسقف', '#10b981'],
      ['السباكة', 'PLUM', 'الأنابيب والمواسير والأطقم', '#0ea5e9'],
      ['الأبواب والنوافذ', 'DOOR', 'الأبواب الخشبية وشتر الألمنيوم', '#8b5cf6'],
      ['الأعمال التشغيلية', 'OPS', 'أعمال الحفر، النقل، والخدمات', '#f59e0b']
    ];
    cats.forEach(c => db.run("INSERT INTO categories (name, code, description, color) VALUES (?,?,?,?)", c));
  }

  // مواد البناء (Seed from Mock Data)
  if (count('materials_catalog') === 0) {
    const materials = [
      ['أسمنت بورتلاندي عادي', 1, 'كيس', 15, 18], ['أسمنت مقاوم للأملاح', 1, 'كيس', 16, 19], ['أسمنت أبيض', 1, 'كيس', 25, 30],
      ['بلك أسمنتي مصمت', 2, 'حبة', 2, 2.5], ['بلك أسمنتي مفرغ 20', 2, 'حبة', 1.8, 2.2], ['بلك بركاني عازل', 2, 'حبة', 3.5, 4.5],
      ['حديد تسليح 8 ملم', 3, 'طن', 2700, 3100], ['حديد تسليح 14 ملم - الراجحي', 3, 'طن', 2800, 3200], ['سلك رباط', 3, 'لفة', 50, 65],
      ['أسلاك كهرباء 4 ملم الفنار', 4, 'لفة', 110, 135], ['طبلون كهرباء رئيسي', 4, 'حبة', 350, 450], ['لمبات ليد سبوت لايت', 4, 'حبة', 12, 18],
      ['صبة نظافة', 5, 'م3', 200, 230], ['عزل مائي رولات بيتومين', 5, 'م2', 18, 25],
      ['خرسانة جاهزة عيار 350', 6, 'م3', 230, 260], ['رمل أبيض / نيسة', 6, 'قلاب', 300, 400], ['أخشاب نجارة للشدات', 6, 'م3', 1200, 1500],
      ['سيراميك أرضيات 60x60', 7, 'م2', 35, 45], ['رخام طبيعي روزا', 7, 'م2', 150, 220], ['دهانات جوتن نصف لمعة', 7, 'برميل', 120, 150],
      ['مواسير تغذية حرارية PPR 3/4', 8, 'حبة', 25, 35], ['أكواع وتوصيلات PPR', 8, 'حبة', 5, 8], ['كراسي إفرنجي معلق', 8, 'حبة', 650, 900],
      ['أبواب خشب سنديان غرف', 9, 'حبة', 800, 1200], ['نوافذ ألمنيوم دبل جلاس', 9, 'م2', 350, 480],
      ['حفر وترحيل أساسات', 10, 'م3', 15, 25], ['نقل مخلفات بناء', 10, 'رد', 150, 200]
    ];
    materials.forEach(m => db.run("INSERT INTO materials_catalog (name, category_id, unit, buy_price, sell_price) VALUES (?,?,?,?,?)", m));
  }

  // عمالة
  db.run("DELETE FROM labor_catalog");
  [['طاقم بناء بلك', 600, 150], ['طاقم لياسة', 800, 100], ['طاقم حدادة ونجارة', 1500, 5], ['مبلط', 200, 30]].forEach(l => {
    db.run("INSERT INTO labor_catalog (crew_type, daily_rate, daily_production) VALUES (?, ?, ?)", l);
  });

  // الموظفون والعمال (Seed)
  if (count('staff') === 0) {
    const mockEmployees = [
      ['محمد علي', '0501112223', 'مهندس مدني', 'سعودي', '1088877766', 12000, 400, '2020-01-15', 'على رأس العمل', 'engineer', 1],
      ['سارة خالد', '0502223334', 'محاسبة', 'سعودية', '1077766655', 9000, 300, '2021-03-10', 'على رأس العمل', 'accountant', null],
      ['خالد إبراهيم', '0503334445', 'مهندس موقع', 'سعودي', '1066655544', 10000, 333, '2022-05-20', 'على رأس العمل', 'supervisor', 1],
      ['عبدالرحمن معلم', '0551112222', 'بناء بلك', 'مصري', '2011122233', 4500, 150, '2023-01-10', 'على رأس العمل', 'labor', 1],
      ['أحمد النجار', '0552223333', 'نجار مسلح', 'مصري', '2022233344', 5000, 160, '2022-11-05', 'على رأس العمل', 'labor', 1],
      ['سيد محمود', '0553334444', 'حداد مسلح', 'مصري', '2033344455', 5000, 160, '2022-12-15', 'على رأس العمل', 'labor', 1],
      ['رفيق أحمد', '0554445555', 'مبلط سيراميك ورخام', 'هندي', '2044455566', 4000, 130, '2023-02-20', 'على رأس العمل', 'labor', null],
      ['علي مليس', '0557778888', 'معلم لياسة', 'يمني', '2077788899', 4200, 140, '2023-05-15', 'مجاز', 'labor', null],
      ['فاروق الدهان', '0558889999', 'دهان وصباغ', 'هندي', '2088899900', 3900, 130, '2023-06-01', 'على رأس العمل', 'labor', 1],
      ['سعد السائق', '0572223333', 'سائق معدات ثقيلة', 'سعودي', '1199900022', 7000, 230, '2023-12-01', 'على رأس العمل', 'labor', null]
    ];
    mockEmployees.forEach(e => {
      db.run("INSERT INTO staff (name, phone, profession, nationality, id_number, salary, daily_rate, join_date, status, role, project_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)", e);
    });
  }

  // معدات الأسطول
  if (count('equipment') === 0) {
    const mockEquipment = [
      ['حفارة (بوكلين)', 'ثقيل', 'EXC-100', 'في الموقع', 1200, 30000, '2023-11-01', 1],
      ['شيول (Loader)', 'ثقيل', 'LDR-200', 'متوفر', 1000, 25000, '2023-12-05', null],
      ['بوبكات (Bobcat)', 'متوسط', 'BOB-300', 'في الموقع', 500, 12000, '2023-10-15', 2],
      ['كرين (رافعة) 50 طن', 'ثقيل', 'CRN-400', 'صيانة', 2000, 50000, '2023-12-01', null],
      ['رافعة شوكية تويوتا', 'متوسط', 'FG-500', 'متوفر', 300, 7500, '2023-11-20', null],
      ['خلاطة أسمنت مركزية', 'ثقيل', 'MIX-600', 'في الموقع', 800, 20000, '2023-12-05', 1],
      ['مضخة خرسانة (بامب)', 'ثقيل', 'PMP-700', 'متوفر', 1500, 35000, '2023-11-10', null],
      ['رصاصة (دكاكة) للردم', 'ثقيل', 'CMP-800', 'في الموقع', 900, 22000, '2023-10-25', 1],
      ['ماطور هواء (كمبريسور)', 'خفيف', 'AIR-900', 'متوفر', 150, 3500, '2023-12-08', null],
      ['مولد كهربائي 100KVA', 'متوسط', 'GEN-1000', 'في الموقع', 400, 10000, '2023-11-30', 2],
      ['سقالات معدنية (مجموعة)', 'أصول', 'SCAF-1100', 'في الموقع', 100, 2500, '2023-01-01', 1],
      ['سيارة نقل (دينا)', 'مركبات', 'TRK-1200', 'متوفر', 350, 8000, '2023-12-10', null]
    ];
    mockEquipment.forEach(e => {
      db.run("INSERT INTO equipment (name, type, serial_number, status, daily_cost, monthly_cost, last_maintenance, project_id) VALUES (?,?,?,?,?,?,?,?)", e);
    });
  }

  // الموردون (Seed)
  if (count('suppliers') === 0) {
    const mockSuppliers = [
      ['مصنع الشرق للرخام والخرسانة', 'رخام وخرسانة', 'عبدالله العتيبي', '0544444444', 'info@sharq.com', 'الرياض', 'نشط', 0],
      ['شركة الحديد والصلب الوطنية', 'حديد تسليح', 'فهد المصري', '0566666666', 'sales@nsc.com', 'جدة', 'نشط', 0],
      ['مؤسسة البناء الحديث', 'مقاول باطن', 'سعد الشمري', '0555555555', 'benaa@modern.com', 'الدمام', 'نشط', 0],
      ['شركة الكهرباء الذكية', 'مقاول باطن', 'وليد حسن', '0599999999', 'smart@electric.com', 'الرياض', 'نشط', 0]
    ];
    mockSuppliers.forEach(s => {
      db.run("INSERT INTO suppliers (name, category, contact_name, phone, email, city, status, balance) VALUES (?,?,?,?,?,?,?,?)", s);
    });
  }

  

  

  saveDb();
  console.log('✅ قاعدة البيانات جاهزة:', dbPath);
};

// ==========================================
// دوال مساعدة للتعامل مع قاعدة البيانات
// ==========================================
const queryDb = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    if (params && params.length > 0) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch (err) {
    console.error('DB Query Error:', sql, err.message);
    return [];
  }
};

const executeDb = (sql, params = []) => {
  try {
    db.run(sql, params);
    saveDb();
    return { success: true };
  } catch (err) {
    console.error('DB Execute Error:', sql, err.message);
    throw err;
  }
};

// ==========================================
// إنشاء نافذة التطبيق
// ==========================================
function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.once('ready-to-show', () => win.show());

  // Add context menu (Right-click menu for Copy/Paste)
  win.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

    if (params.isEditable) {
      menu.append(new MenuItem({ label: 'قص (Cut)', role: 'cut' }));
      menu.append(new MenuItem({ label: 'نسخ (Copy)', role: 'copy' }));
      menu.append(new MenuItem({ label: 'لصق (Paste)', role: 'paste' }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ label: 'تحديد الكل (Select All)', role: 'selectAll' }));
    } else if (params.selectionText) {
      menu.append(new MenuItem({ label: 'نسخ (Copy)', role: 'copy' }));
    }

    if (menu.items.length > 0) {
      menu.popup({ window: win, x: params.x, y: params.y });
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// ==========================================
// تشغيل التطبيق
// ==========================================
app.whenReady().then(async () => {
  await initDatabase();

  // مسح الـ Service Workers والـ Cache القديمة التي تسبب مشكلة العرض
  const { session } = await import('electron');
  try {
    await session.defaultSession.clearStorageData({
      storages: ['serviceworkers', 'cachestorage', 'cookies']
    });
    console.log('✅ تم مسح Service Workers القديمة');
  } catch(e) {
    console.warn('تحذير مسح الـ session:', e.message);
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ==========================================
// IPC Handlers
// ==========================================
ipcMain.handle('db:query',   (event, sql, params) => queryDb(sql,   params || []));
ipcMain.handle('db:execute', (event, sql, params) => executeDb(sql, params || []));
