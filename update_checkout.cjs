const fs = require('fs');
const path = 'c:/Users/Administrator/Documents/ECOMMERCE/FO/laine-et-deco/src/frontend/views/CheckoutView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace address
content = content.replace(
  '<label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Adresse</label>',
  '<label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Nom du quartier</label>'
);
content = content.replace(
  'placeholder="123 Rue de la Laine"',
  'placeholder="Ex: Deido, Bonamoussadi..."'
);

// Add icons to import
content = content.replace(
  'import { MapPin, CreditCard, ShoppingBag, Truck, Package, Lock } from \'lucide-react\';',
  'import { MapPin, CreditCard, ShoppingBag, Truck, Package, Lock, Phone, CheckCircle } from \'lucide-react\';'
);

// Replace Step 3 confirmation block
const step3Start = content.indexOf('<div className="bg-white p-10 rounded-[3rem] border border-primary/5 shadow-sm space-y-6">');
const step3End = content.indexOf('</div>\r\n                  </div>\r\n                )}', step3Start);
const step3End2 = content.indexOf('</div>\n                  </div>\n                )}', step3Start);
const endToUse = step3End !== -1 ? step3End : step3End2;

if (step3Start !== -1 && endToUse !== -1) {
  const newStep3 = `<div className="bg-white rounded-[3rem] border border-primary/5 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-[#5c5e46]" />
                    <div className="p-10 space-y-8">
                      <div className="flex items-center gap-4 border-b border-primary/5 pb-8">
                        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                          <Package size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-serif font-bold text-primary">Prêt à valider ?</h3>
                          <p className="text-sm text-primary/70">Vérifiez vos informations avant de confirmer.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-4 bg-secondary/30 p-6 rounded-3xl">
                          <h4 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-primary/70 uppercase">
                            <MapPin size={14} /> Adresse de livraison
                          </h4>
                          <div>
                            <p className="font-serif text-lg font-bold text-primary">{formData.firstName} {formData.lastName}</p>
                            <p className="text-primary/80 mt-1">{formData.address}</p>
                            <p className="text-primary/80">{formData.city}</p>
                            {formData.coordinates && (
                              <p className="text-[10px] text-accent font-mono mt-3 bg-accent/10 px-3 py-1.5 rounded-lg inline-block border border-accent/20">
                                📍 GPS: {formData.coordinates}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 bg-secondary/30 p-6 rounded-3xl">
                          <h4 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-primary/70 uppercase">
                            <Phone size={14} /> Contact
                          </h4>
                          <div>
                            <p className="text-primary/80 font-medium">{formData.phone}</p>
                            <p className="text-primary/80 mt-1">{user?.email}</p>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-4 bg-accent/5 p-6 rounded-3xl border border-accent/10">
                          <h4 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-accent uppercase">
                            <CreditCard size={14} /> Mode de paiement
                          </h4>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-accent">
                              {formData.paymentMethod === 'delivery' ? <Truck size={24} /> : <CreditCard size={24} />}
                            </div>
                            <div>
                              <p className="font-serif text-lg font-bold text-primary">
                                {formData.paymentMethod === 'delivery' ? 'Paiement à la livraison' : 
                                 formData.paymentMethod === 'mobile' ? 'Mobile Money' : 'Carte Bancaire'}
                              </p>
                              <p className="text-xs text-primary/70 mt-1">
                                {formData.paymentMethod === 'delivery' ? 'Vous paierez en espèces lors de la réception.' : 'Paiement en ligne sécurisé.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>`;
  content = content.substring(0, step3Start) + newStep3 + content.substring(endToUse);
  fs.writeFileSync(path, content, 'utf8');
  console.log('CheckoutView updated successfully');
} else {
  console.log('Could not find step3 bounds:', step3Start, endToUse);
}
