const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/frontend/views/AdminDashboard.tsx',
  'src/frontend/components/MainContent.tsx',
  'src/frontend/components/Layout.tsx',
  'src/frontend/views/CartView.tsx',
  'src/frontend/components/ProductCard.tsx',
  'src/frontend/components/ChatBubble.tsx'
];

const replacements = {
  'bg-red-500': 'bg-red-700',
  'text-red-500': 'text-red-700',
  'bg-red-100': 'bg-red-200',
  'text-red-600': 'text-red-800',
  'bg-green-500': 'bg-green-700',
  'text-green-500': 'text-green-700',
  'bg-green-100': 'bg-green-200',
  'text-green-600': 'text-green-800',
  'bg-blue-500': 'bg-blue-700',
  'text-blue-500': 'text-blue-700',
  'bg-blue-100': 'bg-blue-200',
  'text-blue-600': 'text-blue-800',
  'bg-yellow-500': 'bg-yellow-700',
  'bg-yellow-100': 'bg-yellow-200',
  'text-yellow-600': 'text-yellow-800',
  'bg-orange-100': 'bg-orange-200',
  'text-orange-700': 'text-orange-800',
  'bg-purple-100': 'bg-purple-200',
  'text-purple-600': 'text-purple-800',
  'bg-emerald-100': 'bg-emerald-200',
  'text-emerald-700': 'text-emerald-800',
  'bg-amber-100': 'bg-amber-200',
  'text-amber-600': 'text-amber-800',
  'bg-slate-100': 'bg-slate-200',
  'text-slate-500': 'text-slate-600',
  'text-slate-400': 'text-slate-500',
  'bg-slate-50': 'bg-slate-100',
  'border-slate-100': 'border-slate-200',
  'border-slate-200': 'border-slate-300',
  'bg-red-50': 'bg-red-100',
  'bg-green-50': 'bg-green-100',
  'bg-blue-50': 'bg-blue-100',
};

filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [oldClass, newClass] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      content = content.replace(regex, newClass);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${file}`);
  }
});
