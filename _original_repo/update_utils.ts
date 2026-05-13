import fs from 'fs';

fs.writeFileSync('src/frontend/utils/siteUtils.ts', `export const updateSEOMeta = (title: any, description: any) => {};\n`);

fs.writeFileSync('src/frontend/utils/searchUtils.ts', `
export const productSearch = (products: any[], query: string) => products;
export const orderSearch = (orders: any[], query: string) => orders;
export const userSearch = (users: any[], query: string) => users;
export const getStatusText = (status: string) => status;
export const getActionDescription = (action: string) => action;
`);

fs.writeFileSync('src/frontend/utils/invoiceUtils.ts', `export const generateInvoicePDF = (order: any, siteConfig: any) => {};\n`);

fs.writeFileSync('src/frontend/utils/aiUtils.ts', `export const analyzeProductImage = async (file: any) => ({ tags: [], description: '' });\n`);

console.log('Utils updated successfully.');
