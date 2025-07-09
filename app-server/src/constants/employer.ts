// Stałe dla pracodawców - backend

export const CONTRACT_TYPES = [
  'Umowa o pracę',
  'Umowa B2B', 
  'Umowa zlecenie',
  'Umowa o dzieło'
] as const;

// Type dla TypeScript
export type ContractType = typeof CONTRACT_TYPES[number];
