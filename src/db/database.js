import Dexie from 'dexie';

// تهيئة قاعدة البيانات المحلية (Offline Database) باستخدام Dexie (IndexedDB wrapper)
export const db = new Dexie('ConstructionERPDatabase');

// تعريف هيكل الجداول (Schema)
// تمت إضافة حقل sync_status لتتبع حالة المزامنة مع الخادم (أونلاين)
db.version(1).stores({
  projects: '++id, name, client_name, status, deadline, created_at, sync_status',
  blueprints: '++id, project_id, file_name, file_type, file_blob, scale_factor, uploaded_at, sync_status',
  materials_catalog: '++id, name, unit, unit_price, waste_factor, sync_status',
  labor_catalog: '++id, crew_type, daily_rate, daily_production, sync_status',
  takeoff_measurements: '++id, blueprint_id, element_name, geometry_type, raw_value, unit, sync_status',
  project_estimations: '++id, project_id, total_material_cost, total_labor_cost, estimated_days, crews_allocated, sync_status',
  sync_queue: '++id, action, table_name, record_id, timestamp' // جدول لجدولة العمليات التي تنتظر المزامنة عندما يعود الاتصال
});

// دوال مساعدة للتعامل مع قاعدة البيانات أوفلاين/أونلاين
export const isOnline = () => navigator.onLine;

// مستمع لتغير حالة الاتصال
window.addEventListener('online', () => {
  console.log('🌐 النظام متصل بالإنترنت، بدء مزامنة البيانات...');
  // سيتم إضافة دالة المزامنة (Sync) لاحقاً
});

window.addEventListener('offline', () => {
  console.log('🚫 النظام غير متصل بالإنترنت، العمليات ستُحفظ محلياً.');
});
