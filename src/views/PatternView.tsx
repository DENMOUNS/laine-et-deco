import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export const PatternView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatterns = async () => {
      const snapshot = await getDocs(collection(db, 'patterns'));
      setPatterns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPatterns();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif mb-8">Patrons Exclusifs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {patterns.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-primary/5">
            <h3 className="font-serif text-lg">{p.title}</h3>
            <p className="font-bold text-accent">{p.price} €</p>
            <button className="mt-4 w-full bg-primary text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
              Acheter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
