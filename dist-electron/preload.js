const { contextBridge, ipcRenderer } = require('electron');

// هذا الملف يعمل كجسر آمن (Bridge) بين Electron (Backend) و React (Frontend)
contextBridge.exposeInMainWorld('electronAPI', {
  // قراءة بيانات (Select)
  queryDb: (query, params) => ipcRenderer.invoke('db:query', query, params),
  
  // إدخال وتحديث بيانات (Insert, Update, Delete)
  executeDb: (query, params) => ipcRenderer.invoke('db:execute', query, params),
});
