const normalize = (str: string) => 
  (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const createSearcher = <T>(getSearchableText: (item: T) => string) => {
  let indexedItems: T[] = [];

  return {
    indexItems: (items: T[]) => {
      indexedItems = items;
    },
    search: (query: string) => {
      if (!query.trim()) return indexedItems;
      const terms = normalize(query).split(/\s+/).filter(t => t.length > 0);
      
      return indexedItems.filter(item => {
        const text = normalize(getSearchableText(item));
        return terms.every(term => text.includes(term));
      });
    }
  };
};

const getConditionText = (condition?: string) => {
  if (condition === 'second-hand') return 'deuxieme main occasion vintage second hand seconde';
  return 'neuf nouveau new';
};

export const productSearch = createSearcher<any>((p) => 
  `${p.name} ${p.category} ${p.description || ''} ${p.material || ''} ${p.brand || ''} ${getConditionText(p.condition)}`
);

export const orderSearch = createSearcher<any>((o) => 
  `${o.id} ${o.customerName} ${o.email} ${o.status}`
);

export const userSearch = createSearcher<any>((u) => 
  `${u.displayName || ''} ${u.email} ${u.uid}`
);

export const getStatusText = (status: string) => status;
export const getActionDescription = (method: string, path: string) => `${method} ${path}`;
