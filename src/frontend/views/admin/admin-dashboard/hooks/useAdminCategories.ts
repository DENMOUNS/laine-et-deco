import { useState } from 'react';
import { useEntity } from '../../../../hooks/useEntity';
import { useAdminStore } from '../../../../../stores/adminStore';
import { toast } from 'sonner';
import type { Category } from '../../../../../types';

export function useAdminCategories() {
  const { data: categories, setData, addEntity, updateEntity, deleteEntity, isLoading } = useEntity<Category>('category', []);
  const categoryPage = useAdminStore((s) => s.categoryPage);
  const setCategoryPage = useAdminStore((s) => s.setCategoryPage);
  const itemsPerPage = useAdminStore((s) => s.itemsPerPage);

  const deleteCategory = async (id: string, name: string) => {
    if (!id) {
      toast.error('Identifiant de catégorie invalide');
      return;
    }
    if (!window.confirm(`Voulez-vous vraiment supprimer la catégorie "${name || id}" ?`)) return;
    try {
      if (setData) {
        setData((prev) => (prev || []).filter((c) => c.id !== id));
      }
      await deleteEntity(id);
      toast.success(`Catégorie "${name || id}" supprimée avec succès`);
    } catch (e: any) {
      console.error('[deleteCategory error]', e);
      toast.error(e?.message || 'Erreur lors de la suppression de la catégorie');
    }
  };

  return {
    categories,
    categoryPage,
    setCategoryPage,
    itemsPerPage,
    addCategory: addEntity,
    updateCategory: updateEntity,
    deleteCategory,
    isLoading
  };
}
