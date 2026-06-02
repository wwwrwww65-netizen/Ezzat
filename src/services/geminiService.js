/**
 * خدمة Gemini Vision API
 * مهمة الذكاء الاصطناعي: قراءة المخطط واستخراج المساحات والأبعاد فقط.
 * مهمة الحساب: يقوم بها calculationEngine.js بدقة 100% من قاعدة البيانات.
 */

const GEMINI_API_KEY = ''; // Removed hardcoded key. Read from Settings DB.

// قائمة النماذج البديلة - يجرب النظام الأول فإذا كان مزدحماً انتقل للتالي
const GEMINI_MODELS = [
  'gemini-2.5-flash',       // الأفضل - يجرب أولاً
  'gemini-2.0-flash',       // بديل جيد
  'gemini-2.0-flash-lite',  // أخف وأقل عرضة لـ rate limit
];

/**
 * المرحلة الأولى: استخراج البيانات المكانية من صورة المخطط فقط.
 * لا يُطلب من الذكاء الاصطناعي أي حسابات مالية أو كميات مواد.
 */
export const analyzeWithGemini = async (imageDataUrls, config, onProgress) => {
  try {
    if (onProgress) onProgress(5, 'جاري تحضير المخططات وجلب الإعدادات...');

    let currentApiKey = GEMINI_API_KEY;
    if (window.electronAPI) {
      try {
        const rows = await window.electronAPI.queryDb("SELECT value FROM settings WHERE key='geminiApiKey'");
        if (rows && rows.length > 0 && rows[0].value) {
          currentApiKey = rows[0].value;
        }
      } catch (e) {
        console.error('Failed to load API key from DB:', e);
      }
    }

    if (!currentApiKey) {
      throw new Error('مفتاح API غير متوفر. الرجاء إضافته من صفحة الإعدادات.');
    }

    if (onProgress) onProgress(10, 'جاري تحضير المخططات...');

    // عدد الأدوار من الإعدادات
    const buildingInfo = config['معلومات_المبنى'] || [];
    const floorsLine = buildingInfo.find(l => l.includes('عدد الأدوار')) || '';
    const floorsMatch = floorsLine.match(/(\d+)/);
    const numFloors = floorsMatch ? parseInt(floorsMatch[1]) : 1;
    const hasBasement = buildingInfo.some(l => l.includes('يوجد بدروم'));
    const hasRoof = buildingInfo.some(l => l.includes('يوجد ملحق علوي'));

const SPATIAL_EXTRACTION_PROMPT = `أنت خبير في قراءة المخططات الهندسية ومدير مشاريع محترف. مهمتك هي استخراج البيانات المكانية من المخطط واقتراح جدول تنفيذي متسلسل للمشروع.

لا تقم بأي حسابات مالية. اقرأ المخطط واستخرج:
1. مجموع مساحة الدور الواحد (من مجموع مساحات الغرف أو الأبعاد الكلية).
2. قائمة الغرف مع اسم كل غرفة ومساحتها المقروءة من المخطط مباشرة.
3. المحيط التقريبي للمبنى (بالمتر).
4. ارتفاع الدور الواحد (القياسي 3 متر إن لم يُذكر).
5. عدد الحمامات، الغرف، المداخل.
6. جدولاً زمنياً متسلسلاً للمشروع (Construction Schedule Phases) يوضح متى تبدأ وتنتهي كل مرحلة حقيقية بناءً على حجم وتفاصيل هذا المخطط تحديداً، مع إعطاء نسب البداية والنهاية لكل مهمة (من 0.0 إلى 1.0).

معلومات إضافية من المستخدم:
- عدد الأدوار المطلوبة: ${numFloors}
- يوجد بدروم: ${hasBasement ? 'نعم' : 'لا'}
- يوجد ملحق علوي (روف): ${hasRoof ? 'نعم' : 'لا'}

أخرج النتيجة كـ JSON صارم بهذا الهيكل فقط:
{
  "singleFloorArea": المساحة الصافية للدور الواحد (م2، رقم),
  "totalBuildArea": إجمالي المساحة لكل الأدوار (م2، رقم) = singleFloorArea × numFloors + بدروم إن وجد + روف إن وجد,
  "perimeter": المحيط التقريبي للمبنى (م، رقم),
  "floorHeight": ارتفاع الدور (م، رقم، افتراضي 3),
  "bathroomCount": عدد الحمامات (رقم),
  "bedroomCount": عدد غرف النوم (رقم),
  "doorCount": عدد الأبواب التقريبي (رقم),
  "windowCount": عدد النوافذ التقريبي (رقم),
  "rooms": [
    { "name": "اسم الغرفة", "area": المساحة_بالمتر_المربع, "category": "نوم/معيشة/حمام/مطبخ/ممر/أخرى", "confidence": "high/medium" }
  ],
  "proposed_schedule": [
    { "phase_name": "اسم المرحلة أو المهمة (مثل: تخطيط وحفر، أعمال العظم، سباكة، تشطيبات)", "start_ratio": 0.0, "end_ratio": 0.15 }
  ],
  "readingConfidence": "high/medium/low",
  "notes": "أي ملاحظات على جودة المخطط أو صعوبات القراءة"
}`;

    const requestParts = [{ text: SPATIAL_EXTRACTION_PROMPT }];

    for (const dataUrl of imageDataUrls) {
      const base64Data = dataUrl.split(',')[1];
      let mimeType = 'image/jpeg';
      if (dataUrl.startsWith('data:')) {
        mimeType = dataUrl.split(';')[0].split(':')[1];
      }
      requestParts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      });
    }

    if (onProgress) onProgress(30, 'جاري إرسال المخطط للذكاء الاصطناعي لاستخراج المساحات...');

    const requestBody = {
      contents: [{ parts: requestParts }],
      generationConfig: {
        temperature: 0,
        response_mime_type: "application/json"
      }
    };

    let response;
    let currentModelIndex = 0;
    let retries = 2; // محاولتان لكل نموذج
    let delay = 2000;

    // محاكاة تقدم بطيء لإشعار المستخدم أن النظام يعمل
    let currentProgress = 30;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 2;
      if (currentProgress < 68) {
        if (onProgress) onProgress(Math.floor(currentProgress), 'الذكاء الاصطناعي يقرأ المساحات (قد يستغرق بضع ثواني)...');
      }
    }, 800);

    // حلقة تجرب النماذج بالترتيب عند الازدحام
    while (currentModelIndex < GEMINI_MODELS.length) {
      const model = GEMINI_MODELS[currentModelIndex];
      const modelApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentApiKey}`;
      try {
        if (onProgress) onProgress(currentProgress, `جاري المحاولة بنموذج ${model}...`);
        response = await fetch(modelApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) break; // نجح، اخرج من الحلقة

        if (response.status === 503 || response.status === 429) {
          retries--;
          // 429 = تجاوز الحد - يحتاج وقت أطول
          const waitTime = response.status === 429 ? delay * 3 : delay;
          if (retries > 0) {
            const msg = response.status === 429
              ? `${model}: تجاوز حد الطلبات، انتظار ${Math.round(waitTime/1000)}ث...`
              : `${model} مزدحم، إعادة المحاولة...`;
            if (onProgress) onProgress(currentProgress, msg);
            await new Promise(r => setTimeout(r, waitTime));
            delay *= 2;
          } else {
            // انتقل للنموذج التالي
            currentModelIndex++;
            retries = 2;
            delay = 3000;
            if (currentModelIndex < GEMINI_MODELS.length) {
              if (onProgress) onProgress(currentProgress, `الانتقال للنموذج البديل: ${GEMINI_MODELS[currentModelIndex]}...`);
              await new Promise(r => setTimeout(r, 2000)); // انتظر قبل النموذج الجديد
            }
          }
        } else {
          // خطأ غير متوقع (مثل 404) - انتقل للنموذج التالي مباشرة
          currentModelIndex++;
          retries = 2;
          delay = 3000;
        }
      } catch (err) {
        currentModelIndex++; // مشكلة شبكة، جرب النموذج التالي
        retries = 2;
      }
    }

    clearInterval(progressInterval);

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'Network error';
      throw new Error(`API Error: ${response?.status || 'Unknown'} - ${errorText}`);
    }

    if (onProgress) onProgress(75, 'تم استخراج البيانات المكانية، جاري قراءة النتائج...');

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const spatialData = JSON.parse(text);

    if (onProgress) onProgress(100, '✅ اكتمل استخراج بيانات المخطط!');

    return {
      spatialData,
      error: null
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    if (onProgress) onProgress(100, `خطأ: ${error.message}`);
    return {
      spatialData: null,
      error: error.message
    };
  }
};
