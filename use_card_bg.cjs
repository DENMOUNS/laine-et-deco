const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/frontend/views/HomeView.tsx',
  'src/frontend/views/ShopView.tsx',
  'src/frontend/views/CategoriesView.tsx',
  'src/frontend/views/AdminDashboard.tsx',
  'src/frontend/views/CartView.tsx',
  'src/frontend/views/AuthView.tsx',
  'src/frontend/views/PromotionsView.tsx',
  'src/frontend/views/SecondHandView.tsx',
  'src/frontend/components/ProductCard.tsx',
  'src/frontend/components/ChatBubble.tsx',
  'src/frontend/components/MainContent.tsx',
  'src/frontend/components/Layout.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Replace bg-white with bg-card, but only if it's not followed by / (opacity)
    // and if it's not inside a string that shouldn't be changed.
    // Actually, simple replacement should work for most cases.
    content = content.replace(/bg-white(?!\/)/g, 'bg-card');
    fs.writeFileSync(fullPath, content);
  }
});
