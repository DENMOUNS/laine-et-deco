const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  // Exclude node_modules, .git, and _original_repo to avoid infinite loops or massive copying
  const basename = path.basename(src);
  if (basename === 'node_modules' || basename === '.git' || basename === '_original_repo') {
    return;
  }

  // Preserve our latest features
  if (src.endsWith('DashboardLoyalty.tsx') || src.endsWith('CustomerDashboard.tsx')) {
    return; 
  }

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Restoring from _original_repo...');
copyRecursiveSync('./_original_repo', '.');
console.log('Restore complete!');
