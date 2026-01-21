'use client';

import { useState, useEffect } from 'react';
import { Prospect, Interaction } from '@/types';

const STORAGE_KEY = 'prospection_crm_prospects';

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données du localStorage au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProspects(JSON.parse(stored));
      } catch (error) {
        console.error('Erreur lors du chargement des prospects:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Sauvegarder les modifications dans localStorage
  const saveProspects = (updatedProspects: Prospect[]) => {
    setProspects(updatedProspects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProspects));
  };

  // Ajouter un nouveau prospect
  const addProspect = (prospect: Omit<Prospect, 'id'>) => {
    const newProspect: Prospect = {
      ...prospect,
      id: Date.now().toString(),
    };
    saveProspects([...prospects, newProspect]);
    return newProspect;
  };

  // Modifier un prospect
  const updateProspect = (id: string, updates: Partial<Prospect>) => {
    const updated = prospects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveProspects(updated);
  };

  // Supprimer un prospect
  const deleteProspect = (id: string) => {
    const filtered = prospects.filter((p) => p.id !== id);
    saveProspects(filtered);
  };

  // Ajouter une interaction à un prospect
  const addInteraction = (prospectId: string, interaction: Omit<Interaction, 'id'>) => {
    const newInteraction: Interaction = {
      ...interaction,
      id: Date.now().toString(),
    };
    updateProspect(prospectId, {
      interactions: [
        ...(prospects.find((p) => p.id === prospectId)?.interactions || []),
        newInteraction,
      ],
    });
  };

  return {
    prospects,
    isLoading,
    addProspect,
    updateProspect,
    deleteProspect,
    addInteraction,
  };
}

