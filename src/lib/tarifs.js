/** Grille Fast & Clean — édition octobre 2026. Source unique pour le site. */

export const MIN_EXTERIEUR_HT = 240;
export const MIN_INTERIEUR_TTC = 99;

export const EXTERIEUR = [
  { id: 'terrasse', name: 'Terrasse / dallage', price: 9, tax: 'HT', hint: 'Béton, carrelage, pierre compatibles' },
  { id: 'facade', name: 'Façade jusqu’à 3 m', price: 16, tax: 'HT', hint: 'Accès courant, support compatible', exclusive: 'facadeHaute' },
  { id: 'facadeHaute', name: 'Façade au-delà de 3 m', price: 20, tax: 'HT', hint: 'Sous réserve d’accès sécurisé', exclusive: 'facade' },
  { id: 'toiture', name: 'Nettoyage de toiture', price: 22, tax: 'HT', hint: 'Méthode adaptée à la couverture' },
];

export const SUPPLEMENTS = [
  { id: 'antimousse', name: 'Traitement anti-mousse', price: 8, tax: 'HT', hint: 'En supplément du nettoyage' },
  { id: 'hydrofuge', name: 'Traitement hydrofuge', price: 10, tax: 'HT', hint: 'En supplément, support éligible' },
];

export const PACK_PROTECT = { name: 'Pack anti-mousse + hydrofuge', price: 16, tax: 'HT' };

export const INTERIEUR = [
  { id: 'vitres', name: 'Vitres et vitrines', price: 5, tax: 'TTC', hint: 'Par m² et par face nettoyée', unit: 'm²/face' },
  { id: 'sols', name: 'Salles et sols', price: 2.5, tax: 'TTC', hint: 'Salle clients, accueil, circulation', unit: 'm²' },
];

export const formatEuro = (n) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

export function estimateQuote(surface, selected) {
  const s = Number(surface);
  const on = (id) => !!selected[id];
  const extLines = [];
  const intLines = [];

  if (!(s > 0)) {
    return { extLines, intLines, extRaw: 0, ext: 0, intRaw: 0, intTotal: 0, minExt: false, minInt: false };
  }

  for (const item of EXTERIEUR) {
    if (!on(item.id)) continue;
    if (item.id === 'facade' && on('facadeHaute')) continue;
    extLines.push({ name: item.name, price: item.price, tax: 'HT', total: item.price * s });
  }

  const bothProtect = on('antimousse') && on('hydrofuge');
  if (bothProtect) {
    extLines.push({ name: PACK_PROTECT.name, price: PACK_PROTECT.price, tax: 'HT', total: PACK_PROTECT.price * s });
  } else {
    for (const item of SUPPLEMENTS) {
      if (on(item.id)) {
        extLines.push({ name: `${item.name} (supplément)`, price: item.price, tax: 'HT', total: item.price * s });
      }
    }
  }

  for (const item of INTERIEUR) {
    if (!on(item.id)) continue;
    intLines.push({
      name: item.id === 'vitres' ? `${item.name} (par face)` : item.name,
      price: item.price,
      tax: 'TTC',
      total: item.price * s,
    });
  }

  const extRaw = extLines.reduce((sum, l) => sum + l.total, 0);
  const intRaw = intLines.reduce((sum, l) => sum + l.total, 0);
  const minExt = extRaw > 0 && extRaw < MIN_EXTERIEUR_HT;
  const minInt = intRaw > 0 && intRaw < MIN_INTERIEUR_TTC;

  return {
    extLines,
    intLines,
    extRaw,
    ext: extRaw > 0 ? Math.max(extRaw, MIN_EXTERIEUR_HT) : 0,
    intRaw,
    intTotal: intRaw > 0 ? Math.max(intRaw, MIN_INTERIEUR_TTC) : 0,
    minExt,
    minInt,
  };
}
