const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/frontend/views/HomeView.tsx',
  'src/frontend/views/PromotionsView.tsx',
  'src/frontend/views/CategoriesView.tsx',
  'src/frontend/views/ShopView.tsx',
  'src/frontend/views/AdminDashboard.tsx',
  'src/frontend/views/CartView.tsx',
  'src/frontend/components/Layout.tsx',
  'src/frontend/components/MainContent.tsx',
  'src/frontend/components/ProductCard.tsx',
  'src/frontend/components/ChatBubble.tsx',
  'src/frontend/index.css'
];

filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace bg-accent/X with bg-primary/X
    content = content.replace(/bg-accent\/([0-9]+)/g, 'bg-primary/$1');
    
    // Replace border-accent/X with border-primary/X
    content = content.replace(/border-accent\/([0-9]+)/g, 'border-primary/$1');
    
    // Replace text-accent/X with text-primary/X (less common but possible)
    content = content.replace(/text-accent\/([0-9]+)/g, 'text-primary/$1');

    // Special case for CategoriesView blur elements
    content = content.replace(/bg-accent\/20 rounded-full blur-3xl/g, 'bg-primary/10 rounded-full blur-3xl');
    content = content.replace(/bg-accent\/10 rounded-full blur-3xl/g, 'bg-primary/5 rounded-full blur-3xl');

    fs.writeFileSync(filePath, content);
  } else {
    console.log(`File not found: ${file}`);
  }
});
