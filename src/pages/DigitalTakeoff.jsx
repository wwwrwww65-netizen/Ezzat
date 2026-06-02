import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as fabricModule from 'fabric';
const fabric = fabricModule.fabric || fabricModule;

import { Upload, Square, Ruler, MousePointer2, Move, Maximize, FileText, Check, Sparkles, X, AlertCircle, Building, DollarSign, TrendingUp, Clock, Users, Printer, HardHat, PenTool, Database } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { runFullCalculation } from '../services/calculationEngine';
import { analyzeWithGemini } from '../services/geminiService';
import { Select } from '../components/UI';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
export default function DigitalTakeoff() {
  const canvasElementRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // States
  const [currentTool, setCurrentTool] = useState('select');
  const [measurements, setMeasurements] = useState([]);
  
  // AI Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiProgressMsg, setAiProgressMsg] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  // كاش نتائج Gemini المكانية - مفتاحه بصمة الصورة لضمان نفس النتائج عند إعادة التحليل
  const spatialCacheRef = React.useRef({});
  // AI Configuration States with LocalStorage Persistence
  const [showConfigModal, setShowConfigModal] = useState(false);

  // SQLite Data States
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [buildingConfig, setBuildingConfig] = useState(() => {
    const saved = localStorage.getItem('takeoff_buildingConfig');
    return saved ? JSON.parse(saved) : { floors: 1, hasBasement: false, hasRoofAnnex: false };
  });

  const [selectedItemIds, setSelectedItemIds] = useState(() => {
    const saved = localStorage.getItem('takeoff_selectedItemIds');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedLaborIds, setSelectedLaborIds] = useState(() => {
    const saved = localStorage.getItem('takeoff_selectedLaborIds');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedEquipIds, setSelectedEquipIds] = useState(() => {
    const saved = localStorage.getItem('takeoff_selectedEquipIds');
    return saved ? JSON.parse(saved) : [];
  });

  const [projectDuration, setProjectDuration] = useState(() => {
    return Number(localStorage.getItem('takeoff_project_duration')) || 45;
  });

  const laborList = (employees || []).filter(e => e.role === 'labor' || e.role === 'supervisor');

  // Select all items by default ONLY IF there is no saved selection
  useEffect(() => {
    if (inventory && inventory.length > 0 && selectedItemIds.length === 0 && !localStorage.getItem('takeoff_selectedItemIds')) {
      setSelectedItemIds(inventory.map(i => i.id));
    }
    if (laborList && laborList.length > 0 && selectedLaborIds.length === 0 && !localStorage.getItem('takeoff_selectedLaborIds')) {
      setSelectedLaborIds(laborList.map(l => l.id));
    }
    if (equipment && equipment.length > 0 && selectedEquipIds.length === 0 && !localStorage.getItem('takeoff_selectedEquipIds')) {
      setSelectedEquipIds(equipment.map(e => e.id));
    }
  }, [inventory, employees, equipment]);

  // Save to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('takeoff_buildingConfig', JSON.stringify(buildingConfig));
  }, [buildingConfig]);

  useEffect(() => {
    if (selectedItemIds.length > 0) localStorage.setItem('takeoff_selectedItemIds', JSON.stringify(selectedItemIds));
  }, [selectedItemIds]);

  useEffect(() => {
    if (selectedLaborIds.length > 0) localStorage.setItem('takeoff_selectedLaborIds', JSON.stringify(selectedLaborIds));
  }, [selectedLaborIds]);

  useEffect(() => {
    if (selectedEquipIds.length > 0) localStorage.setItem('takeoff_selectedEquipIds', JSON.stringify(selectedEquipIds));
  }, [selectedEquipIds]);

  const handleToggleMaterial = (id) => setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleToggleLabor = (id) => setSelectedLaborIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleToggleEquip = (id) => setSelectedEquipIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  
  // Fetch initial measurements and catalogs from SQLite
  useEffect(() => {
    const fetchAllData = async () => {
      if (window.electronAPI) {
        try {
          const prjs = await window.electronAPI.queryDb('SELECT id, name FROM projects ORDER BY id DESC');
          setProjects(prjs || []);
          if (prjs && prjs.length > 0) setSelectedProject(prjs[0].id);

          const cats = await window.electronAPI.queryDb('SELECT * FROM categories');
          setCategories(cats || []);

          const mats = await window.electronAPI.queryDb('SELECT * FROM materials_catalog');
          setInventory(mats || []);

          const staff = await window.electronAPI.queryDb('SELECT * FROM staff');
          setEmployees(staff || []);

          const equips = await window.electronAPI.queryDb('SELECT * FROM equipment');
          setEquipment(equips || []);
        } catch(e) {
          console.error(e);
        }
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!selectedProject || !window.electronAPI) return;
    const fetchMeasurements = async () => {
      try {
        const rows = await window.electronAPI.queryDb('SELECT * FROM takeoff_measurements WHERE project_id = ? ORDER BY id DESC', [selectedProject]);
        setMeasurements(rows || []);
      } catch(e) { console.error(e); }
    };
    fetchMeasurements();
  }, [selectedProject]);
  
  // Scale Calibration
  const [scaleFactor, setScaleFactor] = useState(100); // 100 px = 1 meter default
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);
  const [calibrationPxData, setCalibrationPxData] = useState(0);
  const [realWorldLength, setRealWorldLength] = useState('');

  // Drawing Refs
  const isDrawing = useRef(false);
  const isPanning = useRef(false);
  const lastPosX = useRef(0);
  const lastPosY = useRef(0);
  
  // Line Tool Refs
  const linePath = useRef(null);
  
  // Polygon Tool Refs
  const polygonPoints = useRef([]);
  const polygonLines = useRef([]);
  const activeLine = useRef(null);
  const activeShape = useRef(null);

  useEffect(() => {
    const initCanvas = new fabric.Canvas(canvasElementRef.current, {
      width: 800,
      height: 600,
      selection: false,
      preserveObjectStacking: true // Keep drawings above background
    });

    // --- Zoom Implementation (Scroll) ---
    initCanvas.on('mouse:wheel', function(opt) {
      const delta = opt.e.deltaY;
      let zoom = initCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.1) zoom = 0.1;
      initCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    setFabricCanvas(initCanvas);
    return () => initCanvas.dispose();
  }, []);

  const handlePdfUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = [];
    
    for (const file of files) {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        for (let i = 1; i <= loadedPdf.numPages; i++) {
          const page = await loadedPdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const hiddenCanvas = document.createElement('canvas');
          const ctx = hiddenCanvas.getContext('2d');
          hiddenCanvas.height = viewport.height;
          hiddenCanvas.width = viewport.width;
          await page.render({ canvasContext: ctx, viewport }).promise;
          newImages.push(hiddenCanvas.toDataURL('image/jpeg', 0.8)); // 0.8 to compress slightly
        }
      } else if (file.type.startsWith('image/')) {
        const dataUrl = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = ev => resolve(ev.target.result);
          reader.readAsDataURL(file);
        });
        newImages.push(dataUrl);
      }
    }

    if (newImages.length > 0) {
      setUploadedImages(prev => [...prev, ...newImages]);
      setPdfDoc(true);
      
      // Load the first image into canvas for preview
      fabric.Image.fromURL(newImages[0]).then((img) => {
        fabricCanvas.setDimensions({ width: img.width, height: img.height });
        img.set({ originX: 'left', originY: 'top' });
        fabricCanvas.backgroundImage = img;
        fabricCanvas.requestRenderAll();
        setCurrentImageIndex(0);
      });
    }
  };

  const loadPreviewImage = (index) => {
    if (!uploadedImages[index]) return;
    fabric.Image.fromURL(uploadedImages[index]).then((img) => {
      fabricCanvas.setDimensions({ width: img.width, height: img.height });
      img.set({ originX: 'left', originY: 'top' });
      fabricCanvas.backgroundImage = img;
      fabricCanvas.requestRenderAll();
      setCurrentImageIndex(index);
    });
  };

  useEffect(() => {
    if (!fabricCanvas) return;

    // Reset interactions
    fabricCanvas.off('mouse:down');
    fabricCanvas.off('mouse:move');
    fabricCanvas.off('mouse:up');
    fabricCanvas.off('object:moving');

    fabricCanvas.getObjects().forEach(obj => obj.set('selectable', currentTool === 'select'));

    // --- Pan Tool ---
    if (currentTool === 'pan') {
      fabricCanvas.defaultCursor = 'grab';
      fabricCanvas.on('mouse:down', function(opt) {
        const evt = opt.e;
        isPanning.current = true;
        fabricCanvas.setCursor('grabbing');
        lastPosX.current = evt.clientX;
        lastPosY.current = evt.clientY;
      });
      fabricCanvas.on('mouse:move', function(opt) {
        if (isPanning.current) {
          const e = opt.e;
          const vpt = fabricCanvas.viewportTransform;
          vpt[4] += e.clientX - lastPosX.current;
          vpt[5] += e.clientY - lastPosY.current;
          fabricCanvas.requestRenderAll();
          lastPosX.current = e.clientX;
          lastPosY.current = e.clientY;
        }
      });
      fabricCanvas.on('mouse:up', function() {
        isPanning.current = false;
        fabricCanvas.setCursor('grab');
      });
    }

    // --- Calibrate or Line Tool ---
    else if (currentTool === 'line' || currentTool === 'calibrate') {
      fabricCanvas.defaultCursor = 'crosshair';
      fabricCanvas.on('mouse:down', (o) => {
        isDrawing.current = true;
        const pointer = o.scenePoint;
        linePath.current = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          strokeWidth: currentTool === 'calibrate' ? 3 : 4, 
          fill: currentTool === 'calibrate' ? '#3b82f6' : '#ef4444', 
          stroke: currentTool === 'calibrate' ? '#3b82f6' : '#ef4444', 
          originX: 'center', originY: 'center', selectable: false
        });
        fabricCanvas.add(linePath.current);
      });

      fabricCanvas.on('mouse:move', (o) => {
        if (!isDrawing.current) return;
        const pointer = o.scenePoint;
        linePath.current.set({ x2: pointer.x, y2: pointer.y });
        fabricCanvas.renderAll();
      });

      fabricCanvas.on('mouse:up', () => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        linePath.current.setCoords();
        
        const lengthPx = Math.sqrt(
          Math.pow(linePath.current.x2 - linePath.current.x1, 2) + Math.pow(linePath.current.y2 - linePath.current.y1, 2)
        );

        if (currentTool === 'calibrate') {
          setCalibrationPxData(lengthPx);
          setShowCalibrateModal(true);
        } else {
          const lengthMeters = (lengthPx / scaleFactor).toFixed(2);
          saveMeasurement('جدار (طول)', 'طول', lengthMeters, 'متر');
        }
      });
    }

    // --- Polygon Tool ---
    else if (currentTool === 'polygon') {
      fabricCanvas.defaultCursor = 'crosshair';
      
      const finishPolygon = () => {
        if (polygonPoints.current.length > 2) {
          // Remove temp lines
          polygonLines.current.forEach(l => fabricCanvas.remove(l));
          if (activeLine.current) fabricCanvas.remove(activeLine.current);
          if (activeShape.current) fabricCanvas.remove(activeShape.current);

          const poly = new fabric.Polygon(polygonPoints.current, {
            fill: 'rgba(239, 68, 68, 0.3)',
            stroke: '#ef4444',
            strokeWidth: 2,
            selectable: false
          });
          fabricCanvas.add(poly);
          
          // Calculate Area using Shoelace Formula
          let areaPx = 0;
          const pts = polygonPoints.current;
          for (let i = 0; i < pts.length; i++) {
            let j = (i + 1) % pts.length;
            areaPx += pts[i].x * pts[j].y;
            areaPx -= pts[j].x * pts[i].y;
          }
          areaPx = Math.abs(areaPx) / 2;
          
          // Convert to real world area
          // area_m2 = area_px / (scaleFactor_px_per_m ^ 2)
          const areaMeters = (areaPx / Math.pow(scaleFactor, 2)).toFixed(2);
          saveMeasurement('غرفة (مساحة)', 'مساحة', areaMeters, 'متر مربع');
        }
        
        // Reset
        polygonPoints.current = [];
        polygonLines.current = [];
        activeLine.current = null;
        activeShape.current = null;
        setCurrentTool('select'); // Auto switch to select after drawing
      };

      fabricCanvas.on('mouse:down', (o) => {
        const pointer = o.scenePoint;
        const pts = polygonPoints.current;
        
        // Check if clicked near the first point to close polygon
        if (pts.length > 2) {
          const firstPt = pts[0];
          const dist = Math.sqrt(Math.pow(pointer.x - firstPt.x, 2) + Math.pow(pointer.y - firstPt.y, 2));
          if (dist < 20) { // 20px threshold to close
            finishPolygon();
            return;
          }
        }

        pts.push({ x: pointer.x, y: pointer.y });
        
        const circle = new fabric.Circle({
          radius: 5, fill: '#ffffff', stroke: '#ef4444', strokeWidth: 2,
          left: pointer.x, top: pointer.y, selectable: false, originX: 'center', originY: 'center'
        });
        fabricCanvas.add(circle);
        polygonLines.current.push(circle);

        if (pts.length > 1) {
          activeLine.current = new fabric.Line(
            [pts[pts.length - 2].x, pts[pts.length - 2].y, pointer.x, pointer.y],
            { strokeWidth: 2, fill: '#ef4444', stroke: '#ef4444', selectable: false }
          );
          fabricCanvas.add(activeLine.current);
          polygonLines.current.push(activeLine.current);
        }
      });

      fabricCanvas.on('mouse:move', (o) => {
        if (activeLine.current && activeLine.current.class === 'line') {
          const pointer = o.scenePoint;
          activeLine.current.set({ x2: pointer.x, y2: pointer.y });
          
          // Draw temp polygon for visual feedback
          if (activeShape.current) fabricCanvas.remove(activeShape.current);
          const pts = [...polygonPoints.current, { x: pointer.x, y: pointer.y }];
          activeShape.current = new fabric.Polygon(pts, {
            fill: 'rgba(239, 68, 68, 0.1)', stroke: 'transparent', selectable: false
          });
          fabricCanvas.add(activeShape.current);
          activeShape.current.sendToBack();
          
          fabricCanvas.renderAll();
        }
      });
    }

  }, [currentTool, fabricCanvas, scaleFactor]);

  const saveMeasurement = async (name, type, val, unit, aiCost = 0, aiDays = 0, category = '', startDay = 0, endDay = 0) => {
    const rawVal = Number(val);
    const estCost = Number(aiCost) || 0;
    const estDays = Number(aiDays) || 0;
    const sDay = Number(startDay) || 0;
    const eDay = Number(endDay) || 0;
    
    if (window.electronAPI && selectedProject) {
      await window.electronAPI.executeDb(
        'INSERT INTO takeoff_measurements (project_id, element_name, geometry_type, raw_value, unit, estimated_cost, estimated_days, category, start_day, end_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [selectedProject, name, type, rawVal, unit, estCost, estDays, category, sDay, eDay]
      );
      // Refresh Data
      const rows = await window.electronAPI.queryDb('SELECT * FROM takeoff_measurements WHERE project_id = ? ORDER BY id DESC', [selectedProject]);
      setMeasurements(rows || []);
    } else {
      const newMeasurement = {
        id: Date.now(), project_id: selectedProject, element_name: name, geometry_type: type, raw_value: rawVal, unit, estimated_cost: estCost, estimated_days: estDays, category, start_day: sDay, end_day: eDay
      };
      setMeasurements(prev => [newMeasurement, ...prev]);
    }
  };


  const submitCalibration = () => {
    if (!realWorldLength || isNaN(realWorldLength)) return;
    const newScale = calibrationPxData / Number(realWorldLength);
    setScaleFactor(newScale);
    setShowCalibrateModal(false);
    setRealWorldLength('');
    setCurrentTool('select');
    fabricCanvas.remove(linePath.current);
  };

  // --- AI Auto Analysis ---
  const handleAiAnalyzeClick = () => {
    if (uploadedImages.length === 0) return;
    setShowConfigModal(true);
  };

  const startAiAnalysis = async () => {
    setShowConfigModal(false);
    setIsAnalyzing(true);
    setAiError(null);
    setAiResults(null);
    setAiProgress(0);

    // المرحلة الأولى: الذكاء الاصطناعي يقرأ المخطط ويستخرج المساحات فقط
    const config = {
      'معلومات_المبنى': [
        `عدد الأدوار المتكررة المطلوبة: ${buildingConfig.floors} دور`,
        buildingConfig.hasBasement ? 'يوجد بدروم (قبو)' : 'لا يوجد بدروم',
        buildingConfig.hasRoofAnnex ? 'يوجد ملحق علوي (روف)' : 'لا يوجد ملحق علوي'
      ]
    };

    // --- حساب بصمة سريعة للصور المرفوعة (طول البيانات كمفتاح) ---
    const imageFingerprint = uploadedImages.map(img => img.length).join('-') + 
      `_f${buildingConfig.floors}_b${buildingConfig.hasBasement}_r${buildingConfig.hasRoofAnnex}`;

    // --- تحقق من وجود نتيجة مخزنة لهذه الصورة بنفس الإعدادات ---
    let geminiResult;
    const cached = spatialCacheRef.current[imageFingerprint] ||
      (() => { try { const s = localStorage.getItem(`spatial_${imageFingerprint}`); return s ? JSON.parse(s) : null; } catch { return null; } })();

    if (cached) {
      // استخدام النتيجة المخزنة - لا حاجة لاستدعاء Gemini
      setAiProgress(70);
      setAiProgressMsg('⚡ تم استرجاع بيانات المخطط من الكاش (نفس الصورة - نفس النتيجة)...');
      await new Promise(r => setTimeout(r, 500));
      geminiResult = { spatialData: cached, error: null };
    } else {
      // استدعاء Gemini لأول مرة لهذه الصورة
      geminiResult = await analyzeWithGemini(uploadedImages, config, (pct, msg) => {
        setAiProgress(pct);
        setAiProgressMsg(msg);
      });

      if (!geminiResult.error && geminiResult.spatialData) {
        // حفظ النتيجة في الكاش لاستخدامها مستقبلاً
        spatialCacheRef.current[imageFingerprint] = geminiResult.spatialData;
        try {
          localStorage.setItem(`spatial_${imageFingerprint}`, JSON.stringify(geminiResult.spatialData));
        } catch { /* تجاهل إذا امتلأ الـ localStorage */ }
      }
    }

    if (geminiResult.error) {
      setIsAnalyzing(false);
      setAiError(geminiResult.error);
      return;
    }

    // المرحلة الثانية: الكود يحسب كل شيء رياضياً من قاعدة البيانات
    setAiProgressMsg('🔢 جاري الحساب الدقيق من قاعدة البيانات...');
    setAiProgress(85);

    const selectedItems = inventory.filter(i => selectedItemIds.includes(i.id));
    const selectedLabors = laborList.filter(l => selectedLaborIds.includes(l.id));
    const selectedEquips = (equipment || []).filter(e => selectedEquipIds.includes(e.id));

    const finalResults = runFullCalculation(
      geminiResult.spatialData,
      selectedItems,
      selectedLabors,
      selectedEquips,
      buildingConfig
    );

    setAiProgress(100);
    setAiProgressMsg('✅ اكتمل الحساب بدقة 100% من قاعدة البيانات!');

    await new Promise(r => setTimeout(r, 800));
    setIsAnalyzing(false);
    setAiResults(finalResults);
    setShowAiModal(true);
  };

  const handleImportAiResults = async () => {
    if (!aiResults) return;
    
    // Combine materials, labor, and equipment into the same table
    const itemsToImport = [...aiResults.measurements];
    
    if (aiResults.laborBreakdown) {
      aiResults.laborBreakdown.forEach(l => {
        itemsToImport.push({
          element_name: `عمالة: ${l.profession}`,
          geometry_type: 'يومية / مقطوعية',
          raw_value: l.count * l.days,
          unit: 'يوم/عامل',
          estimated_cost: l.cost,
          category: 'عمالة',
          estimated_days: l.days,
          start_day: l.startDay,
          end_day: l.endDay
        });
      });
    }

    if (aiResults.equipmentBreakdown) {
      aiResults.equipmentBreakdown.forEach(e => {
        itemsToImport.push({
          element_name: `معدة: ${e.equipment}`,
          geometry_type: 'إيجار / مقطوعية',
          raw_value: e.count * e.days,
          unit: 'يوم/معدة',
          estimated_cost: e.cost,
          category: 'معدات',
          estimated_days: e.days,
          start_day: e.startDay,
          end_day: e.endDay
        });
      });
    }

    if (aiResults.tasksSchedule) {
      aiResults.tasksSchedule.forEach(t => {
        itemsToImport.push({
          element_name: `مهمة: ${t.task_name}`,
          geometry_type: 'مرحلة تنفيذية',
          raw_value: t.days,
          unit: 'يوم',
          estimated_cost: 0,
          category: 'مهام الذكاء الاصطناعي',
          estimated_days: t.days,
          start_day: t.startDay,
          end_day: t.endDay
        });
      });
    }
    
    // Save the exact overarching project duration estimated by AI
    const duration = aiResults.duration || 45;
    setProjectDuration(duration);
    localStorage.setItem('takeoff_project_duration', duration.toString());

    // إخفاء النافذة فوراً لتسريع الاستجابة للمستخدم
    setShowAiModal(false);
    setAiResults(null);

    if (window.electronAPI) {
      try { await window.electronAPI.executeDb('ALTER TABLE takeoff_measurements ADD COLUMN start_day INTEGER DEFAULT 0'); } catch(e) {}
      try { await window.electronAPI.executeDb('ALTER TABLE takeoff_measurements ADD COLUMN end_day INTEGER DEFAULT 0'); } catch(e) {}
    }

    // استيراد البنود في الخلفية
    for (const m of itemsToImport) {
      try {
        await saveMeasurement(m.element_name, m.geometry_type, m.raw_value, m.unit, m.estimated_cost, m.estimated_days, m.category, m.start_day, m.end_day);
      } catch (err) {
        console.error("Failed to save measurement", m, err);
      }
    }
  };

  const handleExportPDF = () => {
    // بناء قالب HTML نظيف تماماً من البيانات فقط - بدون أي أزرار أو عناصر واجهة
    const date = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

    const getCategoryLabel = (name) => {
      if (name.startsWith('عمالة:')) return { label: 'عمالة', color: '#3b82f6', bg: '#eff6ff' };
      if (name.startsWith('معدة:'))  return { label: 'معدات', color: '#d97706', bg: '#fffbeb' };
      return { label: 'مواد', color: '#6b7280', bg: '#f9fafb' };
    };

    const tableRows = measurements.map((m, idx) => {
      const unitCost = m.raw_value > 0 ? (Number(m.estimated_cost) / Number(m.raw_value)).toFixed(2) : '0';
      const cat = getCategoryLabel(m.element_name);
      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      return `
        <tr style="background:${rowBg}; page-break-inside: avoid;">
          <td style="padding:10px 14px; font-weight:700; color:#1f2937; border-bottom:1px solid #e5e7eb; text-align:right;">${m.element_name}</td>
          <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb; text-align:right;">
            <span style="background:${cat.bg}; color:${cat.color}; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;">${cat.label}</span>
          </td>
          <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb; text-align:right;">
            <span style="background:#eef2ff; color:#4f46e5; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;">${m.geometry_type || '-'}</span>
          </td>
          <td style="padding:10px 14px; font-weight:800; color:#4f46e5; border-bottom:1px solid #e5e7eb; text-align:center;">${Number(m.raw_value).toLocaleString('ar-SA')}</td>
          <td style="padding:10px 14px; color:#6b7280; font-weight:700; border-bottom:1px solid #e5e7eb; text-align:center;">${m.unit || '-'}</td>
          <td style="padding:10px 14px; color:#374151; font-weight:700; border-bottom:1px solid #e5e7eb; text-align:center;">${unitCost} ر.س</td>
          <td style="padding:10px 14px; font-weight:900; color:#111827; border-bottom:1px solid #e5e7eb; text-align:center;">${Number(m.estimated_cost).toLocaleString('ar-SA')}</td>
        </tr>`;
    }).join('');

    const htmlContent = `
<div id="pdf-wrapper">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    #pdf-wrapper {
      font-family: 'Cairo', Arial, sans-serif !important;
      direction: rtl;
      background-color: #ffffff !important;
      color: #1f2937;
      font-size: 13px;
      width: 100%;
      min-height: 100vh;
    }
    #pdf-wrapper * { box-sizing: border-box; }
    #pdf-wrapper .page-header {
      background-color: #1e3a8a !important;
      color: white !important;
      padding: 24px 30px;
    }
    #pdf-wrapper .page-header h1 { font-size: 22px; font-weight: 900; margin: 0 0 4px 0; color: white !important; }
    #pdf-wrapper .page-header p { font-size: 12px; margin: 0; color: white !important; }
    
    #pdf-wrapper .summary-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px 24px;
      background-color: #f8fafc !important;
      border-bottom: 2px solid #e2e8f0;
    }
    #pdf-wrapper .summary-card {
      background-color: #ffffff !important;
      border-radius: 10px;
      padding: 14px;
      border: 1px solid #e5e7eb;
      text-align: center;
      width: calc(25% - 9px);
    }
    #pdf-wrapper .summary-card .label { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 6px; }
    #pdf-wrapper .summary-card .value { font-size: 16px; font-weight: 900; }
    
    #pdf-wrapper .summary-card.highlight { background-color: #eff6ff !important; border-color: #bfdbfe; }
    #pdf-wrapper .summary-card.highlight .label { color: #3b82f6 !important; }
    #pdf-wrapper .summary-card.highlight .value { color: #1e3a8a !important; }
    
    #pdf-wrapper .summary-card.green .value { color: #16a34a !important; }
    #pdf-wrapper .summary-card.blue .value { color: #2563eb !important; }
    #pdf-wrapper .summary-card.purple .value { color: #7c3aed !important; }
    
    #pdf-wrapper .section-title {
      padding: 14px 24px 10px;
      font-size: 15px;
      font-weight: 900;
      color: #1e293b;
      border-bottom: 2px solid #e2e8f0;
    }
    
    #pdf-wrapper table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      background-color: #ffffff;
    }
    #pdf-wrapper thead tr {
      background-color: #f1f5f9 !important;
      page-break-inside: avoid;
    }
    #pdf-wrapper thead th {
      padding: 10px 14px;
      font-weight: 700;
      color: #374151;
      border-bottom: 2px solid #e2e8f0;
      text-align: right;
    }
    #pdf-wrapper thead th:not(:first-child) { text-align: center; }
    #pdf-wrapper tbody tr { page-break-inside: avoid; }
    
    #pdf-wrapper .total-row { background-color: #f8fafc !important; }
    #pdf-wrapper .total-row td {
      color: #0f172a !important;
      font-weight: 900;
      padding: 14px;
      border-top: 2px solid #cbd5e1;
      text-align: center;
    }
    #pdf-wrapper .total-row td:first-child { text-align: right; }
    
    #pdf-wrapper .page-footer {
      padding: 14px 24px;
      background-color: #f8fafc !important;
      border-top: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #6b7280;
    }
  </style>

  <div class="page-header">
    <h1>📋 جدول الحصر والمقايسة التفصيلية (BOQ)</h1>
    <p>تاريخ الإصدار: ${date} &nbsp;|&nbsp; إجمالي البنود: ${measurements.length} بند ومادة &nbsp;|&nbsp; مدة المشروع: ${projectDuration} يوم</p>
  </div>

  <div class="summary-grid">
    <div class="summary-card blue">
      <div class="label">تكلفة المواد</div>
      <div class="value">${materialsCost.toLocaleString('ar-SA', {maximumFractionDigits:0})} ر.س</div>
    </div>
    <div class="summary-card purple">
      <div class="label">تكلفة العمالة</div>
      <div class="value">${laborCost.toLocaleString('ar-SA', {maximumFractionDigits:0})} ر.س</div>
    </div>
    <div class="summary-card">
      <div class="label">تكلفة المعدات</div>
      <div class="value" style="color:#d97706">${equipCost.toLocaleString('ar-SA', {maximumFractionDigits:0})} ر.س</div>
    </div>
    <div class="summary-card highlight">
      <div class="label">رأس المال الكلي</div>
      <div class="value">${totalCost.toLocaleString('ar-SA', {maximumFractionDigits:0})} ر.س</div>
    </div>
    <div class="summary-card green">
      <div class="label">صافي الربح (30%)</div>
      <div class="value">+${totalProfit.toLocaleString('ar-SA', {maximumFractionDigits:0})} ر.س</div>
    </div>
    <div class="summary-card highlight">
      <div class="label">سعر البيع المقترح</div>
      <div class="value" style="color:#38bdf8">${totalSell.toLocaleString('ar-SA', {maximumFractionDigits:0})} ر.س</div>
    </div>
    <div class="summary-card">
      <div class="label">مدة التنفيذ</div>
      <div class="value" style="color:#0891b2">${projectDuration} يوم</div>
    </div>
    <div class="summary-card">
      <div class="label">عدد البنود</div>
      <div class="value" style="color:#6b7280">${measurements.length} بند</div>
    </div>
  </div>

  <div class="section-title">📊 تفاصيل بنود المواد والعمالة والمعدات</div>

  <table>
    <thead>
      <tr>
        <th style="text-align:right; min-width:180px;">اسم البند / العنصر</th>
        <th>الفئة</th>
        <th>النوع</th>
        <th>الكمية</th>
        <th>الوحدة</th>
        <th>التكلفة الإفرادية</th>
        <th>إجمالي التكلفة (ر.س)</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
      <tr class="total-row" style="page-break-inside:avoid;">
        <td colspan="5" style="text-align:right;">الإجمالي الكلي لجميع البنود</td>
        <td>-</td>
        <td>${totalCost.toLocaleString('ar-SA', {maximumFractionDigits:0})} ر.س</td>
      </tr>
    </tbody>
  </table>

  <div class="page-footer">
    <span>🏗️ نظام إدارة الإنشاءات المتقدم</span>
    <span>جميع الأسعار بالريال السعودي (ر.س) - تقديري للمقايسة</span>
    <span>${date}</span>
  </div>
</div>`;

    const opt = {
      margin: [10, 5, 10, 5],
      filename: 'مقايسة_المشروع.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: 'tr' }
    };

    html2pdf().set(opt).from(htmlContent).save();
  };

  const handleSyncToMainSystem = async () => {
    if (!window.electronAPI || !selectedProject || measurements.length === 0) return;
    setIsSyncing(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (Number(projectDuration) || 45));
      const endStr = endDate.toISOString().split('T')[0];

      // 1. ترحيل إلى جداول الكميات (boq_items)
      for (const m of measurements) {
        const unitCost = m.raw_value > 0 ? (Number(m.estimated_cost) / Number(m.raw_value)) : 0;
        await window.electronAPI.executeDb(
          `INSERT INTO boq_items (project_id, description, unit, qty, est_rate, act_rate, is_header) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [selectedProject, m.element_name, m.unit, m.raw_value, unitCost, 0, 0]
        );

        // 2. ترحيل إلى المهام (tasks) إذا كان البند يخص العمالة أو المعدات أو المهام الذكية
        if (m.element_name.startsWith('عمالة:') || m.element_name.startsWith('معدة:') || m.element_name.startsWith('مهمة:')) {
          let taskTitle = m.element_name.replace('عمالة: ', '').replace('معدة: ', '').replace('مهمة: ', '');
          if (!m.element_name.startsWith('مهمة:')) taskTitle = `تنفيذ: ${taskTitle}`;
          
          const taskStart = new Date();
          taskStart.setDate(taskStart.getDate() + (Number(m.start_day) || 0));
          const taskStartStr = taskStart.toISOString().split('T')[0];

          const taskEnd = new Date();
          taskEnd.setDate(taskEnd.getDate() + (Number(m.end_day) || Number(m.estimated_days) || 1));
          const taskEndStr = taskEnd.toISOString().split('T')[0];

          await window.electronAPI.executeDb(
            `INSERT INTO tasks (title, project_id, assigned_to, start_date, end_date, priority, status, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [taskTitle, selectedProject, null, taskStartStr, taskEndStr, 'عالية', 'لم تبدأ', 0]
          );
        }
      }

      alert('تم اعتماد وترحيل جميع بنود المقايسة إلى جداول الكميات (BOQ) وإنشاء مهام التنفيذ بنجاح!');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الترحيل.');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Calculations for Summary Cards ---
  const materialsCost = measurements.filter(m => !m.element_name.startsWith('عمالة:') && !m.element_name.startsWith('معدة:')).reduce((sum, m) => sum + (Number(m.estimated_cost) || 0), 0);
  const laborCost = measurements.filter(m => m.element_name.startsWith('عمالة:')).reduce((sum, m) => sum + (Number(m.estimated_cost) || 0), 0);
  const equipCost = measurements.filter(m => m.element_name.startsWith('معدة:')).reduce((sum, m) => sum + (Number(m.estimated_cost) || 0), 0);
  
  const totalCost = materialsCost + laborCost + equipCost;
  // Assuming a generic 30% profit margin
  const totalSell = totalCost * 1.30; 
  const totalProfit = totalSell - totalCost;
  
  // We now use the exact projectDuration saved from the AI analysis (aiResults.estimatedDurationDays)
  // which perfectly represents the timeline (e.g. 10 days) without confusing it with labor man-days (e.g. 240).

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col relative print-friendly-container">
      
      {/* Project Selector Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 shrink-0">
        <Building className="w-6 h-6 text-primary-600" />
        <h2 className="text-lg font-black text-gray-800">المشروع الحالي لحصر الكميات:</h2>
        <Select 
          options={projects.map(p => ({label: p.name, value: p.id}))}
          value={selectedProject}
          onChange={e => setSelectedProject(Number(e.target.value))}
          className="w-64 border-gray-200"
        />
      </div>

      {/* ===== AI Configuration Modal ===== */}
      {showConfigModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-black text-gray-800 mb-2">تخصيص معلومات ومواد المشروع</h3>
            <p className="text-sm text-gray-500 mb-6">حدد تفاصيل المبنى والمواد المستخدمة ليقوم الذكاء الاصطناعي بضرب الكميات وحساب التكلفة التقديرية بدقة</p>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
              
              {/* === Building Configuration === */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><Building className="w-5 h-5"/> معلومات وهيكل المبنى</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">عدد الأدوار (بخلاف الأرضي)</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={buildingConfig.floors} 
                      onChange={e => setBuildingConfig({...buildingConfig, floors: e.target.value})} 
                      className="w-full p-2 border border-blue-200 rounded-lg outline-none focus:border-blue-500 bg-white" 
                    />
                  </div>
                  <div className="flex items-center gap-2 md:mt-6">
                    <input 
                      type="checkbox" 
                      id="basement" 
                      checked={buildingConfig.hasBasement} 
                      onChange={e => setBuildingConfig({...buildingConfig, hasBasement: e.target.checked})} 
                      className="w-4 h-4 rounded text-blue-600" 
                    />
                    <label htmlFor="basement" className="text-sm font-bold text-gray-700 cursor-pointer">إضافة بدروم (قبو)</label>
                  </div>
                  <div className="flex items-center gap-2 md:mt-6">
                    <input 
                      type="checkbox" 
                      id="roof" 
                      checked={buildingConfig.hasRoofAnnex} 
                      onChange={e => setBuildingConfig({...buildingConfig, hasRoofAnnex: e.target.checked})} 
                      className="w-4 h-4 rounded text-blue-600" 
                    />
                    <label htmlFor="roof" className="text-sm font-bold text-gray-700 cursor-pointer">إضافة ملحق علوي (روف)</label>
                  </div>
                </div>
              </div>
              
              {/* === Inventory Categories === */}
              {categories.map(cat => {
                const items = inventory.filter(i => i.category_id === cat.id);
                if (items.length === 0) return null;
                return (
                  <div key={cat.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3">{cat.name} <span className="text-xs text-gray-400 font-normal">(مواد بناء)</span></h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {items.map(item => {
                        const isSelected = selectedItemIds.includes(item.id);
                        return (
                          <label key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-primary-50 border-primary-500' : 'bg-white border-gray-200 hover:bg-gray-100'}`}>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={isSelected}
                              onChange={() => handleToggleMaterial(item.id)}
                            />
                            <div className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm font-bold truncate ${isSelected ? 'text-primary-700' : 'text-gray-700'}`} title={item.name}>{item.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            </div>

            <div className="mt-6 flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={startAiAnalysis} className="flex-1 bg-gradient-to-l from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" /> بدء التحليل الشامل
              </button>
              <button onClick={() => setShowConfigModal(false)} className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== AI Progress Overlay ===== */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[420px] max-w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-1">الذكاء الاصطناعي يحلل المخطط</h3>
            <p className="text-sm text-gray-500 mb-6">{aiProgressMsg}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${aiProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{aiProgress}%</p>
          </div>
        </div>
      )}

      {/* ===== AI Error Modal ===== */}
      {aiError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md text-center border-t-4 border-red-500">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">تعذر تحليل المخطط</h3>
            <p className="text-xs text-gray-500 mb-6 bg-red-50 p-3 rounded-lg border border-red-100 text-left max-h-32 overflow-y-auto">{aiError}</p>
            <button onClick={() => setAiError(null)} className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              حسناً، إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ===== AI Results Modal ===== */}
      {showAiModal && aiResults && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-l from-indigo-50 to-purple-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800">نتائج التحليل التلقائي</h3>
                  <p className="text-xs text-purple-600 font-bold">{aiResults.summary}</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="p-2 hover:bg-white rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {/* Detected Rooms */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {aiResults.rooms.length > 0 ? (
                <>
                  <div className="bg-gradient-to-l from-indigo-50 to-purple-50 p-4 rounded-xl mb-5 flex justify-between items-center border border-indigo-100">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">إجمالي التكلفة التقريبية (مواد + عمالة + معدات)</p>
                      <p className="text-xl font-black text-indigo-700">{aiResults.totalCost?.toLocaleString() || 0} ر.س</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">المدة الكلية (أيام)</p>
                      <p className="text-lg font-black text-gray-800">{aiResults.duration || 0}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">عدد العمال الإجمالي</p>
                      <p className="text-lg font-black text-gray-800">{aiResults.workers || 0}</p>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">الغرف المكتشفة ({aiResults.rooms?.length || 0})</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {(aiResults.rooms || []).map((room, i) => (
                      <div key={i} className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${room.confidence === 'high' ? 'bg-green-500' : 'bg-amber-400'}`} />
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{room.name}</p>
                          <p className="text-xs text-gray-500">{room.area} م²  {room.confidence === 'high' ? '✓ من المخطط' : '(تقريبي)'}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">تفاصيل بنود المواد ({aiResults.measurements?.length || 0})</p>
                  <div className="space-y-2 mb-5">
                    {(aiResults.measurements || []).map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                          <p className="font-bold text-gray-800">{m.element_name}</p>
                          <p className="text-xs text-gray-500">{m.geometry_type} - {m.category}</p>
                        </div>
                        <div className="text-left">
                          <p className="font-black text-primary-600">{m.raw_value} {m.unit}</p>
                          <p className="text-xs font-bold text-green-600">{m.estimated_cost?.toLocaleString()} ر.س</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {aiResults.laborBreakdown && aiResults.laborBreakdown.length > 0 && (
                    <>
                      <p className="text-xs font-bold text-blue-500 uppercase mb-3">العمالة المطلوبة ({aiResults.laborBreakdown.length})</p>
                      <div className="space-y-2 mb-5">
                        {aiResults.laborBreakdown.map((l, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div>
                              <p className="font-bold text-gray-800">{l.profession}</p>
                              <p className="text-xs text-gray-500">العدد: {l.count} عمال</p>
                            </div>
                            <div className="text-left">
                              <p className="font-black text-blue-600">{l.days} يوم</p>
                              <p className="text-xs font-bold text-green-600">{l.cost?.toLocaleString()} ر.س</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {aiResults.equipmentBreakdown && aiResults.equipmentBreakdown.length > 0 && (
                    <>
                      <p className="text-xs font-bold text-amber-500 uppercase mb-3">المعدات المطلوبة ({aiResults.equipmentBreakdown.length})</p>
                      <div className="space-y-2">
                        {aiResults.equipmentBreakdown.map((e, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <div>
                              <p className="font-bold text-gray-800">{e.equipment}</p>
                              <p className="text-xs text-gray-500">العدد: {e.count} معدة</p>
                            </div>
                            <div className="text-left">
                              <p className="font-black text-amber-600">{e.days} يوم</p>
                              <p className="text-xs font-bold text-green-600">{e.cost?.toLocaleString()} ر.س</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                  <p className="font-bold text-gray-700">لم يتمكن الذكاء الاصطناعي من قراءة الغرف بوضوح</p>
                  <p className="text-sm text-gray-500 mt-1">الصورة قد تكون منخفضة الدقة أو بخط غير عربي واضح.<br/>يُنصح بالرسم اليدوي.</p>
                </div>
              )}
            </div>
            {/* Footer */}
            {aiResults.measurements.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={handleImportAiResults}
                  className="flex-1 bg-gradient-to-l from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> استيراد {aiResults.measurements.length} بند إلى جدول الكميات
                </button>
                <button onClick={() => setShowAiModal(false)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50">
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal للمعايرة */}
      {showCalibrateModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-xl">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 max-w-full">
            <h3 className="text-lg font-black text-gray-800 mb-2">معايرة المقياس (Scale)</h3>
            <p className="text-sm text-gray-500 mb-4">لقد قمت برسم خط. أدخل الطول الحقيقي لهذا الخط في الواقع (بالمتر) ليقوم النظام بضبط الحسابات.</p>
            <input 
              type="number" 
              placeholder="مثال: 1.5" 
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary-500 mb-4 outline-none"
              value={realWorldLength}
              onChange={e => setRealWorldLength(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={submitCalibration} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700">اعتماد المقياس</button>
              <button onClick={() => { setShowCalibrateModal(false); fabricCanvas.remove(linePath.current); }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-800">الحصر الرقمي للمخططات</h1>
          <p className="text-sm text-gray-500 mt-1">المقياس الحالي: <span className="font-bold text-primary-600">{Math.round(scaleFactor)} بكسل / متر</span></p>
        </div>
        <div className="flex items-center gap-3">
          {/* AI Analyze Button */}
          {uploadedImages.length > 0 && (
            <button
              onClick={handleAiAnalyzeClick}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-200 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>تحليل شامل ({uploadedImages.length} مخططات)</span>
            </button>
          )}
          <div className="relative">
            <input type="file" multiple accept="application/pdf, image/png, image/jpeg, image/jpg" onChange={handlePdfUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
              <Upload className="w-4 h-4" />

              <span>استيراد مخطط (PDF / صورة)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 gap-6 pb-6">
        {/* القسم العلوي: الأدوات والمخطط */}
        <div className="flex flex-col lg:flex-row gap-6 shrink-0" style={{ minHeight: '60vh' }}>
          {/* الأدوات الجانبية */}
          <div className="w-full lg:w-72 space-y-4 flex flex-col shrink-0">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm shrink-0">
              <h3 className="font-bold text-gray-800 mb-4">أدوات الحصر</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setCurrentTool('select')} className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${currentTool === 'select' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <MousePointer2 className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">تحديد الماوس</span>
                </button>
                <button onClick={() => setCurrentTool('pan')} className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${currentTool === 'pan' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <Move className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">تحريك (Pan)</span>
                </button>
                <button onClick={() => setCurrentTool('calibrate')} className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all col-span-2 ${currentTool === 'calibrate' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <Maximize className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">معايرة المقياس (Calibration)</span>
                </button>
                <button onClick={() => setCurrentTool('line')} className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${currentTool === 'line' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <Ruler className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">حصر الأطوال</span>
                </button>
                <button onClick={() => setCurrentTool('polygon')} className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${currentTool === 'polygon' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <Square className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">حصر المساحات</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-center">تلميح: استخدم عجلة الماوس (Scroll) للتكبير والتصغير</p>
            </div>
          </div>

          {/* مساحة عرض المخطط */}
          <div className="flex-1 bg-gray-100/50 rounded-xl border border-gray-200 shadow-inner overflow-hidden relative flex items-center justify-center min-h-[500px]">
            {!pdfDoc && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-0 pointer-events-none">
                 <Upload className="w-16 h-16 mb-4 opacity-20" />
                 <p className="font-bold text-lg">لم يتم اختيار مخطط</p>
                 <p className="text-sm">اسحب ملف PDF أو استخدم زر الاستيراد</p>
              </div>
            )}
            <div className="w-full h-full relative z-10 flex items-center justify-center p-4">
              <canvas ref={canvasElementRef} className="shadow-2xl rounded-sm" />
              
              {/* Image Preview Selector Sidebar */}
              {uploadedImages.length > 1 && (
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-white/90 p-2 rounded-xl shadow-lg border border-gray-200 max-h-[90%] overflow-y-auto custom-scrollbar">
                  <p className="text-[10px] font-bold text-gray-500 text-center">المخططات المرفوعة ({uploadedImages.length})</p>
                  {uploadedImages.map((imgUrl, idx) => (
                    <button 
                      key={idx}
                      onClick={() => loadPreviewImage(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-primary-600 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={imgUrl} alt={`مخطط ${idx+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* القسم السفلي: جدول الحصر */}
        <div id="takeoff-report" className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col shrink-0 section-to-print">
          
          {/* Header for PDF */}
          <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-gray-800">
             <h1 className="text-3xl font-black text-gray-900 mb-2">مقايسة وجدول كميات المشروع (BOQ)</h1>
             <p className="text-gray-500">تم التوليد بواسطة نظام إدارة الإنشاءات المتقدم</p>
          </div>

          {/* Detailed Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
            
            {/* Cost Breakdowns */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Square className="w-4 h-4 text-indigo-500" />
                <p className="text-[10px] font-bold text-gray-500 uppercase">المواد</p>
              </div>
              <p className="text-lg font-black text-indigo-700">{materialsCost.toLocaleString(undefined, {maximumFractionDigits:0})} ر.س</p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <HardHat className="w-4 h-4 text-blue-500" />
                <p className="text-[10px] font-bold text-gray-500 uppercase">العمالة</p>
              </div>
              <p className="text-lg font-black text-blue-700">{laborCost.toLocaleString(undefined, {maximumFractionDigits:0})} ر.س</p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <PenTool className="w-4 h-4 text-amber-500" />
                <p className="text-[10px] font-bold text-gray-500 uppercase">المعدات</p>
              </div>
              <p className="text-lg font-black text-amber-700">{equipCost.toLocaleString(undefined, {maximumFractionDigits:0})} ر.س</p>
            </div>

            {/* Final Totals */}
            <div className="bg-indigo-50 p-3 rounded-xl shadow-sm border border-indigo-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-indigo-700" />
                <p className="text-[10px] font-bold text-indigo-700 uppercase">رأس المال</p>
              </div>
              <p className="text-xl font-black text-gray-900">{totalCost.toLocaleString(undefined, {maximumFractionDigits:0})} ر.س</p>
            </div>

            <div className="bg-green-50 p-3 rounded-xl shadow-sm border border-green-100 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-green-200 rounded-bl-full z-0 opacity-50"></div>
              <div className="flex items-center gap-2 mb-1 relative z-10">
                <TrendingUp className="w-4 h-4 text-green-700" />
                <p className="text-[10px] font-bold text-green-800 uppercase">الربح</p>
              </div>
              <p className="text-xl font-black text-green-700 relative z-10">+{totalProfit.toLocaleString(undefined, {maximumFractionDigits:0})} ر.س</p>
            </div>

            <div className="bg-gray-800 p-3 rounded-xl shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-white" />
                <p className="text-[10px] font-bold text-gray-300 uppercase">البيع المقترح</p>
              </div>
              <p className="text-xl font-black text-white">{totalSell.toLocaleString(undefined, {maximumFractionDigits:0})} ر.س</p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-teal-500" />
                <p className="text-[10px] font-bold text-gray-500 uppercase">مدة البناء</p>
              </div>
              <p className="text-xl font-black text-teal-600">{projectDuration} يوم</p>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary-600" />
              جدول الحصر والمقايسة التفصيلية (BOQ)
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full">{measurements.length} بند ومادة</span>
              <button 
                onClick={handleSyncToMainSystem}
                disabled={isSyncing || measurements.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md no-print disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                <span>{isSyncing ? 'جاري الترحيل...' : 'اعتماد وترحيل للنظام'}</span>
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md no-print"
              >
                <Printer className="w-4 h-4" />
                <span>تصدير PDF / طباعة المقايسة</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold">اسم البند / العنصر</th>
                  <th className="px-6 py-4 font-bold">الفئة</th>
                  <th className="px-6 py-4 font-bold">النوع</th>
                  <th className="px-6 py-4 font-bold text-left">الكمية الإجمالية</th>
                  <th className="px-6 py-4 font-bold text-left">الوحدة</th>
                  <th className="px-6 py-4 font-bold text-left">التكلفة الإفرادية (تقريبي)</th>
                  <th className="px-6 py-4 font-bold text-left">إجمالي التكلفة (ر.س)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {measurements.map((m, idx) => {
                  const unitCost = m.raw_value > 0 ? (Number(m.estimated_cost) / Number(m.raw_value)).toFixed(2) : 0;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/80 transition-colors break-inside-avoid">
                      <td className="px-6 py-4 font-bold text-gray-800">{m.element_name}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${m.element_name.startsWith('عمالة:') ? 'bg-blue-50 text-blue-600 border-blue-100' : m.element_name.startsWith('معدة:') ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {m.element_name.startsWith('عمالة:') ? 'عمالة' : m.element_name.startsWith('معدة:') ? 'معدات' : 'مواد'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                          {m.geometry_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-primary-600 text-left">{m.raw_value}</td>
                      <td className="px-6 py-4 text-gray-500 font-bold text-left">{m.unit}</td>
                      <td className="px-6 py-4 text-gray-600 font-bold text-left">{unitCost} ر.س/{m.unit}</td>
                      <td className="px-6 py-4 font-black text-gray-900 text-left">{Number(m.estimated_cost).toLocaleString()}</td>
                    </tr>
                  );
                })}
                {measurements.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400 font-medium">
                      لا توجد بنود حصر بعد. ابدأ برسم الأبعاد أو استخدم الذكاء الاصطناعي.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
