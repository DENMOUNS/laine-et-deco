const fs = require('fs');
let code = fs.readFileSync('src/frontend/components/MainContent.tsx', 'utf8');

const viewsToLazy = [
  'HomeView', 'ShopView', 'ProductDetailView', 'CartView', 'CheckoutView', 
  'OrderSuccessView', 'CategoriesView', 'ContactView', 'FAQView', 
  'AboutView', 'BlogIndexView', 'BlogPostView', 'LookbookView', 
  'PromotionsView', 'AuthView', 'CustomerDashboard', 'AdminDashboard', 
  'LookbookUploadView', 'FlashSaleEditorView', 'AdminAnalyticsView',
  'PackConfiguratorView', 'CustomOrderView', 'QRLandingView',
  'SecondHandView', 'TeamView', 'CommunityGalleryView', 'CalculatorView',
  'CareGuideView', 'ComparisonView', 'PacksView', 'PackDetailView',
  'AdminProductDetailView', 'AdminUserDetailView', 'AdminLogsView',
  'KnittingCompanionView', 'KnittingConfiguratorView', 'VolumeCalculatorView',
  'VolumeCalculatorView', 'PatternGeneratorView', 'CustomPackBuilderView'
];

viewsToLazy.forEach(view => {
  const fileMatch = code.match(new RegExp(`import { ${view} } from '(\\.\\./views/[^']+)';`));
  if (fileMatch) {
     let filePath = fileMatch[1];
     code = code.replace(fileMatch[0], `const ${view} = lazy(() => import('${filePath}').then(m => ({ default: m.${view} })));`);
  }
});

fs.writeFileSync('src/frontend/components/MainContent.tsx', code);
