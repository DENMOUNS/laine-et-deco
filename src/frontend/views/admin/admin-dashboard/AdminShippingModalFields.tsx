import React, { useState, useEffect } from 'react';
import { Truck, Target, Info } from 'lucide-react';

export function AdminShippingModalFields({ ctx }: { ctx: any }) {
  const { modalType, editingItem } = ctx;
  const [ruleType, setRuleType] = useState<'threshold' | 'zone' | 'default'>('zone');
  const [thresholdValue, setThresholdValue] = useState('200000');
  const [conditionPreview, setConditionPreview] = useState('');

  useEffect(() => {
    if (editingItem) {
      setRuleType((editingItem.type as any) || 'zone');
      if (editingItem.type === 'threshold' && editingItem.condition) {
        const match = editingItem.condition.match(/\d+/);
        if (match) setThresholdValue(match[0]);
      }
    } else {
      setRuleType('zone');
      setThresholdValue('200000');
    }
  }, [editingItem]);

  useEffect(() => {
    if (ruleType === 'threshold') {
      setConditionPreview(`Total > ${Number(thresholdValue).toLocaleString('fr-FR')} FCFA`);
    } else if (ruleType === 'zone') {
      setConditionPreview('Applicable à la zone/ville sélectionnée');
    } else {
      setConditionPreview('Règle par défaut (toujours appliquée)');
    }
  }, [ruleType, thresholdValue]);

  if (modalType !== 'shipping') return null;

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* Rule Name */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">
          Nom de la règle
        </label>
        <input
          name="name"
          type="text"
          className="input-field"
          defaultValue={editingItem?.name}
          required
          placeholder="ex: Livraison gratuite dès 200 000 FCFA"
        />
      </div>

      {/* Rule Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">
          Type de règle
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'threshold', label: 'Seuil', icon: Target, desc: 'Basé sur le montant total' },
            { value: 'zone', label: 'Zone', icon: Truck, desc: 'Basé sur la ville/zone' },
            { value: 'default', label: 'Défaut', icon: Info, desc: 'Règle par défaut' },
          ].map(({ value, label, icon: Icon, desc }) => (
            <label
              key={value}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                ruleType === value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-primary/15 text-primary/50 hover:border-primary/40'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={value}
                checked={ruleType === value}
                onChange={() => setRuleType(value as any)}
                className="sr-only"
              />
              <Icon size={20} />
              <span className="text-xs font-bold">{label}</span>
              <span className="text-[10px] text-center leading-tight opacity-70">{desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Threshold-specific: amount input */}
      {ruleType === 'threshold' && (
        <div className="space-y-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/60">
            Montant seuil (FCFA)
          </label>
          <p className="text-xs text-primary/50">
            La règle s'applique quand le total du panier dépasse ce montant.
          </p>
          <input
            name="thresholdAmount"
            type="number"
            className="input-field"
            value={thresholdValue}
            onChange={(e) => setThresholdValue(e.target.value)}
            required
            min={0}
            placeholder="200000"
          />
          {/* Hidden condition field for form submission */}
          <input type="hidden" name="condition" value={`Total > ${thresholdValue}`} />
        </div>
      )}

      {/* Zone-specific: zone/city name */}
      {ruleType === 'zone' && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/60">
            Nom de la zone ou ville
          </label>
          <input
            name="condition"
            type="text"
            className="input-field"
            defaultValue={editingItem?.condition}
            placeholder="ex: Yaoundé"
          />
          <p className="text-xs text-primary/40">
            Entrez le nom exact de la ville (doit correspondre aux villes du module Villes).
          </p>
        </div>
      )}

      {/* Default rule — no extra condition */}
      {ruleType === 'default' && (
        <input type="hidden" name="condition" value="default" />
      )}

      {/* Price */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">
          Frais de livraison (FCFA)
        </label>
        <div className="relative">
          <input
            name="price"
            type="number"
            className="input-field pr-20"
            defaultValue={editingItem?.price ?? 0}
            required
            min={0}
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary/40">FCFA</span>
        </div>
        <p className="text-xs text-primary/40">Mettez 0 pour une livraison gratuite.</p>
      </div>

      {/* Preview */}
      {conditionPreview && (
        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <Info size={14} className="text-primary/50 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-primary/70">Aperçu de la condition</p>
            <p className="text-xs text-primary/50 mt-0.5">{conditionPreview}</p>
          </div>
        </div>
      )}
    </div>
  );
}
