import { useEntity } from '../../../../hooks/useEntity';
import { toast } from 'sonner';
import type { Pack } from '../../../../../types';

export function useAdminPacks() {
  const { data: packs, addEntity, updateEntity, deleteEntity, isLoading } = useEntity<Pack>('pack', []);

  const togglePackStatus = async (packId: string, currentStatus: string, packName: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateEntity(packId, { status: newStatus });
      toast.success(`Pack "${packName}" ${newStatus === 'active' ? 'activé' : 'désactivé'}`);
    } catch (e) {
      toast.error('Erreur lors de la mise à jour du pack');
    }
  };

  const deletePack = async (packId: string, packName: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le pack "${packName}" ?`)) return;
    try {
      await deleteEntity(packId);
      toast.success(`Pack "${packName}" supprimé avec succès`);
    } catch (e) {
      toast.error('Erreur lors de la suppression du pack');
    }
  };

  return {
    packs,
    togglePackStatus,
    deletePack,
    isLoading
  };
}
