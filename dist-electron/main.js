import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import r from "path";
import { fileURLToPath as i } from "url";
import { createRequire as a } from "module";
import o from "fs";
//#region electron/main.js
var s = a(import.meta.url), c = r.dirname(i(import.meta.url)), l = null, u = r.join(t.getPath("userData"), "construction_erp.db"), d = () => {
	if (l) {
		let e = l.export();
		o.writeFileSync(u, Buffer.from(e));
	}
}, f = async () => {
	let e = await s("sql.js")();
	if (o.existsSync(u)) {
		let t = o.readFileSync(u);
		l = new e.Database(t);
	} else l = new e.Database();
	l.run("\n    CREATE TABLE IF NOT EXISTS projects (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      client_name TEXT,\n      status TEXT,\n      budget REAL,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n    CREATE TABLE IF NOT EXISTS blueprints (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      project_id INTEGER,\n      file_path TEXT,\n      scale_factor REAL DEFAULT 100,\n      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE\n    );\n    CREATE TABLE IF NOT EXISTS materials_catalog (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT,\n      unit TEXT,\n      unit_price REAL,\n      waste_factor REAL\n    );\n    CREATE TABLE IF NOT EXISTS labor_catalog (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      crew_type TEXT,\n      daily_rate REAL,\n      daily_production REAL\n    );\n    CREATE TABLE IF NOT EXISTS equipment_catalog (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT,\n      daily_rate REAL,\n      fuel_consumption REAL\n    );\n    CREATE TABLE IF NOT EXISTS takeoff_measurements (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      blueprint_id INTEGER,\n      element_name TEXT,\n      geometry_type TEXT,\n      raw_value REAL,\n      unit TEXT,\n      estimated_cost REAL,\n      estimated_days REAL,\n      FOREIGN KEY(blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE\n    );\n    CREATE TABLE IF NOT EXISTS settings (\n      key TEXT PRIMARY KEY,\n      value TEXT\n    );\n    CREATE TABLE IF NOT EXISTS suppliers (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      phone TEXT,\n      balance REAL DEFAULT 0,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n    CREATE TABLE IF NOT EXISTS inventory_stock (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      material_id INTEGER,\n      warehouse_name TEXT,\n      quantity REAL DEFAULT 0,\n      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY(material_id) REFERENCES materials_catalog(id)\n    );\n    CREATE TABLE IF NOT EXISTS staff (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      role TEXT,\n      basic_salary REAL DEFAULT 0,\n      join_date DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n    CREATE TABLE IF NOT EXISTS expenses (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      project_id INTEGER,\n      category TEXT,\n      amount REAL,\n      description TEXT,\n      expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY(project_id) REFERENCES projects(id)\n    );\n    CREATE TABLE IF NOT EXISTS accounting_journal (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      account_code TEXT,\n      debit REAL DEFAULT 0,\n      credit REAL DEFAULT 0,\n      description TEXT,\n      entry_date DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n    CREATE TABLE IF NOT EXISTS users (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      username TEXT UNIQUE NOT NULL,\n      password TEXT NOT NULL,\n      role TEXT NOT NULL DEFAULT 'user',\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n    CREATE TABLE IF NOT EXISTS purchases (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      supplier_id INTEGER,\n      invoice_number TEXT,\n      total_amount REAL,\n      paid_amount REAL,\n      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)\n    );\n    CREATE TABLE IF NOT EXISTS purchase_items (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      purchase_id INTEGER,\n      material_id INTEGER,\n      quantity REAL,\n      unit_price REAL,\n      total REAL,\n      FOREIGN KEY(purchase_id) REFERENCES purchases(id),\n      FOREIGN KEY(material_id) REFERENCES materials_catalog(id)\n    );\n    CREATE TABLE IF NOT EXISTS staff_advances (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      staff_id INTEGER,\n      amount REAL,\n      reason TEXT,\n      date DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY(staff_id) REFERENCES staff(id)\n    );\n  ");
	let t = (e) => {
		try {
			let t = l.prepare(e);
			t.step();
			let n = t.getAsObject();
			return t.free(), n;
		} catch {
			return { count: 0 };
		}
	}, n = t("SELECT count(*) as count FROM users");
	(!n.count || n.count == 0) && l.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
		"admin",
		"admin123",
		"admin"
	]);
	let r = t("SELECT count(*) as count FROM projects");
	(!r.count || r.count == 0) && (l.run("INSERT INTO projects (name, client_name, status, budget) VALUES (?, ?, ?, ?)", [
		"مشروع فيلا سكنية - الرياض",
		"أحمد محمد",
		"نشط",
		15e5
	]), l.run("INSERT INTO blueprints (project_id, file_path, scale_factor) VALUES (?, ?, ?)", [
		1,
		"demo-blueprint.pdf",
		100
	])), l.run("DELETE FROM materials_catalog"), [
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
	].forEach((e) => {
		l.run("INSERT INTO materials_catalog (name, unit, unit_price, waste_factor) VALUES (?, ?, ?, ?)", e);
	}), l.run("DELETE FROM labor_catalog"), [
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
	].forEach((e) => {
		l.run("INSERT INTO labor_catalog (crew_type, daily_rate, daily_production) VALUES (?, ?, ?)", e);
	}), l.run("DELETE FROM equipment_catalog"), [
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
		l.run("INSERT INTO equipment_catalog (name, daily_rate, fuel_consumption) VALUES (?, ?, ?)", e);
	}), l.run("DELETE FROM takeoff_measurements"), [
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
	].forEach((e) => {
		l.run("INSERT INTO takeoff_measurements (blueprint_id, element_name, geometry_type, raw_value, unit, estimated_cost, estimated_days) VALUES (?, ?, ?, ?, ?, ?, ?)", e);
	}), d(), console.log("✅ قاعدة البيانات جاهزة:", u);
}, p = (e, t = []) => {
	try {
		let n = l.prepare(e);
		t && t.length > 0 && n.bind(t);
		let r = [];
		for (; n.step();) r.push(n.getAsObject());
		return n.free(), r;
	} catch (t) {
		return console.error("DB Query Error:", e, t), [];
	}
}, m = (e, t = []) => {
	try {
		return l.run(e, t), d(), { success: !0 };
	} catch (t) {
		throw console.error("DB Execute Error:", e, t), t;
	}
};
function h() {
	let t = new e({
		width: 1400,
		height: 900,
		show: !1,
		webPreferences: {
			preload: r.join(c, "preload.js"),
			nodeIntegration: !1,
			contextIsolation: !0
		}
	});
	t.once("ready-to-show", () => t.show()), process.env.VITE_DEV_SERVER_URL ? (t.loadURL(process.env.VITE_DEV_SERVER_URL), t.webContents.openDevTools({ mode: "detach" })) : t.loadFile(r.join(c, "../dist/index.html"));
}
t.whenReady().then(async () => {
	await f(), h();
}), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
}), n.handle("db:query", (e, t, n) => p(t, n || [])), n.handle("db:execute", (e, t, n) => m(t, n || []));
//#endregion
