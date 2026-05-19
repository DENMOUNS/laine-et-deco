import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, RefreshCcw, Truck } from 'lucide-react';
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
  onRequestReturn?: (orderId: string, reason: string) => void;
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

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason.trim()) {
      toast.error('Veuillez indiquer une raison pour le retour');
      return;
    }
    if (onRequestReturn) {
      onRequestReturn(selectedOrder.id, returnReason);
      setShowReturnForm(false);
      setReturnReason('');
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
              <p className="text-sm text-primary/70">
                Vous souhaitez retourner des articles de la commande <span className="font-bold">#{selectedOrder.id}</span>. 
                Veuillez nous expliquer la raison de ce retour.
              </p>
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">Raison du retour</label>
                  <textarea 
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Ex: Produit défectueux, Erreur de taille, Ne correspond pas à la description..."
                    className="w-full bg-slate-50 border border-primary/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]"
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowReturnForm(false)}
                    className="flex-grow py-4 border border-primary/10 rounded-2xl font-bold hover:bg-slate-50 transition-colors h-auto"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-grow bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg h-auto"
                  >
                    Confirmer la demande
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
                          <img src={products.find(p => p.id === item.productId)?.image || item.image || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80'} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                <div className="flex justify-between items-center text-sm">
                  <p className="text-primary/70">Frais de livraison</p>
                  <p className="font-bold text-primary">
                    {selectedOrder.shippingFee === 0 ? 'Gratuit' : `${(selectedOrder.shippingFee || 0).toLocaleString()} FCFA`}
                  </p>
                </div>
                {(() => {
                  const subtotal = (selectedOrder.orderDetails || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
                  const discount = (subtotal + (selectedOrder.shippingFee || 0)) - selectedOrder.total;
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
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">Un problème ?</p>
                    <p className="text-sm text-orange-700">Vous pouvez demander un retour produit.</p>
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={() => setShowReturnForm(true)}
                    className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-orange-600 hover:text-white transition-all h-auto"
                  >
                    <RefreshCcw size={14} />
                    Retourner
                  </Button>
                </div>
              )}

              {hasExistingRMA && (
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-1">Retour en cours</p>
                  <p className="text-sm text-green-700">Une demande de retour a déjà été soumise pour cette commande.</p>
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
