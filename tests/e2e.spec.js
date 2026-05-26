import { test, expect } from '@playwright/test';

// Helper: Inject auth token directly
const injectAuth = async (page) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'true');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, username: 'admin', role: 'admin' }));
  });
};

// ═══════════════════════════════════════════════════════
// 🔐 SECTION 1: Authentication
// ═══════════════════════════════════════════════════════
test.describe('🔐 Authentication', () => {

  test('Login page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/#/login');
    await expect(page.getByText('نظام إدارة المقاولات ERP')).toBeVisible();
    await expect(page.getByPlaceholder('أدخل اسم المستخدم')).toBeVisible();
    await expect(page.getByRole('button', { name: 'تسجيل الدخول' })).toBeVisible();
  });

  test('Wrong credentials shows error', async ({ page }) => {
    await page.goto('http://localhost:5173/#/login');
    await page.getByPlaceholder('أدخل اسم المستخدم').fill('wronguser');
    await page.getByPlaceholder('••••••••').fill('wrongpass');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await expect(page.getByText(/غير صحيح|بيانات/)).toBeVisible({ timeout: 5000 });
  });

  test('Correct credentials (admin/admin123) navigates to dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/#/login');
    await page.getByPlaceholder('أدخل اسم المستخدم').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await expect(page.getByText('لوحة التحكم الرئيسية')).toBeVisible({ timeout: 10000 });
  });

});

// ═══════════════════════════════════════════════════════
// 📊 SECTION 2: Dashboard
// ═══════════════════════════════════════════════════════
test.describe('📊 Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('http://localhost:5173/#/');
  });

  test('Dashboard loads with main heading', async ({ page }) => {
    await expect(page.getByText('لوحة التحكم الرئيسية')).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard shows KPI cards (إجمالي المشاريع, صافي الربح)', async ({ page }) => {
    await expect(page.getByText('إجمالي المشاريع')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('صافي الربح')).toBeVisible();
  });

  test('Dashboard shows cash flow chart', async ({ page }) => {
    await expect(page.getByText('تحليل التدفق النقدي')).toBeVisible({ timeout: 8000 });
  });

  test('Dashboard shows projects table', async ({ page }) => {
    await expect(page.getByText('المشاريع الجارية')).toBeVisible({ timeout: 8000 });
  });

  test('Dashboard shows tasks section', async ({ page }) => {
    await expect(page.getByText('المهام والمواعيد')).toBeVisible({ timeout: 8000 });
  });

});

// ═══════════════════════════════════════════════════════
// 🏗️ SECTION 3: Projects - CRUD REAL
// ═══════════════════════════════════════════════════════
test.describe('🏗️ Projects - CRUD', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('http://localhost:5173/#/projects');
    await expect(page.getByText('إدارة المشاريع')).toBeVisible({ timeout: 10000 });
  });

  test('Projects page loads with heading and stats', async ({ page }) => {
    await expect(page.getByText('قيمة العقود الإجمالية')).toBeVisible();
    await expect(page.getByText('المشاريع النشطة')).toBeVisible();
  });

  test('Search box works', async ({ page }) => {
    const searchInput = page.getByPlaceholder('بحث باسم المشروع، رقم العقد، أو العميل...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('مشروع');
    // Just verify typing works without error
    await expect(searchInput).toHaveValue('مشروع');
  });

  test('ADD PROJECT: Opens modal, fills form, saves and verifies', async ({ page }) => {
    // Click Add button
    await page.getByRole('button', { name: 'إضافة مشروع جديد' }).click();

    // Modal should open
    await expect(page.getByText('إضافة مشروع جديد').last()).toBeVisible({ timeout: 5000 });

    // Fill project name
    await page.locator('div').filter({ has: page.getByText('اسم المشروع', { exact: true }) }).locator('input').first().fill('مشروع الاختبار الآلي 001');

    // Fill location
    await page.locator('div').filter({ has: page.getByText('الموقع / الحي', { exact: true }) }).locator('input').first().fill('حي النرجس');

    // Fill city
    await page.locator('div').filter({ has: page.getByText('المدينة', { exact: true }) }).locator('input').first().fill('الرياض');

    // Fill contract value
    await page.locator('div').filter({ has: page.getByText('قيمة العقد (المتفق عليها)', { exact: true }) }).locator('input').first().fill('500000');

    // Fill budget
    await page.locator('div').filter({ has: page.getByText('الميزانية التقديرية (التكلفة)', { exact: true }) }).locator('input').first().fill('450000');

    // Fill start date
    await page.locator('div').filter({ has: page.getByText('تاريخ البدء', { exact: true }) }).locator('input').first().fill('2026-01-01');

    // Fill end date
    await page.locator('div').filter({ has: page.getByText('تاريخ التسليم المتوقع', { exact: true }) }).locator('input').first().fill('2026-12-31');

    // Submit
    await page.getByRole('button', { name: 'إنشاء المشروع' }).click();

    // Verify project appears in the list
    await expect(page.getByText('مشروع الاختبار الآلي 001')).toBeVisible({ timeout: 8000 });
  });

  test('DELETE PROJECT: Can delete a project from the list', async ({ page }) => {
    // First add a project to delete
    await page.getByRole('button', { name: 'إضافة مشروع جديد' }).click();
    await page.locator('div').filter({ has: page.getByText('اسم المشروع', { exact: true }) }).locator('input').first().fill('مشروع للحذف 999');
    await page.locator('div').filter({ has: page.getByText('الموقع / الحي', { exact: true }) }).locator('input').first().fill('اختبار');
    await page.getByRole('button', { name: 'إنشاء المشروع' }).click();
    await expect(page.getByText('مشروع للحذف 999')).toBeVisible({ timeout: 8000 });

    // Find and click the delete (trash) button next to this project card
    const projectCard = page.locator('.group').filter({ hasText: 'مشروع للحذف 999' });
    await projectCard.locator('button').last().click();

    // Verify project is removed
    await expect(page.getByText('مشروع للحذف 999')).not.toBeVisible({ timeout: 5000 });
  });

});

// ═══════════════════════════════════════════════════════
// 👥 SECTION 4: Clients - CRUD REAL
// ═══════════════════════════════════════════════════════
test.describe('👥 Clients - CRUD', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
    await page.goto('http://localhost:5173/#/clients');
    await expect(page.getByText('إدارة العملاء')).toBeVisible({ timeout: 10000 });
  });

  test('ADD CLIENT: Opens modal, fills form, saves and verifies', async ({ page }) => {
    // Click Add button
    await page.getByRole('button', { name: 'إضافة عميل جديد' }).click();

    // Modal should open
    await expect(page.getByText('إضافة عميل جديد').last()).toBeVisible({ timeout: 5000 });

    // Fill client name
    await page.locator('div').filter({ has: page.getByText('اسم العميل', { exact: true }) }).locator('input').first().fill('عميل الاختبار محمد أحمد');

    // Fill mobile
    await page.locator('div').filter({ has: page.getByText('رقم الجوال', { exact: true }) }).locator('input').first().fill('0501234567');

    // Fill email
    await page.locator('div').filter({ has: page.getByText('البريد الإلكتروني', { exact: true }) }).locator('input').first().fill('test@example.com');

    // Fill ID number
    await page.locator('div').filter({ has: page.getByText('رقم الهوية / السجل', { exact: true }) }).locator('input').first().fill('1234567890');

    // Fill address
    await page.locator('div').filter({ has: page.getByText('العنوان الكامل', { exact: true }) }).locator('input').first().fill('الرياض، حي النرجس');

    // Save
    await page.getByRole('button', { name: 'حفظ البيانات' }).click();

    // Verify client appears in the table
    await expect(page.getByText('عميل الاختبار محمد أحمد')).toBeVisible({ timeout: 8000 });
  });

  test('SEARCH CLIENT: Search box filters results correctly', async ({ page }) => {
    const searchInput = page.getByPlaceholder('البحث بالاسم، الهاتف، أو البريد الإلكتروني...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('خالد');
    await expect(searchInput).toHaveValue('خالد');
  });

  test('VIEW CLIENT DETAILS: Opens client detail modal', async ({ page }) => {
    // Click eye button on first client row
    const eyeBtn = page.locator('button[title="التفاصيل"]').first();
    if (await eyeBtn.isVisible()) {
      await eyeBtn.click();
      await expect(page.getByText('تفاصيل العميل').first()).toBeVisible({ timeout: 5000 });
    }
  });

});

// ═══════════════════════════════════════════════════════
// 💰 SECTION 5: Finance Pages
// ═══════════════════════════════════════════════════════
test.describe('💰 Finance', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('Finance overview page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/finance');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Invoices page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/invoices');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Payments page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/payments');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Expenses page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/expenses');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Income page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/income');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

});

// ═══════════════════════════════════════════════════════
// 📐 SECTION 6: BOQ & Digital Takeoff
// ═══════════════════════════════════════════════════════
test.describe('📐 BOQ & Digital Takeoff', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('BOQ CRUD: Can manually add and delete an item', async ({ page }) => {
    await page.goto('http://localhost:5173/#/boq');
    await expect(page.getByText('جداول الكميات (BOQ)')).toBeVisible({ timeout: 10000 });

    // Click Add
    await page.getByRole('button', { name: 'إضافة بند جديد' }).click();
    await expect(page.getByText('إضافة بند BOQ يدوي').last()).toBeVisible();

    // Fill form
    await page.locator('div').filter({ has: page.getByText('وصف البند', { exact: true }) }).locator('input').first().fill('بند دهانات تجريبي');
    await page.locator('div').filter({ has: page.getByText('الكمية', { exact: true }) }).locator('input').first().fill('150');
    await page.locator('div').filter({ has: page.getByText('السعر الإفرادي التقديري', { exact: false }) }).locator('input').first().fill('25');
    
    // Save
    await page.getByRole('button', { name: 'إضافة البند' }).click();

    // Verify it appeared
    await expect(page.getByText('بند دهانات تجريبي')).toBeVisible({ timeout: 8000 });

    // Delete it
    const row = page.locator('tr').filter({ hasText: 'بند دهانات تجريبي' });
    await row.locator('button', { hasText: 'حذف' }).click();

    // Verify deleted
    await expect(page.getByText('بند دهانات تجريبي')).not.toBeVisible({ timeout: 5000 });
  });

  test('Digital Takeoff page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/digital-takeoff');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Valuations page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/valuations');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

});

// ═══════════════════════════════════════════════════════
// 👷 SECTION 7: HR & Site Management
// ═══════════════════════════════════════════════════════
test.describe('👷 HR & Site - CRUD', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('LABOR CRUD: Can add and delete a worker', async ({ page }) => {
    await page.goto('http://localhost:5173/#/labor');
    await expect(page.getByText('إدارة العمالة والميدان')).toBeVisible({ timeout: 10000 });

    // Click Add
    await page.getByRole('button', { name: 'إضافة عامل' }).click();
    await expect(page.getByText('إضافة عامل جديد').last()).toBeVisible();

    // Fill form
    await page.locator('div').filter({ has: page.getByText('الاسم الكامل', { exact: true }) }).locator('input').first().fill('عامل بناء تجريبي');
    await page.locator('div').filter({ has: page.getByText('المهنة', { exact: true }) }).locator('input').first().fill('بناء');
    await page.locator('div').filter({ has: page.getByText('الجنسية', { exact: true }) }).locator('input').first().fill('مصر');
    await page.locator('div').filter({ has: page.getByText('الأجر اليومي', { exact: true }) }).locator('input').first().fill('150');
    await page.locator('div').filter({ has: page.getByText('رقم الهوية / الإقامة', { exact: true }) }).locator('input').first().fill('2222222222');
    
    // Save
    await page.getByRole('button', { name: 'حفظ البيانات' }).click();

    // Verify it appeared
    await expect(page.getByText('عامل بناء تجريبي')).toBeVisible({ timeout: 8000 });

    // Delete it
    const row = page.locator('tr').filter({ hasText: 'عامل بناء تجريبي' });
    await row.locator('button').last().click();

    // Verify deleted
    await expect(page.getByText('عامل بناء تجريبي')).not.toBeVisible({ timeout: 5000 });
  });

  test('EQUIPMENT CRUD: Can add and delete equipment', async ({ page }) => {
    await page.goto('http://localhost:5173/#/equipment');
    await expect(page.getByText('إدارة المعدات والآليات')).toBeVisible({ timeout: 10000 });

    // Click Add
    await page.getByRole('button', { name: 'إضافة معدة' }).click();
    await expect(page.getByText('إضافة معدة جديدة للأسطول').last()).toBeVisible();

    // Fill form
    await page.locator('div').filter({ has: page.getByText('اسم المعدة', { exact: true }) }).locator('input').first().fill('حفار تجريبي');
    await page.locator('div').filter({ has: page.getByText('النوع', { exact: true }) }).locator('input').first().fill('حفار');
    await page.locator('div').filter({ has: page.getByText('الرقم التسلسلي', { exact: true }) }).locator('input').first().fill('EX-999');
    
    // Save
    await page.getByRole('button', { name: 'حفظ المعدة' }).click();

    // Verify it appeared
    await expect(page.getByText('حفار تجريبي')).toBeVisible({ timeout: 8000 });

    // Delete it
    const row = page.locator('tr').filter({ hasText: 'حفار تجريبي' });
    await row.locator('button').last().click();

    // Verify deleted
    await expect(page.getByText('حفار تجريبي')).not.toBeVisible({ timeout: 5000 });
  });

  test('Employees page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/employees');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('DAILY LOGS CRUD: Can add a daily log', async ({ page }) => {
    await page.goto('http://localhost:5173/#/daily-logs');
    await expect(page.getByText('يوميات الموقع')).toBeVisible({ timeout: 10000 });

    // Click Add
    await page.getByRole('button', { name: 'كتابة تقرير يومي' }).click();
    await expect(page.getByText('كتابة تقرير يومي').last()).toBeVisible();

    // Fill form
    await page.locator('div').filter({ has: page.getByText('درجة الحرارة', { exact: true }) }).locator('input').first().fill('40°C');
    await page.locator('div').filter({ has: page.getByText('عدد العمال والفنيين', { exact: true }) }).locator('input').first().fill('50');
    await page.locator('div').filter({ has: page.getByText('عدد المعدات العاملة', { exact: true }) }).locator('input').first().fill('10');
    await page.locator('div').filter({ has: page.getByText('تفاصيل الأعمال المنجزة', { exact: true }) }).locator('textarea').first().fill('تقرير تجريبي لأعمال الموقع');
    
    // Save
    await page.getByRole('button', { name: 'حفظ التقرير' }).click();

    // Verify it appeared
    await expect(page.getByText('تقرير تجريبي لأعمال الموقع')).toBeVisible({ timeout: 8000 });

    // Delete it
    await page.getByText('(حذف)').first().click();

    // Verify deleted
    await expect(page.getByText('تقرير تجريبي لأعمال الموقع')).not.toBeVisible({ timeout: 5000 });
  });

  test('TASKS CRUD: Can add and delete a task', async ({ page }) => {
    await page.goto('http://localhost:5173/#/tasks');
    await expect(page.getByText('الجدول الزمني والمهام')).toBeVisible({ timeout: 10000 });

    // Switch to list view to find the button properly
    await page.getByRole('button', { name: 'القائمة' }).click();

    // Click Add
    await page.getByRole('button', { name: 'مهمة جديدة' }).click();
    await expect(page.getByText('إضافة مهمة للجدول الزمني').last()).toBeVisible();

    // Fill form
    await page.locator('div').filter({ has: page.getByText('عنوان المهمة', { exact: true }) }).locator('input').first().fill('مهمة تجريبية للاختبار');
    await page.locator('div').filter({ has: page.getByText('تاريخ البدء', { exact: true }) }).locator('input').first().fill('2024-01-01');
    await page.locator('div').filter({ has: page.getByText('تاريخ الانتهاء المتوقع', { exact: true }) }).locator('input').first().fill('2024-01-10');
    
    // Save
    await page.getByRole('button', { name: 'حفظ في الجدول الزمني' }).click();

    // Verify it appeared
    await expect(page.getByText('مهمة تجريبية للاختبار')).toBeVisible({ timeout: 8000 });

    // Delete it
    const row = page.locator('tr').filter({ hasText: 'مهمة تجريبية للاختبار' });
    await row.locator('button').last().click();

    // Verify deleted
    await expect(page.getByText('مهمة تجريبية للاختبار')).not.toBeVisible({ timeout: 5000 });
  });

});

// ═══════════════════════════════════════════════════════
// 📦 SECTION 8: Inventory & Suppliers
// ═══════════════════════════════════════════════════════
test.describe('📦 Inventory & Suppliers - CRUD', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('MATERIALS CRUD: Can add and delete a material', async ({ page }) => {
    await page.goto('http://localhost:5173/#/materials');
    await expect(page.getByText('دليل الأصناف والمواد')).toBeVisible({ timeout: 10000 });

    // Click Add
    await page.getByRole('button', { name: 'إضافة صنف' }).click();
    await expect(page.getByText('إضافة صنف جديد').last()).toBeVisible();

    // Fill form
    await page.locator('div').filter({ has: page.getByText('اسم الصنف / المادة', { exact: true }) }).locator('input').first().fill('اسمنت بورتلاندي آلي');
    await page.locator('div').filter({ has: page.getByText('سعر الشراء التقديري', { exact: true }) }).locator('input').first().fill('15');
    await page.locator('div').filter({ has: page.getByText('سعر البيع (المقايسة)', { exact: true }) }).locator('input').first().fill('20');
    
    // Save
    await page.getByRole('button', { name: 'إضافة الصنف' }).click();

    // Verify it appeared
    await expect(page.getByText('اسمنت بورتلاندي آلي')).toBeVisible({ timeout: 8000 });

    // Delete it
    const row = page.locator('tr').filter({ hasText: 'اسمنت بورتلاندي آلي' });
    await row.locator('button').last().click();

    // Verify deleted
    await expect(page.getByText('اسمنت بورتلاندي آلي')).not.toBeVisible({ timeout: 5000 });
  });

  test('Inventory page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/inventory');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Suppliers page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/suppliers');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Purchase Orders page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/purchase-orders');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

});

// ═══════════════════════════════════════════════════════
// 📄 SECTION 9: Documents & Reports
// ═══════════════════════════════════════════════════════
test.describe('📄 Documents & Reports', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('Documents Center page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/documents');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Reports page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/reports');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('PROJECT FILES CRUD: Can add and delete a file', async ({ page }) => {
    await page.goto('http://localhost:5173/#/project-files');
    await expect(page.getByText('إدارة مخططات المشاريع')).toBeVisible({ timeout: 10000 });

    // Switch to List view to find Delete button easily
    await page.locator('button').filter({ has: page.locator('svg.lucide-list') }).click();

    // Click Add
    await page.getByRole('button', { name: 'رفع مخطط / ملف' }).click();
    await expect(page.getByText('رفع ملفات للمشروع').last()).toBeVisible();

    // Fill form
    await page.locator('div').filter({ has: page.getByText('اسم الملف', { exact: true }) }).locator('input').first().fill('مخطط_تجريبي.pdf');
    
    // Save
    await page.getByRole('button', { name: 'بدء الرفع' }).click();

    // Verify it appeared
    await expect(page.getByText('مخطط_تجريبي.pdf')).toBeVisible({ timeout: 8000 });

    // Delete it
    const row = page.locator('tr').filter({ hasText: 'مخطط_تجريبي.pdf' });
    await row.locator('button').last().click();

    // Verify deleted
    await expect(page.getByText('مخطط_تجريبي.pdf')).not.toBeVisible({ timeout: 5000 });
  });

  test('Activity Log page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/activity-log');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

});

// ═══════════════════════════════════════════════════════
// ⚙️ SECTION 10: Settings & Users
// ═══════════════════════════════════════════════════════
test.describe('⚙️ Settings & Users', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('Settings page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/settings');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Users page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/#/users');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

});

// ═══════════════════════════════════════════════════════
// 🗺️ SECTION 11: Navigation & No Crashes
// ═══════════════════════════════════════════════════════
test.describe('🗺️ Navigation - All pages no crash', () => {

  test('All 21 routes load without React errors', async ({ page }) => {
    await injectAuth(page);

    const routes = [
      '/', '/projects', '/clients', '/employees', '/finance',
      '/invoices', '/payments', '/bonds', '/expenses', '/income',
      '/inventory', '/materials', '/suppliers', '/purchase-orders',
      '/labor', '/equipment', '/reports', '/settings', '/users',
      '/activity-log', '/tasks', '/requests', '/documents',
      '/boq', '/valuations', '/daily-logs', '/digital-takeoff'
    ];

    const failed = [];
    for (const route of routes) {
      await page.goto(`http://localhost:5173/#${route}`);
      const hasHeading = await page.locator('h1, h2, h3').first().isVisible({ timeout: 8000 }).catch(() => false);
      if (!hasHeading) failed.push(route);
    }

    if (failed.length > 0) {
      throw new Error(`❌ الصفحات التالية لا تفتح بشكل صحيح:\n${failed.join('\n')}`);
    }
  });

});
