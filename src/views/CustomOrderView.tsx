import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export const CustomOrderView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Veuillez vous connecter pour passer une commande.');
      onNavigate('login');
      return;
    }
    try {
      await addDoc(collection(db, 'customOrders'), {
        uid: auth.currentUser.uid,
        description,
        status: 'pending'
      });
      toast.success('Commande sur-mesure envoyée !');
      onNavigate('home');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'envoi de la commande.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif mb-8">Commande Sur-Mesure</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[3rem] shadow-sm border border-primary/5">
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-40 p-4 bg-secondary/50 rounded-2xl mb-6"
          placeholder="Décrivez votre projet..."
        />
        <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-colors">
          Envoyer la demande
        </button>
      </form>
    </div>
  );
};
