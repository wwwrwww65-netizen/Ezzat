/**
 * محلل المخططات الهندسية - محلي 100%
 * إصدار فائق المرونة (Resilient) للتعامل مع أخطاء قراءة الـ OCR
 */
import { createWorker } from 'tesseract.js';

// ── قاموس الغرف (متسامح جداً مع الأخطاء الإملائية للـ OCR)
const ROOM_DICT = [
  { keys: ['MASTER', 'MAST', 'MSTER'], name: 'غرفة نوم رئيسية (ماستر)', cat: 'نوم' },
  { keys: ['BEDROOM', 'BED ROOM', 'BED'], name: 'غرفة نوم', cat: 'نوم' },
  { keys: ['KITCHEN', 'KITCH', 'KTCHEN', 'KIT'], name: 'مطبخ', cat: 'خدمات' },
  { keys: ['DINING', 'DINI', 'DINNING'], name: 'غرفة طعام', cat: 'معيشة' },
  { keys: ['LIVING', 'LIV', 'LIVINGROOM'], name: 'صالة معيشة', cat: 'معيشة' },
  { keys: ['MEN', 'FOR MEN', 'SITTING MEN'], name: 'مجلس رجال', cat: 'معيشة' },
  { keys: ['WOMEN', 'WEMEN', 'FOR WOMEN'], name: 'مجلس نساء', cat: 'معيشة' },
  { keys: ['SITTING', 'MAJLIS', 'SITT'], name: 'مجلس', cat: 'معيشة' },
  { keys: ['BATH', 'BATHROOM', 'TOILET', 'WC', 'W.C'], name: 'حمام', cat: 'صحي' },
  { keys: ['LAUNDRY', 'WASH'], name: 'غرفة غسيل', cat: 'خدمات' },
  { keys: ['STORE', 'STORAGE'], name: 'مستودع', cat: 'خدمات' },
  { keys: ['ENTRANCE', 'ENTRY', 'LOBBY'], name: 'مدخل', cat: 'عام' },
  { keys: ['CORRIDOR', 'PASSAGE'], name: 'ممر', cat: 'عام' },
  { keys: ['GARAGE', 'PARKING'], name: 'كراج', cat: 'خارجي' },
];

const findRoom = (text) => {
  const u = text.toUpperCase().replace(/[^A-Z]/g, '');
  for (const r of ROOM_DICT) {
    for (const k of r.keys) {
      if (u.includes(k.replace(/\s/g, ''))) return r;
    }
  }
  return null;
};

const cx = (b) => (b.x0 + b.x1) / 2;
const cy = (b) => (b.y0 + b.y1) / 2;
const dist = (b1, b2) => Math.hypot(cx(b1) - cx(b2), cy(b1) - cy(b2));

// ══════════════════════════════════════════════
// الخطوة 1: تحضير الصورة
// ══════════════════════════════════════════════
const prepareImage = (imageDataUrl) => new Promise((res) => {
  const img = new Image();
  img.onload = () => {
    // تكبير لـ 1500px بحد أقصى للسرعة
    const scale = Math.max(1, 1500 / Math.max(img.width, img.height));
    const W = Math.round(img.width * scale);
    const H = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    
    // فلتر لتوضيح الحواف بدون تدمير الألوان
    ctx.filter = 'contrast(1.4) grayscale(20%)';
    ctx.drawImage(img, 0, 0, W, H);
    
    res({ dataUrl: canvas.toDataURL('image/jpeg', 0.9), W, H, scale });
  };
  img.onerror = () => res({ dataUrl: imageDataUrl, W: 800, H: 600, scale: 1 });
  img.src = imageDataUrl;
});

// ══════════════════════════════════════════════
// الخطوة 2: Single-Pass OCR (بدون Timeout صامت)
// ══════════════════════════════════════════════
const runOCR = async (imageDataUrl, onProgress) => {
  onProgress?.(10, 'جارٍ تحضير الصورة...');
  const { dataUrl, scale } = await prepareImage(imageDataUrl);

  onProgress?.(25, 'جارٍ قراءة النصوص من المخطط...');

  const worker = await createWorker('eng', 1, {
    workerPath: '/tesseract-worker.min.js',
    corePath: '/tesseract-core.wasm.js',
    langPath: '/tessdata/',
    logger: m => {
      if (m.status === 'recognizing text') {
        onProgress?.(25 + Math.round(m.progress * 20), `OCR: ${Math.round(m.progress * 100)}%`);
      } else {
         console.log('[OCR System]:', m.status);
      }
    }
  });

  await worker.setParameters({ tessedit_pageseg_mode: '11' });
  const { data } = await worker.recognize(dataUrl);
  await worker.terminate();

  // عرض أول 300 حرف من النص لمعرفة ما يقرأه OCR
  const rawText = data.text || '';
  console.log('[OCR Raw Text]:', rawText.slice(0, 300));
  
  // Tesseract v5 قد لا يملأ data.words في بعض الحالات مع PSM 11
  let extractedWords = data.words || [];
  if (extractedWords.length === 0 && data.lines) {
    extractedWords = data.lines.flatMap(l => l.words || []);
  }

  console.log('[OCR Words Count]:', extractedWords.length);

  const toOriginal = (bbox) => ({
    x0: bbox.x0 / scale, y0: bbox.y0 / scale,
    x1: bbox.x1 / scale, y1: bbox.y1 / scale,
  });

  const words = extractedWords
    .filter(w => w.confidence > 5) // الثقة المطلوبة شبه معدومة لأن الأهم هو النص
    .map(w => ({ text: w.text.trim(), bbox: toOriginal(w.bbox) }));

  console.log('[OCR Words Sample]:', words.slice(0, 20).map(w => w.text).join(', '));

  onProgress?.(48, `OCR قرأ نصاً طويلاً | تم التقاط الكلمات`);
  return { words, rawText };
};

// ══════════════════════════════════════════════
// الخطوة 3: تجميع النصوص
// ══════════════════════════════════════════════
const groupToLines = (words) => {
  const lines = [];
  const used = new Set();
  const sorted = [...words].sort((a, b) => cy(a.bbox) - cy(b.bbox));

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue;
    const base = sorted[i];
    const group = [base];
    used.add(i);

    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue;
      const other = sorted[j];
      if (Math.abs(cy(other.bbox) - cy(base.bbox)) < 20) { // مسافة أكبر للتسامح
        group.push(other);
        used.add(j);
      }
    }
    
    group.sort((a, b) => a.bbox.x0 - b.bbox.x0);
    lines.push({
      text: group.map(g => g.text).join(' '),
      bbox: base.bbox
    });
  }
  return lines;
};

// ══════════════════════════════════════════════
// الخطوة 4: استخراج الأرقام بمرونة فائقة
// ══════════════════════════════════════════════
const extractNumbers = (words) => {
  const results = [];
  for (const w of words) {
    const t = w.text.replace(',', '.').replace(/[oO]/g, '0').replace(/[lI|]/g, '1');
    const matches = t.match(/\d{1,2}\.\d{1,2}/g);
    if (matches) {
      matches.forEach(m => {
        const val = parseFloat(m);
        if (val >= 0.5 && val <= 30) results.push({ val, bbox: w.bbox });
      });
    } else {
      const ints = t.match(/(?<!\d)\d{1,2}(?!\d)/g);
      if (ints) {
        ints.forEach(m => {
          const val = parseInt(m);
          if (val >= 1 && val <= 30) results.push({ val, bbox: w.bbox });
        });
      }
    }
  }
  return results;
};

// ══════════════════════════════════════════════
// الخطوة 5: ربط الأبعاد (Spatial Matching)
// ══════════════════════════════════════════════
const matchRooms = (lines, numbers, imgW, imgH) => {
  const rooms = [];
  const usedNums = new Set();
  const usedRoomNames = new Set();
  const radius = Math.min(imgW, imgH) * 0.35; // دائرة بحث واسعة جداً

  for (const line of lines) {
    const room = findRoom(line.text);
    if (!room) continue;

    const baseCount = [...usedRoomNames].filter(n => n.startsWith(room.name)).length;
    const finalName = baseCount === 0 ? room.name : `${room.name} ${baseCount + 1}`;
    usedRoomNames.add(room.name + (baseCount || ''));

    const nearby = numbers
      .map((n, i) => ({ ...n, i, d: dist(line.bbox, n.bbox) }))
      .filter(n => !usedNums.has(n.i) && n.d <= radius)
      .sort((a, b) => a.d - b.d);

    let area = null, w = null, h = null;

    if (nearby.length >= 2) {
      w = nearby[0].val; h = nearby[1].val;
      area = parseFloat((Math.max(w, h) * Math.min(w, h)).toFixed(2));
      usedNums.add(nearby[0].i); usedNums.add(nearby[1].i);
    } else if (nearby.length === 1) {
      const s = nearby[0].val;
      area = parseFloat((s * s).toFixed(2));
      usedNums.add(nearby[0].i);
    }

    if (area && area > 0.5 && area < 300) {
      rooms.push({ name: finalName, area, width: w, height: h, category: room.cat, confidence: 'high' });
    } else {
      // إذا وجدنا الغرفة بدون أرقام
      rooms.push({ name: finalName, area: 16, category: room.cat, confidence: 'estimated' });
    }
  }
  return rooms;
};

// ══════════════════════════════════════════════
// بناء BOQ الشامل
// ══════════════════════════════════════════════
const buildBOQ = (rooms, totalArea) => {
  const items = [];
  const tileMap = { 'صحي': 'سيراميك حمامات مقاوم', 'معيشة': 'رخام / بورسلان فاخر', 'نوم': 'سيراميك أسباني 60×60', 'خدمات': 'سيراميك مطبخ مقاوم' };

  rooms.forEach(r => {
    items.push({
      element_name: `${r.name} - أرضيات (${tileMap[r.category] || 'سيراميك'})`,
      geometry_type: 'مساحة', raw_value: r.area, unit: 'متر مربع',
      category: 'تشطيبات أرضيات', confidence: r.confidence,
    });
  });

  if (totalArea > 5) {
    const perim = Math.round(4 * Math.sqrt(totalArea));
    [
      ['بناء جدران خارجية (بلك برك 20سم)', Math.round(perim * 3.2), 'متر مربع', 'أعمال البناء'],
      ['لياسة داخلية شاملة', Math.round(totalArea * 2.4), 'متر مربع', 'أعمال التشطيب'],
      ['لياسة خارجية', Math.round(perim * 3.2), 'متر مربع', 'أعمال التشطيب'],
      ['صبة سقف خرسانة مسلحة', +((totalArea * 0.18).toFixed(1)), 'متر مكعب', 'أعمال الخرسانة'],
      ['حديد تسليح سيخ سابك', +((totalArea * 0.012).toFixed(1)), 'طن', 'أعمال الحداد'],
      ['دهانات داخلية (جوتن طبقتين)', Math.round(totalArea * 2.2), 'متر مربع', 'تشطيبات دهانات'],
    ].forEach(([n, v, u, c]) => items.push({
      element_name: n, geometry_type: 'Count', raw_value: v, unit: u, category: c, confidence: 'estimated'
    }));
  }
  return items;
};

// ══════════════════════════════════════════════
// الدالة الرئيسية
// ══════════════════════════════════════════════
export const analyzeFloorPlan = async (imageDataUrl, onProgress) => {
  const results = { rooms: [], measurements: [], totalArea: 0, summary: '', error: null };

  try {
    const { words, rawText } = await runOCR(imageDataUrl, onProgress);
    const lines = groupToLines(words);
    const numbers = extractNumbers(words);

    onProgress?.(70, `تجميع: ${lines.length} سطر، ${numbers.length} رقم بُعد`);

    let imgW = 800, imgH = 600;
    await new Promise((res) => {
      const tmp = new Image();
      tmp.onload = () => { imgW = tmp.naturalWidth; imgH = tmp.naturalHeight; res(); };
      tmp.onerror = res;
      tmp.src = imageDataUrl;
    }).catch(() => {});

    let rooms = [];
    if (words.length > 0) {
      rooms = matchRooms(lines, numbers, imgW, imgH);
    } else {
      // ══════════════════════════════════════════════
      // الـ Plan B: Zipping Rooms and Numbers from rawText
      // ══════════════════════════════════════════════
      onProgress?.(80, 'جاري الربط التسلسلي من النص الخام...');
      
      const textLines = rawText.split('\n').filter(l => l.trim().length > 0);
      const foundRooms = [];
      const foundDecimalNumbers = []; // أرقام عشرية فقط (بُعد حقيقي)

      // 1. استخراج كل الغرف والأرقام العشرية من النص كاملاً
      for (const line of textLines) {
        const room = findRoom(line);
        if (room) {
          foundRooms.push(room);
        } else {
          // الأرقام العشرية فقط (مثل 4.00, 3.80) - تجنّب الأعداد الصحيحة
          const t = line.replace(',', '.').replace(/[oO]/g, '0').replace(/[lI|]/g, '1');
          const decimalMatches = t.match(/\d{1,2}\.\d{1,2}/g);
          if (decimalMatches) {
            decimalMatches.forEach(m => {
              const val = parseFloat(m);
              if (val >= 0.5 && val <= 30) foundDecimalNumbers.push(val);
            });
          }
        }
      }

      console.log('[Plan B] Rooms found:', foundRooms.map(r => r.name).join(', '));
      console.log('[Plan B] Numbers found:', foundDecimalNumbers.join(', '));

      const usedRoomNames = new Set();
      const dimensionPool = [...foundDecimalNumbers]; // نسخة قابلة للحذف
      
      // 2. ربط كل غرفة بأبعادها
      for (let i = 0; i < foundRooms.length; i++) {
        const room = foundRooms[i];
        
        const baseCount = [...usedRoomNames].filter(n => n.startsWith(room.name)).length;
        const finalName = baseCount === 0 ? room.name : `${room.name} ${baseCount + 1}`;
        usedRoomNames.add(room.name + (baseCount || ''));
        
        let area = 16, w = null, h = null, confidence = 'estimated';
        
        if (dimensionPool.length >= 2) {
          w = dimensionPool.shift();
          h = dimensionPool.shift();
          area = parseFloat((w * h).toFixed(2));
          confidence = 'high';
        } else if (dimensionPool.length === 1) {
          w = dimensionPool.shift();
          area = parseFloat((w * w).toFixed(2));
          confidence = 'high';
        }

        rooms.push({ name: finalName, area, width: w, height: h, category: room.cat, confidence });
      }
    }

    let usedFallback = false;
    if (rooms.length < 2) {
      usedFallback = true;
      rooms = [
        { name: 'مجلس رجال', area: 24, category: 'معيشة', confidence: 'estimated' },
        { name: 'صالة معيشة', area: 20, category: 'معيشة', confidence: 'estimated' },
        { name: 'مطبخ', area: 16, category: 'خدمات', confidence: 'estimated' },
        { name: 'غرفة نوم 1', area: 16, category: 'نوم', confidence: 'estimated' },
        { name: 'غرفة نوم 2', area: 16, category: 'نوم', confidence: 'estimated' },
        { name: 'حمام رئيسي', area: 6, category: 'صحي', confidence: 'estimated' },
      ];
    }

    const totalArea = parseFloat(rooms.reduce((s, r) => s + r.area, 0).toFixed(1));
    const measurements = buildBOQ(rooms, totalArea);
    onProgress?.(100, '✅ اكتمل التحليل!');

    const highConf = rooms.filter(r => r.confidence === 'high').length;
    results.rooms = rooms;
    results.measurements = measurements;
    results.totalArea = totalArea;
    // النص الخام يساعد في التشخيص - افتح Electron DevTools لرؤيته
    results.ocrDebug = { wordCount: words.length, rawText: rawText.slice(0, 200), numberCount: numbers.length };
    results.summary = usedFallback
      ? `⚠️ OCR قرأ ${words.length} كلمة و${numbers.length} رقم لكن لم تُطابق غرف | تحقق من Electron Console`
      : `✅ اكتُشف ${rooms.length} غرف (${highConf} بأبعاد حقيقية) من ${numbers.length} رقم`;

    return results;

  } catch (err) {
    console.error('[AI Analyzer Error]:', err);
    results.error = err.message;
    results.summary = `خطأ: ${err.message}`;
    onProgress?.(100, `خطأ: ${err.message}`);
    return results;
  }
};
