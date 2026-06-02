import { useState } from 'react';
import { useEntity } from '../../../../hooks/useEntity';
import { useAdminStore } from '../../../../../stores/adminStore';
import { toast } from 'sonner';
import type { Category } from '../../../../../types';

export function useAdminCategories() {
  const { data: categories, addEntity, updateEntity, deleteEntity, isLoading } = useEntity<Category>('category', []);
  const categoryPage = useAdminStore((s) => s.categoryPage);
  const setCategoryPage = useAdminStore((s) => s.setCategoryPage);
  const itemsPerPage = useAdminStore((s) => s.itemsPerPage);

  const deleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer la catégorie "${name}" ?`)) return;
    try {
      await deleteEntity(id);
      toast.success(`Catégorie "${name}" supprimée avec succès`);
    } catch (e) {
      toast.error('Erreur lors de la suppression de la catégorie');
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
