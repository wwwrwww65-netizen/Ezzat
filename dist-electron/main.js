import { BrowserWindow, app, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import fs from "fs";
//#region electron/main.js
var require = createRequire(import.meta.url);
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var db = null;
var dbPath = path.join(app.getPath("userData"), "construction_erp.db");
var saveDb = () => {
	if (db) {
		const data = db.export();
		fs.writeFileSync(dbPath, Buffer.from(data));
	}
};
var initDatabase = async () => {
	const SQL = await require("sql.js")();
	if (fs.existsSync(dbPath)) {
		const fileBuffer = fs.readFileSync(dbPath);
		db = new SQL.Database(fileBuffer);
	} else db = new SQL.Database();
	db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client_name TEXT,
      status TEXT,
      budget REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS blueprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      file_path TEXT,
      scale_factor REAL DEFAULT 100,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS materials_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      unit TEXT,
      unit_price REAL,
      waste_factor REAL
    );
    CREATE TABLE IF NOT EXISTS labor_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crew_type TEXT,
      daily_rate REAL,
      daily_production REAL
    );
    CREATE TABLE IF NOT EXISTS equipment_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      daily_rate REAL,
      fuel_consumption REAL
    );
    CREATE TABLE IF NOT EXISTS takeoff_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blueprint_id INTEGER,
      element_name TEXT,
      geometry_type TEXT,
      raw_value REAL,
      unit TEXT,
      estimated_cost REAL,
      estimated_days REAL,
      FOREIGN KEY(blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS inventory_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER,
      warehouse_name TEXT,
      quantity REAL DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(material_id) REFERENCES materials_catalog(id)
    );
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      basic_salary REAL DEFAULT 0,
      join_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      category TEXT,
      amount REAL,
      description TEXT,
      expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id)
    );
    CREATE TABLE IF NOT EXISTS accounting_journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_code TEXT,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      description TEXT,
      entry_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER,
      invoice_number TEXT,
      total_amount REAL,
      paid_amount REAL,
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    );
    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER,
      material_id INTEGER,
      quantity REAL,
      unit_price REAL,
      total REAL,
      FOREIGN KEY(purchase_id) REFERENCES purchases(id),
      FOREIGN KEY(material_id) REFERENCES materials_catalog(id)
    );
    CREATE TABLE IF NOT EXISTS staff_advances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER,
      amount REAL,
      reason TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(staff_id) REFERENCES staff(id)
    );
  `);
	const seedRows = (sql) => {
		try {
			const stmt = db.prepare(sql);
			stmt.step();
			const row = stmt.getAsObject();
			stmt.free();
			return row;
		} catch (e) {
			return { count: 0 };
		}
	};
	const userCount = seedRows("SELECT count(*) as count FROM users");
	if (!userCount.count || userCount.count == 0) db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
		"admin",
		"admin123",
		"admin"
	]);
	const projCount = seedRows("SELECT count(*) as count FROM projects");
	if (!projCount.count || projCount.count == 0) {
		db.run("INSERT INTO projects (name, client_name, status, budget) VALUES (?, ?, ?, ?)", [
			"مشروع فيلا سكنية - الرياض",
			"أحمد محمد",
			"نشط",
			15e5
		]);
		db.run("INSERT INTO blueprints (project_id, file_path, scale_factor) VALUES (?, ?, ?)", [
			1,
			"demo-blueprint.pdf",
			100
		]);
	}
	db.run("DELETE FROM materials_catalog");
	[
		[
			"حفر وترحيل",
			"م3",
			15,
			0
		],
		[
			"ردم ورص (بيسكورس)",
			"م3",
			25,
			.05
		],
		[
			"صبة نظافة",
			"م3",
			200,
			.05
		],
		[
			"عزل مائي (لفائف)",
			"م2",
			20,
			.1
		],
		[
			"عزل حراري",
			"م2",
			15,
			.05
		],
		[
			"مبيدات حشرية للتربة",
			"لتر",
			45,
			0
		],
		[
			"حديد تسليح",
			"طن",
			2800,
			.03
		],
		[
			"خرسانة جاهزة",
			"م3",
			250,
			.05
		],
		[
			"أسمنت بورتلاندي عادي",
			"كيس",
			15,
			.04
		],
		[
			"أسمنت مقاوم للأملاح",
			"كيس",
			18,
			.04
		],
		[
			"رمل أبيض",
			"قلاب",
			300,
			.1
		],
		[
			"رمل أسود / نيسة",
			"قلاب",
			350,
			.1
		],
		[
			"كنكري / زلط",
			"قلاب",
			400,
			.05
		],
		[
			"بلك أسمنتي مصمت (للقواعد)",
			"حبة",
			2.5,
			.05
		],
		[
			"أخشاب نجارة (للشدات)",
			"م3",
			1200,
			.15
		],
		[
			"بلك بركاني عازل",
			"حبة",
			3.5,
			.05
		],
		[
			"بلك أسمنتي عادي",
			"حبة",
			1.8,
			.05
		],
		[
			"حجر طبيعي واجهات",
			"م2",
			80,
			.1
		],
		[
			"رخام واجهات",
			"م2",
			120,
			.1
		],
		[
			"واجهات زجاجية (كرتن وول)",
			"م2",
			450,
			.05
		],
		[
			"تكسيات جي آر سي (GRC)",
			"م2",
			250,
			.05
		],
		[
			"تكسيات خشبية (WPC)",
			"م2",
			150,
			.05
		],
		[
			"دهانات بروفايل خارجية",
			"برميل",
			140,
			.05
		],
		[
			"بلك أسمنتي (قواطع)",
			"حبة",
			1.8,
			.05
		],
		[
			"طوب أحمر فخاري",
			"حبة",
			2.2,
			.05
		],
		[
			"طابوق أبيض خفيف (AAC)",
			"حبة",
			4.5,
			.05
		],
		[
			"قواطع جبس بورد",
			"م2",
			45,
			.05
		],
		[
			"ألواح أسمنتية (للأماكن الرطبة)",
			"م2",
			65,
			.05
		],
		[
			"بورسلان صالات",
			"م2",
			45,
			.1
		],
		[
			"سيراميك حمامات",
			"م2",
			35,
			.1
		],
		[
			"سيراميك مطابخ",
			"م2",
			38,
			.1
		],
		[
			"رخام طبيعي (أرضيات)",
			"م2",
			150,
			.1
		],
		[
			"باركيه خشبي",
			"م2",
			55,
			.05
		],
		[
			"أرضيات إيبوكسي",
			"م2",
			75,
			.02
		],
		[
			"أسقف مستعارة (جبس بورد)",
			"م2",
			60,
			.05
		],
		[
			"دهانات داخلية (جوتن)",
			"برميل",
			120,
			.05
		],
		[
			"دهانات داخلية (الجزيرة)",
			"برميل",
			110,
			.05
		],
		[
			"أبواب خشب (سنديان)",
			"حبة",
			800,
			0
		],
		[
			"أبواب WPC (مقاومة للماء)",
			"حبة",
			600,
			0
		],
		[
			"أبواب حديد (مداخل)",
			"حبة",
			1500,
			0
		],
		[
			"نوافذ ألمنيوم دبل جلاس",
			"م2",
			350,
			0
		],
		[
			"شتر ألمنيوم كهربائي",
			"م2",
			450,
			0
		],
		[
			"مواسير وتمديدات حرارية (PPR)",
			"لفة",
			120,
			.05
		],
		[
			"مواسير صرف (PVC)",
			"حبة",
			45,
			.05
		],
		[
			"أطقم صحية (خزف/جروهي)",
			"طقم",
			850,
			0
		],
		[
			"كابلات وأسلاك كهربائية (الفنار)",
			"لفة",
			110,
			.05
		],
		[
			"طبالين ومفاتيح كهربائية",
			"حبة",
			350,
			0
		],
		[
			"وحدات تكييف (سبليت/مخفي)",
			"وحدة",
			2500,
			0
		]
	].forEach((m) => {
		db.run("INSERT INTO materials_catalog (name, unit, unit_price, waste_factor) VALUES (?, ?, ?, ?)", m);
	});
	db.run("DELETE FROM labor_catalog");
	[
		[
			"طاقم بناء بلك",
			600,
			150
		],
		[
			"طاقم لياسة",
			800,
			100
		],
		[
			"طاقم حدادة ونجارة",
			1500,
			5
		],
		[
			"مبلط",
			200,
			30
		]
	].forEach((l) => {
		db.run("INSERT INTO labor_catalog (crew_type, daily_rate, daily_production) VALUES (?, ?, ?)", l);
	});
	db.run("DELETE FROM equipment_catalog");
	[
		[
			"حفارة بوكلين",
			1200,
			500
		],
		[
			"كرين (رافعة) 50 طن",
			2e3,
			400
		],
		[
			"بوبكات",
			400,
			150
		],
		[
			"خلاطة مركزية",
			800,
			300
		]
	].forEach((e) => {
		db.run("INSERT INTO equipment_catalog (name, daily_rate, fuel_consumption) VALUES (?, ?, ?)", e);
	});
	db.run("DELETE FROM takeoff_measurements");
	[
		[
			1,
			"بناء جدران الدور الأرضي (بلك معزول)",
			"Area",
			350,
			"متر مربع",
			350 * 55,
			3
		],
		[
			1,
			"صبة النظافة (خرسانة 250)",
			"Volume",
			60,
			"متر مكعب",
			13200,
			1
		],
		[
			1,
			"حديد تسليح القواعد والرقاب",
			"Count",
			12,
			"طن",
			12 * 3200,
			4
		],
		[
			1,
			"أعمال اللياسة الداخلية",
			"Area",
			800,
			"متر مربع",
			800 * 25,
			8
		],
		[
			1,
			"بلاط سيراميك الأرضيات",
			"Area",
			400,
			"متر مربع",
			400 * 85,
			10
		]
	].forEach((t) => {
		db.run("INSERT INTO takeoff_measurements (blueprint_id, element_name, geometry_type, raw_value, unit, estimated_cost, estimated_days) VALUES (?, ?, ?, ?, ?, ?, ?)", t);
	});
	saveDb();
	console.log("✅ قاعدة البيانات جاهزة:", dbPath);
};
var queryDb = (sql, params = []) => {
	try {
		const stmt = db.prepare(sql);
		if (params && params.length > 0) stmt.bind(params);
		const rows = [];
		while (stmt.step()) rows.push(stmt.getAsObject());
		stmt.free();
		return rows;
	} catch (err) {
		console.error("DB Query Error:", sql, err);
		return [];
	}
};
var executeDb = (sql, params = []) => {
	try {
		db.run(sql, params);
		saveDb();
		return { success: true };
	} catch (err) {
		console.error("DB Execute Error:", sql, err);
		throw err;
	}
};
function createWindow() {
	const win = new BrowserWindow({
		width: 1400,
		height: 900,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true
		}
	});
	win.once("ready-to-show", () => win.show());
	if (process.env.VITE_DEV_SERVER_URL) {
		win.loadURL(process.env.VITE_DEV_SERVER_URL);
		win.webContents.openDevTools({ mode: "detach" });
	} else win.loadFile(path.join(__dirname, "../dist/index.html"));
}
app.whenReady().then(async () => {
	await initDatabase();
	createWindow();
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
ipcMain.handle("db:query", (event, sql, params) => queryDb(sql, params || []));
ipcMain.handle("db:execute", (event, sql, params) => executeDb(sql, params || []));
//#endregion
