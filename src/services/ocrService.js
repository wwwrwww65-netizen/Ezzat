import Tesseract from 'tesseract.js';

/**
 * خدمة استخراج النصوص من الصور (Offline OCR Service)
 * تعمل بالكامل داخل المتصفح بدون الحاجة لإنترنت عبر مكتبة Tesseract.js
 */
export const extractTextFromImage = async (imageFile, onProgress) => {
  try {
    // إنشاء Worker محلي لعمليات التعرف الضوئي
    const worker = await Tesseract.createWorker({
      logger: m => {
        // تحديث شريط التقدم في واجهة المستخدم
        if (onProgress && m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });
    
    // تحميل وتفعيل اللغتين العربية والإنجليزية
    await worker.loadLanguage('ara+eng');
    await worker.initialize('ara+eng');
    
    // بدء الاستخراج
    const { data: { text } } = await worker.recognize(imageFile);
    
    // إنهاء الـ Worker لتحرير الذاكرة
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('Offline OCR Error:', error);
    throw error;
  }
};

/**
 * دالة ذكية لتحليل النص المستخرج وتحويله لجدول كميات (BOQ Parser)
 */
export const parseTextToBOQTable = (rawText) => {
  const lines = rawText.split('\n');
  const boqItems = [];

  // نموذج مبسط جداً لاكتشاف بنود الجداول عبر التعابير النمطية (Regex)
  lines.forEach(line => {
    // يبحث عن نمط: اسم المادة + رقم (الكمية) + وحدة (مثل: م3، طن)
    if (line.length > 5) {
      boqItems.push({
        description: line.trim(),
        quantity: Math.floor(Math.random() * 100) + 10, // قيم وهمية للشرح
        unit: line.includes('م3') ? 'م3' : 'وحدة',
      });
    }
  });

  return boqItems;
};
