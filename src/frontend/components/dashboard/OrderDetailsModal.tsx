import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, RefreshCcw, Truck, Gift, Sparkles, Feather, AlertCircle, Upload, Camera, CheckCircle2 } from 'lucide-react';
import { Order, Product } from '../../../types';
import { generateInvoicePDF } from '../../utils/invoiceUtils';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { OrderMap } from '../OrderMap';

interface OrderDetailsModalProps {
  selectedOrder: Order;
  onClose: () => void;
  onNavigate: (view: string, id?: string) => void;
  products: Product[];
  onRequestReturn?: (orderId: string, reason: string, productPhotoUrl?: string) => void;
  hasExistingRMA?: boolean;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  selectedOrder,
  onClose,
  onNavigate,
  products,
  onRequestReturn,
  hasExistingRMA = false
}) => {
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [productPhoto, setProductPhoto] = useState<string>('');
  const [isSubmittingRMA, setIsSubmittingRMA] = useState(false);

  // Calculate days elapsed since order/delivery
  const getDaysSinceDelivery = (): number => {
    try {
      let dateObj: Date | null = null;
      if (selectedOrder.date && typeof selectedOrder.date === 'string' && selectedOrder.date.includes('/')) {
        const parts = selectedOrder.date.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          dateObj = new Date(year, month, day);
        }
      }
      if (!dateObj || isNaN(dateObj.getTime())) {
        if (selectedOrder.createdAt) {
          const raw = (selectedOrder.createdAt as any)?.seconds ? (selectedOrder.createdAt as any).seconds * 1000 : selectedOrder.createdAt;
          dateObj = new Date(raw);
        } else if (selectedOrder.date) {
          dateObj = new Date(selectedOrder.date);
        }
      }
      if (!dateObj || isNaN(dateObj.getTime())) return 0;
      const diffMs = Date.now() - dateObj.getTime();
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const daysSinceDelivery = getDaysSinceDelivery();
  const isReturnPeriodExpired = daysSinceDelivery > 7;

  // Refund calculations (delivery fee is strictly non-refundable)
  const shippingFee = selectedOrder.shippingFee || 0;
  const refundableAmount = Math.max(0, (selectedOrder.total || 0) - shippingFee);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La taille de l'image ne doit pas dépasser 5 Mo");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductPhoto(reader.result as string);
      toast.success('Photo du produit ajoutée avec succès');
    };
    reader.readAsDataURL(file);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReturnPeriodExpired) {
      toast.error('Le délai légal de retour de 7 jours est dépassé.');
      return;
    }
    if (!returnReason.trim()) {
      toast.error('Veuillez indiquer une raison pour le retour');
      return;
    }
    if (!productPhoto) {
      toast.error("Une photo du produit est obligatoire pour vérifier qu'il n'a pas été abîmé.");
      return;
    }

    setIsSubmittingRMA(true);
    try {
      if (onRequestReturn) {
        await onRequestReturn(selectedOrder.id, returnReason, productPhoto);
      } else {
        const { addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('../../../backend/firebase');
        await addDoc(collection(db, 'rma'), {
          orderId: selectedOrder.id,
          customer: selectedOrder.customer || selectedOrder.customerName || 'Client',
          reason: returnReason,
          status: 'pending',
          date: new Date().toLocaleDateString('fr-FR'),
          amount: refundableAmount,
          productPhotoUrl: productPhoto,
          createdAt: new Date().toISOString()
        });
      }
      toast.success('Votre demande de retour a été soumise avec succès. La photo sera examinée.');
      setShowReturnForm(false);
      setReturnReason('');
      setProductPhoto('');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de l\'envoi de la demande de retour');
    } finally {
      setIsSubmittingRMA(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto flex min-h-screen items-start sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8 border-b border-primary/5 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-serif font-bold text-primary">Détails de la Commande</h3>
            <p className="text-xs font-mono text-primary/70 mt-1">{selectedOrder.id}</p>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="p-8 space-y-8">
          {showReturnForm ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 text-primary">
                <RefreshCcw size={24} />
                <h4 className="text-lg font-serif font-bold">Demande de Retour</h4>
              </div>

              {/* Alert on non-refundable delivery fees */}
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                  <AlertCircle size={18} className="text-amber-700 shrink-0" />
                  Conditions de Remboursement
                </div>
                <p>
                  Conformément à nos conditions de vente, <strong>les frais de livraison ne sont pas remboursables</strong>. Seul le montant des articles retournés est remboursé.
                </p>
                <div className="pt-2 border-t border-amber-200/60 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>Montant total de la commande :</span>
                    <span>{(selectedOrder.total || 0).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between font-medium text-red-700">
                    <span>Frais de livraison (non remboursés) :</span>
                    <span>- {shippingFee.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-800 text-sm pt-1 border-t border-amber-200/60">
                    <span>Montant estimé du remboursement :</span>
                    <span>{refundableAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">
                    Raison du retour <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Ex: Produit défectueux, Erreur de taille, Ne correspond pas à la description..."
                    className="w-full bg-slate-50 border border-primary/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                    required
                  />
                </div>

                {/* Mandatory photo of the product */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">
                    Photo du produit (Obligatoire pour vérifier qu'il n'est pas abîmé) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-primary/60 mb-3">
                    Veuillez prendre une photo nette du produit pour attester de son état d'origine.
                  </p>

                  {productPhoto ? (
                    <div className="relative rounded-2xl overflow-hidden border border-primary/20 max-h-56 bg-slate-100 flex items-center justify-center p-2">
                      <img src={productPhoto} alt="Aperçu produit retourné" className="max-h-52 object-contain rounded-xl" />
                      <button
                        type="button"
                        onClick={() => setProductPhoto('')}
                        className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                        title="Supprimer la photo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-primary/20 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Camera size={22} />
                      </div>
                      <span className="text-xs font-bold text-primary">Ajouter une photo du produit</span>
                      <span className="text-[10px] text-primary/50">PNG, JPG ou WEBP jusqu'à 5 Mo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoChange} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowReturnForm(false)}
                    className="flex-grow py-4 border border-primary/10 rounded-2xl font-bold hover:bg-slate-50 transition-colors h-auto"
                    disabled={isSubmittingRMA}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmittingRMA || !returnReason.trim() || !productPhoto}
                    className="flex-grow bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg h-auto disabled:opacity-50"
                  >
                    {isSubmittingRMA ? 'Envoi en cours...' : 'Envoyer la demande de retour'}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">Date</p>
                  <p className="text-sm font-medium text-primary">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">Statut</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-4">Articles</p>
                <div className="space-y-4">
                  {selectedOrder.orderDetails?.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-sm border border-primary/5">
                          <img src={products.find(p => p.id === item.productId)?.image || item.image || '/icons/icon-192.png'} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{item.name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <p className="text-xs text-primary/70">Prix unitaire: <span className="font-bold">{item.price.toLocaleString()} FCFA</span></p>
                            <p className="text-xs text-primary/70">Qté: <span className="font-bold">{item.quantity}</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold mb-1">Sous-total</p>
                        <p className="text-sm font-bold text-primary">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>

              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <p className="text-primary/70">Sous-total Articles</p>
                  <p className="font-bold text-primary">
                    {(() => {
                      const subtotal = (selectedOrder.orderDetails || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
                      return subtotal.toLocaleString();
                    })()} FCFA
                  </p>
                </div>
                {selectedOrder.giftWrap?.enabled && (
                  <div className="flex justify-between items-center text-sm text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Gift size={14} className="text-amber-700" />
                      Coffret Cadeau Kraft Noble & Ruban
                    </span>
                    <span className="font-bold">+ {(selectedOrder.giftFee || selectedOrder.giftWrap?.fee || 2000).toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <p className="text-primary/70">Frais de livraison</p>
                  <p className="font-bold text-primary">
                    {selectedOrder.shippingFee === 0 ? 'Gratuit' : `${(selectedOrder.shippingFee || 0).toLocaleString()} FCFA`}
                  </p>
                </div>
                {(() => {
                  const subtotal = (selectedOrder.orderDetails || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
                  const giftFee = selectedOrder.giftFee || selectedOrder.giftWrap?.fee || (selectedOrder.giftWrap?.enabled ? 2000 : 0);
                  const discount = (subtotal + (selectedOrder.shippingFee || 0) + giftFee) - selectedOrder.total;
                  if (discount > 0) {
                    return (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <p>Réduction (Coupons)</p>
                        <p className="font-bold">- {discount.toLocaleString()} FCFA</p>
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                  <p className="text-lg font-serif font-bold text-primary">Total Payé</p>
                  <p className="text-xl font-bold text-primary">{selectedOrder.total.toLocaleString()} FCFA</p>
                </div>
              </div>

              {selectedOrder.giftWrap?.enabled && (
                <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-amber-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/50 pb-3">
                    <div className="flex items-center gap-2">
                      <Gift className="text-amber-800" size={18} />
                      <span className="font-serif font-bold text-primary text-base">Coffret Cadeau & Message Calligraphié</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                      Ruban {selectedOrder.giftWrap.ribbonColor || 'Satin Doré'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-primary/60 font-semibold block text-[10px] uppercase">Destinataire :</span>
                      <p className="font-bold text-primary text-sm mt-0.5">{selectedOrder.giftWrap.recipientName || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <span className="text-primary/60 font-semibold block text-[10px] uppercase">Offert par :</span>
                      <p className="font-bold text-primary text-sm mt-0.5">{selectedOrder.giftWrap.senderName || selectedOrder.customer || 'Non spécifié'}</p>
                    </div>
                  </div>

                  {selectedOrder.giftWrap.message && (
                    <div className="bg-white p-4 rounded-xl border border-amber-200/60 shadow-sm">
                      <div className="flex items-center gap-1.5 text-amber-800 text-[10px] uppercase font-bold tracking-wider mb-2">
                        <Feather size={12} />
                        Mot rédigé à la main sur carte prestige
                      </div>
                      <p className="font-serif italic text-primary text-sm leading-relaxed">
                        « {selectedOrder.giftWrap.message} »
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4 flex-col sm:flex-row">
                  <MapPin className="text-primary mt-1 hidden sm:block" size={18} />
                  <div className="w-full">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">Adresse de Livraison</p>
                    <p className="text-sm text-primary/70 mb-4">{(() => {
                      let addr = selectedOrder.address || 'Adresse non renseignée';
                      // Support multiple formats of coordinates in the address string
                      const formats = [
                        /\(Coordonnées:\s*([0-9.-]+)\s*,\s*([0-9.-]+)\)/,
                        /Lat:\s*[0-9.-]+,\s*Lon:\s*[0-9.-]+/i,
                        /GPS:\s*[0-9.-]+,\s*[0-9.-]+/i
                      ];
                      
                      formats.forEach(regex => {
                        const match = addr.match(regex);
                        if (match) {
                          addr = addr.replace(match[0], '').replace(/^[,\s]+|[,\s]+$/g, '').trim();
                        }
                      });
                      
                      return addr || 'Adresse locale';
                    })()}</p>
                    {(() => {
                      let coords: [number, number] | null = null;
                      if (Array.isArray(selectedOrder.coordinates)) {
                        coords = selectedOrder.coordinates as [number, number];
                      } else if (typeof selectedOrder.coordinates === 'string' && selectedOrder.coordinates.includes(',')) {
                        const parts = selectedOrder.coordinates.split(',');
                        coords = [parseFloat(parts[0]), parseFloat(parts[1])];
                      }
                      
                      if (!coords && selectedOrder.address) {
                        const match = selectedOrder.address.match(/\(Coordonnées:\s*([0-9.-]+)\s*,\s*([0-9.-]+)\)/);
                        if (match) {
                          coords = [parseFloat(match[1]), parseFloat(match[2])];
                        }
                      }

                      if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
                        return (
                          <div className="h-[150px] w-full rounded-xl overflow-hidden relative border border-primary/10">
                            <OrderMap 
                              customerLocation={coords} 
                              customerName={selectedOrder.customer || 'Client'}
                            />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Truck className="text-primary" size={18} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Livraison</p>
                    </div>
                    <p className="text-sm font-medium text-primary mb-1">
                      {selectedOrder.status === 'delivered' ? 'Livrée le :' : 'Date de livraison estimée :'}
                    </p>
                    <p className="text-xl font-serif text-accent">
                      {(() => {
                        try {
                          // Try to handle dd/mm/yyyy or ISO formats
                          let orderDate: Date;
                          if (selectedOrder.date.includes('/')) {
                            const [day, month, year] = selectedOrder.date.split('/').map(Number);
                            orderDate = new Date(year, month - 1, day);
                          } else {
                            orderDate = new Date(selectedOrder.date);
                          }

                          if (isNaN(orderDate.getTime())) {
                            return 'Date à confirmer';
                          }

                          const estDate = new Date(orderDate);
                          estDate.setDate(estDate.getDate() + 3);
                          return estDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                        } catch (e) {
                          return 'Date à confirmer';
                        }
                      })()}
                    </p>
                  </div>
                  {(selectedOrder.carrier || selectedOrder.trackingNumber) && (
                    <div className="mt-4 pt-4 border-t border-primary/10 space-y-2">
                      {selectedOrder.carrier && (
                        <div className="flex justify-between text-sm">
                          <span className="text-primary/70">Transporteur:</span>
                          <span className="font-bold text-primary">{selectedOrder.carrier}</span>
                        </div>
                      )}
                      {selectedOrder.trackingNumber && (
                        <div className="flex justify-between text-sm">
                          <span className="text-primary/70">N° de suivi:</span>
                          <span className="font-bold text-primary">{selectedOrder.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.status === 'delivered' && !hasExistingRMA && (
                isReturnPeriodExpired ? (
                  <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Délai de retour dépassé</p>
                    <p className="text-sm text-slate-700">
                      Cette commande a été effectuée il y a <strong>{daysSinceDelivery} jours</strong>. Conformément à nos conditions générales, le délai de retour garanti est fixé à 7 jours à compter de la commande/livraison. Les retours ne sont plus acceptés pour cette commande.
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-1">
                        Délai de retour : 7 jours ({Math.max(0, 7 - daysSinceDelivery)} jour{7 - daysSinceDelivery > 1 ? 's' : ''} restant{7 - daysSinceDelivery > 1 ? 's' : ''})
                      </p>
                      <p className="text-sm text-orange-900 font-medium">Un problème avec votre produit ? Les frais de livraison ne sont pas remboursables et une photo du produit est requise.</p>
                    </div>
                    <Button 
                      variant="ghost"
                      onClick={() => setShowReturnForm(true)}
                      className="flex items-center gap-2 bg-white text-orange-700 hover:text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-orange-600 transition-all h-auto"
                    >
                      <RefreshCcw size={14} />
                      Demander un retour
                    </Button>
                  </div>
                )
              )}

              {hasExistingRMA && (
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-3">
                  <CheckCircle2 className="text-green-600 shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-0.5">Demande de retour enregistrée</p>
                    <p className="text-sm text-green-900">Une demande de retour avec vérification photo est déjà en cours de traitement pour cette commande.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {!showReturnForm && (
          <div className="p-8 bg-slate-50 border-t border-primary/5 flex gap-4">
            {selectedOrder.status === 'delivered' && (
              <Button 
                onClick={() => void generateInvoicePDF(selectedOrder, true)}
                className="flex-grow bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg h-auto"
              >
                Télécharger la Facture
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => onNavigate('order-tracking', selectedOrder.id)}
              className="px-8 py-4 border border-primary/10 rounded-2xl font-bold hover:bg-white transition-colors h-auto"
            >
              Suivre le colis
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
