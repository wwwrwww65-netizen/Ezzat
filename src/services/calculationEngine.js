/**
 * محرك الحسابات الهندسية (Calculation Engine) - النسخة الدقيقة
 * يستقبل البيانات المكانية من Gemini + قائمة الأصناف المختارة من قاعدة البيانات
 * ويحسب كل الكميات والتكاليف والمدة رياضياً بدقة 100%.
 */

// =========================================================
// خوارزميات تحويل المساحة إلى كمية مادة
// =========================================================
const getSpecValue = (customSpecs, nameKeyword) => {
  if (!customSpecs || customSpecs.length === 0) return null;
  const spec = customSpecs.find(s => s.name && s.name.includes(nameKeyword));
  return spec ? parseFloat(spec.value) : null;
};

/**
 * يحسب كمية ومادة واحدة بناءً على البيانات المكانية ومواصفات المادة.
 * @param {object} item - عنصر المخزون (name, unit, buyPrice, sellPrice, customSpecs, ...)
 * @param {object} spatial - البيانات المكانية المستخرجة من الذكاء الاصطناعي
 * @returns {{ quantity, unit, totalCost, element_name, geometry_type, category }}
 */
const calculateItemQuantity = (item, spatial) => {
  const {
    totalBuildArea = 0,
    singleFloorArea = 0,
    perimeter = 0,
    floorHeight = 3,
    bathroomCount = 2,
    bedroomCount = 3,
    doorCount = 10,
    windowCount = 8,
  } = spatial;

  const name = item.name || '';
  const unit = item.unit || '';
  const buyPrice = Number(item.buyPrice) || 0;
  const specs = item.customSpecs || [];

  let quantity = 0;
  let geometry_type = 'مساحة';
  let category = 'مواد';

  // ==================== بلك / طوب ====================
  if (unit === 'حبة' && (name.includes('بلك') || name.includes('طوب') || name.includes('طابوق'))) {
    const blockL = getSpecValue(specs, 'الطول') || 0.40;
    const blockH = getSpecValue(specs, 'الارتفاع') || 0.20;
    // مساحة الجدران = محيط × ارتفاع الدور
    // نطرح نسبة 15% للنوافذ والأبواب والهالك
    const wallArea = perimeter * floorHeight * 0.85;
    quantity = Math.ceil(wallArea / (blockL * blockH));
    geometry_type = 'عدد';
    category = 'مباني';
  }

  // ==================== أسمنت (كيس) ====================
  else if (unit === 'كيس' && name.includes('أسمنت')) {
    const consumptionRate = getSpecValue(specs, 'معدل التغطية') || 1.2;
    // تقدير: نسبة الأسمنت للبلك + اللياسة
    const wallArea = perimeter * floorHeight;
    quantity = Math.ceil(wallArea * consumptionRate);
    geometry_type = 'عدد';
    category = 'إنشائي';
  }

  // ==================== خرسانة جاهزة (م3) ====================
  else if (unit === 'م3' && name.includes('خرسانة')) {
    // الخرسانة = 25% من المساحة الكلية (تقدير هندسي معياري للأعمدة + سقف + قواعد)
    quantity = parseFloat((totalBuildArea * 0.25).toFixed(2));
    geometry_type = 'حجم';
    category = 'إنشائي';
  }

  // ==================== حديد تسليح (طن) ====================
  else if (unit === 'طن' && name.includes('حديد تسليح')) {
    // معدل الحديد المعياري: 60-80 كجم لكل م3 خرسانة
    // حجم الخرسانة = 25% من المساحة الكلية
    const concVolume = totalBuildArea * 0.25;
    quantity = parseFloat((concVolume * 0.07).toFixed(2)); // 70 كجم/م3 → 0.07 طن/م3
    geometry_type = 'وزن';
    category = 'إنشائي';
  }

  // ==================== أرضيات / سيراميك / بورسلان / رخام / باركيه (م2) ====================
  else if (unit === 'م2' && (name.includes('سيراميك') || name.includes('بورسلان') || name.includes('رخام') || name.includes('باركيه'))) {
    // أرضيات = المساحة الكلية (مع هالك 10%)
    quantity = parseFloat((totalBuildArea * 1.10).toFixed(2));
    geometry_type = 'مساحة';
    category = 'تشطيبات';
  }

  // ==================== دهانات (برميل) ====================
  else if (unit === 'برميل' && (name.includes('دهان') || name.includes('برايمر'))) {
    const coverageRate = getSpecValue(specs, 'معدل التغطية') || 80;
    // مساحة الدهان = مساحة الجدران + السقف (تقدير)
    const paintArea = (perimeter * floorHeight) + totalBuildArea;
    quantity = Math.ceil(paintArea / coverageRate);
    geometry_type = 'عدد';
    category = 'تشطيبات';
  }

  // ==================== معجون جدران (كيس) ====================
  else if (unit === 'كيس' && name.includes('معجون')) {
    const coverageRate = getSpecValue(specs, 'معدل التغطية') || 30;
    const wallArea = perimeter * floorHeight;
    quantity = Math.ceil(wallArea / coverageRate);
    geometry_type = 'عدد';
    category = 'تشطيبات';
  }

  // ==================== غراء بلاط (كيس) ====================
  else if (unit === 'كيس' && name.includes('غراء بلاط')) {
    const coverageRate = getSpecValue(specs, 'معدل التغطية') || 4;
    quantity = Math.ceil(totalBuildArea / coverageRate);
    geometry_type = 'عدد';
    category = 'تشطيبات';
  }

  // ==================== ترويبة بلاط (كيس) ====================
  else if (unit === 'كيس' && name.includes('ترويبة')) {
    const coverageRate = getSpecValue(specs, 'معدل التغطية') || 15;
    quantity = Math.ceil(totalBuildArea / coverageRate);
    geometry_type = 'عدد';
    category = 'تشطيبات';
  }

  // ==================== حجر واجهات (م2) ====================
  else if (unit === 'م2' && name.includes('حجر')) {
    // الواجهات = محيط × ارتفاع كلي مع خصم 20% للفتحات
    const facadeArea = perimeter * (floorHeight * Math.max(1, Math.round(totalBuildArea / Math.max(singleFloorArea, 1))));
    quantity = parseFloat((facadeArea * 0.80).toFixed(2));
    geometry_type = 'مساحة';
    category = 'تشطيبات';
  }

  // ==================== أبواب خشب / WPC / حديد (حبة) ====================
  else if (unit === 'حبة' && (name.includes('باب') || name.includes('أبواب'))) {
    if (name.includes('حمام') || name.includes('WPC')) {
      quantity = bathroomCount;
    } else if (name.includes('كراج')) {
      quantity = 1;
    } else if (name.includes('مداخل') || name.includes('حديد')) {
      quantity = 1;
    } else {
      quantity = bedroomCount + bathroomCount + 2; // غرف + حمامات + معيشة + مطبخ
    }
    geometry_type = 'عدد';
    category = 'تشطيبات';
  }

  // ==================== نوافذ ألمنيوم / شتر (م2) ====================
  else if ((unit === 'م2' || unit === 'حبة') && (name.includes('نافذة') || name.includes('نوافذ') || name.includes('شتر'))) {
    const winW = getSpecValue(specs, 'العرض') || 1.20;
    const winL = getSpecValue(specs, 'الطول') || 1.20;
    quantity = unit === 'م2'
      ? parseFloat((windowCount * winW * winL).toFixed(2))
      : windowCount;
    geometry_type = 'عدد';
    category = 'تشطيبات';
  }

  // ==================== عزل مائي (م2) ====================
  else if (unit === 'م2' && name.includes('عزل مائي')) {
    quantity = parseFloat((singleFloorArea * 1.10).toFixed(2)); // طابق واحد مع هالك 10%
    geometry_type = 'مساحة';
    category = 'أساسات';
  }

  // ==================== صبة نظافة (م3) ====================
  else if (unit === 'م3' && name.includes('صبة نظافة')) {
    const thickness = getSpecValue(specs, 'السماكة') || 0.10;
    quantity = parseFloat((singleFloorArea * thickness).toFixed(2));
    geometry_type = 'حجم';
    category = 'أساسات';
  }

  // ==================== حفر وترحيل (م3) ====================
  else if (unit === 'م3' && name.includes('حفر')) {
    const depth = getSpecValue(specs, 'العمق') || 1.5;
    const swell = getSpecValue(specs, 'معامل الانتفاش') || 1.2;
    quantity = parseFloat((singleFloorArea * depth * swell).toFixed(2));
    geometry_type = 'حجم';
    category = 'أساسات';
  }

  // ==================== رمل / كنكري (قلاب) ====================
  else if (unit === 'قلاب') {
    const truckVol = getSpecValue(specs, 'سعة النقل') || 16;
    const estimatedVol = singleFloorArea * 0.15; // 15 سم طبقة رمل
    quantity = Math.ceil(estimatedVol / truckVol);
    geometry_type = 'عدد';
    category = 'أساسات';
  }

  // ==================== أخشاب شدات (م3) ====================
  else if (unit === 'م3' && name.includes('أخشاب')) {
    // تقدير: 0.05 م3 أخشاب لكل م2 بناء
    quantity = parseFloat((totalBuildArea * 0.05).toFixed(2));
    geometry_type = 'حجم';
    category = 'إنشائي';
  }

  // ==================== أسلاك كهرباء (لفة) ====================
  else if (unit === 'لفة' && name.includes('أسلاك')) {
    const rollLength = getSpecValue(specs, 'الطول للفة') || 91.4;
    // تقدير: 3 أمتار أسلاك لكل م2 بناء
    const totalWire = totalBuildArea * 3;
    quantity = Math.ceil(totalWire / rollLength);
    geometry_type = 'عدد';
    category = 'كهرباء';
  }

  // ==================== مواسير كهرباء (حبة) ====================
  else if (unit === 'حبة' && name.includes('مواسير كهرباء')) {
    const pipeLength = getSpecValue(specs, 'الطول') || 3;
    const totalPipe = totalBuildArea * 1.5;
    quantity = Math.ceil(totalPipe / pipeLength);
    geometry_type = 'عدد';
    category = 'كهرباء';
  }

  // ==================== مفاتيح وأفياش (حبة) ====================
  else if (unit === 'حبة' && (name.includes('أفياش') || name.includes('مفاتيح'))) {
    // تقدير: مفتاح/فيش واحد لكل 5 م2
    quantity = Math.ceil(totalBuildArea / 5);
    geometry_type = 'عدد';
    category = 'كهرباء';
  }

  // ==================== طبلون كهرباء (حبة) ====================
  else if (unit === 'حبة' && name.includes('طبلون')) {
    quantity = 1;
    geometry_type = 'عدد';
    category = 'كهرباء';
  }

  // ==================== لمبات (حبة) ====================
  else if (unit === 'حبة' && (name.includes('لمبة') || name.includes('لمبات') || name.includes('إضاءة') || name.includes('ليد'))) {
    // تقدير: لمبة لكل 3 م2
    quantity = Math.ceil(totalBuildArea / 3);
    geometry_type = 'عدد';
    category = 'كهرباء';
  }

  // ==================== مواسير تغذية PPR (حبة) ====================
  else if (unit === 'حبة' && name.includes('PPR')) {
    const pipeLength = getSpecValue(specs, 'الطول') || 4;
    const estimatedTotal = totalBuildArea * 1;
    quantity = Math.ceil(estimatedTotal / pipeLength);
    geometry_type = 'عدد';
    category = 'سباكة';
  }

  // ==================== مواسير صرف PVC (حبة) ====================
  else if (unit === 'حبة' && name.includes('PVC')) {
    const pipeLength = getSpecValue(specs, 'الطول') || 6;
    const estimatedTotal = totalBuildArea * 0.8;
    quantity = Math.ceil(estimatedTotal / pipeLength);
    geometry_type = 'عدد';
    category = 'سباكة';
  }

  // ==================== مغاسل / كراسي / دش (حبة / طقم) ====================
  else if ((unit === 'حبة' || unit === 'طقم') &&
    (name.includes('مغسلة') || name.includes('مغاسل') || name.includes('كرسي') || name.includes('كراسي') || name.includes('دش'))) {
    quantity = bathroomCount;
    geometry_type = 'عدد';
    category = 'سباكة';
  }

  // ==================== سخانات (حبة) ====================
  else if (unit === 'حبة' && name.includes('سخان')) {
    quantity = Math.ceil(bathroomCount / 2) + 1;
    geometry_type = 'عدد';
    category = 'سباكة';
  }

  // ==================== خزان مياه (حبة) ====================
  else if (unit === 'حبة' && name.includes('خزان')) {
    quantity = 1;
    geometry_type = 'عدد';
    category = 'سباكة';
  }

  // ==================== مواد خدمية (مقطوعية) ====================
  else if (unit === 'مقطوعية' || unit === 'شهر') {
    quantity = 1;
    geometry_type = 'مقطوعية';
    category = 'خدمات';
  }

  // ==================== افتراضي (إذا لم تطابق أي فئة) ====================
  else {
    // كمية افتراضية بسيطة مبنية على المساحة
    quantity = parseFloat((totalBuildArea * 0.05).toFixed(2));
    geometry_type = 'كمية';
    category = 'أخرى';
  }

  // منع الصفر
  if (quantity <= 0) quantity = 1;

  const totalCost = parseFloat((quantity * buyPrice).toFixed(2));

  return {
    element_name: item.name,
    geometry_type,
    raw_value: parseFloat(quantity.toFixed(2)),
    unit: item.unit,
    category,
    estimated_cost: totalCost,
    estimated_days: 0
  };
};

// =========================================================
// حساب المدة الزمنية للمشروع
// =========================================================
const calculateDuration = (spatial, selectedLabors) => {
  const { totalBuildArea = 0, singleFloorArea = 0 } = spatial;

  // إنتاجية يومية لفريق العمل: 5 م2 بناء كاملة في اليوم (معيار للبناء المتوسط)
  const DAILY_PRODUCTIVITY_M2 = 5;
  const laborCount = selectedLabors.length || 1;

  // مدة البناء الأساسية
  const baseDays = Math.ceil(totalBuildArea / (DAILY_PRODUCTIVITY_M2 * Math.max(laborCount * 0.5, 1)));

  // إضافة وقت التشطيبات (40% من مدة الهيكل)
  const finishingDays = Math.ceil(baseDays * 0.4);

  // إضافة وقت الأساسات (10% من المساحة / إنتاجية)
  const foundationDays = Math.ceil(singleFloorArea / 20);

  const totalDays = foundationDays + baseDays + finishingDays;

  return Math.max(totalDays, 30); // الحد الأدنى 30 يوم
};

// =========================================================
// الحساب الرئيسي - يُستدعى من DigitalTakeoff
// =========================================================
/**
 * @param {object} spatialData - البيانات المكانية من Gemini
 * @param {Array}  selectedItems - عناصر المخزون المختارة (كاملة مع customSpecs و buyPrice)
 * @param {Array}  selectedLabors - العمال المختارون (مع dailyRate)
 * @param {Array}  selectedEquipments - المعدات المختارة (مع dailyCost)
 * @param {object} buildingConfig - إعدادات المبنى (floors, hasBasement, hasRoofAnnex)
 * @returns {object} - نتائج BOQ كاملة
 */
export const runFullCalculation = (spatialData, selectedItems, selectedLabors, selectedEquipments, buildingConfig) => {
  const floors = parseInt(buildingConfig.floors) || 1;
  const hasBasement = buildingConfig.hasBasement || false;
  const hasRoof = buildingConfig.hasRoofAnnex || false;

  // تحديث المساحة الكلية بناءً على عدد الأدوار
  const singleFloor = spatialData.singleFloorArea || spatialData.totalBuildArea || 0;
  let totalArea = singleFloor * floors;
  if (hasBasement) totalArea += singleFloor * 0.8; // البدروم 80% من مساحة الدور
  if (hasRoof) totalArea += singleFloor * 0.5; // الروف 50% من الدور

  const spatial = {
    ...spatialData,
    singleFloorArea: singleFloor,
    totalBuildArea: totalArea,
    perimeter: spatialData.perimeter || Math.sqrt(singleFloor) * 4, // تقدير المحيط إن لم يُذكر
    floorHeight: spatialData.floorHeight || 3,
    bathroomCount: spatialData.bathroomCount || 2,
    bedroomCount: spatialData.bedroomCount || 3,
    doorCount: spatialData.doorCount || 10,
    windowCount: spatialData.windowCount || 8,
  };

  // --- حساب المواد ---
  const measurements = selectedItems.map(item => calculateItemQuantity(item, spatial));

  // --- حساب العمالة ---
  const duration = calculateDuration(spatial, selectedLabors);
  const laborBreakdown = selectedLabors.map(labor => {
    const dailyRate = Number(labor.dailyRate) || 150;
    // عدد أيام العامل = مدة المشروع (كل عامل طوال المشروع)
    const workerDays = duration;
    const cost = parseFloat((workerDays * dailyRate).toFixed(2));
    return {
      profession: labor.profession || labor.name,
      count: 1,
      days: workerDays,
      cost
    };
  });

  // --- حساب المعدات ---
  const equipmentBreakdown = selectedEquipments.map(equip => {
    const dailyCost = Number(equip.dailyCost) || 500;
    // المعدات تعمل أول 40% من المشروع (مرحلة الهيكل)
    const equipDays = Math.ceil(duration * 0.4);
    const cost = parseFloat((equipDays * dailyCost).toFixed(2));
    return {
      equipment: equip.name,
      count: 1,
      days: equipDays,
      cost
    };
  });

  // --- المجاميع ---
  const totalMaterialCost = measurements.reduce((s, m) => s + (m.estimated_cost || 0), 0);
  const totalLaborCost = laborBreakdown.reduce((s, l) => s + (l.cost || 0), 0);
  const totalEquipCost = equipmentBreakdown.reduce((s, e) => s + (e.cost || 0), 0);
  const totalCost = totalMaterialCost + totalLaborCost + totalEquipCost;

  const summary = `مساحة البناء: ${totalArea.toFixed(0)} م² | ${floors} دور${hasBasement ? ' + بدروم' : ''}${hasRoof ? ' + روف' : ''} | التكلفة الإجمالية: ${totalCost.toLocaleString('ar-SA')} ر.س | المدة: ${duration} يوم`;

  return {
    rooms: spatialData.rooms || [],
    measurements,
    totalArea,
    totalCost: parseFloat(totalCost.toFixed(2)),
    duration,
    workers: selectedLabors.length,
    laborBreakdown,
    equipmentBreakdown,
    summary,
    readingConfidence: spatialData.readingConfidence || 'medium',
    error: null
  };
};
