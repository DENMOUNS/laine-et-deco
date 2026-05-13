import fs from 'fs';
import path from 'path';

const dirs = [
  'src/frontend/components/dashboard',
  'src/frontend/views',
  'src/frontend/presentation/context',
  'src/frontend/utils'
];

dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

const createComponent = (file: string) => {
  const name = path.basename(file, '.tsx');
  fs.writeFileSync(file, `export const ${name} = (props: any) => <div className="p-4">${name} Component</div>;\n`);
};

const components = [
  'src/frontend/components/QuickViewModal.tsx',
  'src/frontend/components/ComparisonTool.tsx',
  'src/frontend/components/NewsletterPopup.tsx',
  'src/frontend/components/Loader.tsx',
  'src/frontend/components/MaintenanceView.tsx',
  'src/frontend/components/InstallBanner.tsx',
  'src/frontend/components/StaticPageView.tsx',
  'src/frontend/components/Modal.tsx',
  'src/frontend/components/DataTable.tsx',
  'src/frontend/components/TabFilter.tsx',
  'src/frontend/components/OrderMap.tsx',
  'src/frontend/components/ProductCard.tsx',
  'src/frontend/views/HomeView.tsx',
  'src/frontend/views/AuthView.tsx',
  'src/frontend/views/AdminUserDetailView.tsx',
  'src/frontend/views/AdminLogsView.tsx',
  'src/frontend/views/ProductDetailView.tsx',
  'src/frontend/views/TeamView.tsx',
  'src/frontend/views/PacksView.tsx',
  'src/frontend/views/CustomPackBuilderView.tsx',
  'src/frontend/views/PackDetailView.tsx',
  'src/frontend/views/BlogPostView.tsx',
  'src/frontend/views/CustomOrderView.tsx',
  'src/frontend/views/CareGuideView.tsx',
  'src/frontend/views/LookbookView.tsx',
  'src/frontend/views/KnittingConfiguratorView.tsx',
  'src/frontend/views/PrivacyPolicyView.tsx',
  'src/frontend/components/dashboard/CouponEditor.tsx',
  'src/frontend/components/dashboard/PromoEventEditor.tsx',
  'src/frontend/components/dashboard/CatalogPriceRuleEditor.tsx',
  'src/frontend/components/dashboard/DashboardSidebar.tsx',
  'src/frontend/components/dashboard/DashboardOverview.tsx',
  'src/frontend/components/dashboard/DashboardOrders.tsx',
  'src/frontend/components/dashboard/DashboardProjects.tsx',
  'src/frontend/components/dashboard/DashboardTools.tsx',
  'src/frontend/components/dashboard/DashboardLoyalty.tsx',
  'src/frontend/components/dashboard/DashboardPayments.tsx',
  'src/frontend/components/dashboard/DashboardHistory.tsx',
  'src/frontend/components/dashboard/DashboardProfile.tsx',
  'src/frontend/components/dashboard/OrderDetailsModal.tsx',
];

components.forEach(createComponent);

fs.writeFileSync('src/frontend/components/ErrorBoundary.tsx', `export default function ErrorBoundary({ children }: any) { return <>{children}</>; }\n`);
fs.writeFileSync('src/frontend/presentation/context/FirebaseContext.tsx', `export const FirebaseProvider = ({ children }: any) => <>{children}</>;\n`);

fs.writeFileSync('src/frontend/utils/siteUtils.ts', `export const siteUtils = {};\n`);
fs.writeFileSync('src/frontend/utils/searchUtils.ts', `export const searchUtils = {};\n`);
fs.writeFileSync('src/frontend/utils/invoiceUtils.ts', `export const invoiceUtils = {};\n`);
fs.writeFileSync('src/frontend/utils/aiUtils.ts', `export const aiUtils = {};\n`);

console.log('Stubs generated successfully.');
