// Types pour l'application CRM de prospection

export type InteractionType = 'appel' | 'email' | 'reunion' | 'sms' | 'visite';
export type ProspectStatus = 'nouveau' | 'contact' | 'qualification' | 'proposition' | 'negociation' | 'conclu' | 'perdu';

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string;
  notes: string;
  duree?: number; // en minutes
}

export interface Prospect {
  id: string;
  nom: string;
  entreprise: string;
  email: string;
  telephone: string;
  adresse: string;
  status: ProspectStatus;
  valeurEstimee?: number; // montant potentiel
  dateCreation: string;
  interactions: Interaction[];
}
