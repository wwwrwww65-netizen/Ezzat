const fs = require('fs');
const files = [
  'src/pages/Users.jsx', 'src/pages/Tasks.jsx', 'src/pages/StaffPenalties.jsx',
  'src/pages/Requests.jsx', 'src/pages/ProjectFiles.jsx', 'src/pages/Payroll.jsx',
  'src/pages/JobRoles.jsx', 'src/pages/Finance/Expenses.jsx', 'src/pages/EmployeesHistory.jsx',
  'src/pages/Employees.jsx', 'src/pages/DailyLogs.jsx', 'src/pages/Clients.jsx', 'src/pages/BOQ.jsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('window.confirm')) {
    content = content.replace(/window\.confirm/g, 'await confirmDialog');
    
    let importPath = '../utils/confirmDialog';
    if (f.includes('Finance')) {
      importPath = '../../utils/confirmDialog';
    }
    
    const importStatement = `import { confirmDialog } from '${importPath}';\n`;
    content = content.replace(/(import React.*?;\n)/, `$1${importStatement}`);
    
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
