import React from 'react';

export function AdminBlogCategoryModalFields({ ctx }: { ctx: any }) {
  const { editingItem } = ctx;

  return (
    <>
      {ctx.modalType === 'blog-category' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de la catégorie</label>
            <input
              name="name"
              type="text"
              className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary"
              defaultValue={editingItem?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Statut</label>
            <select
              name="status"
              defaultValue={editingItem?.status || 'active'}
              className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
}
