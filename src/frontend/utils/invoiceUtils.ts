import { Order } from '../../types';
import { toast } from 'sonner';
import { initFirebase } from '../../backend/firebase';

async function getAuthToken() {
  const { auth } = initFirebase();
  const user = auth?.currentUser;
  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }
  return user.getIdToken();
}

async function readApiResponse(response: Response, fallbackMessage: string) {
  const rawBody = await response.text();
  if (!rawBody) {
    if (response.ok) return {};
    throw new Error(response.statusText || fallbackMessage || `Erreur API ${response.status}`);
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error(response.ok ? rawBody : response.statusText || rawBody || fallbackMessage);
  }
}

async function createInvoiceJob(orderId: string, isDuplicata: boolean = false): Promise<string> {
  const token = await getAuthToken();

  const response = await fetch('/api/dashboard/invoice/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, isDuplicata }),
  });

  const data = await readApiResponse(response, 'Endpoint de facture introuvable');
  if (!response.ok) {
    throw new Error(data?.error || 'Impossible de creer la tache de facture');
  }

  if (!data?.jobId) {
    throw new Error('La tache de facture n\'a pas ete creee correctement');
  }

  return data.jobId;
}

async function pollInvoiceJob(jobId: string, timeoutMs: number = 60000): Promise<string> {
  const token = await getAuthToken();
  const startTime = Date.now();
  const pollIntervalMs = 1000; // Poll every 1 second

  while (Date.now() - startTime < timeoutMs) {
    const response = await fetch(`/api/dashboard/invoice/job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await readApiResponse(response, 'Endpoint de suivi facture introuvable');

    if (!response.ok) {
      throw new Error(data?.error || 'Impossible de verifier la facture');
    }

    if (data.status === 'completed') {
      if (!data.pdfUrl) {
        throw new Error('Lien PDF manquant');
      }
      return data.pdfUrl;
    }

    if (data.status === 'failed') {
      throw new Error(data?.error || 'Generation de facture echouee');
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error('Generation de facture trop longue, veuillez reessayer');
}

export async function generateInvoicePDF(order: Order, isDuplicata: boolean = false) {
  try {
    if (!order) {
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading('Génération de la facture en cours...');

    try {
      // Create job
      const jobId = await createInvoiceJob(order.id, isDuplicata);

      // Poll job until completion
      const pdfUrl = await pollInvoiceJob(jobId, 60000);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Facture_Laine_Deco_${order.id || 'Order'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Facture générée avec succès');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error?.message || 'Erreur lors de la génération de la facture');
    }
  } catch (error: any) {
    toast.error('Erreur lors de la génération de la facture');
  }
};
