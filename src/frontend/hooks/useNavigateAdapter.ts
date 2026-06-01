import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useNavigateAdapter
 * 
 * Converts the legacy `onNavigate(view, id?, query?)` API used throughout
 * the codebase into proper React Router `navigate()` calls.
 * 
 * This hook allows views to consume a single `onNavigate` prop
 * without knowing about React Router internals.
 * 
 * Usage:
 *   const onNavigate = useNavigateAdapter();
 *   onNavigate('shop');          // → /shop
 *   onNavigate('product-detail', '123'); // → /product/123
 */
export function useNavigateAdapter() {
  const navigate = useNavigate();

  return useCallback((view: string, id?: string, query?: string) => {
    let path = '/';
    switch (view) {
      case 'home': path = '/'; break;
      case 'product-detail': path = id ? `/product/${id}` : '/shop'; break;
      case 'admin-product-detail': path = id ? `/admin/product/${id}` : '/admin'; break;
      case 'admin-user-detail': path = id ? `/admin/user/${id}` : '/admin'; break;
      case 'admin-dashboard': path = '/admin'; break;
      case 'pack-detail': path = id ? `/pack/${id}` : '/packs'; break;
      case 'blog-post': path = id ? `/blog/${id}` : '/blog'; break;
      case 'order-tracking': path = id ? `/order-tracking/${id}` : '/order-tracking'; break;
      default: path = `/${view}`; break;
    }
    if (query) path += `?q=${encodeURIComponent(query)}`;
    navigate(path);
  }, [navigate]);
}
